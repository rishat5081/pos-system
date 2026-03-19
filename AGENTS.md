# AGENTS.md — AI Agent Context for POS System

> This file gives AI coding agents (Claude Code, Codex, Cursor, Copilot Workspace, etc.)
> full project context so they can work effectively from the first prompt.

## Quick Start

```bash
pnpm install
pnpm dev          # Launch Electron + Vite dev server
pnpm test         # 43 unit/integration tests (Vitest)
pnpm typecheck    # TypeScript strict check
pnpm lint         # ESLint (flat config, TS + React)
pnpm build        # Production build (main + preload + renderer)
```

## Project Identity

| Field | Value |
|-------|-------|
| Name | `pos-system` |
| Type | Desktop Electron app |
| Stack | Electron 41 + React 19 + TypeScript 5.9 + Tailwind 3 + Zustand 5 |
| Package manager | pnpm 10 |
| Build tool | electron-vite 4 (Vite 7 under the hood) |
| Test runner | Vitest 4 + React Testing Library + Playwright |
| Database | JSON file (auth) + Zustand snapshot (business state) |
| Node | >= 20 |

## Architecture Overview

```
src/
├── main/                      # Electron main process
│   ├── index.ts               # Window creation, IPC registration
│   ├── database/
│   │   └── localDatabase.ts   # JSON auth DB with scrypt hashing
│   ├── ipc/
│   │   ├── auth.ts            # 8 auth IPC channels
│   │   └── sync.ts            # 5 sync IPC channels
│   └── services/
│       ├── authService.ts     # Session + user CRUD
│       └── syncService.ts     # Queue + remote sync
├── preload/
│   └── index.ts               # Context bridge → window.api
└── renderer/src/
    ├── App.tsx                 # Route definitions
    ├── main.tsx                # React entry
    ├── components/
    │   ├── ui/                 # shadcn/ui primitives (button, card, input, etc.)
    │   └── layout/            # Sidebar, Topbar, MainLayout, InvoiceReminderCenter
    ├── pages/                  # 14 route-level pages (see below)
    ├── stores/
    │   ├── authStore.ts        # Session state (login/logout/hydrate)
    │   ├── themeStore.ts       # Light/dark theme
    │   └── storeOpsStore.ts   # 4136-line business operations store (96+ actions)
    ├── lib/
    │   ├── accessControl.ts    # Role + feature permission logic
    │   ├── dataExchange.ts     # CSV/JSON/PDF import/export
    │   ├── deploymentConfig.ts # Industry templates
    │   ├── desktopApi.ts       # IPC wrapper with browser fallback
    │   ├── globalFormat.ts     # Intl currency/date formatting
    │   ├── permissionPresets.ts # 6 role presets
    │   └── useStoreSync.ts     # Debounced store → IPC sync hook
    ├── routes/
    │   └── protectedRoute.tsx  # Auth guard + feature gate + setup redirect
    ├── flows/                  # Integration test scenarios
    ├── test/                   # Test setup (vitest)
    └── types/                  # Global type declarations
```

## Key Files to Read First

If you need to understand the system quickly, read these in order:

1. **`src/renderer/src/stores/storeOpsStore.ts`** — The heart of the app. 4136 lines. All business state, all actions, all types. Every feature flows through this store.
2. **`src/renderer/src/lib/accessControl.ts`** — Role-based access control, feature gates, route permissions.
3. **`src/renderer/src/App.tsx`** — All routes and page structure.
4. **`src/main/database/localDatabase.ts`** — Auth database (JSON + scrypt).
5. **`src/renderer/src/lib/deploymentConfig.ts`** — Industry templates that drive feature flags.
6. **`src/preload/index.ts`** — The IPC bridge between main and renderer.

## Data Architecture

### Two-Layer Storage

1. **Authentication layer** (Electron main process):
   - `data/localDatabase.json` — Users, roles, stores (JSON with scrypt password hashing)
   - Accessed via IPC channels (`auth:login`, `auth:get-session`, etc.)

2. **Business operations layer** (Renderer Zustand store):
   - `storeOpsStore.ts` — All products, orders, customers, staff, etc.
   - Persisted via sync queue → server (or local snapshot)
   - Offline-first: works without server connection

### No SQL Database for Business Data

All business data lives in the Zustand store. The Drizzle ORM schema (`drizzle/schema.ts`) defines 3 tables (stores, roles, users) used only for authentication. Products, orders, customers, staff, etc. are NOT in SQL — they're in Zustand state synced as snapshots.

## IPC Channels (13 total)

### Auth (8 channels)
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `auth:login` | renderer → main | Authenticate user |
| `auth:get-session` | renderer → main | Hydrate session on app load |
| `auth:logout` | renderer → main | Clear session |
| `auth:list-users` | renderer → main | List all user accounts |
| `auth:create-user` | renderer → main | Create new user |
| `auth:update-user-role` | renderer → main | Change user role |
| `auth:update-user-status` | renderer → main | Lock/disable/activate user |
| `auth:update-user-permissions` | renderer → main | Set feature overrides |
| `auth:reset-user-password` | renderer → main | Temporary password reset |

### Sync (5 channels)
| Channel | Direction | Purpose |
|---------|-----------|---------|
| `sync:get-status` | renderer → main | Current sync state |
| `sync:set-server-url` | renderer → main | Configure sync target |
| `sync:queue-store-snapshot` | renderer → main | Queue state for sync |
| `sync:force` | renderer → main | Force immediate sync |
| `sync:get-latest-remote-snapshot` | renderer → main | Pull latest from server |

