# Architecture Reference

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron Shell                           │
│                                                                 │
│  ┌──────────────────┐  Context Bridge  ┌──────────────────────┐ │
│  │   Main Process    │ ◄─────────────► │   Renderer Process   │ │
│  │                   │   (preload.ts)   │                      │ │
│  │  ┌─────────────┐  │                 │  ┌────────────────┐  │ │
│  │  │ Auth Service │  │  8 auth IPC     │  │  React 19 SPA  │  │ │
│  │  │  (scrypt)    │ ◄────────────────► │  │                │  │ │
│  │  └─────────────┘  │                 │  │  ┌──────────┐  │  │ │
│  │  ┌─────────────┐  │  5 sync IPC     │  │  │ Zustand  │  │  │ │
│  │  │ Sync Service │ ◄────────────────► │  │  │ Stores   │  │  │ │
│  │  │  (queue)     │  │                 │  │  │          │  │  │ │
│  │  └─────────────┘  │                 │  │  │ auth     │  │  │ │
│  │  ┌─────────────┐  │                 │  │  │ theme    │  │  │ │
│  │  │  JSON DB     │  │                 │  │  │ storeOps │  │  │ │
│  │  │ (auth only)  │  │                 │  │  └──────────┘  │  │ │
│  │  └─────────────┘  │                 │  └────────────────┘  │ │
│  └──────────────────┘                  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                                        │
          ▼                                        ▼
  data/localDatabase.json              Browser localStorage
  data/syncState.json                  (theme only)
```

## Data Flow

### Authentication Flow

```
User enters credentials
        │
        ▼
LoginPage → authStore.login()
        │
        ▼
IPC: auth:login → authService.authenticate()
        │
        ▼
localDatabase.ts → scrypt verify → return SessionUser
        │
        ▼
authStore.setUser() → ProtectedRoute evaluates
        │
        ├── deploymentSetupCompleted? → /app (dashboard)
        └── not configured? → /setup (wizard)
```

### Checkout Flow

```
PosPage: User adds products to cart
        │
        ▼
processCheckout(cart, paymentMethod, customerId)
        │
        ├── Validate cart items against products
        ├── Calculate subtotal, tax, discounts
        ├── Create OrderRecord
        ├── Deduct stock (if enabled)
        ├── Update customer loyalty points
        ├── Update register session cash
        ├── Increment todaySales / todayOrders
        └── Record staff sale (commission tracking)
```

### Sync Flow

```
Store state changes
        │
        ▼
useStoreSync detects change (800ms debounce)
        │
        ▼
IPC: sync:queue-store-snapshot → syncService.queue()
        │
        ▼
data/syncState.json (persisted queue)
        │
        ▼ (every 30 seconds)
syncService.flush() → POST to serverUrl
        │
        ├── Success → clear queue, update lastSyncedAt
        └── Failure → retain in queue, update lastError
```

## Module Dependency Graph

```
App.tsx
├── ProtectedRoute (accessControl.ts)
├── MainLayout
│   ├── Sidebar (accessControl.ts, deploymentConfig.ts)
│   ├── Topbar (authStore, themeStore)
│   ├── InvoiceReminderCenter (storeOpsStore)
│   └── ScreenGuideBanner
└── Pages
    ├── LoginPage → authStore
    ├── SetupWizardPage → storeOpsStore (deployment)
    ├── DashboardPage → storeOpsStore (KPIs)
    ├── PosPage → storeOpsStore (checkout)
    ├── OrderManagementPage → storeOpsStore (orders + import)
    ├── InventoryPage → storeOpsStore (products)
    ├── CustomersPage → storeOpsStore (customers)
    ├── StaffPage → storeOpsStore (HR)
    ├── BusinessSuitePage → storeOpsStore (industry modules)
    ├── CounterManagementPage → storeOpsStore (counters)
    ├── ReportsPage → storeOpsStore (summaries)
    ├── SettingsPage → storeOpsStore (preferences, sync)
    ├── UserManagementPage → storeOpsStore + IPC auth
    └── SuperAdminPage → storeOpsStore (live ops)
```

## State Architecture

### Why One Big Store?

The `storeOpsStore` (4136 lines) contains all business data in a single store. This is intentional:

1. **Snapshot sync**: The entire business state is serialized as one JSON blob for sync. Splitting stores would require coordinating multiple serialization/hydration passes.

2. **Cross-domain operations**: Checkout touches products, orders, customers, staff, and register state simultaneously. A single store ensures atomic updates.

3. **Backup/restore**: Full state export/import works on one object.

### Store Sections

The store is internally organized by domain:

```
storeOpsStore
├── Profile & Config (storeProfile, globalPreferences, taxRate)
├── Commerce (products, categories, orders, invoices, register)
├── Customers (customers, activity, loyalty, credit)
├── HR (staff, attendance, shifts, leave, payroll, departments)
├── Scheduling (meetings, appointments)
├── Counters (counterRecords)
├── Users (userAccounts, audit)
├── Industry: Restaurant (tables, tickets)
├── Industry: Salon (services, bookings)
├── Industry: Field Service (jobs, estimates, priceBook)
├── Industry: Grocery (subscriptions, manifests)
└── Sync (syncStatus)
```

## Security Model

### Layers

1. **Process isolation**: Renderer has no direct filesystem/network access
2. **Context bridge**: Only whitelisted APIs exposed via preload
3. **Password hashing**: scrypt with random salts (no bcrypt, no plaintext)
4. **Role enforcement**: Server-side (main process) validates role on every IPC call
5. **Feature gates**: Both route-level and component-level checks
6. **No secrets in renderer**: Auth DB only accessible through IPC

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| Password theft | scrypt hashing, no plaintext storage |
| Privilege escalation | Role checked on every IPC handler |
| XSS | Electron contextIsolation, no eval |
| Data tampering | Zustand state is ephemeral; auth layer validates |
| Offline data loss | Sync queue persists to disk |
