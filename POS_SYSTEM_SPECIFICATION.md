# POS System — Complete Specification Document

> **Purpose**: This document is a complete specification for an AI agent to build a fully-featured Point of Sale (POS) system. Every module, feature, API endpoint, database schema, business rule, and test case is defined below.

NOTE: every file and file word should be camelCase.
IMPORTANT: Implement the code logic int eh best way possible and do not add any extra code or logic.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [Module 1: Authentication & Authorization](#4-module-1-authentication--authorization)
5. [Module 2: Product & Inventory Management](#5-module-2-product--inventory-management)
6. [Module 3: Sales & Checkout](#6-module-3-sales--checkout)
7. [Module 4: Payment Processing](#7-module-4-payment-processing)
8. [Module 5: Customer Management](#8-module-5-customer-management)
9. [Module 6: Employee Management](#9-module-6-employee-management)
10. [Module 7: Reporting & Analytics](#10-module-7-reporting--analytics)
11. [Module 8: Loyalty & Promotions](#11-module-8-loyalty--promotions)
12. [Module 9: Multi-Location Management](#12-module-9-multi-location-management)
13. [Module 10: Kitchen Display System (KDS)](#13-module-10-kitchen-display-system-kds)
14. [Module 11: Table & Reservation Management](#14-module-11-table--reservation-management)
15. [Module 12: E-commerce & Omnichannel](#15-module-12-e-commerce--omnichannel)
16. [Module 13: Hardware Integration](#16-module-13-hardware-integration)
17. [Module 14: Notifications & Alerts](#17-module-14-notifications--alerts)
18. [Module 15: Settings & Configuration](#18-module-15-settings--configuration)
19. [UI/UX Design — Futuristic 2050 Vision](#19-uiux-design--futuristic-2050-vision)
20. [Testing Strategy](#20-testing-strategy)
21. [Deployment & Infrastructure](#21-deployment--infrastructure)

---

## 1. System Overview

### 1.1 What This System Does

A cloud-based POS system that handles in-store sales, inventory, customers, employees, payments, reporting, loyalty programs, kitchen operations, table management, and e-commerce — all from a single platform.

### 1.2 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │ POS App  │  │ Admin    │  │ Customer │  │ KDS    │  │
│  │ (Tablet/ │  │ Dashboard│  │ Facing   │  │ Screen │  │
│  │ Desktop) │  │ (Web)    │  │ Display  │  │ (Web)  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │              │              │             │       │
├───────┴──────────────┴──────────────┴─────────────┴──────┤
│                    API GATEWAY                            │
│              (Rate Limiting, Auth, Logging)               │
├──────────────────────────────────────────────────────────┤
│                   BACKEND SERVICES                        │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Auth    │ │ Sales   │ │ Inventory│ │ Payment      │  │
│  │ Service │ │ Service │ │ Service  │ │ Service      │  │
│  ├─────────┤ ├─────────┤ ├──────────┤ ├──────────────┤  │
│  │ Customer│ │Employee │ │ Report   │ │ Notification │  │
│  │ Service │ │ Service │ │ Service  │ │ Service      │  │
│  ├─────────┤ ├─────────┤ ├──────────┤ ├──────────────┤  │
│  │ Loyalty │ │ KDS     │ │ Table    │ │ E-commerce   │  │
│  │ Service │ │ Service │ │ Service  │ │ Service      │  │
│  └─────────┘ └─────────┘ └──────────┘ └──────────────┘  │
├──────────────────────────────────────────────────────────┤
│                   DATA LAYER                              │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐              │
│  │PostgreSQL│  │  Redis    │  │  S3/Blob │              │
│  │(Primary) │  │ (Cache +  │  │ (Files)  │              │
│  │          │  │  Queue)   │  │          │              │
│  └──────────┘  └───────────┘  └──────────┘              │
├──────────────────────────────────────────────────────────┤
│                EXTERNAL INTEGRATIONS                      │
│  ┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────────────┐ │
│  │Stripe  │ │SendGrid│ │ Twilio  │ │ Delivery Apps    │ │
│  │/Square │ │ (Email)│ │  (SMS)  │ │ (DoorDash/Uber)  │ │
│  └────────┘ └────────┘ └─────────┘ └──────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 1.3 Core Design Principles

- **Offline-first**: All critical POS operations must work without internet. Sync when connection restores.
- **Multi-tenant**: Single codebase serves multiple businesses, each isolated by `tenantId`.
- **Real-time**: Inventory, orders, and KDS update in real-time via WebSockets.
- **Audit everything**: Every transaction, void, refund, and change is logged with who/when/what.
- **Idempotent payments**: Payment operations must be safe to retry without double-charging.

---

## 2. Tech Stack

### 2.1 Backend

| Component         | Technology                          |
| ----------------- | ----------------------------------- |
| Runtime           | Node.js 24                          |
| Framework         | NestJS                              |
| Language          | TypeScript (strict mode)            |
| ORM               | TypeORM or Prisma                   |
| Database          | PostgreSQL 15+                      |
| Cache             | Redis 7+                            |
| Queue             | BullMQ (Redis-backed)               |
| WebSockets        | Socket.IO via NestJS Gateway        |
| API Documentation | Swagger / OpenAPI 3.0               |
| Validation        | class-validator + class-transformer |
| Authentication    | JWT (access + refresh tokens)       |
| Payment           | Stripe SDK / Square SDK             |
| File Storage      | AWS S3                              |
| Email             | SendGrid                            |
| SMS               | Twilio                              |

### 2.2 Desktop Application (Electron.js)

| Component          | Technology                                                   |
| ------------------ | ------------------------------------------------------------ |
| Desktop Runtime    | Electron 30+                                                 |
| Renderer Framework | React 18+ (Vite bundler)                                     |
| Language           | TypeScript                                                   |
| UI Library         | Tailwind CSS + shadcn/ui                                     |
| State Management   | Zustand (persisted to local store)                           |
| Forms              | React Hook Form + Zod                                        |
| Data Fetching      | TanStack Query (React Query)                                 |
| Real-time          | Socket.IO Client                                             |
| Charts             | Recharts                                                     |
| Offline Storage    | SQLite (via better-sqlite3) + IndexedDB (via Dexie.js)       |
| Barcode Scanning   | html5-qrcode / quagga2                                       |
| 3D / Animations    | Three.js (react-three-fiber) + Framer Motion + Lottie        |
| IPC Communication  | Electron IPC (contextBridge + preload)                       |
| Auto-Update        | electron-updater                                             |
| Hardware Access    | Serial port (serialport), USB HID, ESC/POS printing          |
| Local DB Sync      | Offline-first with sync queue to cloud PostgreSQL            |
| Packaging          | electron-builder (Windows .exe, macOS .dmg, Linux .AppImage) |

### 2.3 Electron Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    ELECTRON APP                               │
│                                                               │
│  ┌─ Main Process (Node.js) ──────────────────────────────┐   │
│  │                                                        │   │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────────────┐  │   │
│  │  │ App      │ │ Hardware  │ │ Local Database        │  │   │
│  │  │ Lifecycle│ │ Manager   │ │ (SQLite)              │  │   │
│  │  │          │ │           │ │                       │  │   │
│  │  │ - Window │ │ - Receipt │ │ - Offline orders      │  │   │
│  │  │   mgmt   │ │   printer │ │ - Cached products     │  │   │
│  │  │ - Tray   │ │ - Barcode │ │ - Pending payments    │  │   │
│  │  │ - Menu   │ │   scanner │ │ - Sync queue          │  │   │
│  │  │ - Update │ │ - Cash    │ │ - Local settings      │  │   │
│  │  │          │ │   drawer  │ │                       │  │   │
│  │  │          │ │ - Scale   │ │                       │  │   │
│  │  │          │ │ - Card    │ │                       │  │   │
│  │  │          │ │   terminal│ │                       │  │   │
│  │  └──────────┘ └───────────┘ └──────────────────────┘  │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Sync Engine                                      │  │   │
│  │  │ - Queue offline transactions                     │  │   │
│  │  │ - Sync to cloud on reconnect                     │  │   │
│  │  │ - Conflict resolution (last-write-wins + merge)  │  │   │
│  │  │ - Background sync every 30s when online          │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                          │ IPC (contextBridge)                 │
│  ┌─ Renderer Process (Chromium) ─────────────────────────┐   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ React App (Vite)                                 │  │   │
│  │  │                                                  │  │   │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │  │   │
│  │  │  │ POS  │ │Dash- │ │Orders│ │ KDS  │ │Inven-│  │  │   │
│  │  │  │Screen│ │board │ │      │ │      │ │tory  │  │  │   │
│  │  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │  │   │
│  │  │                                                  │  │   │
│  │  │  Zustand Store ←→ IPC Bridge ←→ Main Process     │  │   │
│  │  │  React Query  ←→ REST API   ←→ Cloud Backend     │  │   │
│  │  │  Socket.IO    ←→ WebSocket  ←→ Cloud Backend     │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─ Additional Windows ──────────────────────────────────┐   │
│  │  - Customer-facing display (second screen)            │   │
│  │  - KDS display (dedicated screen)                     │   │
│  │  - Kitchen printer status                             │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 2.4 Electron IPC API

```typescript
// preload.ts — exposed to renderer via contextBridge
interface ElectronAPI {
  // Hardware
  printer: {
    print(receiptData: ReceiptData): Promise<void>;
    openCashDrawer(): Promise<void>;
    getStatus(): Promise<PrinterStatus>;
  };
  scanner: {
    onBarcodeScan(callback: (barcode: string) => void): void;
  };
  scale: {
    getWeight(): Promise<{ weight: number; unit: string }>;
    onWeightChange(callback: (weight: number) => void): void;
  };
  cardTerminal: {
    processPayment(amount: number): Promise<CardPaymentResult>;
    cancelPayment(): Promise<void>;
  };

  // Local Database
  localDb: {
    getOfflineOrders(): Promise<Order[]>;
    saveOfflineOrder(order: Order): Promise<void>;
    getCachedProducts(): Promise<Product[]>;
    getSyncQueue(): Promise<SyncQueueItem[]>;
  };

  // Sync
  sync: {
    forceSync(): Promise<SyncResult>;
    getSyncStatus(): Promise<SyncStatus>;
    onSyncStatusChange(callback: (status: SyncStatus) => void): void;
  };

  // App
  app: {
    getVersion(): string;
    checkForUpdates(): Promise<UpdateInfo | null>;
    installUpdate(): void;
    quit(): void;
    minimize(): void;
    maximize(): void;
    isFullScreen(): boolean;
    toggleFullScreen(): void;
  };

  // Multi-window
  windows: {
    openCustomerDisplay(): Promise<void>;
    openKDSDisplay(): Promise<void>;
    closeWindow(windowId: string): void;
    sendToCustomerDisplay(data: CartDisplayData): void;
  };

  // System
  system: {
    getNetworkStatus(): Promise<"online" | "offline">;
    onNetworkChange(callback: (status: "online" | "offline") => void): void;
    getPlatform(): string;
    getSerialPorts(): Promise<SerialPortInfo[]>;
  };
}
```

### 2.5 Testing

| Type                 | Tool                                  |
| -------------------- | ------------------------------------- |
| Unit Tests           | Jest / Vitest                         |
| Integration Tests    | Jest + Supertest                      |
| E2E Tests (Backend)  | Jest + Supertest                      |
| E2E Tests (Electron) | Playwright + Electron                 |
| Component Tests      | React Testing Library                 |
| Load Tests           | k6                                    |
| Electron Tests       | @electron/test (Spectron replacement) |

### 2.6 Infrastructure

| Component             | Technology                                              |
| --------------------- | ------------------------------------------------------- |
| Container             | Docker + Docker Compose                                 |
| CI/CD                 | GitHub Actions                                          |
| Cloud Backend Hosting | AWS (ECS/EC2) or Railway                                |
| CDN                   | CloudFront                                              |
| App Distribution      | electron-builder (auto-update via GitHub Releases / S3) |
| Monitoring            | Prometheus + Grafana                                    |
| Logging               | Winston + CloudWatch (cloud), electron-log (local)      |
| Error Tracking        | Sentry (both main + renderer)                           |
| Crash Reporting       | Electron crashReporter → Sentry                         |

---

## 3. Database Schema

> **Convention**: All table names and column names use **camelCase** to match TypeScript/NestJS entity conventions. TypeORM entities map directly without name transformations.

### 3.1 Tenant & Business

```sql
CREATE TABLE "tenants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(100) UNIQUE NOT NULL,
  "businessType" VARCHAR(20) NOT NULL CHECK ("businessType" IN ('retail', 'restaurant', 'service', 'grocery', 'franchise')),
  "subscriptionPlan" VARCHAR(20) DEFAULT 'free' CHECK ("subscriptionPlan" IN ('free', 'starter', 'professional', 'enterprise')),
  "subscriptionStatus" VARCHAR(20) DEFAULT 'trial' CHECK ("subscriptionStatus" IN ('active', 'trial', 'pastDue', 'cancelled')),
  "trialEndsAt" TIMESTAMP,
  "settings" JSONB DEFAULT '{}',
  "businessName" VARCHAR(255),
  "businessEmail" VARCHAR(255),
  "businessPhone" VARCHAR(50),
  "taxId" VARCHAR(100),
  "currency" VARCHAR(3) DEFAULT 'USD',
  "timezone" VARCHAR(50) DEFAULT 'America/New_York',
  "locale" VARCHAR(10) DEFAULT 'en-US',
  "addressLine1" VARCHAR(255),
  "addressLine2" VARCHAR(255),
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "postalCode" VARCHAR(20),
  "country" VARCHAR(2) DEFAULT 'US',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "deletedAt" TIMESTAMP
);

CREATE TABLE "locations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL REFERENCES "tenants"("id"),
  "name" VARCHAR(255) NOT NULL,
  "code" VARCHAR(50),
  "type" VARCHAR(20) DEFAULT 'store' CHECK ("type" IN ('store', 'warehouse', 'kitchen', 'popup')),
  "isActive" BOOLEAN DEFAULT true,
  "addressLine1" VARCHAR(255),
  "addressLine2" VARCHAR(255),
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "postalCode" VARCHAR(20),
  "country" VARCHAR(2) DEFAULT 'US',
  "phone" VARCHAR(50),
  "email" VARCHAR(255),
  "operatingHours" JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "21:00", "isClosed": false},
    "tuesday": {"open": "09:00", "close": "21:00", "isClosed": false},
    "wednesday": {"open": "09:00", "close": "21:00", "isClosed": false},
    "thursday": {"open": "09:00", "close": "21:00", "isClosed": false},
    "friday": {"open": "09:00", "close": "22:00", "isClosed": false},
    "saturday": {"open": "10:00", "close": "22:00", "isClosed": false},
    "sunday": {"open": "10:00", "close": "18:00", "isClosed": false}
  }',
  "defaultTaxRate" DECIMAL(5,3) DEFAULT 0.000,
  "taxInclusive" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "deletedAt" TIMESTAMP
);
```

### 3.2 Users & Employees

```sql
CREATE TABLE "users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  avatar_url VARCHAR(500),
  role ENUM('owner', 'admin', 'manager', 'cashier', 'server', 'kitchen', 'viewer') NOT NULL,
  pin VARCHAR(255), -- hashed 4-6 digit PIN for quick POS login
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  -- Permissions override (JSONB for granular control)
  permissions JSONB DEFAULT '{}',
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE("tenantId", "email")
);

CREATE TABLE "userLocations" (
  user_id UUID NOT NULL REFERENCES users(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY ("userId", "locationId")
);

CREATE TABLE "employeeShifts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP,
  break_start TIMESTAMP,
  break_end TIMESTAMP,
  total_hours DECIMAL(5,2),
  status ENUM('active', 'on_break', 'completed') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "employeeSchedules" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role_during_shift VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Products & Inventory

```sql
CREATE TABLE "categories" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  parent_id UUID REFERENCES categories(id), -- for subcategories
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  color VARCHAR(7), -- hex color for POS display
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE("tenantId", "slug")
);

CREATE TABLE "products" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category_id UUID REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  type ENUM('physical', 'digital', 'service', 'composite', 'gift_card') DEFAULT 'physical',
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0, -- what you pay supplier
  compare_at_price DECIMAL(10,2), -- original price for showing discounts
  -- Tax
  tax_category VARCHAR(50) DEFAULT 'standard',
  is_taxable BOOLEAN DEFAULT true,
  -- Inventory
  track_inventory BOOLEAN DEFAULT true,
  allow_backorder BOOLEAN DEFAULT false,
  -- Weight (for shipping and scale-based pricing)
  weight DECIMAL(10,3),
  weight_unit ENUM('kg', 'lb', 'oz', 'g') DEFAULT 'kg',
  sell_by_weight BOOLEAN DEFAULT false,
  -- Display
  image_url VARCHAR(500),
  images JSONB DEFAULT '[]', -- array of image URLs
  color VARCHAR(7), -- hex color for POS button
  sort_order INT DEFAULT 0,
  -- Flags
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_age_verification BOOLEAN DEFAULT false,
  min_age INT, -- 18 for tobacco, 21 for alcohol
  -- Metadata
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE("tenantId", "sku")
);

CREATE TABLE "productVariants" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL, -- e.g., "Large / Red"
  sku VARCHAR(100),
  barcode VARCHAR(100),
  price DECIMAL(10,2), -- NULL means use product price
  cost_price DECIMAL(10,2),
  -- Variant attributes
  option1_name VARCHAR(50), -- e.g., "Size"
  option1_value VARCHAR(100), -- e.g., "Large"
  option2_name VARCHAR(50), -- e.g., "Color"
  option2_value VARCHAR(100), -- e.g., "Red"
  option3_name VARCHAR(50),
  option3_value VARCHAR(100),
  -- Inventory
  track_inventory BOOLEAN DEFAULT true,
  weight DECIMAL(10,3),
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "inventory" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  quantity INT NOT NULL DEFAULT 0,
  reserved_quantity INT DEFAULT 0, -- reserved for pending orders
  reorder_point INT DEFAULT 10,
  reorder_quantity INT DEFAULT 50,
  -- Cost tracking
  last_cost_price DECIMAL(10,2),
  average_cost_price DECIMAL(10,2),
  -- Metadata
  last_counted_at TIMESTAMP,
  last_received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE("productId", "variantId", "locationId")
);

CREATE TABLE "inventoryMovements" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  type ENUM('sale', 'return', 'adjustment', 'transfer_in', 'transfer_out', 'purchase_order', 'waste', 'damage', 'count') NOT NULL,
  quantity INT NOT NULL, -- positive for in, negative for out
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reference_type VARCHAR(50), -- 'order', 'transfer', 'po', 'adjustment'
  reference_id UUID,
  reason TEXT,
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "stockTransfers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  transfer_number VARCHAR(50) NOT NULL,
  from_location_id UUID NOT NULL REFERENCES locations(id),
  to_location_id UUID NOT NULL REFERENCES locations(id),
  status ENUM('draft', 'pending', 'in_transit', 'received', 'cancelled') DEFAULT 'draft',
  notes TEXT,
  initiated_by UUID REFERENCES users(id),
  received_by UUID REFERENCES users(id),
  shipped_at TIMESTAMP,
  received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "stockTransferItems" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES stock_transfers(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity_sent INT NOT NULL,
  quantity_received INT DEFAULT 0,
  notes TEXT
);

CREATE TABLE "suppliers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(500),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'US',
  payment_terms VARCHAR(100), -- "Net 30", "COD"
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE "purchaseOrders" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  status ENUM('draft', 'submitted', 'partial', 'received', 'cancelled') DEFAULT 'draft',
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  expected_delivery_date DATE,
  received_at TIMESTAMP,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "purchaseOrderItems" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity_ordered INT NOT NULL,
  quantity_received INT DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL
);

CREATE TABLE "compositeProductItems" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  composite_product_id UUID NOT NULL REFERENCES products(id),
  component_product_id UUID NOT NULL REFERENCES products(id),
  component_variant_id UUID REFERENCES product_variants(id),
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1
);

CREATE TABLE "productModifiers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL, -- "Size", "Extra Toppings"
  type ENUM('single', 'multiple') DEFAULT 'single', -- single choice vs multi choice
  is_required BOOLEAN DEFAULT false,
  min_selections INT DEFAULT 0,
  max_selections INT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "modifierOptions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_id UUID NOT NULL REFERENCES product_modifiers(id),
  name VARCHAR(255) NOT NULL, -- "Large", "Extra Cheese"
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- additional cost
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE "productModifierLinks" (
  product_id UUID NOT NULL REFERENCES products(id),
  modifier_id UUID NOT NULL REFERENCES product_modifiers(id),
  PRIMARY KEY ("productId", "modifierId")
);
```

### 3.4 Orders & Sales

```sql
CREATE TABLE "orders" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  order_number VARCHAR(50) NOT NULL, -- human-readable, sequential per location
  type ENUM('dine_in', 'takeout', 'delivery', 'online', 'phone') DEFAULT 'dine_in',
  status ENUM('draft', 'open', 'in_progress', 'ready', 'completed', 'cancelled', 'refunded') DEFAULT 'open',
  -- Customer
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  -- Table (for dine-in)
  table_id UUID REFERENCES tables(id),
  table_name VARCHAR(50),
  guests_count INT,
  -- Server/Cashier
  server_id UUID REFERENCES users(id),
  cashier_id UUID REFERENCES users(id),
  -- Financials
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_reason VARCHAR(255),
  tax_amount DECIMAL(10,2) DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  service_charge DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  change_due DECIMAL(10,2) DEFAULT 0,
  -- Discount details
  discount_id UUID REFERENCES discounts(id),
  discount_type ENUM('percentage', 'fixed', 'coupon') ,
  discount_value DECIMAL(10,2),
  coupon_code VARCHAR(50),
  -- Tax breakdown
  tax_details JSONB DEFAULT '[]', -- [{name, rate, amount}]
  -- Delivery info
  delivery_address JSONB,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  delivery_notes TEXT,
  estimated_delivery_time TIMESTAMP,
  -- Status timestamps
  opened_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,
  -- Notes
  notes TEXT,
  kitchen_notes TEXT,
  internal_notes TEXT,
  -- Source tracking
  source ENUM('pos', 'online', 'phone', 'third_party') DEFAULT 'pos',
  external_order_id VARCHAR(255), -- DoorDash/UberEats order ID
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE("tenantId", "orderNumber")
);

CREATE TABLE "orderItems" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  -- Item details (snapshot at time of sale)
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1, -- decimal for weight-based
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  -- Cost (for profit tracking)
  cost_price DECIMAL(10,2) DEFAULT 0,
  -- Modifiers applied
  modifiers JSONB DEFAULT '[]', -- [{modifier_id, option_id, name, price}]
  -- Status
  status ENUM('pending', 'preparing', 'ready', 'served', 'cancelled', 'returned') DEFAULT 'pending',
  -- Kitchen
  course ENUM('appetizer', 'main', 'dessert', 'drink') DEFAULT 'main',
  sent_to_kitchen_at TIMESTAMP,
  prepared_at TIMESTAMP,
  -- Notes
  notes TEXT, -- "no onions, extra sauce"
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "orderItemTaxes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  tax_name VARCHAR(100) NOT NULL,
  tax_rate DECIMAL(5,3) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL
);
```

### 3.5 Payments

```sql
CREATE TABLE "payments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  -- Payment info
  method ENUM('cash', 'credit_card', 'debit_card', 'mobile_wallet', 'gift_card', 'store_credit', 'check', 'bnpl', 'other') NOT NULL,
  status ENUM('pending', 'authorized', 'captured', 'completed', 'failed', 'refunded', 'partially_refunded', 'voided') DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  -- Cash specific
  cash_tendered DECIMAL(10,2),
  change_given DECIMAL(10,2),
  -- Card specific (from payment processor)
  payment_processor ENUM('stripe', 'square', 'manual') DEFAULT 'stripe',
  processor_transaction_id VARCHAR(255),
  processor_response JSONB,
  card_brand VARCHAR(20), -- visa, mastercard, amex
  card_last_four VARCHAR(4),
  card_exp_month INT,
  card_exp_year INT,
  authorization_code VARCHAR(50),
  -- Gift card / store credit
  gift_card_id UUID REFERENCES gift_cards(id),
  store_credit_id UUID,
  -- Refund tracking
  refunded_amount DECIMAL(10,2) DEFAULT 0,
  -- Idempotency
  idempotency_key VARCHAR(255) UNIQUE,
  -- Metadata
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "refunds" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  refund_number VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason ENUM('customer_request', 'defective', 'wrong_item', 'overcharge', 'order_cancelled', 'other') NOT NULL,
  reason_details TEXT,
  method ENUM('original_payment', 'cash', 'store_credit', 'gift_card') DEFAULT 'original_payment',
  status ENUM('pending', 'approved', 'processed', 'rejected') DEFAULT 'pending',
  processor_refund_id VARCHAR(255),
  -- Approval
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  -- Items returned
  items JSONB DEFAULT '[]', -- [{order_item_id, quantity, amount, restock: true/false}]
  restock_items BOOLEAN DEFAULT true,
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "cashDrawers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  register_name VARCHAR(100) NOT NULL,
  status ENUM('closed', 'open') DEFAULT 'closed',
  opened_by UUID REFERENCES users(id),
  closed_by UUID REFERENCES users(id),
  opening_amount DECIMAL(10,2) DEFAULT 0,
  closing_amount DECIMAL(10,2),
  expected_amount DECIMAL(10,2),
  difference DECIMAL(10,2), -- over/short
  opened_at TIMESTAMP,
  closed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "cashDrawerTransactions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_drawer_id UUID NOT NULL REFERENCES cash_drawers(id),
  type ENUM('sale', 'refund', 'pay_in', 'pay_out', 'tip') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reference_id UUID, -- order_id or refund_id
  description VARCHAR(255),
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.6 Customers

```sql
CREATE TABLE "customers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  -- Identity
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'US',
  -- Profile
  date_of_birth DATE,
  gender ENUM('male', 'female', 'non_binary', 'prefer_not_to_say'),
  company_name VARCHAR(255),
  tax_exempt BOOLEAN DEFAULT false,
  tax_exempt_id VARCHAR(100),
  -- Loyalty
  loyalty_points INT DEFAULT 0,
  loyalty_tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
  -- Financial
  store_credit_balance DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  -- Marketing
  accepts_marketing BOOLEAN DEFAULT false,
  marketing_opt_in_at TIMESTAMP,
  -- Tags & notes
  tags JSONB DEFAULT '[]',
  notes TEXT,
  -- Metadata
  first_visit_at TIMESTAMP,
  last_visit_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE("tenantId", "email")
);

CREATE TABLE "customerGroups" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('manual', 'automatic') DEFAULT 'manual',
  conditions JSONB, -- for automatic: [{field, operator, value}]
  discount_percentage DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "customerGroupMembers" (
  customer_id UUID NOT NULL REFERENCES customers(id),
  group_id UUID NOT NULL REFERENCES customer_groups(id),
  PRIMARY KEY ("customerId", "groupId")
);
```

### 3.7 Loyalty & Promotions

```sql
CREATE TABLE "loyaltyPrograms" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  type ENUM('points', 'visits', 'spend') DEFAULT 'points',
  is_active BOOLEAN DEFAULT true,
  -- Points config
  points_per_dollar DECIMAL(5,2) DEFAULT 1, -- earn 1 point per $1
  points_to_dollar DECIMAL(5,2) DEFAULT 100, -- 100 points = $1 reward
  -- Tier thresholds
  tier_config JSONB DEFAULT '{
    "bronze": {"min_points": 0, "multiplier": 1},
    "silver": {"min_points": 500, "multiplier": 1.5},
    "gold": {"min_points": 2000, "multiplier": 2},
    "platinum": {"min_points": 5000, "multiplier": 3}
  }',
  -- Rules
  points_expiry_days INT, -- NULL = never expire
  min_points_to_redeem INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "loyaltyTransactions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  type ENUM('earned', 'redeemed', 'adjusted', 'expired', 'bonus') NOT NULL,
  points INT NOT NULL, -- positive for earned, negative for redeemed
  balance_after INT NOT NULL,
  order_id UUID REFERENCES orders(id),
  description VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "discounts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- coupon code, NULL for automatic discounts
  type ENUM('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping') NOT NULL,
  value DECIMAL(10,2) NOT NULL, -- percentage or fixed amount
  -- Scope
  applies_to ENUM('entire_order', 'specific_products', 'specific_categories', 'specific_customers') DEFAULT 'entire_order',
  applicable_product_ids JSONB DEFAULT '[]',
  applicable_category_ids JSONB DEFAULT '[]',
  applicable_customer_group_ids JSONB DEFAULT '[]',
  -- Conditions
  min_purchase_amount DECIMAL(10,2),
  min_quantity INT,
  max_discount_amount DECIMAL(10,2), -- cap for percentage discounts
  -- BOGO config
  buy_quantity INT,
  get_quantity INT,
  get_discount_percentage DECIMAL(5,2), -- 100 = free
  -- Limits
  usage_limit INT, -- total uses allowed
  usage_count INT DEFAULT 0,
  per_customer_limit INT DEFAULT 1,
  -- Schedule
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  -- Flags
  is_active BOOLEAN DEFAULT true,
  is_automatic BOOLEAN DEFAULT false, -- auto-apply at checkout
  combinable BOOLEAN DEFAULT false, -- can stack with other discounts
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "giftCards" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('physical', 'digital') DEFAULT 'digital',
  initial_balance DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  -- Purchaser
  purchased_by UUID REFERENCES customers(id),
  purchased_order_id UUID REFERENCES orders(id),
  -- Recipient
  recipient_name VARCHAR(255),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  message TEXT,
  -- Status
  status ENUM('active', 'used', 'disabled', 'expired') DEFAULT 'active',
  activated_at TIMESTAMP,
  expires_at TIMESTAMP,
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "giftCardTransactions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id),
  type ENUM('activation', 'redemption', 'reload', 'refund', 'adjustment') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  order_id UUID REFERENCES orders(id),
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.8 Tables & Reservations (Restaurant)

```sql
CREATE TABLE "floorPlans" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  name VARCHAR(100) NOT NULL, -- "Main Floor", "Patio"
  layout JSONB, -- coordinates for visual editor
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "tables" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  floor_plan_id UUID REFERENCES floor_plans(id),
  name VARCHAR(50) NOT NULL, -- "Table 1", "Bar 3"
  capacity INT NOT NULL DEFAULT 4,
  min_capacity INT DEFAULT 1,
  shape ENUM('square', 'round', 'rectangle') DEFAULT 'square',
  status ENUM('available', 'occupied', 'reserved', 'dirty', 'blocked') DEFAULT 'available',
  -- Position on floor plan
  position_x INT,
  position_y INT,
  width INT,
  height INT,
  -- Current order
  current_order_id UUID REFERENCES orders(id),
  occupied_since TIMESTAMP,
  server_id UUID REFERENCES users(id),
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "reservations" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  -- Guest info
  customer_id UUID REFERENCES customers(id),
  guest_name VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  guest_email VARCHAR(255),
  party_size INT NOT NULL,
  -- Reservation details
  table_id UUID REFERENCES tables(id),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration_minutes INT DEFAULT 90,
  -- Status
  status ENUM('pending', 'confirmed', 'seated', 'completed', 'no_show', 'cancelled') DEFAULT 'pending',
  -- Notes
  special_requests TEXT,
  internal_notes TEXT,
  -- Notifications
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.9 Kitchen Display System

```sql
CREATE TABLE "kitchenStations" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  name VARCHAR(100) NOT NULL, -- "Grill", "Fryer", "Bar"
  type ENUM('kitchen', 'bar', 'prep', 'expeditor') DEFAULT 'kitchen',
  -- Which categories this station handles
  category_ids JSONB DEFAULT '[]',
  -- Display settings
  alert_after_minutes INT DEFAULT 10, -- turn yellow
  critical_after_minutes INT DEFAULT 20, -- turn red
  auto_complete_after_minutes INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "kitchenOrders" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  station_id UUID NOT NULL REFERENCES kitchen_stations(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  -- Display info
  item_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  modifiers JSONB DEFAULT '[]',
  notes TEXT,
  course ENUM('appetizer', 'main', 'dessert', 'drink'),
  -- Status
  status ENUM('pending', 'in_progress', 'ready', 'served', 'cancelled') DEFAULT 'pending',
  priority INT DEFAULT 0, -- 0=normal, 1=rush
  -- Timestamps
  received_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  served_at TIMESTAMP,
  prep_time_seconds INT -- actual preparation time
);
```

### 3.10 Audit & Logs

```sql
CREATE TABLE "auditLogs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'order.created', 'payment.refunded', 'product.updated'
  entity_type VARCHAR(50) NOT NULL, -- 'order', 'product', 'payment'
  entity_id UUID NOT NULL,
  changes JSONB, -- {field: {old: x, new: y}}
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_entity ON "auditLogs"("tenantId", "entityType", "entityId");
CREATE INDEX idx_audit_logs_tenant_action ON "auditLogs"("tenantId", "action", "createdAt");

CREATE TABLE "taxRates" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL, -- "State Sales Tax", "City Tax"
  rate DECIMAL(5,3) NOT NULL, -- 0.085 = 8.5%
  type ENUM('inclusive', 'exclusive') DEFAULT 'exclusive',
  applies_to ENUM('all', 'specific_categories', 'specific_products') DEFAULT 'all',
  applicable_ids JSONB DEFAULT '[]',
  region VARCHAR(100), -- state/province/city
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0, -- order of application
  is_compound BOOLEAN DEFAULT false, -- apply on top of previous taxes
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "receipts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  type ENUM('sale', 'refund', 'void', 'gift') NOT NULL,
  format ENUM('thermal', 'email', 'sms', 'pdf') NOT NULL,
  content TEXT, -- rendered receipt content
  sent_to VARCHAR(255), -- email or phone
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Module 1: Authentication & Authorization

### 4.1 Features

| Feature                  | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| Email/password login     | Standard login for admin dashboard                      |
| PIN-based login          | Quick 4-6 digit PIN for POS terminal                    |
| JWT tokens               | Access token (15min) + Refresh token (7 days)           |
| Role-based access (RBAC) | owner, admin, manager, cashier, server, kitchen, viewer |
| Multi-location access    | Users can be assigned to specific locations             |
| Session management       | Track active sessions, force logout                     |
| Password reset           | Email-based password reset flow                         |
| Two-factor auth (2FA)    | Optional TOTP for admin/owner roles                     |

### 4.2 Permission Matrix

| Permission          | Owner | Admin | Manager | Cashier      | Server | Kitchen | Viewer |
| ------------------- | ----- | ----- | ------- | ------------ | ------ | ------- | ------ |
| View dashboard      | YES   | YES   | YES     | NO           | NO     | NO      | YES    |
| Manage products     | YES   | YES   | YES     | NO           | NO     | NO      | NO     |
| Create orders       | YES   | YES   | YES     | YES          | YES    | NO      | NO     |
| Process payments    | YES   | YES   | YES     | YES          | NO     | NO      | NO     |
| Issue refunds       | YES   | YES   | YES     | NO           | NO     | NO      | NO     |
| Void transactions   | YES   | YES   | YES     | NO           | NO     | NO      | NO     |
| View reports        | YES   | YES   | YES     | NO           | NO     | NO      | YES    |
| Manage employees    | YES   | YES   | YES     | NO           | NO     | NO      | NO     |
| Manage customers    | YES   | YES   | YES     | YES          | YES    | NO      | NO     |
| Open/close register | YES   | YES   | YES     | YES          | NO     | NO      | NO     |
| Apply discounts     | YES   | YES   | YES     | configurable | NO     | NO      | NO     |
| Manage settings     | YES   | YES   | NO      | NO           | NO     | NO      | NO     |
| Manage locations    | YES   | YES   | NO      | NO           | NO     | NO      | NO     |
| View audit logs     | YES   | YES   | YES     | NO           | NO     | NO      | NO     |
| KDS operations      | YES   | YES   | YES     | NO           | NO     | YES     | NO     |
| Manage tables       | YES   | YES   | YES     | NO           | YES    | NO      | NO     |

### 4.3 API Endpoints

```
POST   /api/v1/auth/register          - Register new tenant + owner
POST   /api/v1/auth/login             - Email/password login
POST   /api/v1/auth/login/pin         - PIN-based POS login
POST   /api/v1/auth/refresh           - Refresh access token
POST   /api/v1/auth/logout            - Logout (invalidate refresh token)
POST   /api/v1/auth/forgot-password   - Request password reset
POST   /api/v1/auth/reset-password    - Reset password with token
POST   /api/v1/auth/change-password   - Change own password
POST   /api/v1/auth/verify-2fa        - Verify 2FA code
POST   /api/v1/auth/enable-2fa        - Enable 2FA
GET    /api/v1/auth/me                - Get current user profile
PUT    /api/v1/auth/me                - Update own profile
GET    /api/v1/auth/sessions          - List active sessions
DELETE /api/v1/auth/sessions/:id      - Revoke a session
```

### 4.4 Business Rules

1. Owner account is created during tenant registration
2. PIN must be unique per tenant (no two employees share a PIN)
3. After 5 failed login attempts, lock account for 15 minutes
4. Refresh tokens are stored hashed in the database
5. When an employee is deactivated, all their sessions are immediately invalidated
6. Manager can only manage employees at their assigned locations
7. Cashier discount limit is configurable per tenant (e.g., max 10% discount)
8. All auth events are logged to audit_logs

### 4.5 Test Cases

```
AUTH-001: Register new tenant with valid data → 201, tenant + owner created
AUTH-002: Register with existing email → 409 conflict
AUTH-003: Login with valid email/password → 200, returns access + refresh tokens
AUTH-004: Login with invalid password → 401
AUTH-005: Login with inactive account → 403
AUTH-006: PIN login with valid PIN → 200, returns access token
AUTH-007: PIN login with invalid PIN → 401
AUTH-008: Refresh token → 200, returns new access token
AUTH-009: Refresh with expired token → 401
AUTH-010: Access protected route without token → 401
AUTH-011: Access admin route as cashier → 403
AUTH-012: Lockout after 5 failed attempts → 429
AUTH-013: Password reset flow → email sent, password changed
AUTH-014: 2FA enable/verify flow → 200
AUTH-015: Logout invalidates refresh token → subsequent refresh fails
AUTH-016: Manager cannot access other location data → 403
AUTH-017: Deactivated user sessions are invalidated → 401 on next request
```

---

## 5. Module 2: Product & Inventory Management

### 5.1 Features

| Feature              | Description                                              |
| -------------------- | -------------------------------------------------------- |
| Product CRUD         | Create, read, update, soft-delete products               |
| Categories           | Hierarchical categories with parent/child                |
| Variants             | Size, color, material with independent pricing and stock |
| Modifiers            | Add-ons for restaurant items (extra cheese, no onions)   |
| Composite products   | Bundles/combos made of multiple products                 |
| Barcode/SKU          | Barcode scanning and SKU-based lookup                    |
| Inventory tracking   | Per-location stock levels                                |
| Low stock alerts     | Configurable reorder points                              |
| Stock transfers      | Move stock between locations                             |
| Purchase orders      | Order from suppliers, receive stock                      |
| Inventory counts     | Physical count with discrepancy reporting                |
| Movement history     | Complete audit trail of stock changes                    |
| Bulk import/export   | CSV upload for mass product creation                     |
| Image management     | Multiple images per product                              |
| Weight-based selling | Scale integration for by-weight items                    |
| Age verification     | Flag products requiring ID check                         |

### 5.2 API Endpoints

```
# Categories
GET    /api/v1/categories              - List categories (tree structure)
POST   /api/v1/categories              - Create category
GET    /api/v1/categories/:id          - Get category
PUT    /api/v1/categories/:id          - Update category
DELETE /api/v1/categories/:id          - Soft delete category

# Products
GET    /api/v1/products                - List products (paginated, filterable)
POST   /api/v1/products                - Create product
GET    /api/v1/products/:id            - Get product with variants
PUT    /api/v1/products/:id            - Update product
DELETE /api/v1/products/:id            - Soft delete product
GET    /api/v1/products/barcode/:code  - Lookup by barcode
GET    /api/v1/products/sku/:sku       - Lookup by SKU
POST   /api/v1/products/bulk-import    - CSV bulk import
GET    /api/v1/products/export         - CSV export

# Variants
POST   /api/v1/products/:id/variants          - Add variant
PUT    /api/v1/products/:id/variants/:vid      - Update variant
DELETE /api/v1/products/:id/variants/:vid      - Delete variant

# Modifiers
GET    /api/v1/modifiers                       - List modifiers
POST   /api/v1/modifiers                       - Create modifier group
PUT    /api/v1/modifiers/:id                   - Update modifier
DELETE /api/v1/modifiers/:id                   - Delete modifier
POST   /api/v1/products/:id/modifiers/:mid     - Link modifier to product
DELETE /api/v1/products/:id/modifiers/:mid     - Unlink modifier

# Inventory
GET    /api/v1/inventory                       - Stock levels (by location)
PUT    /api/v1/inventory/:productId            - Adjust stock
GET    /api/v1/inventory/movements             - Movement history
GET    /api/v1/inventory/low-stock             - Low stock report
POST   /api/v1/inventory/count                 - Submit inventory count
GET    /api/v1/inventory/valuation             - Inventory valuation report

# Stock Transfers
GET    /api/v1/transfers                       - List transfers
POST   /api/v1/transfers                       - Create transfer
GET    /api/v1/transfers/:id                   - Get transfer details
PUT    /api/v1/transfers/:id/ship              - Mark as shipped
PUT    /api/v1/transfers/:id/receive           - Mark as received

# Suppliers
GET    /api/v1/suppliers                       - List suppliers
POST   /api/v1/suppliers                       - Create supplier
PUT    /api/v1/suppliers/:id                   - Update supplier
DELETE /api/v1/suppliers/:id                   - Delete supplier

# Purchase Orders
GET    /api/v1/purchase-orders                 - List POs
POST   /api/v1/purchase-orders                 - Create PO
GET    /api/v1/purchase-orders/:id             - Get PO details
PUT    /api/v1/purchase-orders/:id             - Update PO
PUT    /api/v1/purchase-orders/:id/submit      - Submit to supplier
PUT    /api/v1/purchase-orders/:id/receive     - Receive items
```

### 5.3 Business Rules

1. SKU and barcode must be unique per tenant
2. Deleting a product soft-deletes it; it remains in historical orders
3. When a product with variants is created, the parent product's price is the starting price
4. If `track_inventory = true`, stock cannot go below 0 unless `allow_backorder = true`
5. Every stock change creates an `inventory_movements` record
6. Low stock alerts trigger when `quantity <= reorder_point`
7. Purchase order receiving automatically increments stock and creates movement records
8. Stock transfer: source stock is decremented on shipment, destination incremented on receipt
9. Composite products decrement component stock when sold
10. Inventory count creates adjustment movements for any discrepancies
11. Bulk import validates all rows before inserting any (all-or-nothing)
12. Products with `requires_age_verification = true` trigger a prompt on the POS screen
13. When cost_price changes, `average_cost_price` in inventory is recalculated using weighted average

### 5.4 Test Cases

```
PROD-001: Create product with all fields → 201
PROD-002: Create product with duplicate SKU → 409
PROD-003: List products with pagination → returns correct page
PROD-004: Filter products by category → correct subset
PROD-005: Search products by name → fuzzy match results
PROD-006: Barcode lookup → returns matching product
PROD-007: Create product with 3 variants → all variants stored
PROD-008: Update variant price independently → variant price differs from parent
PROD-009: Soft delete product → still in DB, not in list
PROD-010: Bulk import 100 products via CSV → all created
PROD-011: Bulk import with one bad row → entire import rejected
PROD-012: Adjust stock up → movement created, quantity increased
PROD-013: Adjust stock down below 0 (no backorder) → 400 error
PROD-014: Adjust stock down below 0 (backorder allowed) → allowed
PROD-015: Sale decrements stock → stock reduced, movement logged
PROD-016: Return increments stock → stock increased, movement logged
PROD-017: Low stock alert triggered → notification created
PROD-018: Create stock transfer → source decremented on ship
PROD-019: Receive stock transfer → destination incremented
PROD-020: Create purchase order and receive → stock updated
PROD-021: Inventory count with discrepancy → adjustment movement created
PROD-022: Composite product sale → all component stocks decremented
PROD-023: Modifier linked to product → shows in product detail
PROD-024: Category tree with subcategories → correct nesting
PROD-025: Weight-based product in order → quantity is decimal
```

---

## 6. Module 3: Sales & Checkout

### 6.1 Features

| Feature              | Description                                            |
| -------------------- | ------------------------------------------------------ |
| Create order         | New order with items, modifiers, notes                 |
| Order types          | Dine-in, takeout, delivery, online, phone              |
| Add/remove items     | Modify order before payment                            |
| Quantity adjustment  | Change item quantity in cart                           |
| Item-level notes     | "no onions", "extra sauce"                             |
| Course management    | Appetizer, main, dessert, drink sequencing             |
| Order-level discount | Percentage or fixed amount                             |
| Item-level discount  | Per-item discounts                                     |
| Coupon codes         | Apply coupon at checkout                               |
| Tax calculation      | Auto-calculate based on location and product tax rules |
| Split orders         | Split into multiple orders/checks                      |
| Merge orders         | Combine multiple orders                                |
| Hold orders          | Park an order, resume later                            |
| Void order           | Cancel entire order (manager approval)                 |
| Void item            | Remove single item (with reason)                       |
| Order transfer       | Move order between tables/servers                      |
| Quick sale           | One-tap sale for common items                          |
| Custom item          | Add unlisted item with custom price                    |
| Receipt generation   | Thermal, email, SMS                                    |

### 6.2 API Endpoints

```
# Orders
GET    /api/v1/orders                          - List orders (filterable by status, date, type)
POST   /api/v1/orders                          - Create new order
GET    /api/v1/orders/:id                      - Get order details
PUT    /api/v1/orders/:id                      - Update order
DELETE /api/v1/orders/:id                      - Void/cancel order

# Order Items
POST   /api/v1/orders/:id/items                - Add item to order
PUT    /api/v1/orders/:id/items/:itemId        - Update item (qty, notes, modifiers)
DELETE /api/v1/orders/:id/items/:itemId        - Remove item

# Order Actions
POST   /api/v1/orders/:id/discount             - Apply discount
DELETE /api/v1/orders/:id/discount             - Remove discount
POST   /api/v1/orders/:id/coupon               - Apply coupon code
POST   /api/v1/orders/:id/split                - Split order
POST   /api/v1/orders/:id/merge                - Merge with another order
PUT    /api/v1/orders/:id/hold                 - Hold order
PUT    /api/v1/orders/:id/resume               - Resume held order
POST   /api/v1/orders/:id/transfer             - Transfer to table/server
POST   /api/v1/orders/:id/send-to-kitchen      - Send to KDS
PUT    /api/v1/orders/:id/complete             - Mark completed
POST   /api/v1/orders/:id/receipt              - Generate/send receipt

# Quick operations
POST   /api/v1/orders/quick-sale               - One-item quick sale
GET    /api/v1/orders/open                     - Get all open orders for location
GET    /api/v1/orders/held                     - Get all held orders
```

### 6.3 Order Lifecycle

```
                    ┌──────────┐
                    │  draft   │ (order created, items being added)
                    └────┬─────┘
                         │ items added
                    ┌────▼─────┐
            ┌──────►│   open   │◄──────┐
            │       └────┬─────┘       │
            │            │ sent to     │ resumed
         resumed         │ kitchen     │
            │       ┌────▼──────┐ ┌────┴─────┐
            │       │in_progress│ │   held   │
            │       └────┬──────┘ └──────────┘
            │            │ all items ready
            │       ┌────▼─────┐
            │       │  ready   │
            │       └────┬─────┘
            │            │ payment processed
            │       ┌────▼──────┐
            └───────│ completed │
                    └────┬──────┘
                         │ refund issued
                    ┌────▼──────┐
                    │ refunded  │
                    └───────────┘

    At any open state:
                    ┌───────────┐
                    │ cancelled │ (void with reason)
                    └───────────┘
```

### 6.4 Business Rules

1. Order number is sequential per location, resets daily: `LOC01-20260301-0001`
2. Only open/in_progress orders can have items added
3. Completed orders cannot be modified; only refund is available
4. Discount cannot exceed order subtotal
5. Coupon validation: check active, within date range, usage limits, minimum purchase
6. Tax is calculated per item based on product tax category and location tax rates
7. Compound taxes are applied on top of previous tax amounts
8. When an order is voided, all inventory adjustments are reversed
9. Splitting an order creates a new order with selected items removed from original
10. Merging combines all items into the target order; source order is cancelled
11. Hold order saves current state; held orders show on a separate held queue
12. Order transfer updates table_id and/or server_id
13. Sending to kitchen creates `kitchen_orders` records for each item
14. Quick sale creates a completed order with a single item in one operation
15. Custom items have no product_id and do not affect inventory
16. All price calculations use banker's rounding (round half to even)

### 6.5 Tax Calculation Logic

```
For each order_item:
  1. Get applicable tax rates for the item's product tax_category + location
  2. Sort by priority
  3. For each tax rate:
     a. If NOT compound: tax = item_total × rate
     b. If compound: tax = (item_total + sum_of_previous_taxes) × rate
  4. If tax_inclusive: extract tax from price (price = total / (1 + sum_rates))
  5. Store each tax line in order_item_taxes
  6. Sum all taxes for order.tax_amount
```

### 6.6 Test Cases

```
ORD-001: Create order with 3 items → correct subtotal, tax, total
ORD-002: Add item to existing open order → item added, totals recalculated
ORD-003: Remove item from order → totals recalculated
ORD-004: Change item quantity → totals recalculated
ORD-005: Apply 10% discount → discount_amount correct
ORD-006: Apply $5 fixed discount → discount_amount = 5.00
ORD-007: Apply valid coupon → discount applied
ORD-008: Apply expired coupon → 400 error
ORD-009: Apply coupon below minimum purchase → 400 error
ORD-010: Apply coupon exceeding usage limit → 400 error
ORD-011: Tax calculation with single rate → correct tax
ORD-012: Tax calculation with compound taxes → compound applied correctly
ORD-013: Tax-inclusive pricing → tax extracted from price
ORD-014: Split order → two orders with correct items and totals
ORD-015: Merge orders → combined items, source cancelled
ORD-016: Hold and resume order → state preserved
ORD-017: Void order → status cancelled, inventory restored
ORD-018: Void single item → item removed, inventory restored
ORD-019: Transfer order to new table → table updated
ORD-020: Complete order → status completed, completed_at set
ORD-021: Modify completed order → 400 error
ORD-022: Quick sale → order created and completed in one step
ORD-023: Custom item → no inventory impact
ORD-024: Order with modifiers → modifier prices included in total
ORD-025: Order number sequential → LOC01-DATE-0001, 0002, 0003...
ORD-026: Send to kitchen → kitchen_orders created for each item
ORD-027: Course sequencing → appetizers sent before mains
ORD-028: Weight-based item → quantity is decimal, total calculated correctly
ORD-029: Age-restricted item → age_verification_required flag in response
ORD-030: Discount cannot exceed subtotal → capped at subtotal
```

---

## 7. Module 4: Payment Processing

### 7.1 Features

| Feature           | Description                               |
| ----------------- | ----------------------------------------- |
| Cash payment      | With cash tendered and change calculation |
| Card payment      | Credit/debit via Stripe/Square terminal   |
| Mobile wallet     | Apple Pay, Google Pay                     |
| Gift card payment | Pay with gift card balance                |
| Store credit      | Pay with customer store credit            |
| Split payment     | Pay with multiple methods                 |
| Partial payment   | Pay portion now, remainder later          |
| Tips              | Add tip (percentage presets or custom)    |
| Refunds           | Full or partial refund to original method |
| Voids             | Cancel payment before settlement          |
| Cash drawer       | Open, close, pay in, pay out operations   |
| End-of-day        | Close register with reconciliation        |
| Idempotency       | Safe to retry failed payment operations   |

### 7.2 API Endpoints

```
# Payments
POST   /api/v1/payments                       - Process payment
GET    /api/v1/payments/:id                    - Get payment details
POST   /api/v1/payments/:id/capture            - Capture authorized payment
POST   /api/v1/payments/:id/void               - Void payment

# Refunds
POST   /api/v1/refunds                         - Process refund
GET    /api/v1/refunds/:id                     - Get refund details
PUT    /api/v1/refunds/:id/approve             - Approve refund (manager)

# Cash Drawer
POST   /api/v1/cash-drawer/open                - Open register
POST   /api/v1/cash-drawer/close               - Close register
POST   /api/v1/cash-drawer/pay-in              - Cash pay-in
POST   /api/v1/cash-drawer/pay-out             - Cash pay-out
GET    /api/v1/cash-drawer/current             - Current drawer status
GET    /api/v1/cash-drawer/:id/summary         - Drawer session summary

# Gift Cards
POST   /api/v1/gift-cards                      - Create/sell gift card
GET    /api/v1/gift-cards/:code/balance         - Check balance
POST   /api/v1/gift-cards/:code/reload          - Reload gift card
```

### 7.3 Payment Flow

```
1. POS sends payment request with:
   - order_id
   - method (cash/card/gift_card/etc)
   - amount
   - tip_amount (optional)
   - idempotency_key (UUID generated client-side)

2. Server validates:
   - Order exists and is open/ready
   - Amount matches remaining balance
   - Idempotency key not already used
   - Gift card/store credit has sufficient balance

3. For card payments:
   a. Create Stripe/Square PaymentIntent
   b. Return client_secret to POS
   c. POS completes payment via terminal/SDK
   d. Webhook confirms payment → update status to 'completed'

4. For cash payments:
   a. Record cash_tendered, calculate change
   b. Update cash drawer balance
   c. Mark payment completed immediately

5. For split payments:
   a. Process each payment method sequentially
   b. Each creates a separate payment record
   c. Order marked complete when sum(payments) >= order.total

6. After all payments processed:
   a. Order status → completed
   b. Inventory decremented (if not already)
   c. Loyalty points earned
   d. Receipt generated
```

### 7.4 Business Rules

1. Idempotency: Same `idempotency_key` returns the original result without reprocessing
2. Split payments: Each payment record tracks its portion; order tracks total paid
3. Cash drawer must be open to process cash payments
4. Only managers+ can process refunds over $50 (configurable threshold)
5. Refunds can only be issued to original payment method or store credit
6. Gift card balance cannot go negative
7. Tips are tracked separately for reporting and payout
8. End-of-day close calculates expected cash based on all transactions
9. Overage/shortage is recorded for accountability
10. Payment processor webhooks update payment status asynchronously
11. Failed card payments do not change order status
12. Void is only available before end-of-day settlement

### 7.5 Test Cases

```
PAY-001: Cash payment → change calculated, drawer updated
PAY-002: Card payment via Stripe → PaymentIntent created
PAY-003: Split payment (cash + card) → both recorded, order complete
PAY-004: Gift card payment → balance decremented
PAY-005: Gift card insufficient balance → 400 error
PAY-006: Store credit payment → balance decremented
PAY-007: Add tip → tip_amount recorded
PAY-008: Idempotent retry → same result returned, no double charge
PAY-009: Full refund → payment status refunded, inventory restocked
PAY-010: Partial refund → refunded_amount updated
PAY-011: Refund to store credit → customer credit balance increased
PAY-012: Void payment → status voided, order reopened
PAY-013: Open cash drawer → status open, opening amount recorded
PAY-014: Close cash drawer → difference calculated
PAY-015: Pay-in to drawer → balance increased, transaction logged
PAY-016: Pay-out from drawer → balance decreased, transaction logged
PAY-017: Payment without open drawer (cash) → 400 error
PAY-018: Refund over threshold by cashier → 403 (needs manager)
PAY-019: Overpayment → change_due calculated
PAY-020: Payment webhook updates status → payment marked completed
```

---

## 8. Module 5: Customer Management

### 8.1 Features

| Feature            | Description                           |
| ------------------ | ------------------------------------- |
| Customer CRUD      | Create, read, update, soft-delete     |
| Search             | By name, email, phone, loyalty number |
| Order history      | All past orders for a customer        |
| Spending analytics | Total spent, average order, frequency |
| Customer groups    | Manual or rule-based segmentation     |
| Store credit       | Balance management                    |
| Tax exemption      | Flag customers as tax-exempt          |
| Notes & tags       | Internal notes and tagging            |
| Marketing consent  | Track opt-in/opt-out                  |
| Merge duplicates   | Combine duplicate customer records    |
| Import/export      | CSV bulk operations                   |

### 8.2 API Endpoints

```
GET    /api/v1/customers                       - List (search, filter, paginate)
POST   /api/v1/customers                       - Create customer
GET    /api/v1/customers/:id                   - Get customer details
PUT    /api/v1/customers/:id                   - Update customer
DELETE /api/v1/customers/:id                   - Soft delete
GET    /api/v1/customers/:id/orders            - Order history
GET    /api/v1/customers/:id/loyalty           - Loyalty details
POST   /api/v1/customers/:id/store-credit      - Add store credit
POST   /api/v1/customers/merge                 - Merge duplicates
POST   /api/v1/customers/import                - CSV import
GET    /api/v1/customers/export                - CSV export

# Customer Groups
GET    /api/v1/customer-groups                 - List groups
POST   /api/v1/customer-groups                 - Create group
PUT    /api/v1/customer-groups/:id             - Update group
DELETE /api/v1/customer-groups/:id             - Delete group
POST   /api/v1/customer-groups/:id/members     - Add members
DELETE /api/v1/customer-groups/:id/members/:cid - Remove member
```

### 8.3 Business Rules

1. Email must be unique per tenant (phone can be shared)
2. Merging keeps the older record as primary, moves all orders/loyalty to it
3. Store credit balance is never negative
4. Auto-groups re-evaluate membership when customer data changes
5. Customer `total_spent`, `total_orders`, `average_order_value` are updated after each order completion
6. `last_visit_at` updates when a new order is created for the customer
7. Tax-exempt customers skip tax calculation on their orders
8. Marketing consent changes are logged with timestamp

### 8.4 Test Cases

```
CUST-001: Create customer → 201
CUST-002: Create with duplicate email → 409
CUST-003: Search by partial name → fuzzy results
CUST-004: Search by phone → exact match
CUST-005: View order history → paginated orders
CUST-006: Add store credit → balance increased
CUST-007: Merge two customers → orders consolidated
CUST-008: Tax-exempt order → no tax calculated
CUST-009: Auto-group membership → customer added when conditions met
CUST-010: Customer stats update after order → total_spent recalculated
CUST-011: Bulk import 500 customers → all created
CUST-012: Export customers to CSV → valid CSV with all fields
```

---

## 9. Module 6: Employee Management

### 9.1 Features

| Feature             | Description                         |
| ------------------- | ----------------------------------- |
| Employee CRUD       | Manage staff accounts               |
| Role assignment     | Assign roles with permissions       |
| Location assignment | Assign to one or more locations     |
| Time clock          | Clock in/out with optional PIN      |
| Break tracking      | Track break start/end               |
| Shift scheduling    | Create and manage schedules         |
| Performance metrics | Sales per employee, avg transaction |
| Commission tracking | Configurable commission rates       |
| Tip management      | Track and distribute tips           |

### 9.2 API Endpoints

```
# Employees (alias for users with employee context)
GET    /api/v1/employees                       - List employees
POST   /api/v1/employees                       - Create employee
GET    /api/v1/employees/:id                   - Get employee details
PUT    /api/v1/employees/:id                   - Update employee
DELETE /api/v1/employees/:id                   - Deactivate employee

# Time Clock
POST   /api/v1/time-clock/clock-in             - Clock in
POST   /api/v1/time-clock/clock-out            - Clock out
POST   /api/v1/time-clock/break-start          - Start break
POST   /api/v1/time-clock/break-end            - End break
GET    /api/v1/time-clock/current              - Current shift status
GET    /api/v1/time-clock/history              - Shift history

# Scheduling
GET    /api/v1/schedules                       - View schedules
POST   /api/v1/schedules                       - Create schedule entry
PUT    /api/v1/schedules/:id                   - Update schedule
DELETE /api/v1/schedules/:id                   - Delete schedule

# Performance
GET    /api/v1/employees/:id/performance       - Performance metrics
GET    /api/v1/employees/:id/commissions       - Commission report
GET    /api/v1/employees/tips                  - Tip distribution report
```

### 9.3 Business Rules

1. Employee can only clock in at their assigned location
2. Clock-out auto-calculates total hours (minus break time)
3. Cannot clock in if already clocked in (must clock out first)
4. Overtime calculated after 40 hours/week (configurable)
5. Commission is calculated per completed order where employee is the server/cashier
6. Tip distribution can be pool-based or individual
7. Schedule conflicts (overlapping shifts) are flagged on creation
8. Deactivating an employee immediately invalidates their sessions

### 9.4 Test Cases

```
EMP-001: Create employee with role → 201
EMP-002: Assign employee to location → assignment created
EMP-003: Clock in → shift started
EMP-004: Clock in while already clocked in → 400
EMP-005: Clock out → total_hours calculated
EMP-006: Break start/end → break duration tracked
EMP-007: Performance metrics → sales count, total, avg
EMP-008: Commission calculation → correct percentage
EMP-009: Schedule overlap → warning/error
EMP-010: Deactivate employee → sessions invalidated
EMP-011: Tip pool distribution → evenly split
```

---

## 10. Module 7: Reporting & Analytics

### 10.1 Features

| Feature             | Description                                      |
| ------------------- | ------------------------------------------------ |
| Sales dashboard     | Real-time sales overview                         |
| Sales reports       | By period, product, category, employee, location |
| Revenue reports     | Revenue, cost, profit, margins                   |
| Product reports     | Best sellers, slow movers, profitability         |
| Customer reports    | New vs returning, CLV, top spenders              |
| Inventory reports   | Valuation, turnover, shrinkage                   |
| Employee reports    | Performance, hours, commissions                  |
| Tax reports         | Tax collected by rate, ready for filing          |
| Payment reports     | By method, tips, refunds                         |
| Cash drawer reports | Open/close history, discrepancies                |
| Custom date ranges  | Filter all reports by date range                 |
| Export              | PDF and CSV export for all reports               |
| Scheduled reports   | Email daily/weekly/monthly summaries             |

### 10.2 API Endpoints

```
# Dashboard
GET    /api/v1/reports/dashboard               - Real-time dashboard data

# Sales
GET    /api/v1/reports/sales                   - Sales summary
GET    /api/v1/reports/sales/by-product        - Sales by product
GET    /api/v1/reports/sales/by-category       - Sales by category
GET    /api/v1/reports/sales/by-employee       - Sales by employee
GET    /api/v1/reports/sales/by-hour           - Hourly sales breakdown
GET    /api/v1/reports/sales/by-day            - Daily sales breakdown
GET    /api/v1/reports/sales/by-location       - Sales by location

# Financial
GET    /api/v1/reports/revenue                 - Revenue & profit
GET    /api/v1/reports/taxes                   - Tax summary
GET    /api/v1/reports/payments                - Payment method breakdown
GET    /api/v1/reports/refunds                 - Refund summary
GET    /api/v1/reports/tips                    - Tip report
GET    /api/v1/reports/discounts               - Discount usage report

# Inventory
GET    /api/v1/reports/inventory/valuation     - Current valuation
GET    /api/v1/reports/inventory/turnover      - Turnover rate
GET    /api/v1/reports/inventory/shrinkage     - Waste & damage

# Customers
GET    /api/v1/reports/customers/overview      - Customer analytics
GET    /api/v1/reports/customers/top           - Top customers by spend
GET    /api/v1/reports/customers/retention     - Retention metrics

# Export
GET    /api/v1/reports/:type/export            - Export report (CSV/PDF)

# Scheduled Reports
POST   /api/v1/reports/scheduled               - Create scheduled report
GET    /api/v1/reports/scheduled               - List scheduled reports
DELETE /api/v1/reports/scheduled/:id           - Delete scheduled report
```

### 10.3 Dashboard Data Structure

```json
{
  "today": {
    "total_sales": 4523.50,
    "total_orders": 87,
    "average_order_value": 52.00,
    "total_refunds": 125.00,
    "net_sales": 4398.50,
    "total_tax": 352.28,
    "total_tips": 445.00,
    "total_discounts": 89.50
  },
  "comparison": {
    "vs_yesterday": "+12.5%",
    "vs_same_day_last_week": "+8.3%",
    "vs_same_day_last_month": "+15.1%"
  },
  "top_products": [...],
  "sales_by_hour": [...],
  "payment_breakdown": {
    "cash": 1200.00,
    "credit_card": 2800.50,
    "gift_card": 398.50,
    "store_credit": 124.50
  },
  "active_orders": 5,
  "tables_occupied": 12,
  "tables_available": 8
}
```

### 10.4 Business Rules

1. All reports respect tenant isolation and location access permissions
2. Dashboard refreshes every 30 seconds via WebSocket
3. Reports with large datasets are paginated or streamed
4. Date ranges default to "today" for dashboard, "last 30 days" for reports
5. Export generates files asynchronously for large datasets (notify when ready)
6. Scheduled reports run as background jobs via BullMQ
7. Profit calculations: `profit = revenue - cost_of_goods_sold`
8. Customer retention: `returning_rate = returning_customers / total_customers × 100`

### 10.5 Test Cases

```
RPT-001: Dashboard returns today's metrics → correct totals
RPT-002: Sales by product → correct ranking and amounts
RPT-003: Sales by employee → matches actual processed orders
RPT-004: Tax report → sums match total tax collected
RPT-005: Payment breakdown → matches actual payment records
RPT-006: Date range filter → only includes orders within range
RPT-007: Multi-location report → data separated by location
RPT-008: Export to CSV → valid CSV with correct data
RPT-009: Export to PDF → readable formatted report
RPT-010: Scheduled report → email delivered on schedule
RPT-011: Comparison metrics → percentage calculations correct
RPT-012: Inventory valuation → sum(qty × avg_cost) per product
```

---

## 11. Module 8: Loyalty & Promotions

### 11.1 Features

| Feature              | Description                                     |
| -------------------- | ----------------------------------------------- |
| Points program       | Earn points per dollar spent                    |
| Tier system          | Bronze, Silver, Gold, Platinum with multipliers |
| Point redemption     | Redeem points as payment                        |
| Automatic promotions | Auto-apply when conditions met                  |
| Coupon codes         | Manual entry discount codes                     |
| BOGO deals           | Buy X get Y free/discounted                     |
| Happy hour           | Time-based automatic discounts                  |
| Gift cards           | Sell, redeem, reload, check balance             |
| Birthday rewards     | Auto-reward on customer birthday                |
| Referral program     | Rewards for referring new customers             |

### 11.2 API Endpoints

```
# Loyalty Program
GET    /api/v1/loyalty                         - Get program config
PUT    /api/v1/loyalty                         - Update program config
GET    /api/v1/loyalty/tiers                   - List tiers
GET    /api/v1/loyalty/customers/:id           - Customer loyalty details
POST   /api/v1/loyalty/redeem                  - Redeem points
GET    /api/v1/loyalty/transactions            - Loyalty transaction history

# Discounts & Promotions
GET    /api/v1/discounts                       - List discounts
POST   /api/v1/discounts                       - Create discount
GET    /api/v1/discounts/:id                   - Get discount details
PUT    /api/v1/discounts/:id                   - Update discount
DELETE /api/v1/discounts/:id                   - Delete discount
POST   /api/v1/discounts/validate              - Validate coupon code

# Gift Cards
POST   /api/v1/gift-cards                      - Create gift card
GET    /api/v1/gift-cards/:code                - Get gift card details
POST   /api/v1/gift-cards/:code/reload         - Reload balance
GET    /api/v1/gift-cards/:code/transactions   - Transaction history
```

### 11.3 Business Rules

1. Points earned = `order_total × points_per_dollar × tier_multiplier`
2. Points only earned on completed (paid) orders
3. Refunded orders deduct the earned points
4. Tier upgrades happen automatically when threshold reached
5. Tier downgrades happen on annual review (configurable)
6. Points expiry is checked by a nightly job
7. BOGO: cheapest qualifying item is discounted
8. Happy hour: time-based discounts auto-apply during configured hours
9. Coupons are case-insensitive
10. Single-use coupons are marked used after first redemption
11. Non-combinable discounts: only the best discount applies
12. Gift card codes are generated as unique 16-character alphanumeric strings
13. Birthday rewards are sent via email/SMS 1 day before birthday

### 11.4 Test Cases

```
LOY-001: Earn points on purchase → points = total × rate × multiplier
LOY-002: Tier upgrade → automatically promoted when threshold reached
LOY-003: Redeem points → balance decreased, order discounted
LOY-004: Redeem more than balance → 400 error
LOY-005: Refund deducts points → earned points reversed
LOY-006: Points expiry job → expired points removed
LOY-007: BOGO discount → cheapest item free
LOY-008: Happy hour auto-discount → applied during configured hours
LOY-009: Happy hour outside hours → not applied
LOY-010: Valid coupon → discount applied
LOY-011: Expired coupon → rejected
LOY-012: Used single-use coupon → rejected
LOY-013: Non-combinable discounts → best one wins
LOY-014: Gift card purchase → card created with balance
LOY-015: Gift card redeem → balance decreased
LOY-016: Gift card reload → balance increased
LOY-017: Birthday reward → notification sent on birthday
```

---

## 12. Module 9: Multi-Location Management

### 12.1 Features

| Feature                    | Description                        |
| -------------------------- | ---------------------------------- |
| Location CRUD              | Create and manage store locations  |
| Per-location inventory     | Independent stock per location     |
| Per-location pricing       | Optional location-specific pricing |
| Per-location tax           | Location-specific tax rates        |
| Stock transfers            | Move inventory between locations   |
| Consolidated reporting     | Cross-location reports             |
| Location-specific settings | Hours, receipts, registers         |

### 12.2 API Endpoints

```
GET    /api/v1/locations                       - List locations
POST   /api/v1/locations                       - Create location
GET    /api/v1/locations/:id                   - Get location details
PUT    /api/v1/locations/:id                   - Update location
DELETE /api/v1/locations/:id                   - Deactivate location
GET    /api/v1/locations/:id/stats             - Location statistics
```

### 12.3 Business Rules

1. All data queries are scoped to the user's current active location
2. Admins/owners can switch between locations
3. Inventory is independent per location
4. Tax rates can be overridden per location
5. Reporting can be per-location or consolidated
6. Each location has its own order number sequence
7. Cash drawers are tied to specific locations

### 12.4 Test Cases

```
LOC-001: Create location → 201
LOC-002: List locations for tenant → correct set
LOC-003: Location-scoped inventory → independent stock
LOC-004: Location-scoped orders → only location orders
LOC-005: Cross-location report → aggregated data
LOC-006: Stock transfer between locations → correct adjustments
LOC-007: Location-specific tax rate → correct tax calculation
```

---

## 13. Module 10: Kitchen Display System (KDS)

### 13.1 Features

| Feature           | Description                                       |
| ----------------- | ------------------------------------------------- |
| Order display     | Show new orders in real-time                      |
| Station routing   | Route items to correct station (grill, bar, etc.) |
| Status updates    | Pending → In Progress → Ready                     |
| Priority orders   | Rush order flagging                               |
| Timer alerts      | Color coding based on wait time                   |
| Course management | Fire courses in sequence                          |
| Bump bar support  | Mark items done via bump bar/touch                |
| Recall            | Recall bumped orders                              |
| Statistics        | Avg prep time, tickets per hour                   |

### 13.2 API Endpoints

```
# Kitchen Stations
GET    /api/v1/kitchen/stations                - List stations
POST   /api/v1/kitchen/stations                - Create station
PUT    /api/v1/kitchen/stations/:id            - Update station

# Kitchen Orders (WebSocket primary, REST fallback)
GET    /api/v1/kitchen/orders                  - Active kitchen orders
PUT    /api/v1/kitchen/orders/:id/start        - Start preparing
PUT    /api/v1/kitchen/orders/:id/ready        - Mark as ready
PUT    /api/v1/kitchen/orders/:id/served       - Mark as served
PUT    /api/v1/kitchen/orders/:id/recall       - Recall bumped order
PUT    /api/v1/kitchen/orders/:id/priority     - Toggle rush priority

# Kitchen Stats
GET    /api/v1/kitchen/stats                   - Prep time stats
```

### 13.3 WebSocket Events

```
# Server → KDS Client
kitchen:new_order      - New order received
kitchen:order_updated  - Order item status changed
kitchen:order_recalled - Bumped order recalled
kitchen:rush_order     - Priority flagged

# KDS Client → Server
kitchen:start_item     - Started preparing
kitchen:complete_item  - Item ready
kitchen:bump_order     - All items ready, clear from screen
```

### 13.4 Business Rules

1. Items are routed to stations based on product category → station mapping
2. Timer starts when order is received at station
3. Yellow alert: `alert_after_minutes` exceeded
4. Red alert: `critical_after_minutes` exceeded
5. Course management: appetizers fire immediately, mains fire on server request
6. Prep time is recorded for analytics
7. KDS screen auto-refreshes if WebSocket disconnects (fallback polling)
8. Recalled orders return to the active queue

### 13.5 Test Cases

```
KDS-001: New order sent to kitchen → appears on KDS
KDS-002: Item routed to correct station → based on category mapping
KDS-003: Start preparing → status updated, timer running
KDS-004: Mark ready → item status ready, notification to server
KDS-005: Bump order → cleared from screen
KDS-006: Recall bumped order → returns to queue
KDS-007: Rush priority → highlighted on all stations
KDS-008: Timer yellow alert → color change after threshold
KDS-009: Timer red alert → color change after critical threshold
KDS-010: Prep time recorded → stored in kitchen_orders
KDS-011: Course fire → mains sent after appetizers ready
KDS-012: WebSocket disconnect → fallback to REST polling
```

---

## 14. Module 11: Table & Reservation Management

### 14.1 Features

| Feature              | Description                                   |
| -------------------- | --------------------------------------------- |
| Floor plan editor    | Visual drag-and-drop table layout             |
| Table status         | Available, occupied, reserved, dirty, blocked |
| Reservation CRUD     | Create, confirm, seat, complete, cancel       |
| Walk-in management   | Assign table to walk-in guests                |
| Wait list            | Queue for full-capacity periods               |
| Table merge/split    | Combine or split physical tables              |
| Auto-notifications   | Reservation reminders via SMS/email           |
| Guest count tracking | Track covers per table                        |

### 14.2 API Endpoints

```
# Floor Plans
GET    /api/v1/floor-plans                     - List floor plans
POST   /api/v1/floor-plans                     - Create floor plan
PUT    /api/v1/floor-plans/:id                 - Update layout

# Tables
GET    /api/v1/tables                          - List tables with status
POST   /api/v1/tables                          - Create table
PUT    /api/v1/tables/:id                      - Update table
PUT    /api/v1/tables/:id/status               - Update status
POST   /api/v1/tables/:id/seat                 - Seat guests (creates order)
POST   /api/v1/tables/:id/clear                - Clear table (mark dirty→available)

# Reservations
GET    /api/v1/reservations                    - List reservations
POST   /api/v1/reservations                    - Create reservation
GET    /api/v1/reservations/:id                - Get details
PUT    /api/v1/reservations/:id                - Update reservation
PUT    /api/v1/reservations/:id/confirm        - Confirm
PUT    /api/v1/reservations/:id/seat           - Seat party
PUT    /api/v1/reservations/:id/cancel         - Cancel
PUT    /api/v1/reservations/:id/no-show        - Mark no-show

# Wait List
GET    /api/v1/waitlist                        - Current wait list
POST   /api/v1/waitlist                        - Add to wait list
PUT    /api/v1/waitlist/:id/notify             - Notify table ready
DELETE /api/v1/waitlist/:id                    - Remove from list
```

### 14.3 Business Rules

1. Seating a table auto-creates a new dine-in order
2. Completing an order sets table status to "dirty"
3. "Dirty" tables can be marked "available" by busser/server
4. Reservations block the table for the duration window
5. Reservation reminders sent 2 hours before (configurable)
6. No-shows are tracked per customer for analytics
7. Wait list estimates based on average table turn time
8. Table capacity is enforced (party size <= table capacity)

### 14.4 Test Cases

```
TBL-001: Create table → appears on floor plan
TBL-002: Seat walk-in → table occupied, order created
TBL-003: Complete order → table status dirty
TBL-004: Clear table → status available
TBL-005: Create reservation → table blocked for time window
TBL-006: Seat reservation → table occupied
TBL-007: Cancel reservation → table unblocked
TBL-008: No-show → tracked on customer record
TBL-009: Wait list add → position and estimate provided
TBL-010: Wait list notify → SMS/notification sent
TBL-011: Overbooking prevention → 409 if table already reserved
TBL-012: Party too large → 400 if exceeds capacity
```

---

## 15. Module 12: E-commerce & Omnichannel

### 15.1 Features

| Feature                 | Description                            |
| ----------------------- | -------------------------------------- |
| Online ordering         | Customer-facing web/mobile ordering    |
| Menu/catalog sync       | Products synced between POS and online |
| Pickup scheduling       | Schedule pickup times                  |
| Delivery management     | Address, fee, estimated time           |
| Order status tracking   | Real-time status for customer          |
| Third-party integration | DoorDash, UberEats, GrubHub webhooks   |
| Unified inventory       | Single stock pool across channels      |

### 15.2 API Endpoints

```
# Storefront (public, no auth)
GET    /api/v1/storefront/menu                 - Public menu/catalog
GET    /api/v1/storefront/menu/:id             - Product details
POST   /api/v1/storefront/orders               - Place online order
GET    /api/v1/storefront/orders/:id/status     - Order status

# Delivery
PUT    /api/v1/orders/:id/delivery             - Update delivery info
PUT    /api/v1/orders/:id/delivery/dispatch    - Dispatch for delivery
PUT    /api/v1/orders/:id/delivery/complete    - Mark delivered

# Third-party webhooks
POST   /api/v1/webhooks/doordash               - DoorDash order webhook
POST   /api/v1/webhooks/ubereats               - UberEats order webhook
POST   /api/v1/webhooks/grubhub                - GrubHub order webhook
```

### 15.3 Business Rules

1. Online orders create orders with `source = 'online'` and `type = 'takeout'` or `'delivery'`
2. Online menu can be a subset of full product catalog (flag per product)
3. Pickup slots are based on location operating hours and current order volume
4. Delivery fee is calculated based on distance or flat rate (configurable)
5. Third-party orders are ingested via webhooks and normalized to internal order format
6. Inventory is shared: an online sale decrements the same stock as a POS sale
7. Customer receives order status updates via email/SMS at each status change

### 15.4 Test Cases

```
ECOM-001: Public menu returns active products → correct catalog
ECOM-002: Place online order → order created, confirmation sent
ECOM-003: Pickup scheduling → valid time slots returned
ECOM-004: Delivery order → address stored, fee calculated
ECOM-005: Order status tracking → real-time status updates
ECOM-006: DoorDash webhook → internal order created
ECOM-007: Inventory shared → online sale decrements POS stock
ECOM-008: Out of stock online → item unavailable on storefront
```

---

## 16. Module 13: Hardware Integration

### 16.1 Supported Hardware

| Device           | Integration Method                         |
| ---------------- | ------------------------------------------ |
| Receipt printer  | ESC/POS commands via USB/network           |
| Barcode scanner  | Keyboard wedge / USB HID                   |
| Cash drawer      | Triggered via receipt printer kick command |
| Card terminal    | Stripe Terminal SDK / Square Terminal      |
| Customer display | Web-based secondary screen                 |
| Kitchen printer  | ESC/POS via network                        |
| Scale            | Serial/USB, weight returned to POS         |
| Label printer    | ZPL commands via USB/network               |

### 16.2 Receipt Format

```
================================
      [BUSINESS NAME]
      [Address Line 1]
      [City, State ZIP]
      Tel: [Phone]
================================
Date: 2026-03-01  Time: 14:23
Cashier: John D.
Order #: STORE01-20260301-0042
Table: 5  Guests: 4
================================
Qty  Item              Price
--------------------------------
  2  Margherita Pizza  $24.00
     + Extra Cheese     $2.00
  1  Caesar Salad       $8.50
  3  Craft Beer        $21.00
  1  Tiramisu           $7.50
================================
Subtotal:             $63.00
Discount (10%):       -$6.30
Tax (8.5%):            $4.82
Tip:                   $9.00
================================
TOTAL:                $70.52
================================
Paid: Visa ****4242   $70.52
================================
Loyalty Points Earned: 63
Total Points: 1,247
================================
Thank you for dining with us!
[QR Code: Feedback URL]
================================
```

### 16.3 Business Rules

1. Receipt printer auto-detected on connection
2. Cash drawer opens automatically on cash payment completion
3. Barcode scanner input is intercepted and triggers product lookup
4. Scale weight auto-populates quantity for weight-based items
5. Card terminal communicates via Stripe/Square SDK (not directly)
6. Customer display mirrors the cart in real-time
7. Kitchen printer is triggered when order is sent to kitchen
8. Label printer generates barcode labels for inventory

---

## 17. Module 14: Notifications & Alerts

### 17.1 Notification Types

| Notification            | Channel       | Trigger                     |
| ----------------------- | ------------- | --------------------------- |
| Low stock alert         | In-app, Email | Stock below reorder point   |
| Order ready             | In-app, KDS   | Kitchen marks order ready   |
| New online order        | In-app, Sound | Online order placed         |
| Reservation reminder    | SMS, Email    | 2 hours before reservation  |
| Reservation confirmed   | SMS, Email    | Reservation confirmed       |
| Cash drawer discrepancy | In-app, Email | Over/short at close         |
| Daily sales summary     | Email         | End of business day         |
| Employee clock in/out   | In-app        | Time clock events           |
| Refund processed        | In-app, Email | Refund completed            |
| Gift card received      | Email, SMS    | Digital gift card purchased |
| Loyalty tier change     | Email         | Customer tier upgrade       |
| Payment failed          | In-app        | Card payment declined       |

### 17.2 API Endpoints

```
GET    /api/v1/notifications                   - List notifications
PUT    /api/v1/notifications/:id/read          - Mark as read
PUT    /api/v1/notifications/read-all          - Mark all as read
GET    /api/v1/notifications/preferences       - Get preferences
PUT    /api/v1/notifications/preferences       - Update preferences
```

### 17.3 WebSocket Events

```
notification:new       - New notification received
notification:count     - Unread count updated
```

---

## 18. Module 15: Settings & Configuration

### 18.1 Tenant Settings

```json
{
  "general": {
    "business_name": "string",
    "logo_url": "string",
    "currency": "USD",
    "timezone": "America/New_York",
    "locale": "en-US",
    "date_format": "MM/DD/YYYY",
    "time_format": "12h"
  },
  "pos": {
    "require_customer_on_sale": false,
    "default_order_type": "dine_in",
    "auto_print_receipt": true,
    "receipt_copies": 1,
    "show_product_images": true,
    "quick_sale_enabled": true,
    "allow_custom_items": true,
    "allow_negative_inventory": false,
    "require_manager_for_void": true,
    "require_manager_for_refund": true,
    "max_cashier_discount_percent": 10,
    "auto_apply_loyalty": true,
    "idle_timeout_minutes": 15
  },
  "tax": {
    "tax_inclusive": false,
    "default_tax_rate": 8.5,
    "tax_on_discounted_amount": true,
    "tax_on_shipping": false
  },
  "tips": {
    "enabled": true,
    "presets": [15, 18, 20, 25],
    "allow_custom": true,
    "default_preset": 18,
    "tip_on_tax": false
  },
  "receipt": {
    "header_text": "Welcome!",
    "footer_text": "Thank you for visiting!",
    "show_barcode": true,
    "show_loyalty_points": true,
    "show_feedback_qr": true,
    "feedback_url": "https://..."
  },
  "notifications": {
    "low_stock_alert": true,
    "daily_summary_email": true,
    "daily_summary_time": "22:00",
    "new_online_order_sound": true
  },
  "integrations": {
    "stripe_account_id": "acct_...",
    "square_location_id": "...",
    "sendgrid_enabled": true,
    "twilio_enabled": false,
    "doordash_enabled": false,
    "ubereats_enabled": false
  }
}
```

### 18.2 API Endpoints

```
GET    /api/v1/settings                        - Get all settings
PUT    /api/v1/settings                        - Update settings
PUT    /api/v1/settings/:section               - Update specific section
GET    /api/v1/settings/tax-rates              - List tax rates
POST   /api/v1/settings/tax-rates              - Create tax rate
PUT    /api/v1/settings/tax-rates/:id          - Update tax rate
DELETE /api/v1/settings/tax-rates/:id          - Delete tax rate
```

---

## 19. UI/UX Design — Futuristic 2050 Vision

> **Design Philosophy**: This POS system does not look like any POS built before. It is a futuristic, cinematic, immersive experience — designed as if it were built in 2050. Every interaction has depth, motion, and purpose. The UI feels alive.

### 19.1 Design DNA

```
┌─────────────────────────────────────────────────────────────┐
│                    DESIGN PILLARS                            │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐             │
│  │ SPATIAL  │  │  LIVING      │  │ CINEMATIC  │             │
│  │ DEPTH    │  │  INTERFACE   │  │ MOTION     │             │
│  │          │  │              │  │            │             │
│  │ Glass    │  │ Responds to  │  │ Every tap  │             │
│  │ layers,  │  │ context,     │  │ triggers a │             │
│  │ 3D cards │  │ time of day, │  │ micro-     │             │
│  │ floating │  │ user state   │  │ animation  │             │
│  └──────────┘  └──────────────┘  └────────────┘             │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐             │
│  │ ZERO     │  │  AMBIENT     │  │ HAPTIC     │             │
│  │ CLUTTER  │  │  INTELLIGENCE│  │ FEEDBACK   │             │
│  │          │  │              │  │            │             │
│  │ Show only│  │ AI suggests  │  │ Vibrations │             │
│  │ what's   │  │ next action, │  │ on touch,  │             │
│  │ needed   │  │ predicts     │  │ sound cues │             │
│  │ NOW      │  │ behavior     │  │ on events  │             │
│  └──────────┘  └──────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### 19.2 Visual Language

#### Color System

```
Theme: Dark futuristic with luminous accents

Primary Background:     #0A0A0F (Deep Space Black)
Secondary Background:   #12121A (Midnight Blue-Black)
Surface / Cards:        rgba(255, 255, 255, 0.03) (Frosted Glass)
Surface Border:         rgba(255, 255, 255, 0.06) (Subtle Edge)

Primary Accent:         #6C5CE7 → #A855F7 (Electric Purple Gradient)
Secondary Accent:       #00D2FF → #3A7BD5 (Cyan-Blue Gradient)
Success:                #00F5A0 → #00D9F5 (Neon Mint Gradient)
Warning:                #F7971E → #FFD200 (Amber Glow Gradient)
Danger:                 #FF416C → #FF4B2B (Crimson Fire Gradient)

Text Primary:           #FFFFFF (Pure White)
Text Secondary:         rgba(255, 255, 255, 0.60)
Text Tertiary:          rgba(255, 255, 255, 0.35)

Glow Effects:           Each accent color has a matching glow:
  Purple Glow:          0 0 20px rgba(108, 92, 231, 0.4)
  Cyan Glow:            0 0 20px rgba(0, 210, 255, 0.4)
  Mint Glow:            0 0 20px rgba(0, 245, 160, 0.4)

Dynamic Theme:
  Morning (6am-12pm):   Warmer undertones, amber glow accents
  Afternoon (12pm-6pm): Neutral, balanced purple/cyan
  Evening (6pm-12am):   Deep blues, stronger neon accents
  Night (12am-6am):     Maximum dark, reduced brightness, red-shifted
```

#### Typography

```
Primary Font:       "Inter" (UI text) — clean geometric sans-serif
Display Font:       "Space Grotesk" (headings, numbers, dashboard)
Monospace Font:     "JetBrains Mono" (order numbers, receipts, codes)

Scale:
  Display XL:       48px / 700 weight / -0.02em tracking
  Display:          36px / 700 weight / -0.02em tracking
  H1:               28px / 600 weight / -0.01em tracking
  H2:               22px / 600 weight
  H3:               18px / 600 weight
  Body:             15px / 400 weight / 0.01em tracking
  Small:            13px / 400 weight
  Micro:            11px / 500 weight / 0.05em tracking (labels, badges)

Numbers on dashboard: Use tabular figures (font-variant-numeric: tabular-nums)
Currency amounts: Always "Space Grotesk" in 600 weight
```

#### Glassmorphism & Depth

```css
/* Card / Surface — floating glass panel */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Elevated card (active/selected) */
.glass-card-elevated {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(108, 92, 231, 0.3);
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(108, 92, 231, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transform: translateY(-2px) scale(1.01);
}

/* Inner panel (nested inside a card) */
.glass-inner {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}
```

### 19.3 3D Animations & Motion Design

#### Animation Library: Framer Motion + Three.js + Lottie

```
Tech Stack for Animations:
- Framer Motion:   Page transitions, layout animations, gestures
- Three.js/R3F:    3D product viewer, dashboard globe, background scenes
- Lottie:          Micro-animations (success checkmark, loading states)
- CSS Animations:  Subtle loops (glows, pulses, floating effects)
- GSAP:            Complex sequenced animations (onboarding, tutorials)
```

#### Motion Principles

```
1. EVERYTHING MOVES — but subtly
   - Cards float with a gentle hover (translateY oscillation)
   - Backgrounds have slow-moving gradient meshes
   - Numbers count up/down with spring animations
   - Lists stagger in one item at a time

2. SPATIAL TRANSITIONS
   - Page changes: current page scales down + fades, new page slides up
   - Modal: rises from below with backdrop blur increasing
   - Drawer: slides from edge with spring physics
   - Tab switch: content cross-fades with subtle Y translation

3. FEEDBACK ANIMATIONS
   - Button press: scale(0.97) → scale(1.02) → scale(1) with spring
   - Success: ripple effect + checkmark Lottie + glow pulse
   - Error: shake animation + red glow flash
   - Loading: skeletal shimmer with gradient sweep
   - Adding to cart: item "flies" to cart with physics arc

4. 3D ELEMENTS
   - Product cards tilt toward touch point (parallax on hover)
   - Dashboard metrics on floating 3D cards with perspective
   - Revenue chart as 3D bar graph with camera orbit
   - Global sales map as interactive 3D globe (Three.js)
   - KDS orders slide in as 3D tickets on a rail

5. AMBIENT MOTION
   - Background: Slowly morphing gradient mesh (noise-based)
   - Idle screen: Floating particles with depth of field
   - Dashboard: Live-updating numbers with flip animation
   - Sidebar icons: Gentle float when section is active
```

#### Key Animation Specs

```javascript
// Framer Motion Defaults
const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

const pageTransition = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.99 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const cardHover = {
  whileHover: {
    scale: 1.02,
    rotateX: 2,
    rotateY: -2,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(108,92,231,0.2)",
  },
  transition: springTransition,
};

const numberFlip = {
  // Numbers animate with a vertical flip/slide effect
  // Old number slides up and fades, new number slides in from below
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -10, opacity: 0 },
  transition: { duration: 0.2 },
};

// 3D Card tilt on touch/hover
const tiltEffect = {
  // Using react-tilt or custom implementation
  maxTilt: 8,
  perspective: 1200,
  scale: 1.02,
  speed: 400,
  glare: true,
  maxGlare: 0.15,
};
```

### 19.4 Screen-by-Screen UI Specification

#### 19.4.1 Login Screen

```
Layout:
┌──────────────────────────────────────────────┐
│                                              │
│         [Animated 3D Logo — rotating         │
│          holographic brand mark with          │
│          particle trail effects]              │
│                                              │
│       ┌────────────────────────────┐         │
│       │  ✉ Email                   │         │
│       │  Floating label, glow on   │         │
│       │  focus, icon morphs        │         │
│       └────────────────────────────┘         │
│       ┌────────────────────────────┐         │
│       │  🔒 Password               │         │
│       │  Show/hide toggle with     │         │
│       │  eye icon animation        │         │
│       └────────────────────────────┘         │
│                                              │
│       ┌────────────────────────────┐         │
│       │    ▸ Sign In               │ ◄── Gradient button
│       │    (Ripple + glow on tap)  │     with shimmer
│       └────────────────────────────┘         │
│                                              │
│       ─── or continue with PIN ───           │
│                                              │
│       ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐        │
│       │  │ │  │ │  │ │  │ │  │ │  │  ◄── PIN dots
│       └──┘ └──┘ └──┘ └──┘ └──┘ └──┘    fill with
│                                          spring bounce
│  Background: Animated gradient mesh            │
│  with slow-moving aurora effect               │
└──────────────────────────────────────────────┘

Animations:
- Logo: 3D rotation on load, subtle floating idle
- Input fields: Label floats up on focus, border glows accent color
- PIN dots: Each fills with a bouncy spring animation
- Success: Entire screen dissolves into particles → dashboard fades in
- Error: Shake + red pulse glow on inputs
```

#### 19.4.2 POS Main Screen (Checkout)

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─ Nav Bar (frosted glass, blur background) ──────────────────┐ │
│ │ [3D Logo]  Dashboard  POS  Orders  Kitchen  [🔔 3] [Avatar] │ │
│ │                                              notification    │ │
│ │            Active tab has glowing underline   badge pulses   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─ Product Grid (left 60%) ─────┐ ┌─ Cart Panel (right 40%) ─┐ │
│ │                                │ │                           │ │
│ │ ┌─ Category Pills ──────────┐ │ │  Order #STORE01-0042      │ │
│ │ │ [All] [🍕Pizza] [🥤Drinks]│ │ │  Table 5 · 4 guests      │ │
│ │ │ [🥗Salads] [🍰Desserts]   │ │ │  Server: John D.          │ │
│ │ │ Horizontal scroll, active  │ │ │                           │ │
│ │ │ pill has gradient fill +   │ │ │ ┌───────────────────────┐ │ │
│ │ │ glow shadow               │ │ │ │ 2x Margherita    $24  │ │ │
│ │ └────────────────────────────┘ │ │ │   + Extra Cheese  $2  │ │ │
│ │                                │ │ │ ────────────────────── │ │ │
│ │ ┌─ Search Bar ───────────────┐ │ │ │ 1x Caesar Salad  $8.5│ │ │
│ │ │ 🔍 Search or scan...      │ │ │ │ ────────────────────── │ │ │
│ │ │ Voice icon + barcode icon  │ │ │ │ 3x Craft Beer    $21  │ │ │
│ │ └────────────────────────────┘ │ │ │ ────────────────────── │ │ │
│ │                                │ │ │ 1x Tiramisu      $7.5 │ │ │
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │ │ └───────────────────────┘ │ │
│ │ │    │ │    │ │    │ │    │  │ │                           │ │
│ │ │ 🍕 │ │ 🍔 │ │ 🥗 │ │ 🍺 │  │ │ Subtotal      $63.00    │ │
│ │ │    │ │    │ │    │ │    │  │ │ Discount      -$6.30     │ │
│ │ │$12 │ │$15 │ │$8.5│ │$7  │  │ │ Tax (8.5%)     $4.82    │ │
│ │ └────┘ └────┘ └────┘ └────┘  │ │ ─────────────────────     │ │
│ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │ │ TOTAL         $61.52     │ │
│ │ │    │ │    │ │    │ │    │  │ │ (large, glowing text)     │ │
│ │ │ 🍰 │ │ ☕ │ │ 🥤 │ │ 🍷 │  │ │                           │ │
│ │ │    │ │    │ │    │ │    │  │ │ ┌─────────┐ ┌───────────┐ │ │
│ │ │$7.5│ │$4  │ │$3  │ │$9  │  │ │ │ 💳 Card │ │ 💵 Cash   │ │ │
│ │ └────┘ └────┘ └────┘ └────┘  │ │ └─────────┘ └───────────┘ │ │
│ │                                │ │ ┌─────────┐ ┌───────────┐ │ │
│ │ Product cards:                 │ │ │ 🎁 Gift │ │ ⚡ Split  │ │ │
│ │ - 3D tilt on hover/touch      │ │ └─────────┘ └───────────┘ │ │
│ │ - Image with parallax depth   │ │                           │ │
│ │ - Price badge with glow       │ │ ┌─────────────────────────┐│ │
│ │ - Tap: item flies to cart     │ │ │    ▸ CHARGE $61.52      ││ │
│ │   with arc physics            │ │ │  (Pulsing gradient btn) ││ │
│ │ - Out of stock: grayscale +   │ │ └─────────────────────────┘│ │
│ │   "SOLD OUT" holographic      │ │                           │ │
│ └────────────────────────────────┘ └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Product Card Animations:
- Appear with stagger (0.04s delay each)
- 3D tilt follows finger/cursor position
- Light reflection (glare) moves across surface
- Tap: Scale down (0.95) → item thumbnail "flies" to cart with bezier arc
- Cart item appears with spring bounce
- Price numbers use flip animation when quantity changes
- Cart total recalculates with counting animation

Charge Button:
- Gradient shimmer animation (continuous subtle sweep)
- On hover: glow intensifies, scale 1.02
- On press: Ripple effect from touch point
- Processing: Button morphs into progress circle
- Success: Circle → checkmark Lottie → receipt slides up
```

#### 19.4.3 Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─ Metric Cards (floating 3D panels) ────────────────────────┐ │
│ │                                                             │ │
│ │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │ │
│ │ │ 💰 REVENUE   │ │ 📦 ORDERS    │ │ 👥 CUSTOMERS │         │ │
│ │ │              │ │              │ │              │         │ │
│ │ │  $4,523.50   │ │     87       │ │     142      │         │ │
│ │ │  ↑ 12.5%     │ │  ↑ 8.3%     │ │  ↑ 15.1%    │         │ │
│ │ │              │ │              │ │              │         │ │
│ │ │ [Sparkline]  │ │ [Sparkline]  │ │ [Sparkline]  │         │ │
│ │ └──────────────┘ └──────────────┘ └──────────────┘         │ │
│ │                                                             │ │
│ │ Cards float with subtle Y oscillation (different phases)    │ │
│ │ Numbers count up from 0 on page load                        │ │
│ │ Percentage badges pulse green/red                           │ │
│ │ Sparklines draw from left to right (animated path)          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─ Revenue Chart (3D) ──────────┐ ┌─ Live Activity Feed ──────┐ │
│ │                                │ │                           │ │
│ │  3D bar chart with:            │ │ Real-time feed items      │ │
│ │  - Camera orbit on drag        │ │ slide in from right:      │ │
│ │  - Bars grow up with spring    │ │                           │ │
│ │  - Hover: bar glows + tooltip  │ │ 🟢 Order #42 completed   │ │
│ │  - Gradient fill on bars       │ │ 💳 $52.00 card payment   │ │
│ │  - Grid lines with subtle      │ │ 🍕 Low stock: Margherita │ │
│ │    opacity animation           │ │ 👤 New customer: Jane D.  │ │
│ │  - Switch: bar/line/area       │ │ ⏰ Reservation in 30min   │ │
│ │                                │ │                           │ │
│ └────────────────────────────────┘ └───────────────────────────┘ │
│                                                                  │
│ ┌─ Floor Plan (3D Isometric) ───┐ ┌─ Top Products ────────────┐ │
│ │                                │ │                           │ │
│ │  Interactive 3D isometric      │ │ Animated horizontal bar   │ │
│ │  view of restaurant floor:     │ │ chart with bars growing   │ │
│ │  - Tables color-coded by       │ │ from left, product images │ │
│ │    status (glow effect)        │ │ as avatars, and live      │ │
│ │  - Occupied: purple glow       │ │ updating quantities       │ │
│ │  - Available: green glow       │ │                           │ │
│ │  - Reserved: amber glow        │ │ 1. Margherita Pizza  ███░ │ │
│ │  - Dirty: red pulse            │ │ 2. Craft Beer        ██░░ │ │
│ │  - Tap table → order details   │ │ 3. Caesar Salad      █░░░ │ │
│ │  - Rotate view with gesture    │ │                           │ │
│ └────────────────────────────────┘ └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### 19.4.4 KDS (Kitchen Display System)

```
┌─────────────────────────────────────────────────────────────────┐
│  KITCHEN DISPLAY  ·  Grill Station  ·  12 active tickets        │
│                                                                  │
│ ┌─ Ticket ──────┐ ┌─ Ticket ──────┐ ┌─ Ticket ──────┐          │
│ │ ORD #42       │ │ ORD #43       │ │ ORD #44       │          │
│ │ Table 5       │ │ TAKEOUT       │ │ Table 8       │          │
│ │ ⏱ 4:23       │ │ ⏱ 2:15       │ │ ⏱ 12:45      │          │
│ │ (green glow)  │ │ (green glow)  │ │ (RED PULSE!)  │          │
│ │               │ │               │ │               │          │
│ │ 2x Margherita │ │ 1x BBQ Burger │ │ 1x Steak     │          │
│ │  +Ex Cheese   │ │  No Onions    │ │  Medium Rare  │          │
│ │ 1x Pepperoni  │ │ 2x Fries      │ │ 1x Lobster   │          │
│ │               │ │               │ │  ⚡ RUSH      │          │
│ │ ┌───────────┐ │ │ ┌───────────┐ │ │ ┌───────────┐ │          │
│ │ │ ▸ START   │ │ │ │ IN PROG   │ │ │ │ ▸ DONE    │ │          │
│ │ └───────────┘ │ │ └───────────┘ │ │ └───────────┘ │          │
│ └───────────────┘ └───────────────┘ └───────────────┘          │
│                                                                  │
│ Ticket Animations:                                               │
│ - New tickets slide in from left with spring                     │
│ - Timer color: green → yellow (10min) → red pulse (20min)        │
│ - RUSH orders have red border with pulsing glow                  │
│ - Completing: ticket flips 180° and flies off screen             │
│ - Recalled: ticket flies back in from the right                  │
│ - Background ambient: subtle flowing gradient                    │
│ - Timer numbers use flip animation (like airport boards)         │
└─────────────────────────────────────────────────────────────────┘
```

#### 19.4.5 Payment Success Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                 ╭─────────────────────╮                          │
│                 │                     │                          │
│                 │   ✓ PAYMENT         │                          │
│                 │   COMPLETE          │                          │
│                 │                     │                          │
│                 │   $61.52            │                          │
│                 │                     │                          │
│                 ╰─────────────────────╯                          │
│                                                                  │
│    Animations:                                                   │
│    1. Processing: charge button morphs into spinning ring        │
│    2. Ring completes → explodes into particles                   │
│    3. Particles reform into checkmark (Lottie)                   │
│    4. Amount fades in with scale spring                          │
│    5. Confetti particles shower from top (subtle, short)         │
│    6. Background glow pulses green once                          │
│    7. Receipt card slides up from bottom after 1.5s              │
│    8. Auto-dismiss after 3s → back to POS with crossfade         │
│                                                                  │
│    ┌─ Receipt Preview (slides up) ─────────┐                    │
│    │ 📧 Email  │ 🖨 Print  │ 📱 SMS       │                    │
│    └───────────────────────────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 19.5 Component Library Specification

#### Buttons

```
Variants:
  Primary:     Gradient fill (purple → blue), white text, glow shadow
  Secondary:   Glass fill, white text, subtle border
  Ghost:       Transparent, white text, hover fills glass
  Danger:      Red gradient fill, white text, red glow
  Success:     Mint gradient fill, dark text, green glow
  Icon:        Circular glass, icon center, tooltip on hover

States:
  Default:     Base style
  Hover:       Scale 1.02, increased glow, brightness +10%
  Pressed:     Scale 0.97, glow dims momentarily
  Loading:     Content replaced by spinning dots (Lottie)
  Disabled:    40% opacity, no glow, no hover effect

Sizes:
  XL:          56px height, 18px text (payment buttons)
  LG:          48px height, 16px text
  MD:          40px height, 14px text (default)
  SM:          32px height, 13px text
  XS:          24px height, 11px text (badges)
```

#### Input Fields

```
Style:
  - Glass background with subtle inner shadow
  - Floating label (animates up on focus/fill)
  - Left icon slot (optional)
  - Right action slot (clear, toggle, etc.)
  - Bottom border glows accent color on focus
  - Error state: red glow + shake animation + error text slides in

Animation:
  Focus:   Label floats up (spring), border glows, icon color changes
  Blur:    Label returns if empty (spring), glow fades
  Error:   Shake (3 oscillations, 4px), red glow pulse
  Success: Brief green glow flash
```

#### Data Tables

```
Style:
  - Glass surface with header row slightly elevated
  - Alternating row backgrounds (subtle opacity difference)
  - Row hover: glass highlight + slight Y translation
  - Selected row: accent border left + glow
  - Sortable columns: arrow icon rotates with animation
  - Pagination: animated page transitions

Animation:
  Load:    Rows stagger in from bottom (0.03s each)
  Sort:    Rows re-arrange with layout animation (Framer Motion)
  Filter:  Non-matching rows shrink + fade out, remaining reflow
  Select:  Left border slides in, background shifts
```

#### Toast / Notifications

```
Style:
  - Glass panel with accent-colored left border
  - Icon + message + optional action button
  - Progress bar at bottom for auto-dismiss timer

Animation:
  Enter:   Slide in from top-right + spring bounce
  Exit:    Slide out right + fade
  Stack:   Multiple toasts stack with Y offset animation
```

#### Modals / Dialogs

```
Style:
  - Centered glass panel with blur backdrop
  - Close button with rotation animation on hover
  - Action buttons at bottom

Animation:
  Open:    Backdrop fades in + modal rises from below with spring
  Close:   Modal falls down slightly + fades + backdrop fades
  Content: Inner content fades in 200ms after modal appears
```

### 19.6 Responsive & Adaptive Design

```
Breakpoints:
  Mobile POS:     320px - 768px   (phone, handheld terminal)
  Tablet POS:     769px - 1024px  (iPad, Android tablet)  ← PRIMARY
  Desktop POS:    1025px - 1440px (touch screen monitor)
  Dashboard:      1441px+         (large monitor, TV display)

Adaptive Behaviors:
  Tablet (primary):
    - Product grid: 3-4 columns
    - Cart: slide-in panel from right (swipe gesture)
    - Navigation: bottom tab bar with icon + label
    - Large touch targets: minimum 48px

  Desktop:
    - Product grid: 5-6 columns
    - Cart: fixed right panel (always visible)
    - Navigation: left sidebar with expanded labels
    - Keyboard shortcuts enabled

  Mobile:
    - Product grid: 2 columns
    - Cart: full-screen overlay
    - Navigation: bottom tab bar (icons only)
    - Simplified views, fewer visible metrics

  KDS / TV:
    - Full-screen ticket grid
    - Extra large fonts (24px+ body)
    - High contrast mode
    - No navigation (station-locked)
```

### 19.7 Micro-Interactions Catalog

```
┌─────────────────────────────────────────────────────────┐
│ Interaction          │ Animation                         │
├──────────────────────┼───────────────────────────────────┤
│ Add item to cart     │ Item thumbnail arcs to cart icon  │
│ Remove from cart     │ Item shrinks + fades + slides out │
│ Quantity +/-         │ Number flips vertically           │
│ Apply discount       │ Total "shatters" → reforms lower  │
│ Scan barcode         │ Green scan line sweeps + product  │
│                      │ card pulses into view             │
│ Payment processing   │ Button → spinner ring → checkmark │
│ Refund              │ Reverse confetti (falls upward)    │
│ Switch location     │ Current view slides away, new      │
│                      │ slides in from location direction │
│ Open cash drawer    │ Virtual drawer slides open         │
│ Clock in            │ Time icon morphs into checkmark    │
│ Low stock alert     │ Product card pulses amber          │
│ New order (KDS)     │ Ticket slides in from left         │
│ Order ready         │ Green ripple + bell chime sound    │
│ Table status change │ Table color transitions smoothly   │
│ Loyalty points      │ Points "+63" float up from total   │
│ Gift card scan      │ Card flips to reveal balance       │
│ Report loading      │ Chart axes draw first, then data   │
│ Empty state         │ Animated illustration (Lottie)     │
│ Pull to refresh     │ Elastic overscroll + spin icon     │
│ Swipe to delete     │ Red danger zone reveals behind     │
│ Long press          │ Radial menu appears around finger  │
│ Pinch zoom (floor)  │ Smooth zoom with inertia           │
│ Tab switch          │ Active indicator slides to tab     │
└──────────────────────┴───────────────────────────────────┘
```

### 19.8 Sound Design

```
All sounds are optional (configurable in settings) and subtle:

Event                    Sound
─────────────────────    ──────────────────────────
Item added to cart       Soft "pop" (50ms)
Payment success          Gentle chime (ascending 3-note)
Payment failed           Low thud (single note)
New order (KDS)          Kitchen bell "ding"
Order ready              Bright double-chime
Low stock alert          Subtle warning tone
Cash drawer open         Mechanical click
Barcode scan             Scanner beep
Notification             Soft bubble sound
Error                    Short buzz
Timer critical (KDS)     Urgent double-beep (repeating)
```

### 19.9 Loading & Empty States

```
Loading States:
  - Skeleton screens with shimmer gradient sweep (never spinners alone)
  - Content-aware skeletons that match the layout of actual content
  - Progressive loading: structure first, then data fills in
  - Charts: axes draw first → gridlines fade in → data animates in

Empty States:
  - Custom Lottie illustration for each context:
    · No orders: animated clock with "No orders yet"
    · No products: animated box opening
    · No customers: animated waving person
    · Empty cart: animated shopping bag with eyes
    · No search results: animated magnifying glass shaking head
  - Always include a CTA button below illustration
  - Subtle floating animation on the illustration

Error States:
  - Animated glitch effect on error icon
  - Clear error message with suggested action
  - Retry button with loading state
  - Toast notification for non-blocking errors
```

### 19.10 Accessibility

```
Despite the rich visual design, accessibility is non-negotiable:

- WCAG 2.1 AA compliance minimum
- All animations respect prefers-reduced-motion
  (when enabled: no transitions, instant state changes)
- Color contrast: 4.5:1 minimum for text
- Focus indicators: visible focus ring (2px accent glow)
- Screen reader: all interactive elements have aria labels
- Keyboard navigation: full tab order for desktop mode
- Touch targets: minimum 44x44px on mobile, 48x48px on tablet
- High contrast mode available in settings
- Font size scaling: user can increase base font up to 150%
```

---

## 20. Testing Strategy

### 20.1 Test Pyramid

```
         ╱╲
        ╱  ╲         E2E Tests (Playwright)
       ╱ 10 ╲        - Critical user flows
      ╱──────╲
     ╱        ╲       Integration Tests (Supertest)
    ╱   30%    ╲      - API endpoints, DB queries
   ╱────────────╲
  ╱              ╲     Unit Tests (Jest)
 ╱     60%        ╲    - Services, utils, validators
╱──────────────────╲
```

### 20.2 Unit Test Coverage Requirements

| Module             | Minimum Coverage |
| ------------------ | ---------------- |
| Auth service       | 95%              |
| Payment service    | 95%              |
| Order service      | 90%              |
| Inventory service  | 90%              |
| Tax calculation    | 100%             |
| Loyalty engine     | 90%              |
| All other services | 80%              |

### 20.3 Integration Test Scenarios

```
# Each module's API endpoints should have integration tests covering:
- Happy path for every endpoint
- Validation errors (missing required fields, invalid types)
- Authentication (no token, invalid token, expired token)
- Authorization (wrong role, wrong location)
- Pagination and filtering
- Edge cases (empty results, max values)
- Concurrent operations (race conditions)
```

### 20.4 E2E Test Flows

```
E2E-001: Complete sale flow
  → Login → Add items → Apply discount → Process payment → Print receipt

E2E-002: Refund flow
  → Find order → Select items → Process refund → Verify inventory restored

E2E-003: Inventory management flow
  → Create product → Add stock → Sell → Check stock decreased → Low stock alert

E2E-004: Customer loyalty flow
  → Create customer → Make purchase → Points earned → Redeem points

E2E-005: Restaurant dine-in flow
  → Seat table → Take order → Send to kitchen → KDS bump → Payment → Clear table

E2E-006: Online order flow
  → Browse menu → Place order → Kitchen receives → Ready → Pickup notification

E2E-007: Cash drawer flow
  → Open drawer → Process sales → Pay in/out → Close drawer → Reconcile

E2E-008: Employee shift flow
  → Clock in → Process sales → Break → Resume → Clock out → Hours calculated

E2E-009: Multi-location flow
  → Switch location → Verify scoped data → Stock transfer → Verify quantities

E2E-010: Reservation flow
  → Create reservation → Confirmation sent → Seat party → Complete → Table cleared
```

### 20.5 Load Test Scenarios

```
LOAD-001: 100 concurrent checkout operations → < 500ms p99
LOAD-002: 1000 product search queries → < 200ms p99
LOAD-003: 50 concurrent KDS WebSocket connections → all receive updates < 100ms
LOAD-004: Dashboard with 100K orders dataset → < 1s response
LOAD-005: Inventory update during 50 concurrent sales → no race conditions
```

### 20.6 Test Data Seeding

```
The test suite should include a seeder that creates:
- 3 tenants (retail, restaurant, grocery)
- 5 locations across tenants
- 20 users with various roles
- 500 products with variants and modifiers
- 100 categories (nested)
- 200 customers with loyalty data
- 5000 historical orders with payments
- 50 active gift cards
- 20 active discounts/coupons
- 10 suppliers with purchase orders
```

---

## 21. Deployment & Infrastructure

### 20.1 Project Directory Structure

```
pos-system/
├── docker/
│   ├── backend/
│   │   ├── Dockerfile
│   │   └── Dockerfile.dev
│   ├── nginx/
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── scripts/
│       ├── init-db.sh
│       ├── seed-db.sh
│       └── wait-for-it.sh
├── services/
│   ├── backend/                    # NestJS API
│   │   ├── src/
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── desktop/                    # Electron App
│       ├── src/
│       │   ├── main/               # Electron main process
│       │   │   ├── index.ts
│       │   │   ├── preload.ts
│       │   │   ├── hardware/       # Printer, scanner, scale, terminal
│       │   │   ├── localDb/        # SQLite offline database
│       │   │   ├── sync/           # Cloud sync engine
│       │   │   └── updater/        # Auto-update logic
│       │   └── renderer/           # React app
│       │       ├── src/
│       │       │   ├── components/
│       │       │   ├── pages/
│       │       │   ├── store/      # Zustand stores
│       │       │   ├── hooks/
│       │       │   ├── lib/
│       │       │   ├── styles/
│       │       │   └── App.tsx
│       │       ├── index.html
│       │       └── vite.config.ts
│       ├── resources/              # App icons, splash screens
│       ├── electron-builder.yml
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml              # Development
├── docker-compose.prod.yml         # Production
├── docker-compose.test.yml         # Testing
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Lint + test
│       ├── deploy-backend.yml      # Backend deploy
│       └── release-desktop.yml     # Electron build + release
├── package.json                    # Root workspace
└── turbo.json                      # Monorepo build system
```

### 21.2 Docker Compose — Development

```yaml
# docker-compose.yml
version: "3.8"

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: pos-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: pos_dev
      POSTGRES_USER: pos
      POSTGRES_PASSWORD: pos_dev_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/scripts/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pos -d pos_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis (Cache + Queue)
  redis:
    image: redis:7-alpine
    container_name: pos-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # NestJS Backend API
  api:
    build:
      context: ./services/backend
      dockerfile: ../../docker/backend/Dockerfile.dev
    container_name: pos-api
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "9229:9229" # Node.js debugger
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgresql://pos:pos_dev_password@db:5432/pos_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-jwt-secret-change-in-production
      JWT_ACCESS_EXPIRY: 15m
      JWT_REFRESH_EXPIRY: 7d
      BCRYPT_ROUNDS: 10
      CORS_ORIGINS: http://localhost:3001,http://localhost:5173
      LOG_LEVEL: debug
    volumes:
      - ./services/backend/src:/app/src
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run start:dev

  # BullMQ Worker (Background Jobs)
  worker:
    build:
      context: ./services/backend
      dockerfile: ../../docker/backend/Dockerfile.dev
    container_name: pos-worker
    restart: unless-stopped
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://pos:pos_dev_password@db:5432/pos_dev
      REDIS_URL: redis://redis:6379
      WORKER_MODE: "true"
    volumes:
      - ./services/backend/src:/app/src
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run worker:dev

  # Database Admin UI
  adminer:
    image: adminer:latest
    container_name: pos-adminer
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: db
    depends_on:
      - db

  # Redis Admin UI
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: pos-redis-commander
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      REDIS_HOSTS: local:redis:6379
    depends_on:
      - redis

  # MailHog (Email Testing)
  mailhog:
    image: mailhog/mailhog:latest
    container_name: pos-mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
    restart: unless-stopped

volumes:
  pgdata:
    driver: local
  redisdata:
    driver: local

networks:
  default:
    name: pos-network
```

### 21.3 Docker Compose — Production

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    container_name: pos-db-prod
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata_prod:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: "1.0"

  redis:
    image: redis:7-alpine
    container_name: pos-redis-prod
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD} --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata_prod:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./services/backend
      dockerfile: ../../docker/backend/Dockerfile
    container_name: pos-api-prod
    restart: always
    ports:
      - "3000:3000"
    env_file: .env.production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "1.0"
      replicas: 2
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  worker:
    build:
      context: ./services/backend
      dockerfile: ../../docker/backend/Dockerfile
    container_name: pos-worker-prod
    restart: always
    env_file: .env.production
    environment:
      WORKER_MODE: "true"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: node dist/jobs/jobs.main.js

  nginx:
    build:
      context: ./docker/nginx
    container_name: pos-nginx-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - api

volumes:
  pgdata_prod:
  redisdata_prod:

networks:
  default:
    name: pos-network-prod
```

### 21.4 Docker Compose — Testing

```yaml
# docker-compose.test.yml
version: "3.8"

services:
  db-test:
    image: postgres:15-alpine
    container_name: pos-db-test
    environment:
      POSTGRES_DB: pos_test
      POSTGRES_USER: pos
      POSTGRES_PASSWORD: pos_test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pos -d pos_test"]
      interval: 2s
      timeout: 2s
      retries: 10

  redis-test:
    image: redis:7-alpine
    container_name: pos-redis-test
    ports:
      - "6380:6379"
    tmpfs:
      - /data

  api-test:
    build:
      context: ./services/backend
      dockerfile: ../../docker/backend/Dockerfile.dev
    container_name: pos-api-test
    environment:
      NODE_ENV: test
      DATABASE_URL: postgresql://pos:pos_test@db-test:5432/pos_test
      REDIS_URL: redis://redis-test:6379
      JWT_SECRET: test-secret
    depends_on:
      db-test:
        condition: service_healthy
    command: npm run test:ci
```

### 21.5 Dockerfiles

#### Backend Production

```dockerfile
# docker/backend/Dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production && cp -R node_modules /prod_modules
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs
COPY --from=deps --chown=nestjs:nodejs /prod_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package.json ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

#### Backend Development

```dockerfile
# docker/backend/Dockerfile.dev
FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3000 9229
CMD ["npm", "run", "start:dev"]
```

#### Nginx

```nginx
# docker/nginx/nginx.conf
worker_processes auto;
events { worker_connections 1024; }

http {
    upstream api_servers {
        least_conn;
        server api:3000;
    }

    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;

    gzip on;
    gzip_types application/json text/plain application/javascript;

    server {
        listen 80;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header Strict-Transport-Security "max-age=31536000" always;

        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://api_servers;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/auth/ {
            limit_req zone=auth_limit burst=5 nodelay;
            proxy_pass http://api_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /socket.io/ {
            proxy_pass http://api_servers;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_read_timeout 86400s;
        }

        location /health {
            proxy_pass http://api_servers;
        }
    }
}
```

### 21.6 Electron Desktop Build

```yaml
# services/desktop/electron-builder.yml
appId: com.yourpos.desktop
productName: YourPOS
copyright: Copyright 2026 YourPOS Inc.

directories:
  output: release
  buildResources: resources

files:
  - dist/**/*
  - node_modules/**/*
  - package.json

mac:
  category: public.app-category.business
  icon: resources/icon.icns
  target:
    - target: dmg
      arch: [x64, arm64]
  hardenedRuntime: true
  notarize: true

win:
  icon: resources/icon.ico
  target:
    - target: nsis
      arch: [x64]

nsis:
  oneClick: false
  perMachine: true
  createDesktopShortcut: true
  shortcutName: YourPOS

linux:
  icon: resources/icon.png
  target:
    - target: AppImage
      arch: [x64]
    - target: deb
      arch: [x64]
  category: Office

publish:
  - provider: github
    owner: yourorg
    repo: pos-desktop
    releaseType: release
```

### 21.7 Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.yourpos.com

# Database
DB_NAME=pos_production
DB_USER=pos_admin
DB_PASSWORD=<strong-random-password>
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_PASSWORD=<strong-random-password>

# Auth
JWT_SECRET=<64-char-random-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12

# Payments
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SQUARE_ACCESS_TOKEN=xxx

# Email
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourpos.com

# SMS
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+1234567890

# Storage
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=pos-uploads
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# Features
ENABLE_ECOMMERCE=true
ENABLE_KDS=true
ENABLE_LOYALTY=true
ENABLE_MULTI_LOCATION=true
ENABLE_OFFLINE_MODE=true

# Electron .env
VITE_API_BASE_URL=https://api.yourpos.com
VITE_WS_URL=wss://api.yourpos.com
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 21.8 Docker Commands Reference

```bash
# Development
docker compose up -d                          # Start all
docker compose up -d --build                  # Start with rebuild
docker compose logs -f api                    # Follow API logs
docker compose exec api sh                    # Shell into API
docker compose exec api npm run migration:run # Run migrations
docker compose exec api npm run seed          # Seed data
docker compose down                           # Stop
docker compose down -v                        # Stop + delete data

# Production
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml up -d --scale api=3
docker compose -f docker-compose.prod.yml logs -f --tail=100

# Database backup/restore
docker compose exec db pg_dump -U pos pos_dev > backup.sql
cat backup.sql | docker compose exec -T db psql -U pos pos_dev

# Testing
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
docker compose -f docker-compose.test.yml down -v
```

### 21.9 CI/CD Pipelines

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: pos_test
          POSTGRES_USER: pos
          POSTGRES_PASSWORD: pos_test
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 10s --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd services/backend && npm ci
      - run: cd services/backend && npm run lint
      - run: cd services/backend && npm run test
      - run: cd services/backend && npm run test:e2e
      - run: cd services/backend && npm run test:coverage

  deploy:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          context: ./services/backend
          file: ./docker/backend/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}/pos-api:latest
```

```yaml
# .github/workflows/release-desktop.yml
name: Desktop Release
on:
  push:
    tags: ["v*"]

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: macos-latest
            platform: mac
          - os: windows-latest
            platform: win
          - os: ubuntu-latest
            platform: linux
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd services/desktop && npm ci
      - run: cd services/desktop && npm run build
      - run: cd services/desktop && npm run package:${{ matrix.platform }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: softprops/action-gh-release@v2
        with:
          files: services/desktop/release/*
```

### 21.10 Database Migrations

```
All schema changes must be migration-based:
- Use TypeORM migrations (recommended for NestJS)
- Migrations are timestamped and sequential
- Every migration has up() and down() methods
- Migrations run automatically on deployment
- Seed data is separate (npm run seed)
- Test database uses tmpfs and resets each run
- All column names use camelCase matching TypeORM entities
```

### 21.11 Monitoring & Alerting

```
Metrics:
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- WebSocket connections
- DB connection pool usage
- Redis memory + hit rate
- Payment success/failure rate
- Queue job completion + latency
- Electron crash rate (Sentry)
- Offline sync queue depth

Alerts:
- Error rate > 5% for 5 min      → Slack + PagerDuty
- API p99 > 2s for 5 min         → Slack
- Payment failure > 10%          → PagerDuty (immediate)
- DB connections > 80%           → Slack
- Disk > 85%                     → Slack
- Sync queue > 100 pending       → Slack
```

---

## Appendix A: API Response Format

All API responses follow this structure:

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Must be a valid email" }
    ]
  }
}
```

## Appendix B: Error Codes

| Code                 | HTTP Status | Description                |
| -------------------- | ----------- | -------------------------- |
| VALIDATION_ERROR     | 400         | Invalid input              |
| UNAUTHORIZED         | 401         | Not authenticated          |
| FORBIDDEN            | 403         | Not authorized for action  |
| NOT_FOUND            | 404         | Resource not found         |
| CONFLICT             | 409         | Duplicate / conflict       |
| INSUFFICIENT_STOCK   | 400         | Not enough inventory       |
| INSUFFICIENT_BALANCE | 400         | Gift card / credit too low |
| PAYMENT_FAILED       | 402         | Payment processor error    |
| DRAWER_NOT_OPEN      | 400         | Cash drawer not open       |
| ORDER_NOT_MODIFIABLE | 400         | Order already completed    |
| ACCOUNT_LOCKED       | 423         | Too many failed attempts   |
| RATE_LIMITED         | 429         | Too many requests          |
| INTERNAL_ERROR       | 500         | Unexpected server error    |

## Appendix C: WebSocket Event Reference

| Event                  | Direction     | Payload                 |
| ---------------------- | ------------- | ----------------------- |
| `order:created`        | Server→Client | Full order object       |
| `order:updated`        | Server→Client | Updated order           |
| `order:completed`      | Server→Client | Completed order         |
| `kitchen:new_order`    | Server→KDS    | Kitchen order items     |
| `kitchen:item_ready`   | Server→POS    | Ready item notification |
| `kitchen:all_ready`    | Server→POS    | All items ready         |
| `table:status_changed` | Server→Client | Table status update     |
| `inventory:low_stock`  | Server→Client | Low stock alert         |
| `notification:new`     | Server→Client | New notification        |
| `drawer:opened`        | Server→Client | Drawer opened           |
| `drawer:closed`        | Server→Client | Drawer closed           |

---

> **Document Version**: 1.0
> **Last Updated**: 2026-03-01
> **Total Test Cases**: 150+
> **Total API Endpoints**: 120+
> **Total Database Tables**: 35+