## Access Control Model

### Roles (3 tiers)
```
super_admin → full platform access, user management, setup wizard
manager     → business ops, HR, inventory, reports, settings
cashier     → dashboard, POS, orders, customers
```

### Feature Keys (18)
```
dashboard, businessSuite, pos, orders, inventory, customers, hr,
counters, reports, settings, restaurantTables, kitchenDisplay,
salonServices, salonDeposits, fieldDispatch, fieldEstimates,
routeSubscriptions, routeManifests
```

### Per-User Overrides
- `grantedFeatureKeys[]` — Force-allow features beyond role default
- `revokedFeatureKeys[]` — Force-deny features from role default
- Applied on top of role base permissions

## Industry Support (5 verticals)

| Industry | Key Features | Feature Keys |
|----------|-------------|--------------|
| Retail | POS, inventory, customers | `pos`, `inventory`, `customers` |
| Restaurant | Tables, kitchen tickets | `restaurantTables`, `kitchenDisplay` |
| Salon | Services, bookings, deposits | `salonServices`, `salonDeposits` |
| Field Service | Jobs, dispatch, estimates | `fieldDispatch`, `fieldEstimates` |
| Grocery & Dairy | Subscriptions, routes | `routeSubscriptions`, `routeManifests` |

## Deployment Templates (6)
Retail, Restaurant, Salon, Field Service, Grocery + Dairy, All In One

## Routes

| Path | Page | Access |
|------|------|--------|
| `/login` | LoginPage | Public |
| `/setup` | SetupWizardPage | Authenticated + unconfigured store |
| `/` | HomePage | Public (landing) |
| `/app` | DashboardPage | `dashboard` feature |
| `/app/businessSuite` | BusinessSuitePage | `businessSuite` feature |
| `/app/pos` | PosPage | `pos` feature |
| `/app/orders` | OrderManagementPage | `orders` feature |
| `/app/inventory` | InventoryPage | `inventory` feature |
| `/app/customers` | CustomersPage | `customers` feature |
| `/app/hr` | StaffPage | `hr` feature |
| `/app/counters` | CounterManagementPage | `counters` feature |
| `/app/reports` | ReportsPage | `reports` feature |
| `/app/settings` | SettingsPage | `settings` feature |
| `/app/userManagement` | UserManagementPage | `super_admin` only |
| `/app/superAdmin` | SuperAdminPage | `super_admin` only |

## Test Structure

```
src/renderer/src/
├── stores/__tests__/          # 3 store test files
├── pages/__tests__/           # 3 page test files
├── lib/__tests__/             # 2 utility test files
├── components/layout/__tests__/ # 1 layout test file
└── flows/__tests__/           # 2 integration test files

tests/e2e/                     # 2 Playwright spec files
```

**Current coverage: 43 unit/integration tests, 2 E2E specs**

## Conventions

- **State**: All business state in `storeOpsStore.ts`. Auth in `authStore.ts`. Theme in `themeStore.ts`.
- **Naming**: PascalCase for components/pages, camelCase for functions/variables, `Record` suffix for data types (e.g., `OrderRecord`, `StaffRecord`).
- **Imports**: Path aliases — `@/` = `src/renderer/src/`, `@main/` = `src/main/`, `@preload/` = `src/preload/`.
- **Components**: shadcn/ui primitives in `components/ui/`. Layout wrappers in `components/layout/`.
- **Testing**: Vitest + React Testing Library for unit/integration, Playwright for E2E.
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `ci:`, etc.).
- **Branches**: `type/description` format (`feat/add-printing`, `fix/cart-total`).

## Common Tasks for Agents

### Adding a new page
1. Create `src/renderer/src/pages/yourPage.tsx`
2. Add route in `App.tsx`
3. Add feature key to `DeploymentFeatureKey` type in `storeOpsStore.ts`
4. Update `accessControl.ts` route map
5. Add nav item in `sidebar.tsx`
6. Add tests

### Adding a new store action
1. Add the action signature to the store's type
2. Implement in `storeOpsStore.ts` using `set()` / `get()`
3. Add test in `stores/__tests__/storeOpsStore.test.ts`

### Adding a new IPC channel
1. Define handler in `src/main/ipc/` (auth or sync)
2. Add method to `src/preload/index.ts` context bridge
3. Add type to `DesktopApi` interface
4. Use via `getDesktopApi()` in renderer

### Adding a new industry module
1. Define types in `storeOpsStore.ts`
2. Add feature keys to `DeploymentFeatureKey`
3. Create deployment template in `deploymentConfig.ts`
4. Add UI section in `businessSuitePage.tsx`
5. Update access control

## Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | `super_admin` |

## Critical Warnings

- **`storeOpsStore.ts` is 4136 lines** — Be careful with edits. Read the relevant section before modifying.
- **No SQL for business data** — Don't look for product/order tables in Drizzle. They're in Zustand.
- **Offline-first** — The app must work without a server. Never make features depend on sync.
- **Feature flags drive everything** — If a feature key isn't enabled in the deployment, the UI hides it and the route guard blocks it.
- **React 19** — No global `JSX` namespace. Don't add `JSX.Element` return type annotations.
- **Tailwind 3** — Not v4. The config uses `tailwind.config.ts` with CSS variable theme.
- **React Router 6** — Not v7. Uses `<Routes>` / `<Route>` pattern.
