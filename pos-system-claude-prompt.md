# CLAUDE.md — All-in-One POS / Inventory / Business Management System

> **This document is the master blueprint for Claude Code.** Every feature, design decision, architecture choice, and implementation detail is defined here. Follow this document exactly.

---

## 1. PROJECT OVERVIEW

### 1.1 What This Is

A **desktop-first, multi-tenant, white-label** business management platform built with Electron.js. It combines:

- **Point of Sale (POS)** — Fast checkout, barcode scanning, receipt printing, payment processing
- **Inventory Management** — Stock tracking, purchase orders, suppliers, warehousing, expiry tracking
- **Accounting & Finance** — Ledger, profit/loss, tax calculations, invoicing, expense tracking
- **Customer Relationship Management (CRM)** — Customer profiles, loyalty programs, credit management
- **Human Resources (HR)** — Employee management, attendance, payroll, shifts, commissions
- **Reporting & Analytics** — Real-time dashboards, exportable reports, trend analysis
- **User & Access Management** — Role-based access, audit logs, super admin oversight
- **Multi-Store Management** — Centralized control across multiple shop deployments

Each deployment is **independent per shop/store** — the shop owner fully controls their instance. An optional **cloud sync** layer allows multi-store owners to aggregate data.

### 1.2 Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Desktop Shell | Electron.js (latest stable) | Cross-platform desktop app |
| Frontend Framework | React 18+ with TypeScript | Component-based UI, type safety |
| UI Library | Tailwind CSS + shadcn/ui | Customizable design system, accessible components |
| State Management | Zustand | Lightweight, minimal boilerplate |
| Local Database (Primary) | SQLite via better-sqlite3 | Zero-config, file-based, works offline |
| Optional Remote DB | PostgreSQL via Sequelize | For multi-store cloud sync deployments |
| ORM | Drizzle ORM | Type-safe queries, works with both SQLite and PostgreSQL |
| IPC Communication | Electron IPC (contextBridge) | Secure main↔renderer communication |
| Build Tool | Vite | Fast HMR, optimized builds |
| Packaging | electron-builder | Cross-platform packaging (Windows, macOS, Linux) |
| Printing | electron-pos-printer or node-thermal-printer | Receipt and report printing |
| Barcode | quagga2 (scanning) + JsBarcode (generation) | Barcode/QR operations |
| Charts | Recharts or Chart.js | Dashboard visualizations |
| PDF Export | jsPDF + autoTable | Report generation |
| Excel Export | exceljs | Spreadsheet exports |
| Auto-Update | electron-updater | OTA updates for deployed instances |

### 1.3 Project Structure

```
pos-system/
├── electron/                          # Electron main process
│   ├── main.ts                        # App entry point, window creation
│   ├── preload.ts                     # Context bridge, IPC exposure
│   ├── ipc/                           # IPC handlers organized by domain
│   │   ├── auth.ipc.ts
│   │   ├── pos.ipc.ts
│   │   ├── inventory.ipc.ts
│   │   ├── finance.ipc.ts
│   │   ├── reports.ipc.ts
│   │   ├── users.ipc.ts
│   │   ├── settings.ipc.ts
│   │   ├── backup.ipc.ts
│   │   └── print.ipc.ts
│   ├── database/
│   │   ├── connection.ts              # DB connection manager (SQLite/PostgreSQL)
│   │   ├── migrations/                # All migration files (numbered)
│   │   ├── seeds/                     # Seed data for fresh installs
│   │   └── schema.ts                  # Drizzle schema definitions
│   ├── services/                      # Business logic (main process)
│   │   ├── auth.service.ts
│   │   ├── pos.service.ts
│   │   ├── inventory.service.ts
│   │   ├── finance.service.ts
│   │   ├── customer.service.ts
│   │   ├── employee.service.ts
│   │   ├── report.service.ts
│   │   ├── backup.service.ts
│   │   ├── audit.service.ts
│   │   ├── print.service.ts
│   │   └── sync.service.ts           # Cloud sync (optional)
│   ├── utils/
│   │   ├── logger.ts                  # Winston-based file logging
│   │   ├── encryption.ts             # Data encryption utilities
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── updater.ts                     # Auto-update logic
├── src/                               # React renderer process
│   ├── main.tsx                       # React entry
│   ├── App.tsx                        # Root component, router, theme provider
│   ├── assets/                        # Static assets (default logos, icons)
│   ├── components/
│   │   ├── ui/                        # shadcn/ui base components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── pos/
│   │   │   ├── POSTerminal.tsx        # Main POS screen
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   ├── ReceiptPreview.tsx
│   │   │   ├── BarcodeScanner.tsx
│   │   │   ├── CustomerSearch.tsx
│   │   │   ├── DiscountApplier.tsx
│   │   │   ├── HoldOrders.tsx
│   │   │   └── QuickKeys.tsx
│   │   ├── inventory/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── CategoryManager.tsx
│   │   │   ├── StockAdjustment.tsx
│   │   │   ├── PurchaseOrders.tsx
│   │   │   ├── SupplierManager.tsx
│   │   │   ├── StockAlerts.tsx
│   │   │   ├── ExpiryTracker.tsx
│   │   │   ├── BatchManager.tsx
│   │   │   └── WarehouseManager.tsx
│   │   ├── finance/
│   │   │   ├── Ledger.tsx
│   │   │   ├── InvoiceList.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── ExpenseTracker.tsx
│   │   │   ├── ProfitLoss.tsx
│   │   │   ├── TaxManager.tsx
│   │   │   ├── CashRegister.tsx
│   │   │   └── PaymentHistory.tsx
│   │   ├── customers/
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerProfile.tsx
│   │   │   ├── LoyaltyProgram.tsx
│   │   │   ├── CreditManager.tsx
│   │   │   └── CustomerHistory.tsx
│   │   ├── employees/
│   │   │   ├── EmployeeList.tsx
│   │   │   ├── EmployeeForm.tsx
│   │   │   ├── AttendanceTracker.tsx
│   │   │   ├── ShiftScheduler.tsx
│   │   │   ├── PayrollManager.tsx
│   │   │   └── CommissionTracker.tsx
│   │   ├── reports/
│   │   │   ├── Dashboard.tsx          # Main analytics dashboard
│   │   │   ├── SalesReport.tsx
│   │   │   ├── InventoryReport.tsx
│   │   │   ├── FinanceReport.tsx
│   │   │   ├── EmployeeReport.tsx
│   │   │   ├── CustomerReport.tsx
│   │   │   ├── TaxReport.tsx
│   │   │   └── ExportManager.tsx
│   │   ├── admin/
│   │   │   ├── SuperAdminDashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── RoleManager.tsx
│   │   │   ├── AuditLog.tsx
│   │   │   ├── SystemSettings.tsx
│   │   │   ├── BrandingSettings.tsx   # Logo, colors, receipt header
│   │   │   ├── BackupRestore.tsx
│   │   │   └── LicenseManager.tsx
│   │   └── shared/
│   │       ├── DataTable.tsx          # Reusable sortable/filterable table
│   │       ├── SearchBar.tsx
│   │       ├── DateRangePicker.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── NotificationBell.tsx
│   │       ├── FileUploader.tsx
│   │       └── PrintButton.tsx
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   ├── usePOS.ts
│   │   ├── useInventory.ts
│   │   ├── useNotifications.ts
│   │   └── useTheme.ts
│   ├── stores/                        # Zustand stores
│   │   ├── authStore.ts
│   │   ├── posStore.ts
│   │   ├── cartStore.ts
│   │   ├── inventoryStore.ts
│   │   ├── settingsStore.ts
│   │   ├── notificationStore.ts
│   │   └── themeStore.ts
│   ├── lib/
│   │   ├── ipc.ts                     # Type-safe IPC client wrappers
│   │   ├── formatters.ts             # Currency, date, number formatters
│   │   ├── permissions.ts            # Permission constants and helpers
│   │   └── validators.ts             # Form validation schemas (zod)
│   ├── styles/
│   │   ├── globals.css                # Tailwind base + CSS custom properties
│   │   └── themes/                    # Pre-built theme presets
│   │       ├── default.css
│   │       ├── dark.css
│   │       ├── blue-professional.css
│   │       ├── green-nature.css
│   │       └── custom.css             # User-defined overrides
│   └── types/
│       ├── database.types.ts          # DB model types
│       ├── api.types.ts               # IPC request/response types
│       ├── pos.types.ts
│       ├── inventory.types.ts
│       ├── finance.types.ts
│       └── auth.types.ts
├── resources/                         # Electron build resources
│   ├── icon.png
│   ├── icon.ico
│   └── icon.icns
├── scripts/
│   ├── setup-db.ts                    # First-run database setup
│   └── generate-migration.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── electron-builder.yml
├── tailwind.config.ts
├── drizzle.config.ts
├── .eslintrc.cjs
├── .prettierrc
└── CLAUDE.md                          # This file
```

