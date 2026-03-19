# Developer Handbook

Complete reference for developing, maintaining, and extending the POS System.

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Architecture](#project-architecture)
3. [State Management](#state-management)
4. [Authentication & Security](#authentication--security)
5. [Access Control](#access-control)
6. [Industry Modules](#industry-modules)
7. [Data Exchange](#data-exchange)
8. [Sync Architecture](#sync-architecture)
9. [Testing Strategy](#testing-strategy)
10. [Adding Features](#adding-features)
11. [Deployment & Release](#deployment--release)
12. [Troubleshooting](#troubleshooting)

---

## Development Setup

### Prerequisites

- Node.js >= 20
- pnpm >= 10

### Install & Run

```bash
git clone https://github.com/rishat5081/pos-system.git
cd pos-system
pnpm install
pnpm dev
```

### Demo Login

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | super_admin |

### First-Run Flow

1. Login → redirected to Setup Wizard (deployment not configured)
2. Choose deployment template (Retail, Restaurant, Salon, etc.)
3. Configure store identity and enabled modules
4. Dashboard loads with KPIs

---

## Project Architecture

### Three-Process Model (Electron)

```
┌─────────────┐     IPC (13 channels)     ┌──────────────┐
│   Renderer   │ ◄─────────────────────► │     Main      │
│   (React)    │                          │  (Node.js)    │
│              │                          │               │
│  Zustand     │     Context Bridge       │  Auth DB      │
│  State       │ ◄─────────────────────► │  Sync Queue   │
│  (business)  │     (preload/index.ts)   │  (JSON files) │
└─────────────┘                          └──────────────┘
```

### Main Process (`src/main/`)

Handles authentication and sync. Three concerns:

1. **localDatabase.ts** — JSON file CRUD with scrypt password hashing
2. **authService.ts** — Login validation, session management, user CRUD
3. **syncService.ts** — Snapshot queue, server push/pull, conflict resolution

### Preload (`src/preload/`)

Exposes `window.api` via `contextBridge.exposeInMainWorld()`. Typed as `DesktopApi`.

### Renderer (`src/renderer/src/`)

React SPA with 14 pages, 3 Zustand stores, and shadcn/ui components.

---

## State Management

### Three Stores

| Store | File | Purpose |
|-------|------|---------|
| `authStore` | `stores/authStore.ts` | User session (login/logout/hydrate) |
| `themeStore` | `stores/themeStore.ts` | Light/dark theme (localStorage) |
| `storeOpsStore` | `stores/storeOpsStore.ts` | ALL business data (4136 lines) |

### storeOpsStore — The Core

This single store contains:

- **50+ type definitions** — Every data record (OrderRecord, StaffRecord, etc.)
- **96+ actions** — Every business operation (processCheckout, clockInStaff, etc.)
- **Complete business state** — Products, orders, customers, staff, invoices, counters, industry-specific data, sync status

**Why one store?** Snapshot sync. The entire business state is serialized as one JSON blob for sync. Splitting would complicate serialization/hydration.

### Reading Store State

```typescript
// Select specific slice (re-renders only when slice changes)
const orders = useStoreOpsStore((state) => state.orders);

// Select action (stable reference, no re-renders)
const processCheckout = useStoreOpsStore((state) => state.processCheckout);
```

### Modifying Store State

```typescript
// Inside store definition
addProduct: (product) => {
  set((state) => ({
    products: [...state.products, { ...product, id: crypto.randomUUID() }]
  }));
}
```

---

## Authentication & Security

### Password Storage

Passwords are hashed with Node.js `scrypt` (64-byte key, random 32-byte salt):

```
stored format: "salt_hex:hash_hex"
```

The main process (`localDatabase.ts`) handles all crypto. The renderer never sees raw passwords or hashes.

### Session Flow

```
Login → main process validates credentials
      → returns SessionUser { id, username, role, features }
      → renderer stores in authStore
      → subsequent requests use session (no token needed — local app)
```

### IPC Security

- All IPC handlers validate payloads with type checking
- Auth state is checked on every privileged IPC call
- Renderer has no direct filesystem access (context bridge only)

---

## Access Control

### Role Hierarchy

```
super_admin
├── Everything a manager can do
├── Super Admin Console (live operations dashboard)
├── User Management (create/edit/delete users)
└── Setup Wizard re-run

manager
├── Everything a cashier can do
├── Business Suite (industry verticals)
├── Inventory management
├── HR & workforce
├── Counter management
├── Reports
└── Settings

cashier
├── Dashboard
├── POS checkout
├── Order management
└── Customer profiles
```

### Feature Keys

18 feature keys control access. Enabled/disabled by deployment template:

```
dashboard, businessSuite, pos, orders, inventory, customers,
hr, counters, reports, settings, restaurantTables, kitchenDisplay,
salonServices, salonDeposits, fieldDispatch, fieldEstimates,
routeSubscriptions, routeManifests
```

### Per-User Overrides

Two arrays on each user account:
- `grantedFeatureKeys[]` — Force-allow specific features
- `revokedFeatureKeys[]` — Force-deny specific features

Evaluated in `accessControl.ts`:
```
finalAccess = (roleDefault + grants) - revokes
```

### Permission Presets (6)

Pre-built override bundles for common job functions:
1. Store Cashier
2. Customer Desk
3. Inventory Lead
4. HR Coordinator
5. Restaurant Lead
6. Operations Manager

---

## Industry Modules

### Restaurant

**Tables** (`RestaurantTableRecord`):
- Status: available → occupied → reserved → cleaning
- Linked to kitchen tickets and orders

**Kitchen Tickets** (`KitchenTicketRecord`):
- Channels: dine-in, pickup, delivery, drive-thru
- Status: queued → preparing → ready → served
- Course grouping, modifiers, staff assignment

### Salon

**Services** (`SalonServiceRecord`):
- Duration, price, deposit required, no-show fee
- Categories for organization

**Bookings** (`SalonBookingRecord`):
- Status: scheduled → checkedIn → completed / noShow / cancelled
- Deposit tracking, staff assignment

### Field Service

**Jobs** (`FieldJobRecord`):
- Trades: plumbing, electrical, general
- Status: scheduled → enRoute → inProgress → completed
- Scheduled windows, technician assignment

**Estimates** (`FieldEstimateRecord`):
- Line items with price book lookup
- Status: draft → sent → approved → invoiced
- Conversion to invoice

### Grocery & Dairy

**Subscriptions** (`DeliverySubscriptionRecord`):
- Frequencies: daily, weekly, custom
- Delivery days, item summary, next delivery date

**Route Manifests** (`RouteManifestRecord`):
- Driver assignment, vehicle, stops
- Per-stop delivery confirmation

---

## Data Exchange

### Export Formats
CSV, TSV, JSON, TXT, PDF, XLSX

### Import Formats
CSV, TSV, JSON, TXT (with fuzzy header matching)

### Export Domains
- Orders, invoices, inventory (products/categories)
- Customers (directory/activity/history/orders)
- HR (employees/meetings/appointments/shifts/leave/payroll/departments)
- User management (accounts/audit logs)
- Settings (full snapshot backup + PDF summary)

### Implementation
All in `lib/dataExchange.ts`:
- `parseImportFile()` — Parse any supported format → headers + rows
- `downloadDataExport()` — Convert rows → file download
- `findMatchingHeader()` — Fuzzy column matching for imports

---

## Sync Architecture

### Flow

```
Store Change → Debounce (800ms) → Queue Snapshot → Server Push (30s interval)
                                                     ↕
                                              Server Pull (on demand)
```

### Queue Mechanism

1. `useStoreSync` hook watches store changes
2. Debounces 800ms, then calls `sync:queue-store-snapshot` IPC
3. Main process stores in `data/syncState.json`
4. Every 30 seconds, queue is flushed to server

### Conflict Resolution

- **Local wins**: If store changed during sync, local state takes priority
- **Snapshot-based**: Entire state blob, not field-level merge
- **Manual fallback**: Settings page has "Force Sync" button

### Server URL

Configurable in Settings. Empty = offline only.

---

## Testing Strategy

### Unit & Integration (Vitest)

11 test files, 43 tests total:

| File | Tests | Coverage |
|------|-------|----------|
| `authStore.test.ts` | Login/logout/hydration | Auth state machine |
| `storeOpsStore.test.ts` | All 96+ actions | Business logic |
| `themeStore.test.ts` | Theme toggle/persist | Theme state |
| `loginPage.test.tsx` | Form render/submit | Login UI |
| `homePage.test.tsx` | Feature showcase | Landing page |
| `dashboardSettings.test.tsx` | KPI display | Dashboard |
| `permissionPresets.test.ts` | Permission logic | Access control |
| `dataExchange.test.ts` | Import/export | Data handling |
| `layout.test.tsx` | Sidebar/topbar | Layout |
| `appFlow.test.tsx` | E2E workflows | Integration |
| `apiExecutionReport.test.ts` | API patterns | Coverage report |

### E2E (Playwright)

2 spec files:
- `authNavigation.spec.ts` — Login → navigate → logout
- `routeGuard.spec.ts` — Role-based route blocking

### Running Tests

```bash
pnpm test          # All unit/integration tests
pnpm test:watch    # Watch mode
pnpm test:e2e      # E2E (requires Chromium)
```

### Writing Tests

- Use `@testing-library/react` for component tests
- Use `@testing-library/user-event` for interactions
- Mock `window.api` for IPC calls (see `test/setup.ts`)
- Test store actions by calling them directly and asserting state

---

## Adding Features

### New Page

1. Create `src/renderer/src/pages/myPage.tsx`
2. Add route in `App.tsx`:
   ```tsx
   <Route path="myPage" element={<MyPage />} />
   ```
3. Add feature key to `DeploymentFeatureKey` type in `storeOpsStore.ts`
4. Map route → feature in `accessControl.ts`
5. Add sidebar nav item in `sidebar.tsx`
6. Write tests in `pages/__tests__/`

### New Store Action

1. Add action type to store interface in `storeOpsStore.ts`
2. Implement:
   ```typescript
   myAction: (params) => {
     set((state) => ({ ...state, /* updates */ }));
   }
   ```
3. Test in `stores/__tests__/storeOpsStore.test.ts`

### New IPC Channel

1. Add handler in `src/main/ipc/auth.ts` or `sync.ts`
2. Add method to preload context bridge (`src/preload/index.ts`)
3. Add type to `DesktopApi` interface
4. Use via `getDesktopApi()` in renderer

### New Industry Module

1. Define record types in `storeOpsStore.ts`
2. Add state fields and actions
3. Add feature keys to `DeploymentFeatureKey`
4. Create deployment template in `deploymentConfig.ts`
5. Add UI section in `businessSuitePage.tsx`
6. Update access control for new feature keys

---

## Deployment & Release

### Local Build

```bash
pnpm build    # Outputs to out/ (main + preload + renderer)
```

### CI/CD (GitHub Actions)

| Workflow | Trigger | Jobs |
|----------|---------|------|
| CI | Push/PR to main | Typecheck, lint, test (Node 20+22), build |
| E2E | PR to main | Playwright on Chromium |
| Code Quality | PR + weekly | Audit, license check, bundle size |
| Release | `v*` tags | Cross-platform build + GitHub Release |
| Dependency Review | PR to main | Vulnerability scanning |
| Stale | Daily cron | Auto-close inactive issues/PRs |
| PR Checks | PR events | Conventional commit titles, branch naming |

### Creating a Release

```bash
git tag v0.2.0
git push origin v0.2.0
# GitHub Actions builds for Linux, macOS, Windows
# Creates GitHub Release with artifacts
```

---

## Troubleshooting

### `pnpm lint` shows file not found errors
Electron-vite creates temp config files during build. Use `pnpm exec eslint . --ext .ts,.tsx` directly.

### Tests fail with "window.api is not defined"
The test setup mocks `window.api`. Check `src/renderer/src/test/setup.ts`.

### TypeScript errors after dependency update
Run `pnpm typecheck` first. Common issues:
- `JSX.Element` — Remove return type annotation (React 19)
- `setState in useEffect` — Use `useMemo` for derived state

### Build fails on Linux/CI
Electron needs native dependencies. Ensure `electron` postinstall ran:
```bash
pnpm install
node node_modules/electron/install.js
```

### Sync not working
1. Check Settings → Sync → Server URL is set
2. Check `data/syncState.json` for errors
3. Try "Force Sync" in Settings
