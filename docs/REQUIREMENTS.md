# Requirements Specification

## System Requirements

### Functional Requirements

#### FR-1: Authentication & Authorization

| ID | Requirement | Status |
|----|------------|--------|
| FR-1.1 | System shall authenticate users with username and password | Done |
| FR-1.2 | Passwords shall be hashed with scrypt (64-byte key, 32-byte salt) | Done |
| FR-1.3 | System shall support 3 roles: super_admin, manager, cashier | Done |
| FR-1.4 | System shall support per-user feature overrides (grant/revoke) | Done |
| FR-1.5 | System shall support 6 permission presets for common job functions | Done |
| FR-1.6 | System shall redirect unauthorized route access to first valid route | Done |
| FR-1.7 | Super admin console and user management shall be super_admin only | Done |
| FR-1.8 | System shall support temporary password reset by admin | Done |

#### FR-2: Point of Sale

| ID | Requirement | Status |
|----|------------|--------|
| FR-2.1 | POS shall support product search and cart management | Done |
| FR-2.2 | POS shall calculate subtotal, tax, discount, and total | Done |
| FR-2.3 | POS shall support cash, card, and digital payment methods | Done |
| FR-2.4 | POS shall deduct stock on checkout (configurable) | Done |
| FR-2.5 | POS shall create order records with full line items | Done |
| FR-2.6 | POS shall update customer loyalty points on purchase | Done |
| FR-2.7 | Register sessions shall track opening/closing cash | Done |

#### FR-3: Order Management

| ID | Requirement | Status |
|----|------------|--------|
| FR-3.1 | Orders shall have status lifecycle (completed/cancelled/refunded) | Done |
| FR-3.2 | Orders shall support CSV/TSV/JSON/TXT import with header analysis | Done |
| FR-3.3 | Orders shall support custom fields at runtime | Done |
| FR-3.4 | Invoices shall be created from orders with due dates and reminders | Done |
| FR-3.5 | Invoice reminders shall trigger audio + visual notifications | Done |
| FR-3.6 | Orders shall support delivery tracking with status and date | Done |

#### FR-4: Inventory

| ID | Requirement | Status |
|----|------------|--------|
| FR-4.1 | Products shall have name, category, price, stock, reorder level | Done |
| FR-4.2 | Stock adjustments shall be tracked | Done |
| FR-4.3 | Reorder alerts shall be visible when stock <= reorder level | Done |
| FR-4.4 | Products and categories shall support bulk import/export | Done |

#### FR-5: Customer Management

| ID | Requirement | Status |
|----|------------|--------|
| FR-5.1 | Customers shall have loyalty points and credit balance | Done |
| FR-5.2 | Customer activity history shall be tracked | Done |
| FR-5.3 | Credit actions (add/deduct) shall be supported | Done |
| FR-5.4 | Customer data shall support import/export | Done |

#### FR-6: HR & Workforce

| ID | Requirement | Status |
|----|------------|--------|
| FR-6.1 | Staff records with role, department, salary, status | Done |
| FR-6.2 | Clock in/out with duration and overtime tracking | Done |
| FR-6.3 | Break management (start/end) with daily totals | Done |
| FR-6.4 | Shift planning with date, time, and role assignment | Done |
| FR-6.5 | Leave requests with approval workflow | Done |
| FR-6.6 | Payroll generation from attendance (base + overtime - deductions) | Done |
| FR-6.7 | Loan tracking and repayment | Done |
| FR-6.8 | Department transfers with audit trail | Done |
| FR-6.9 | Tips pool collection and distribution | Done |
| FR-6.10 | Commission tracking (rate, sales, earned) | Done |
| FR-6.11 | Meetings and appointments scheduling | Done |

#### FR-7: Industry Modules

| ID | Requirement | Status |
|----|------------|--------|
| FR-7.1 | Restaurant: table management with status lifecycle | Done |
| FR-7.2 | Restaurant: kitchen tickets with channel and course tracking | Done |
| FR-7.3 | Salon: service catalog with duration, price, deposits | Done |
| FR-7.4 | Salon: booking management with no-show handling | Done |
| FR-7.5 | Field Service: job dispatch with technician assignment | Done |
| FR-7.6 | Field Service: estimates with price book and invoice conversion | Done |
| FR-7.7 | Grocery: delivery subscriptions (daily/weekly/custom) | Done |
| FR-7.8 | Grocery: route manifests with stop-level delivery confirmation | Done |

#### FR-8: Platform Controls

| ID | Requirement | Status |
|----|------------|--------|
| FR-8.1 | Setup wizard for first-run deployment configuration | Done |
| FR-8.2 | Setup wizard re-run from Settings (super_admin only) | Done |
| FR-8.3 | 6 deployment templates (Retail, Restaurant, Salon, Field, Grocery, All) | Done |
| FR-8.4 | Light/dark theme with persistence | Done |
| FR-8.5 | i18n: locale, currency, timezone, date format preferences | Done |
| FR-8.6 | Offline sync controls and manual sync trigger | Done |
| FR-8.7 | Super admin live operations dashboard | Done |
| FR-8.8 | User account management with audit trail | Done |
| FR-8.9 | Full snapshot backup export/import (JSON) with PDF summary | Done |

#### FR-9: Data Exchange

| ID | Requirement | Status |
|----|------------|--------|
| FR-9.1 | Export to CSV, TSV, JSON, TXT, PDF, XLSX | Done |
| FR-9.2 | Import from CSV, TSV, JSON, TXT with fuzzy header matching | Done |
| FR-9.3 | All domains exportable: orders, invoices, inventory, customers, HR, users, settings | Done |

### Non-Functional Requirements

| ID | Requirement | Status |
|----|------------|--------|
| NFR-1 | Offline-first: full functionality without server | Done |
| NFR-2 | Cross-platform: Linux, macOS, Windows via Electron | Done |
| NFR-3 | Secure auth: scrypt password hashing, no plaintext storage | Done |
| NFR-4 | Type safety: TypeScript strict mode, no `any` | Done |
| NFR-5 | Test coverage: unit + integration + E2E | Done (43 + 2) |
| NFR-6 | CI/CD: GitHub Actions for lint, typecheck, test, build | Done |
| NFR-7 | Bundle size: renderer < 2MB JS | Done (1.5MB) |
| NFR-8 | Hot reload: Vite HMR in development | Done |

---

## Technical Requirements

### Runtime
- Node.js >= 20
- Electron 41
- pnpm >= 10

### Browser Target
- Chromium (Electron embedded)

### Build Output
- `out/main/index.js` — Main process bundle
- `out/preload/index.mjs` — Preload script
- `out/renderer/` — Static SPA (HTML + JS + CSS)
