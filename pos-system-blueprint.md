# POS System Master Blueprint (Expanded)

This document is the definitive technical and functional guide for the POS System. It defines every screen, every role, and every interaction in exhaustive detail.

---

## 1. PROJECT MANAGEMENT PLAN (PMP)

### 1.1 Project Vision

A high-performance, desktop-first POS solution that empowers business owners with real-time inventory tracking, detailed financial reporting, and seamless checkout experiences.

### 1.2 Core Modules & Detailed Responsibilities

- **Super Admin Module**: Total system control, license management, store configuration, and global audit oversight.
- **Authentication & Identity**: Multi-method login, bio-metric (optional), and session persistence.
- **POS Operations**: High-velocity checkout, split payments, and offline-first data sync.
- **Inventory & Supply Chain**: Multi-warehouse tracking, PO lifecycle, and supplier relations.
- **Financial Intelligence**: Double-entry ledger, P&L, tax compliance, and expense management.
- **Human Resources**: Shift scheduling, attendance tracking, and commission-based payroll.
- **CRM & Loyalty**: Customer segmentation, credit limits, and tiered rewards.

### 1.3 Optimization & Performance

- **Bundle Size**: Tree-shaking, code-splitting by route, and SVG-only iconography.
- **Speed**: <50ms UI response time for POS actions.
- **Data Integrity**: Atomic transactions using Drizzle ORM and SQLite.

---

## 2. DETAILED SYSTEM FLOWS

### 2.1 Role Management & Hierarchy Flow

The system employs a strict hierarchical permission model managed by the Super Admin.

#### A. Role Hierarchy & Access

1.  **Super Admin**:
    - **Control**: 100% System access.
    - **Responsibilities**: Manage Roles, Licenses, Store settings, Global Audit logs.
    - **Management Screen**: "System Configuration" & "Global Users".
2.  **Store Manager**:
    - **Control**: 80% System access (No license/global logs).
    - **Responsibilities**: Employee attendance, Stock overrides, Discount approvals, Financial reviews.
    - **Management Screen**: "Management Dashboard".
3.  **Accountant**:
    - **Control**: 50% System access (Finance & Reporting only).
    - **Responsibilities**: Tax filing, Ledger auditing, Expense approval.
    - **Management Screen**: "Finance Hub".
4.  **Inventory Clerk**:
    - **Control**: 40% System access (Products & Suppliers only).
    - **Responsibilities**: Stock counts, Purchase Orders, Warehouse transfers.
    - **Management Screen**: "Inventory Control".
5.  **Cashier**:
    - **Control**: 20% System access (POS Terminal & Basic Reports).
    - **Responsibilities**: Sales processing, Customer returns (with approval), Opening/Closing registers.
    - **Management Screen**: "POS Terminal".

#### B. Permission Management Flow (Super Admin Action)

1.  **Open Role Manager**: Super Admin navigates to `Admin > Roles`.
2.  **Define Permissions**: Selects granular actions (e.g., `pos:void`, `inv:delete`, `fin:view_pl`).
3.  **Assign to Role**: Maps permissions to a role.
4.  **Apply to Users**: All users assigned to that role receive updated permissions instantly via IPC broadcast.
5.  **Audit**: System logs "ROLE_UPDATED" with old vs new permission set.

---

### 2.2 User Management & Authentication (Deep Dive)

#### A. Multi-Method Login Details

- **Email Login**: `user@store.com` + `HeavyPassword123!`.
- **Username Login**: `admin_john` + `HeavyPassword123!`.
- **Phone Login**: `+1234567890` + `HeavyPassword123!`.
- **Quick PIN**: 4-6 digit numeric code for quick screen-unlocking within an active session.

#### B. Profile & Security Flow

1.  **Identity**: Users can update Name, Phone, and Email (requires re-verification).
2.  **Avatar**: High-res picture upload with real-time cropping and WebP optimization.
3.  **Security**:
    - **Change Password**: Current password required -> New Heavy Password -> Re-login.
    - **Forget Password**: OTP sent to registered Phone/Email -> Reset link -> Password update.
4.  **Success State**: A beautiful, animated "Profile Updated" card with a summary of changes.

---

## 3. COMPREHENSIVE SCREEN-BY-SCREEN BREAKDOWN

### 3.1 Authentication & Onboarding

- **Login Screen**: Minimalist design with a focus on the store logo. Transparent input fields with floating labels.
- **Setup Wizard**: 5-step interactive flow (Store Setup -> Admin Creation -> Brand Colors -> Categories -> Finish).
- **Lock Screen**: Simplified login view showing only the user's avatar and a PIN entry field.

### 3.2 Dashboard & Navigation