---

## 2. DATABASE SCHEMA (COMPLETE)

### 2.1 Design Principles

- Every table has `id` (UUID primary key), `created_at`, `updated_at`, `deleted_at` (soft delete)
- All monetary values stored as **integers in cents/smallest currency unit** (never floating point)
- Every mutation records who did it (`created_by`, `updated_by` → users.id)
- Multi-tenant: every business-scoped table has `store_id` foreign key
- Indexes on all foreign keys and commonly queried columns

### 2.2 Core Tables

```sql
-- ============================================
-- STORE & CONFIGURATION
-- ============================================

CREATE TABLE stores (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,
    legal_name TEXT,
    tax_id TEXT,                            -- VAT/Tax registration number
    currency TEXT NOT NULL DEFAULT 'USD',   -- ISO 4217 currency code
    timezone TEXT NOT NULL DEFAULT 'UTC',
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT NOT NULL DEFAULT 'US',     -- ISO 3166-1 alpha-2
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_path TEXT,                         -- Path to uploaded logo file
    receipt_header TEXT,                    -- Custom text on receipt top
    receipt_footer TEXT,                    -- Custom text on receipt bottom
    fiscal_year_start_month INTEGER DEFAULT 1, -- 1=Jan, 4=Apr, etc.
    low_stock_threshold INTEGER DEFAULT 10, -- Global default for low stock alerts
    is_active INTEGER NOT NULL DEFAULT 1,
    license_key TEXT,
    license_expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE TABLE store_settings (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    key TEXT NOT NULL,                      -- Setting key (e.g., 'pos.default_tax_rate')
    value TEXT NOT NULL,                    -- JSON-encoded value
    category TEXT NOT NULL,                 -- 'pos', 'inventory', 'finance', 'appearance', 'printing', 'notifications'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(store_id, key)
);

-- ============================================
-- USER & ACCESS MANAGEMENT
-- ============================================

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    username TEXT NOT NULL,
    email TEXT,
    password_hash TEXT NOT NULL,            -- bcrypt hashed
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_path TEXT,
    role_id TEXT NOT NULL REFERENCES roles(id),
    pin_code TEXT,                          -- 4-6 digit PIN for quick POS login
    is_active INTEGER NOT NULL DEFAULT 1,
    is_super_admin INTEGER NOT NULL DEFAULT 0,
    last_login_at TEXT,
    password_changed_at TEXT,
    force_password_change INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TEXT,                      -- Account lockout timestamp
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    UNIQUE(store_id, username)
);

CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,                     -- 'Super Admin', 'Manager', 'Cashier', 'Inventory Clerk', etc.
    description TEXT,
    is_system_role INTEGER DEFAULT 0,       -- 1 = cannot be deleted (Super Admin, etc.)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(store_id, name)
);

CREATE TABLE permissions (
    id TEXT PRIMARY KEY,
    module TEXT NOT NULL,                   -- 'pos', 'inventory', 'finance', 'customers', 'employees', 'reports', 'admin'
    action TEXT NOT NULL,                   -- 'view', 'create', 'update', 'delete', 'export', 'print', 'void', 'refund', 'discount'
    resource TEXT NOT NULL,                 -- 'sales', 'products', 'invoices', 'users', 'settings', etc.
    description TEXT,
    UNIQUE(module, action, resource)
);

CREATE TABLE role_permissions (
    id TEXT PRIMARY KEY,
    role_id TEXT NOT NULL REFERENCES roles(id),
    permission_id TEXT NOT NULL REFERENCES permissions(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(role_id, permission_id)
);

CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token TEXT NOT NULL,
    device_info TEXT,                       -- JSON: { os, hostname, ip }
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- AUDIT & LOGGING
-- ============================================

CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,                   -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT', 'VOID', 'REFUND'
    module TEXT NOT NULL,                   -- 'pos', 'inventory', 'finance', etc.
    resource_type TEXT NOT NULL,            -- Table/entity name
    resource_id TEXT,                       -- ID of affected record
    old_values TEXT,                        -- JSON: previous state
    new_values TEXT,                        -- JSON: new state
    ip_address TEXT,
    device_info TEXT,
    notes TEXT,                             -- Optional description
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_store_date ON audit_logs(store_id, created_at);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- ============================================
-- PRODUCTS & INVENTORY
-- ============================================

CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    parent_id TEXT REFERENCES categories(id), -- For nested categories
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,                             -- Hex color for POS display
    icon TEXT,                              -- Icon identifier
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE TABLE brands (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,
    logo_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    UNIQUE(store_id, name)
);

CREATE TABLE units (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,                     -- 'Piece', 'Kilogram', 'Liter', 'Box', 'Carton', 'Dozen'
    abbreviation TEXT NOT NULL,             -- 'pc', 'kg', 'L', 'box', 'ctn', 'dz'
    is_default INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(store_id, abbreviation)
);

CREATE TABLE products (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    category_id TEXT REFERENCES categories(id),
    brand_id TEXT REFERENCES brands(id),
    unit_id TEXT REFERENCES units(id),
    sku TEXT,                               -- Stock Keeping Unit (unique per store)
    barcode TEXT,                           -- EAN/UPC barcode
    name TEXT NOT NULL,
    description TEXT,
    image_path TEXT,

    -- Pricing (all in cents / smallest currency unit)
    cost_price INTEGER NOT NULL DEFAULT 0,      -- Purchase/cost price
    selling_price INTEGER NOT NULL,              -- Retail selling price
    wholesale_price INTEGER,                     -- Bulk/wholesale price
    minimum_price INTEGER,                       -- Floor price (no discount below this)

    -- Tax
    tax_rate REAL DEFAULT 0,                     -- Tax percentage (e.g., 18.0 for 18%)
    is_tax_inclusive INTEGER DEFAULT 0,           -- 1 = selling_price includes tax
    tax_category TEXT,                            -- 'standard', 'reduced', 'zero', 'exempt'

    -- Stock
    current_stock REAL NOT NULL DEFAULT 0,        -- REAL for fractional units (kg, liters)
    low_stock_threshold INTEGER,                  -- Override store default
    reorder_point INTEGER,                        -- Auto-generate PO when stock hits this
    reorder_quantity INTEGER,                     -- Default quantity for reorder
    max_stock INTEGER,                            -- Maximum stock level

    -- Properties
    is_active INTEGER NOT NULL DEFAULT 1,
    is_service INTEGER DEFAULT 0,                 -- 1 = service item (no stock tracking)
    is_serialized INTEGER DEFAULT 0,              -- 1 = track serial numbers
    is_batch_tracked INTEGER DEFAULT 0,           -- 1 = track batches/lots
    has_expiry INTEGER DEFAULT 0,                 -- 1 = track expiry dates
    allow_negative_stock INTEGER DEFAULT 0,       -- 1 = can sell even if stock is 0
    is_weighable INTEGER DEFAULT 0,               -- 1 = sold by weight

    -- POS Display
    pos_color TEXT,                               -- Quick-key color on POS
    pos_favorite INTEGER DEFAULT 0,               -- 1 = show in POS favorites
    sort_order INTEGER DEFAULT 0,

    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    UNIQUE(store_id, sku)
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(store_id, category_id);
CREATE INDEX idx_products_search ON products(store_id, name, sku, barcode);

CREATE TABLE product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    name TEXT NOT NULL,                     -- 'Large', 'Red', 'Size 42'
    sku TEXT,
    barcode TEXT,
    additional_cost INTEGER DEFAULT 0,      -- Price modifier in cents
    additional_price INTEGER DEFAULT 0,
    current_stock REAL DEFAULT 0,
    image_path TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE TABLE product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    image_path TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE serial_numbers (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    serial_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'sold', 'returned', 'damaged', 'warranty'
    purchase_order_id TEXT REFERENCES purchase_orders(id),
    sale_item_id TEXT REFERENCES sale_items(id),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE batches (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    batch_number TEXT NOT NULL,
    quantity REAL NOT NULL,
    remaining_quantity REAL NOT NULL,
    cost_price INTEGER,
    manufacture_date TEXT,
    expiry_date TEXT,
    supplier_id TEXT REFERENCES suppliers(id),
    purchase_order_id TEXT REFERENCES purchase_orders(id),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_batches_expiry ON batches(expiry_date);

CREATE TABLE stock_adjustments (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    variant_id TEXT REFERENCES product_variants(id),
    type TEXT NOT NULL,                     -- 'addition', 'subtraction', 'damage', 'theft', 'return', 'correction', 'transfer'
    quantity REAL NOT NULL,                  -- Positive or negative
    previous_stock REAL NOT NULL,
    new_stock REAL NOT NULL,
    reason TEXT NOT NULL,
    reference_type TEXT,                    -- 'sale', 'purchase_order', 'transfer', 'manual'
    reference_id TEXT,                      -- ID of related record
    adjusted_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- SUPPLIERS & PURCHASING
-- ============================================

CREATE TABLE suppliers (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    tax_id TEXT,
    payment_terms TEXT,                     -- 'net_30', 'net_60', 'cod', 'prepaid'
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    balance_due INTEGER DEFAULT 0,          -- Outstanding balance in cents
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE TABLE supplier_products (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    supplier_sku TEXT,                      -- Supplier's own SKU
    supplier_price INTEGER,                 -- Supplier's price in cents
    lead_time_days INTEGER,                 -- Expected delivery time
    minimum_order_quantity INTEGER,
    is_preferred INTEGER DEFAULT 0,         -- Preferred supplier for this product
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(supplier_id, product_id)
);

CREATE TABLE purchase_orders (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    supplier_id TEXT NOT NULL REFERENCES suppliers(id),
    po_number TEXT NOT NULL,                -- Auto-generated PO-YYYYMMDD-XXXX
    status TEXT NOT NULL DEFAULT 'draft',   -- 'draft', 'sent', 'partially_received', 'received', 'cancelled'
    order_date TEXT NOT NULL,
    expected_date TEXT,
    received_date TEXT,
    subtotal INTEGER NOT NULL DEFAULT 0,
    tax_amount INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    shipping_cost INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT DEFAULT 'unpaid',   -- 'unpaid', 'partially_paid', 'paid'
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    approved_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    UNIQUE(store_id, po_number)
);

CREATE TABLE purchase_order_items (
    id TEXT PRIMARY KEY,
    purchase_order_id TEXT NOT NULL REFERENCES purchase_orders(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    variant_id TEXT REFERENCES product_variants(id),
    quantity_ordered REAL NOT NULL,
    quantity_received REAL DEFAULT 0,
    unit_cost INTEGER NOT NULL,             -- Cost per unit in cents
    tax_rate REAL DEFAULT 0,
    tax_amount INTEGER DEFAULT 0,
    discount_percent REAL DEFAULT 0,
    total_amount INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE goods_received_notes (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    purchase_order_id TEXT NOT NULL REFERENCES purchase_orders(id),
    grn_number TEXT NOT NULL,
    received_date TEXT NOT NULL,
    received_by TEXT NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE grn_items (
    id TEXT PRIMARY KEY,
    grn_id TEXT NOT NULL REFERENCES goods_received_notes(id),
    po_item_id TEXT NOT NULL REFERENCES purchase_order_items(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity_received REAL NOT NULL,
    quantity_rejected REAL DEFAULT 0,
    rejection_reason TEXT,
    batch_number TEXT,
    expiry_date TEXT,
    serial_numbers TEXT,                    -- JSON array of serial numbers
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- CUSTOMERS & CRM
-- ============================================

CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    customer_code TEXT,                     -- Auto-generated CUST-XXXX
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    date_of_birth TEXT,
    gender TEXT,                            -- 'male', 'female', 'other', 'prefer_not_to_say'
    company_name TEXT,
    tax_id TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,

    -- Financial
    credit_limit INTEGER DEFAULT 0,         -- Maximum credit in cents
    credit_balance INTEGER DEFAULT 0,       -- Current outstanding credit in cents
    total_purchases INTEGER DEFAULT 0,      -- Lifetime purchase total in cents
    total_returns INTEGER DEFAULT 0,

    -- Loyalty
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze',     -- 'bronze', 'silver', 'gold', 'platinum'

    -- Preferences
    preferred_payment_method TEXT,
    notes TEXT,
    tags TEXT,                              -- JSON array of tags

    is_active INTEGER DEFAULT 1,
    is_wholesale INTEGER DEFAULT 0,         -- 1 = wholesale customer (gets wholesale prices)
    created_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    UNIQUE(store_id, customer_code)
);

CREATE TABLE loyalty_rules (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    points_per_currency_unit REAL DEFAULT 1, -- e.g., 1 point per $1 spent
    redemption_value INTEGER DEFAULT 1,      -- Value per point in cents
    minimum_redemption_points INTEGER DEFAULT 100,
    tier_thresholds TEXT,                    -- JSON: { silver: 1000, gold: 5000, platinum: 10000 }
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE loyalty_transactions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    type TEXT NOT NULL,                     -- 'earned', 'redeemed', 'expired', 'adjusted'
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type TEXT,                    -- 'sale', 'return', 'manual', 'promotion'
    reference_id TEXT,
    notes TEXT,
    created_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- SALES & POS
-- ============================================

CREATE TABLE registers (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,                     -- 'Register 1', 'Counter A'
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE register_sessions (
    id TEXT PRIMARY KEY,
    register_id TEXT NOT NULL REFERENCES registers(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    opening_amount INTEGER NOT NULL,        -- Cash in drawer at start (cents)
    closing_amount INTEGER,                 -- Cash in drawer at end (cents)
    expected_amount INTEGER,                -- System-calculated expected cash
    difference INTEGER,                     -- closing - expected (overage/shortage)
    status TEXT NOT NULL DEFAULT 'open',    -- 'open', 'closed'
    opened_at TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at TEXT,
    closing_notes TEXT
);

CREATE TABLE sales (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    register_session_id TEXT REFERENCES register_sessions(id),
    customer_id TEXT REFERENCES customers(id),
    sale_number TEXT NOT NULL,              -- Auto: INV-YYYYMMDD-XXXX
    sale_type TEXT NOT NULL DEFAULT 'sale', -- 'sale', 'return', 'exchange', 'layaway'
    status TEXT NOT NULL DEFAULT 'completed', -- 'draft', 'hold', 'completed', 'voided', 'returned'

    -- Amounts (all in cents)
    subtotal INTEGER NOT NULL,
    discount_amount INTEGER DEFAULT 0,
    discount_type TEXT,                     -- 'percentage', 'fixed'
    discount_value REAL,                    -- The entered value (percent or fixed amount)
    discount_reason TEXT,
    tax_amount INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL,

    -- Payment
    payment_status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'partial', 'unpaid', 'refunded'
    amount_paid INTEGER NOT NULL DEFAULT 0,
    change_given INTEGER DEFAULT 0,

    -- Loyalty
    loyalty_points_earned INTEGER DEFAULT 0,
    loyalty_points_redeemed INTEGER DEFAULT 0,

    -- Return/void info
    return_reason TEXT,
    original_sale_id TEXT REFERENCES sales(id), -- For returns: links to original sale
    voided_by TEXT REFERENCES users(id),
    voided_at TEXT,
    void_reason TEXT,

    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sales_store_date ON sales(store_id, created_at);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_number ON sales(sale_number);

CREATE TABLE sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL REFERENCES sales(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    variant_id TEXT REFERENCES product_variants(id),
    product_name TEXT NOT NULL,             -- Snapshot at time of sale
    sku TEXT,
    quantity REAL NOT NULL,
    unit_price INTEGER NOT NULL,            -- Price per unit in cents
    cost_price INTEGER NOT NULL,            -- Cost at time of sale (for profit calc)
    discount_amount INTEGER DEFAULT 0,
    discount_type TEXT,
    tax_rate REAL DEFAULT 0,
    tax_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,

    -- Return tracking
    quantity_returned REAL DEFAULT 0,

    serial_number TEXT,
    batch_id TEXT REFERENCES batches(id),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL REFERENCES sales(id),
    method TEXT NOT NULL,                   -- 'cash', 'card', 'mobile', 'bank_transfer', 'credit', 'loyalty_points', 'check', 'gift_card'
    amount INTEGER NOT NULL,                -- Amount in cents
    reference_number TEXT,                  -- Card last 4, transfer ref, etc.
    status TEXT DEFAULT 'completed',        -- 'completed', 'pending', 'failed', 'refunded'
    processed_at TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT
);

CREATE TABLE held_orders (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    customer_id TEXT REFERENCES customers(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    reference TEXT,                         -- Optional hold name/reference
    items TEXT NOT NULL,                    -- JSON: full cart snapshot
    notes TEXT,
    held_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT
);

-- ============================================
-- FINANCE & ACCOUNTING
-- ============================================

CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,                     -- 'Cash', 'Bank - Main', 'Accounts Receivable', etc.
    type TEXT NOT NULL,                     -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    code TEXT,                              -- Account code (e.g., '1000', '2000')
    parent_id TEXT REFERENCES accounts(id),
    balance INTEGER DEFAULT 0,              -- Current balance in cents
    is_system INTEGER DEFAULT 0,            -- 1 = system-created, cannot delete
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    entry_number TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    reference_type TEXT,                    -- 'sale', 'purchase', 'expense', 'adjustment'
    reference_id TEXT,
    is_posted INTEGER DEFAULT 0,
    created_by TEXT NOT NULL REFERENCES users(id),
    approved_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE journal_lines (
    id TEXT PRIMARY KEY,
    journal_entry_id TEXT NOT NULL REFERENCES journal_entries(id),
    account_id TEXT NOT NULL REFERENCES accounts(id),
    debit_amount INTEGER DEFAULT 0,
    credit_amount INTEGER DEFAULT 0,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE expenses (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    category TEXT NOT NULL,                 -- 'rent', 'utilities', 'salary', 'supplies', 'maintenance', 'other'
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,                -- In cents
    payment_method TEXT,
    receipt_path TEXT,                      -- Uploaded receipt image
    date TEXT NOT NULL,
    is_recurring INTEGER DEFAULT 0,
    recurrence_interval TEXT,               -- 'daily', 'weekly', 'monthly', 'yearly'
    vendor TEXT,
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    approved_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT
);

CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    customer_id TEXT NOT NULL REFERENCES customers(id),
    sale_id TEXT REFERENCES sales(id),
    invoice_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',   -- 'draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    tax_amount INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    amount_paid INTEGER DEFAULT 0,
    notes TEXT,
    terms TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    UNIQUE(store_id, invoice_number)
);

CREATE TABLE invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id),
    product_id TEXT REFERENCES products(id),
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price INTEGER NOT NULL,
    tax_rate REAL DEFAULT 0,
    tax_amount INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE invoice_payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id),
    amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    reference_number TEXT,
    payment_date TEXT NOT NULL,
    notes TEXT,
    received_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- EMPLOYEES & HR
-- ============================================

CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    user_id TEXT REFERENCES users(id),      -- Links to user account if they have one
    employee_code TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth TEXT,
    gender TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    national_id TEXT,
    hire_date TEXT NOT NULL,
    termination_date TEXT,
    department TEXT,
    position TEXT NOT NULL,
    employment_type TEXT DEFAULT 'full_time', -- 'full_time', 'part_time', 'contract', 'temporary'
    salary_type TEXT DEFAULT 'monthly',      -- 'hourly', 'daily', 'weekly', 'monthly'
    salary_amount INTEGER NOT NULL,          -- In cents
    commission_rate REAL DEFAULT 0,          -- Commission percentage on sales
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    UNIQUE(store_id, employee_code)
);

CREATE TABLE attendance (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id),
    date TEXT NOT NULL,
    clock_in TEXT,
    clock_out TEXT,
    break_minutes INTEGER DEFAULT 0,
    hours_worked REAL,
    overtime_hours REAL DEFAULT 0,
    status TEXT DEFAULT 'present',          -- 'present', 'absent', 'late', 'half_day', 'leave', 'holiday'
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(employee_id, date)
);

CREATE TABLE shifts (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,                     -- 'Morning', 'Evening', 'Night'
    start_time TEXT NOT NULL,               -- '09:00'
    end_time TEXT NOT NULL,                 -- '17:00'
    break_duration_minutes INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE shift_assignments (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id),
    shift_id TEXT NOT NULL REFERENCES shifts(id),
    date TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',        -- 'scheduled', 'completed', 'no_show', 'swapped'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(employee_id, date)
);

CREATE TABLE payroll (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    employee_id TEXT NOT NULL REFERENCES employees(id),
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    base_salary INTEGER NOT NULL,
    overtime_pay INTEGER DEFAULT 0,
    commission_amount INTEGER DEFAULT 0,
    bonuses INTEGER DEFAULT 0,
    deductions INTEGER DEFAULT 0,
    tax_amount INTEGER DEFAULT 0,
    net_pay INTEGER NOT NULL,
    payment_status TEXT DEFAULT 'pending',  -- 'pending', 'paid', 'cancelled'
    payment_date TEXT,
    payment_method TEXT,
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE commissions (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id),
    sale_id TEXT NOT NULL REFERENCES sales(id),
    sale_amount INTEGER NOT NULL,
    commission_rate REAL NOT NULL,
    commission_amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',          -- 'pending', 'approved', 'paid'
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- WAREHOUSES & STOCK TRANSFERS
-- ============================================

CREATE TABLE warehouses (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,
    address TEXT,
    is_default INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE warehouse_stock (
    id TEXT PRIMARY KEY,
    warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    variant_id TEXT REFERENCES product_variants(id),
    quantity REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(warehouse_id, product_id, variant_id)
);

CREATE TABLE stock_transfers (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    transfer_number TEXT NOT NULL,
    from_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    to_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    status TEXT DEFAULT 'pending',          -- 'pending', 'in_transit', 'received', 'cancelled'
    notes TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    received_by TEXT REFERENCES users(id),
    shipped_at TEXT,
    received_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE stock_transfer_items (
    id TEXT PRIMARY KEY,
    transfer_id TEXT NOT NULL REFERENCES stock_transfers(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    variant_id TEXT REFERENCES product_variants(id),
    quantity_sent REAL NOT NULL,
    quantity_received REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- GIFT CARDS & PROMOTIONS
-- ============================================

CREATE TABLE gift_cards (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    code TEXT NOT NULL,
    initial_value INTEGER NOT NULL,
    current_balance INTEGER NOT NULL,
    customer_id TEXT REFERENCES customers(id),
    is_active INTEGER DEFAULT 1,
    expires_at TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(store_id, code)
);

CREATE TABLE promotions (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,                     -- 'percentage_discount', 'fixed_discount', 'buy_x_get_y', 'bundle', 'free_item'
    value REAL,                             -- Discount value (percent or cents based on type)
    minimum_purchase INTEGER,               -- Minimum cart total to activate (cents)
    maximum_discount INTEGER,               -- Cap on discount amount (cents)
    applies_to TEXT NOT NULL,               -- 'all', 'category', 'product', 'customer_group'
    target_ids TEXT,                        -- JSON array of applicable category/product IDs
    start_date TEXT NOT NULL,
    end_date TEXT,
    usage_limit INTEGER,                    -- Max total uses
    usage_count INTEGER DEFAULT 0,
    per_customer_limit INTEGER,
    coupon_code TEXT,
    is_active INTEGER DEFAULT 1,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- NOTIFICATIONS & ALERTS
-- ============================================

CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    user_id TEXT REFERENCES users(id),      -- NULL = broadcast to all
    type TEXT NOT NULL,                     -- 'low_stock', 'expiry_alert', 'payment_due', 'target_achieved', 'system', 'custom'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info',           -- 'info', 'warning', 'error', 'success'
    is_read INTEGER DEFAULT 0,
    reference_type TEXT,
    reference_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at);

-- ============================================
-- DATA EXPORT & BACKUPS
-- ============================================

CREATE TABLE export_logs (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    export_type TEXT NOT NULL,              -- 'sales', 'inventory', 'finance', 'customers', 'employees', 'audit_log'
    format TEXT NOT NULL,                   -- 'pdf', 'xlsx', 'csv'
    file_path TEXT,
    parameters TEXT,                        -- JSON: date range, filters used
    status TEXT DEFAULT 'completed',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE backups (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES stores(id),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    type TEXT NOT NULL,                     -- 'manual', 'scheduled', 'pre_update'
    status TEXT DEFAULT 'completed',        -- 'in_progress', 'completed', 'failed'
    created_by TEXT REFERENCES users(id),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 3. USER INTERFACE DESIGN

### 3.1 Design Philosophy

- **Speed-first**: POS screen must respond in under 100ms for every interaction
- **Touch-friendly**: All interactive elements minimum 44x44px tap targets
- **Keyboard-navigable**: Every action reachable via keyboard shortcuts
- **Information density**: Show maximum useful information without clutter
- **Consistent**: Same patterns across all modules

### 3.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR (48px height)                                       │
│  [☰ Menu] [Store Name + Logo]    [🔔 3] [👤 John] [⚙️]     │
├────────┬────────────────────────────────────────────────────┤
│        │                                                     │
│  SIDE  │  MAIN CONTENT AREA                                  │
│  BAR   │                                                     │
│  (240px│  - Page title + breadcrumb                          │
│  width)│  - Action buttons (top-right)                       │
│        │  - Content (tables, forms, dashboards)              │
│  📊 Dash│  - Pagination (bottom)                              │
│  💰 POS │                                                     │
│  📦 Inv │                                                     │
│  💵 Fin │                                                     │
│  👥 Cust│                                                     │
│  👷 Emp │                                                     │
│  📈 Rep │                                                     │
│  ⚙️ Admin│                                                     │
│        │                                                     │
│        │                                                     │
├────────┴────────────────────────────────────────────────────┤
│  STATUS BAR (24px) [DB: Connected] [Register: Open] [v1.0]  │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 POS Screen Layout (Full-Screen Mode)

```
┌──────────────────────────────────────────────────────────────────┐
│ POS MODE  [← Back to Dashboard]  Register: Counter 1  User: John │
├───────────────────────────────────┬──────────────────────────────┤
│                                   │  CART                         │
│  PRODUCT AREA                     │  ┌──────────────────────────┐│
│                                   │  │ Item        Qty    Price ││
│  [🔍 Search / Scan barcode...]    │  │──────────────────────────││
│                                   │  │ Cola 500ml   2    $3.00  ││
│  Categories:                      │  │ Bread Wht    1    $2.50  ││
│  [All] [Beverages] [Snacks]       │  │ Milk 1L      1    $4.00  ││
│  [Dairy] [Bakery] [Produce]       │  │                          ││
│                                   │  │                          ││
│  ┌──────┐ ┌──────┐ ┌──────┐     │  │                          ││
│  │ Cola │ │Pepsi │ │Water │     │  └──────────────────────────┘│
│  │$1.50 │ │$1.50 │ │$1.00 │     │                              │
│  │  🛒  │ │  🛒  │ │  🛒  │     │  Subtotal:          $9.50   │
│  └──────┘ └──────┘ └──────┘     │  Tax (18%):          $1.71   │
│  ┌──────┐ ┌──────┐ ┌──────┐     │  Discount:          -$0.00   │
│  │Bread │ │Chips │ │Juice │     │  ─────────────────────────── │
│  │$2.50 │ │$3.00 │ │$2.00 │     │  TOTAL:            $11.21   │
│  │  🛒  │ │  🛒  │ │  🛒  │     │                              │
│  └──────┘ └──────┘ └──────┘     │  [🎫 Discount] [👤 Customer]  │
│                                   │  [⏸ Hold] [🗑 Clear]         │
│                                   │                              │
│                                   │  [████████ PAY $11.21 ██████]│
└───────────────────────────────────┴──────────────────────────────┘
```

### 3.4 Color & Theming System

The application uses **CSS custom properties** for complete theme customization:

```css
:root {
  /* Primary Brand Colors (user-customizable) */
  --color-primary: #2563eb;          /* Main brand color */
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #dbeafe;
  --color-primary-foreground: #ffffff;

  /* Secondary */
  --color-secondary: #64748b;
  --color-secondary-hover: #475569;

  /* Semantic Colors */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-info: #0891b2;

  /* Surface Colors */
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-elevated: #ffffff;
  --color-border: #e2e8f0;

  /* Text */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;

  /* Sidebar */
  --color-sidebar-bg: #1e293b;
  --color-sidebar-text: #e2e8f0;
  --color-sidebar-active: var(--color-primary);

  /* POS Specific */
  --color-pos-product-bg: #ffffff;
  --color-pos-cart-bg: #f1f5f9;
  --color-pos-pay-button: #16a34a;

  /* Dimensions */
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 64px;
  --topbar-height: 48px;
  --statusbar-height: 24px;

  /* Typography */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

**Pre-built themes** the user can switch between:
1. **Default Light** — Clean white/blue professional theme
2. **Dark Mode** — Dark surfaces with muted accents
3. **Blue Professional** — Corporate blue tones
4. **Green Nature** — Earthy green palette
5. **Custom** — User picks every color via color pickers in Settings → Branding

**Branding Settings page allows:**
- Upload custom logo (displayed in sidebar, receipts, invoices, login screen)
- Pick primary color (automatically generates hover/light/foreground variants)
- Pick sidebar color scheme
- Set receipt header text (store name, address, tax ID)
- Set receipt footer text (thank you message, return policy)
- Preview changes live before saving

---

## 4. FEATURE SPECIFICATIONS (DETAILED)

### 4.1 Authentication & Security

#### Login Screen
- Username + password login
- Optional: PIN-only quick login (4-6 digits) for POS cashiers
- "Remember me" checkbox (stores encrypted session locally)
- Failed login lockout: 5 failed attempts → 15-minute lockout
- First-time setup wizard (on fresh install)

#### Session Management
- JWT-based sessions stored in encrypted local storage
- Session timeout: configurable (default 8 hours, POS sessions 12 hours)
- Force logout capability for super admin
- Active sessions visible in admin panel

#### Password Policy (configurable by super admin)
- Minimum 8 characters
- Require uppercase, lowercase, number
- Password expiry: optional (30/60/90 days)
- Password history: prevent reuse of last 5 passwords
- Force password change on first login

#### Data Encryption
- All passwords hashed with bcrypt (12 rounds)
- Sensitive data (customer PII) encrypted at rest using AES-256-GCM
- Database file encrypted with SQLCipher (optional, configurable)
- PIN codes stored as SHA-256 hashes

---

### 4.2 Point of Sale (POS)

#### Core POS Flow
1. User opens POS → Select/create register session (enter opening cash amount)
2. Search/scan products → Add to cart
3. Adjust quantities, apply discounts
4. Optionally assign customer
5. Click PAY → Select payment method(s)
6. Process payment → Print/email receipt
7. Sale recorded, stock updated, loyalty points calculated

#### Product Search
- **Barcode scan**: Camera-based or hardware scanner via USB/serial
- **Text search**: Searches name, SKU, barcode simultaneously (debounced, 200ms)
- **Category browse**: Grid of category buttons → product grid
- **Quick keys**: Configurable favorite products as large buttons
- **Recent**: Shows last 20 sold products for quick re-add

#### Cart Features
- Adjust quantity (tap quantity → number input, or +/- buttons)
- Line-item discount (percentage or fixed)
- Remove item (swipe left or delete button)
- Cart-level discount
- Notes per line item
- Weighable items: prompts for weight entry
- Price override (requires permission)
- Hold order (save cart, recall later)
- Multiple held orders simultaneously
- Customer assignment (search by name/phone/code)

#### Payment Processing
- **Split payment**: Pay with multiple methods (e.g., $50 cash + $20 card)
- **Payment methods**: Cash, Card, Mobile Payment, Bank Transfer, Store Credit, Loyalty Points, Gift Card, Check
- **Cash handling**: Auto-calculate change, quick-tender buttons ($5, $10, $20, $50, $100, Exact)
- **Card integration**: Manual entry of card reference/last 4 digits (for offline POS)
- **Credit sale**: Charge to customer account (requires credit limit check)
- **Layaway**: Partial payment, hold items, track balance

#### Receipt
- **Thermal printer support**: ESC/POS compatible printers (80mm and 58mm)
- **Receipt content**: Store name/logo, address, tax ID, items, totals, payment, barcode of receipt number, date/time, cashier name, custom header/footer
- **Email receipt**: Send PDF receipt to customer email
- **Reprint**: Reprint any past receipt from sale history
- **No-receipt option**: Customer can decline

#### Returns & Refunds
- Search original sale by receipt number or date
- Select items to return (full or partial)
- Specify return reason (required)
- Refund to original payment method or store credit
- Returned stock automatically added back to inventory
- Return transaction linked to original sale
- Requires manager approval (configurable permission)

#### Void Sale
- Void entire sale (requires permission)
- Void reason required
- Voided sales visible in reports but excluded from totals
- Stock adjustments reversed automatically

#### End of Day
- Close register session
- Count cash in drawer
- System shows expected vs actual
- Report overage/shortage
- Print Z-report (daily summary)
- All data locked for that session

---

### 4.3 Inventory Management

#### Product Management
- **Create product**: All fields from schema (name, SKU, barcode, prices, tax, stock, etc.)
- **Bulk import**: Upload CSV/XLSX with product data
- **Bulk edit**: Select multiple products → update category, price, tax rate, status
- **Product images**: Upload multiple images, set primary
- **Variants**: Size, color, weight variations with independent stock and pricing
- **Composite/bundle products**: Create product bundles that auto-deduct component stock
- **Print barcode labels**: Generate and print barcode stickers (configurable label sizes)

#### Stock Management
- **Real-time stock levels**: Updated on every sale, return, adjustment, transfer
- **Stock adjustment**: Manual add/subtract with mandatory reason
- **Stock count**: Full stocktake workflow (generate count sheet → enter counts → review discrepancies → approve adjustments)
- **Stock alerts**: Low stock notifications based on per-product or global threshold
- **Expiry tracking**: Dashboard of products expiring within 30/60/90 days
- **Negative stock prevention**: Configurable per product

#### Purchase Orders
- Create PO → Select supplier → Add products → Set quantities and prices
- PO approval workflow (optional)
- Send PO to supplier (PDF export or email)
- Receive goods: Partial or full receipt
- GRN (Goods Received Note) generation
- Auto-update stock on receipt
- Cost price auto-update option
- PO status tracking

#### Suppliers
- Full supplier profiles (contact, address, payment terms)
- Supplier-product linking with supplier-specific pricing
- Supplier balance tracking
- Purchase history per supplier
- Performance metrics (delivery time, rejection rate)

#### Warehouses
- Multiple warehouse/location support
- Per-warehouse stock levels
- Stock transfers between warehouses
- Transfer request → approve → ship → receive workflow
- Default selling warehouse

---

### 4.4 Finance & Accounting

#### Cash Register Management
- Opening balance entry
- All cash movements tracked
- Cash in/out entries (petty cash, float adjustments)
- Closing balance and reconciliation
- Overage/shortage reporting

#### Expense Tracking
- Create expense entries with categories
- Upload receipt images
- Recurring expenses (rent, utilities)
- Expense approval workflow
- Monthly expense comparison

#### Invoicing
- Generate invoices from sales or manually
- Customizable invoice template (logo, colors, terms)
- Invoice numbering (auto-increment, configurable prefix)
- Send invoice via email (PDF attachment)
- Payment tracking against invoices
- Overdue invoice alerts
- Credit note generation

#### Profit & Loss
- Real-time P&L statement
- Revenue (sales - returns - discounts)
- Cost of Goods Sold (based on cost_price at time of sale)
- Gross profit and margin percentages
- Operating expenses
- Net profit/loss
- Filterable by date range, category, product

#### Tax Management
- Multiple tax rates (standard, reduced, zero-rated, exempt)
- Tax-inclusive and tax-exclusive pricing
- Tax report generation (total tax collected, by rate, by period)
- Exportable for tax filing

#### General Ledger
- Double-entry bookkeeping (auto-generated from sales, purchases, expenses)
- Chart of accounts (customizable)
- Journal entries (auto and manual)
- Trial balance
- Balance sheet

---

### 4.5 Customer Management (CRM)

#### Customer Profiles
- Complete contact information
- Purchase history with totals
- Outstanding credit balance
- Loyalty points and tier
- Custom tags for segmentation
- Notes and interaction history

#### Credit Management
- Set credit limit per customer
- Credit sales tracked
- Credit balance dashboard
- Payment collection against credit
- Credit aging report (30/60/90 days)
- Block sales when credit limit exceeded

#### Loyalty Program
- Points-based system (configurable earn rate)
- Tiered rewards (Bronze/Silver/Gold/Platinum)
- Points redemption at POS
- Points expiry (configurable)
- Loyalty history and statements
- Promotion multipliers (2x points events)

#### Customer Communication
- Customer export for email marketing
- Birthday/anniversary tracking
- Purchase pattern analysis

---

### 4.6 Employee & HR Management

#### Employee Profiles
- Personal and contact information
- Employment details (hire date, position, department)
- Salary and compensation details
- Document storage (ID copies, contracts)
- Link to user account for system access

#### Attendance
- Clock in/out (PIN or user login)
- Break tracking
- Late arrival flagging
- Overtime calculation
- Monthly attendance summary
- Leave management (request → approve)

#### Shift Scheduling
- Define shift templates (Morning, Evening, Night)
- Assign employees to shifts
- Weekly schedule view
- Shift swap requests
- Understaffing alerts

#### Payroll
- Auto-calculate based on attendance + salary type
- Overtime pay calculation
- Commission calculation (from sales data)
- Bonuses and deductions
- Tax deduction templates
- Payslip generation (PDF)
- Payroll history

---

### 4.7 Reporting & Analytics

#### Dashboard (Home Screen)
The main dashboard shows real-time KPIs:

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD                                    [Today ▼]     │
├──────────┬──────────┬──────────┬──────────────────────────┤
│ 💰 Sales  │ 📦 Orders │ 💵 Profit │ 👥 Customers            │
│ $4,230   │    47     │ $1,890   │    12 new               │
│ ↑12%     │ ↑8%      │ ↑15%     │ ↑3%                     │
├──────────┴──────────┴──────────┴──────────────────────────┤
│                                                             │
│  [Sales Trend Line Chart - Last 7/30/90 days]               │
│  ████████████████████████████████████████████               │
│                                                             │
├────────────────────────────┬────────────────────────────────┤
│ Top Selling Products       │ Sales by Category               │
│ 1. Cola 500ml    - 142 qty │ [Pie Chart]                     │
│ 2. Bread White   - 98 qty  │  Beverages: 35%                │
│ 3. Milk 1L       - 87 qty  │  Snacks: 25%                   │
│ 4. Rice 5kg      - 56 qty  │  Dairy: 20%                    │
│ 5. Sugar 1kg     - 45 qty  │  Other: 20%                    │
├────────────────────────────┼────────────────────────────────┤
│ Low Stock Alerts (5)       │ Recent Sales                    │
│ ⚠ Rice 5kg: 3 left        │ INV-001 - $45.00 - 2min ago   │
│ ⚠ Sugar 1kg: 5 left       │ INV-002 - $12.50 - 15min ago  │
│ ⚠ Cooking Oil: 2 left     │ INV-003 - $78.00 - 30min ago  │
│ ⚠ Flour 2kg: 4 left       │ INV-004 - $23.00 - 1hr ago    │
│ ⚠ Butter 500g: 1 left     │ INV-005 - $156.00 - 2hr ago   │
└────────────────────────────┴────────────────────────────────┘
```

#### Available Reports

**Sales Reports:**
- Daily/Weekly/Monthly/Yearly sales summary
- Sales by product, category, brand
- Sales by employee/cashier
- Sales by customer
- Sales by payment method
- Sales by hour of day (peak hours analysis)
- Sales comparison (period vs period)
- Voided sales report
- Returns report
- Discount report

**Inventory Reports:**
- Current stock valuation (at cost and retail)
- Stock movement history
- Low stock report
- Dead stock report (no movement in X days)
- Expiring stock report
- Stock adjustment history
- Purchase order history
- Supplier performance report

**Finance Reports:**
- Profit & Loss statement
- Cash flow report
- Expense report by category
- Tax collection report
- Accounts receivable aging
- Accounts payable aging
- Revenue by product/category
- Gross margin analysis
- Daily cash register report (Z-report)

**Customer Reports:**
- Customer purchase frequency
- Top customers by revenue
- Customer acquisition rate
- Credit balance report
- Loyalty points report
- Customer retention analysis

**Employee Reports:**
- Sales performance by employee
- Attendance summary
- Commission report
- Payroll summary
- Overtime report

#### Export Options
- **PDF**: Formatted reports with charts, tables, store branding
- **Excel (XLSX)**: Raw data with multiple sheets, formulas
- **CSV**: Plain data for import into other systems
- **Print**: Direct print to connected printer

#### Report Scheduling
- Schedule reports to auto-generate daily/weekly/monthly
- Save report configurations as templates
- Quick filters: Today, Yesterday, This Week, This Month, This Quarter, This Year, Custom Range

---

### 4.8 Super Admin Features

#### System Dashboard
- All stores overview (for multi-store deployments)
- System health metrics
- Active users count
- Database size
- Last backup timestamp
- License status

#### User Management
- Create, edit, deactivate, delete users
- Assign roles
- Reset passwords
- Force logout
- View active sessions
- User activity log

#### Role & Permission Management
- Create custom roles
- Granular permissions per module/action/resource
- Default roles: Super Admin (all), Manager (most), Cashier (POS only), Inventory Clerk (inventory only), Accountant (finance only), Viewer (read-only)
- Permission matrix view (role × permission grid)

#### Audit Log
- Complete activity log with filters:
  - Filter by user
  - Filter by module
  - Filter by action (create, update, delete, login, export)
  - Filter by date range
  - Search in details
- Shows: who, what, when, old value, new value
- Non-deletable (audit logs cannot be modified or removed)
- Export audit logs to PDF/CSV

#### Backup & Restore
- Manual backup: creates encrypted SQLite file copy
- Scheduled backups: daily/weekly at configured time
- Backup location: configurable (local folder, external drive)
- Restore from backup file
- Pre-update automatic backup
- Backup history with file sizes

#### System Settings
- Store information (name, address, tax ID, etc.)
- Currency and locale settings
- Tax rate configuration
- Receipt customization
- Notification preferences
- Data retention policies
- Database optimization (vacuum, reindex)

#### License Management
- License key entry and validation
- License type (trial, basic, professional, enterprise)
- Feature gating based on license
- Expiry notifications
- License renewal

---

### 4.9 Notifications & Alerts System

The system generates real-time in-app notifications:

| Trigger | Severity | Recipients |
|---------|----------|------------|
| Stock below threshold | Warning | Manager, Inventory staff |
| Stock at zero | Error | Manager, Super Admin |
| Product expiring within 30 days | Warning | Manager, Inventory |
| Customer credit limit reached | Warning | Cashier, Manager |
| Large void/refund | Warning | Super Admin |
| Failed login attempts (lockout) | Error | Super Admin |
| Backup completed | Info | Super Admin |
| Backup failed | Error | Super Admin |
| Report ready for download | Info | Requesting user |
| New user created | Info | Super Admin |
| System update available | Info | Super Admin |
| Register session not closed | Warning | Manager |
| Invoice overdue | Warning | Manager, Accountant |
| Employee no-show | Warning | Manager |
| Sales target achieved | Success | Manager, Employee |
| Daily sales summary | Info | Manager, Super Admin |

Notifications appear in:
1. **Bell icon** in top bar with unread count badge
2. **Notification panel** (slide-out from right) with list, mark read, mark all read
3. **System tray** notifications (Electron native notifications for critical alerts)

---

### 4.10 Data Privacy & Security

#### Data Access Levels
- Users only see data their permissions allow
- Sensitive fields (customer PII, financial data) require explicit permission
- Export permission is separate from view permission
- Print permission is separate from view permission

#### Data Download & Export Controls
- All exports logged in audit trail (who, what, when, filters used)
- Configurable: require manager approval for bulk exports
- Watermark on exported PDFs with user name and timestamp
- CSV/Excel exports can be restricted to certain roles

#### Data Retention
- Configurable retention periods per data type
- Automatic archival of old transactions (> X years)
- Soft delete for most records (recoverable)
- Hard delete only via super admin with confirmation

#### Privacy Features
- Customer data anonymization tool (GDPR compliance)
- Right to erasure: anonymize all customer data on request
- Data access report: what data is stored for a specific customer
- Consent tracking for marketing communications

---

## 5. KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| `F1` | Open help / documentation |
| `F2` | Quick search (global) |
| `F5` | Refresh current view |
| `F9` | Open POS |
| `F10` | Hold current order |
| `F11` | Full screen toggle |
| `F12` | Open developer tools (dev mode only) |
| `Ctrl+N` | New (product/customer/sale based on context) |
| `Ctrl+S` | Save current form |
| `Ctrl+P` | Print |
| `Ctrl+E` | Export |
| `Ctrl+F` | Find/Search in current view |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+Shift+L` | Lock screen (require re-login) |
| `Escape` | Close modal / Cancel |
| `Enter` | Confirm / Submit |
| `Alt+1-9` | Navigate to sidebar menu items |
| POS: `+` / `-` | Increase/decrease item quantity |
| POS: `Delete` | Remove selected item from cart |
| POS: `Ctrl+D` | Apply discount |
| POS: `Ctrl+Enter` | Proceed to payment |

---

## 6. FIRST-RUN SETUP WIZARD

On first launch (no database exists), the app walks through:

1. **Welcome Screen** — App introduction, language selection
2. **Store Setup** — Store name, address, contact info, tax ID, currency, timezone
3. **Super Admin Account** — Create the first user (super admin)
4. **Business Type** — Select template: Retail Store, Restaurant, Pharmacy, Electronics, Clothing, Grocery, General (pre-configures categories, units, tax rates)
5. **Branding** — Upload logo, pick primary color
6. **POS Setup** — Create first register, set default tax rate
7. **Initial Products** — Import products from CSV or skip
8. **Completion** — Summary of setup, go to dashboard

---

## 7. ELECTRON-SPECIFIC CONFIGURATION

### 7.1 Window Management
- Default window size: 1280x800 (minimum: 1024x768)
- Remember window position and size between sessions
- POS mode: optional full-screen or dedicated window
- System tray: minimize to tray, tray notifications

### 7.2 Auto-Updates
- Check for updates on startup and every 6 hours
- Download update in background
- Prompt user to install (never force)
- Pre-update automatic database backup

### 7.3 Printing
- Auto-detect connected printers
- Save default printer per print type (receipt, report, label)
- Printer settings: paper size, margins, copies
- Silent print option (no print dialog for receipts)

### 7.4 Hardware Integration
- **Barcode scanners**: USB HID (keyboard emulation) — works automatically
- **Cash drawers**: Kick via printer or serial port
- **Customer displays**: Secondary screen support
- **Weighing scales**: Serial port integration
- **Label printers**: Zebra/DYMO support

### 7.5 File Storage
- All app data in: `%APPDATA%/pos-system/` (Windows), `~/Library/Application Support/pos-system/` (macOS), `~/.config/pos-system/` (Linux)
- Database: `data/store.db`
- Backups: `backups/`
- Uploads: `uploads/` (logos, receipts, product images)
- Logs: `logs/` (rotated daily, max 30 days retention)
- Exports: `exports/`

---

## 8. IMPLEMENTATION PRIORITIES

Build in this order:

### Phase 1: Foundation
1. Electron + React + Vite project setup
2. Database schema creation and migrations
3. Authentication system (login, sessions, password hashing)
4. Main layout (sidebar, topbar, routing)
5. Theme system with CSS custom properties
6. Basic settings page

### Phase 2: Core POS
7. Product CRUD (create, list, edit, delete)
8. Category management
9. POS terminal screen
10. Cart management
11. Payment processing
12. Receipt generation and printing
13. Register session management

### Phase 3: Inventory
14. Stock tracking (auto-update on sales)
15. Stock adjustments
16. Supplier management
17. Purchase orders
18. Low stock alerts

### Phase 4: Finance
19. Expense tracking
20. Invoice generation
21. Profit & Loss calculation
22. Cash register management
23. Tax reports

### Phase 5: CRM & HR
24. Customer management
25. Loyalty program
26. Credit management
27. Employee management
28. Attendance tracking

### Phase 6: Reporting
29. Dashboard with KPIs and charts
30. Sales reports
31. Inventory reports
32. Financial reports
33. PDF/Excel/CSV export engine

### Phase 7: Administration
34. User & role management
35. Permission system
36. Audit logging
37. Backup & restore
38. Branding customization

### Phase 8: Polish
39. Keyboard shortcuts
40. Notification system
41. Barcode printing
42. Auto-updates
43. Setup wizard
44. Performance optimization

---

## 9. CODE STANDARDS

### Naming Conventions
- **Files**: kebab-case (`product-list.tsx`, `auth.service.ts`)
- **Components**: PascalCase (`ProductList`, `PaymentModal`)
- **Functions/variables**: camelCase (`calculateTotal`, `isActive`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`, `DEFAULT_TAX_RATE`)
- **Database columns**: snake_case (`created_at`, `store_id`)
- **CSS variables**: kebab-case (`--color-primary`, `--sidebar-width`)

### TypeScript Rules
- Strict mode enabled
- No `any` types (use `unknown` and narrow)
- All function parameters and return types explicitly typed
- Interfaces for objects, types for unions/primitives
- Zod schemas for all form validation

### Component Rules
- Functional components only (no class components)
- One component per file
- Co-locate styles, hooks, and types with components
- Use composition over inheritance
- Custom hooks for shared logic

### Database Rules
- All monetary values in cents (integer, never float)
- All dates in ISO 8601 format (TEXT in SQLite)
- UUID for all primary keys
- Soft delete (deleted_at) for business data
- Audit log entry for every write operation
- Never delete audit logs

### Error Handling
- All IPC calls wrapped in try/catch
- User-friendly error messages (never show raw errors)
- Errors logged to file with full stack trace
- Toast notifications for user-facing errors/successes

### Security Rules
- Never store plain text passwords or PINs
- Sanitize all user inputs
- Parameterized queries only (no string concatenation in SQL)
- Validate all IPC inputs on main process side
- CSP headers in Electron

---

## 10. ESSENTIAL COMMANDS

```bash
# Setup
npm install
npm run dev                    # Start Electron + Vite dev server

# Database
npm run db:migrate             # Run pending migrations
npm run db:migrate:create      # Create new migration
npm run db:seed                # Seed default data

# Build
npm run build                  # Build for production
npm run package                # Package as distributable
npm run package:win            # Package for Windows (.exe)
npm run package:mac            # Package for macOS (.dmg)
npm run package:linux          # Package for Linux (.AppImage)

# Quality
npm run lint                   # ESLint
npm run lint:fix               # Auto-fix lint issues
npm run typecheck              # TypeScript type checking
npm run test                   # Run tests
npm run test:watch             # Watch mode

# Utilities
npm run db:backup              # Manual database backup
npm run db:reset               # Reset database (DESTRUCTIVE)
```

---

## 11. IMPORTANT REMINDERS FOR CLAUDE CODE

1. **Always use cents for money** — Never use floating point for currency. $10.50 = 1050 cents.
2. **Always check permissions** — Before any operation, verify the user has the required permission.
3. **Always log to audit** — Every create, update, delete, login, export, print must create an audit_log entry.
4. **Always soft delete** — Use `deleted_at` timestamp, never hard DELETE (except audit logs which are immutable).
5. **Always validate** — Validate all inputs with Zod on the renderer side AND re-validate on the main process IPC handler.
6. **Store ID scoping** — Every query must include `store_id` in the WHERE clause (multi-tenancy).
7. **POS must be fast** — The POS screen must never block the UI. Use web workers for heavy calculations if needed.
8. **Offline-first** — The app must work fully offline. Cloud sync is optional and eventual.
9. **Responsive but desktop-first** — Minimum width 1024px. Support touch screens but optimize for keyboard+mouse.
10. **Never expose sensitive data in logs** — Mask passwords, tokens, and PII in log files.
