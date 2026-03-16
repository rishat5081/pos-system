# POS System

Electron desktop POS built with React, Vite, TypeScript, Tailwind, and shadcn/ui.

## Run

```bash
pnpm install
pnpm dev
```

## Demo credentials

- Username: `admin`
- Password: `admin123`

## First-run deployment flow

After login, the app sends an unconfigured store to the setup wizard. The wizard captures:

- deployment template
- store identity
- enabled industries
- enabled modules

Available deployment templates:

- `Retail`
- `Restaurant`
- `Salon`
- `Field Service`
- `Grocery + Dairy`
- `All In One`

The setup wizard can be intentionally reopened from Settings by a `super_admin`. Re-running setup preserves operational data and only reopens deployment configuration.

## Access model

The app now uses a single permission matrix for navigation and route access.

Role scope:

- `super_admin`: full platform access, including super admin console, user management, deployment changes, and setup rerun
- `manager`: operational management access, including business suite, HR, inventory, counters, reports, and settings
- `cashier`: sales-facing access, including dashboard, POS, orders, and customers

Per-user overrides:

- feature access can be explicitly `allowed` or `revoked` per account
- overrides are applied on top of the role default
- overrides are persisted through the main-process auth layer and included in the live session
- job-function presets can apply curated override bundles faster for cashier, customer desk, inventory, HR, restaurant, and operations roles

Protected areas:

- `Super Admin Console` is `super_admin` only
- `User Management` is `super_admin` only
- `Settings` is `manager` or `super_admin`
- vertical operating modules inside Business Suite are restricted to `manager` or `super_admin`

If a role tries to open a route that is not allowed for that deployment or role, the app redirects to the first valid module for that user.

## Implemented modules

Core commerce:

- authentication, protected routing, and session hydration
- dashboard KPIs and visual summaries
- POS checkout, cart updates, stock deduction, register open/close, and payments
- orders with status management, CSV import analysis flow, runtime custom fields, invoice creation, due reminders, and delivery tracking
- inventory with categories, stock adjustment, reorder visibility, and product management
- customers with loyalty, credit actions, and activity history
- counter management for assignments and active work state
- reports for operations and finance summaries
- settings for deployment, permissions, localization, and sync

HR and workforce:

- employee directory
- attendance and clock tracking
- payroll generation
- loan tracking
- department transfer history and export
- meetings, appointments, shift planning, and calendar day summaries

Data exchange:

- orders export in `csv`, `tsv`, `json`, `txt`, `pdf`, and `xlsx`
- invoices export in `csv`, `tsv`, `json`, `txt`, `pdf`, and `xlsx`
- order import from `csv`, `tsv`, `json`, and `txt` with header analysis and retained custom fields
- inventory import/export for products and categories
- customer import/export for directories, activity, single-customer history, and customer orders
- HR import/export for employee directory, meetings, appointments, shifts, leave, payroll, department history, and selected calendar day summary
- user management import/export for account directories and audit logs
- settings-level full snapshot JSON backup export/import plus PDF summary export

Cross-industry suite:

- restaurant tables and kitchen tickets
- salon services, bookings, deposits, and no-show handling
- field jobs, dispatch, estimates, and invoice conversion
- grocery and dairy subscriptions plus route manifests

Platform controls:

- super admin live operations screen
- user account management with role/status updates, per-user feature overrides, job-function presets, temporary password reset, and audit trail
- light and dark theme switching
- international locale, currency, timezone, and date formatting
- offline sync controls and manual sync

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Notes:

- `pnpm exec eslint . --ext .ts,.tsx` is the reliable direct lint command
- `pnpm lint` can occasionally race with Electron Vite temp config files if it is run alongside build processes

## Validation status

Current validation target:

- unit and integration coverage with Vitest
- UI browser flows with Playwright
- production renderer/electron build

Validated commands:

```bash
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm exec eslint . --ext .ts,.tsx
```