- **Sidebar**: Dynamic navigation based on user role. Icons have subtle hover animations.
- **Main Dashboard**:
  - **KPI Cards**: Animated counters for Today's Sales, Net Profit, and Active Orders.
  - **Charts**: Interactive Line charts for sales trends and Pie charts for category distribution.
  - **Quick Actions**: FAB (Floating Action Button) for "New Sale", "New Product", "Add Expense".

### 3.3 POS Terminal Screen (The Engine)

- **Product Explorer**:
  - Visual grid of products with high-res thumbnails.
  - "Quick-Keys" for favorite items.
  - Real-time stock badges (Green: In Stock, Red: Low).
- **Cart & Checkout**:
  - Drag-and-drop support for items.
  - Multi-line discount toggles.
  - **Payment Bar**: Sticky footer with large "PAY" button showing the exact total.
- **Modals & Pop-ups**:
  - **Customer Profile**: Slide-out panel from the right for customer history.
  - **Void Confirmation**: Manager-only PIN entry required to void a line item.

### 3.4 Inventory & Warehouse

- **Stock Control**: Spreadsheet-like interface for quick inventory adjustments.
- **PO Manager**: Timeline view of Purchase Orders (Draft -> Sent -> Received).
- **Warehouse Map**: 2D visualization of stock levels across different shelf/rack locations.

### 3.5 Finance & Reports

- **Ledger View**: Color-coded entries (Debit: Blue, Credit: Green) with filtering by date/category.
- **Tax Summary**: Auto-calculated GST/VAT reports with "One-Click Export" for government filing.
- **P&L Dashboard**: Real-time revenue vs. expense tracking with profit margin indicators.

---

## 4. EXTRAORDINARY UI/UX & DESIGN

### 4.1 Animations & Transitions

- **Page Transitions**: Smooth "Slide-Fade" transitions between modules.
- **Button Feedback**: Subtle scale-down effect on click (`scale-95`).
- **Success/Error**: Full-screen subtle blur with a centered Lottie animation (Checkmark for Success, Cross for Error).

### 4.2 Notifications & Pop-ups

- **Smart Notifications**: Small, non-intrusive badges for low-stock or new order alerts.
- **Confirmation Modals**: Glassmorphism backdrop with focused action buttons.
- **Floating Alerts**: Brief "Success" or "Updated" toasts that appear in the top-right and auto-dismiss after 3s.

---

## 5. ROLE & PERMISSION MATRIX (GRANULAR)

| Module        | Action         | Super Admin | Manager | Accountant | Cashier          |
| ------------- | -------------- | ----------- | ------- | ---------- | ---------------- |
| **POS**       | Create Sale    | ✅          | ✅      | ❌         | ✅               |
|               | Void Line Item | ✅          | ✅      | ❌         | 🔐 (Manager PIN) |
|               | Cart Discount  | ✅          | ✅      | ❌         | 🔐 (Limit 5%)    |
| **Inventory** | CRUD Product   | ✅          | ✅      | ❌         | ❌               |
|               | Stock Adjust   | ✅          | ✅      | ❌         | ❌               |
| **Finance**   | View Reports   | ✅          | ✅      | ✅         | ❌               |
|               | Expense Entry  | ✅          | ✅      | ✅         | ❌               |
| **Admin**     | Role Edit      | ✅          | ❌      | ❌         | ❌               |
|               | Audit View     | ✅          | ✅      | ✅         | ❌               |

---

## 6. TECHNICAL API & DATA FLOWS

### 6.1 Multi-Method Login Logic

```typescript
async function login(identifier: string, pass: string) {
  // 1. Identify user by Email, Username, or Phone
  const user = await db.users.findFirst({
    where: or(
      eq(email, identifier),
      eq(username, identifier),
      eq(phone, identifier),
    ),
  });

  // 2. Verify Heavy Password via Bcrypt
  const isMatch = await bcrypt.compare(pass, user.password_hash);

  // 3. Initiate Real-time Session & Broadcast Login Success
  if (isMatch) {
    const session = createSession(user);
    IPC.broadcast("USER_LOGGED_IN", { name: user.full_name, role: user.role });
    return session;
  }
}
```

### 6.2 Success Message Architecture

Every successful update (Inventory/Profile/POS) triggers:

1.  **Backend**: `db.update()` + `audit_log.insert()`.
2.  **Frontend**: `ui.notifySuccess()` -> Shows "Extraordinary" Success Pop-up.
3.  **State**: Zustand store updates reactively across all open windows.

---

## 7. OPTIMIZATION FOR SCALE

- **Virtualization**: 10,000+ items handled via `react-window` for zero lag.
- **Lazy Loading**: Each module (Inventory, Finance, POS) is loaded only when accessed.
- **Asset Prefetching**: Frequently used icons/images cached in memory for instant display.
