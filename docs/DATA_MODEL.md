# Data Model Reference

Complete reference for all data types used in the POS System.

---

## Authentication Layer (Main Process)

Stored in `data/localDatabase.json`.

### Store

```typescript
{
  id: string              // "store-default"
  name: string            // "Default Store"
  currency: string        // "USD"
  timezone: string        // "UTC"
  isActive: boolean
  createdAt: string       // ISO datetime
  updatedAt: string
}
```

### Role

```typescript
{
  id: string              // "role-super-admin"
  storeId: string         // FK → Store
  name: string            // "super_admin" | "manager" | "cashier"
  description: string
  isSystemRole: boolean
  createdAt: string
  updatedAt: string
}
```

### User (Auth)

```typescript
{
  id: string              // "user-super-admin"
  storeId: string         // FK → Store
  roleId: string          // FK → Role
  username: string
  passwordHash: string    // "salt_hex:scrypt_hash_hex"
  fullName: string
  status: "active" | "locked" | "disabled"
  grantedFeatureKeys: string[]
  revokedFeatureKeys: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt: string
  passwordUpdatedAt: string
}
```

---

## Business Operations Layer (Zustand Store)

All types defined in `src/renderer/src/stores/storeOpsStore.ts`.

### Store Profile

```typescript
StoreProfileRecord {
  storeName: string
  storeCode: string
  address: string
  timezone: string
  businessType: string
  primaryIndustry: "retail" | "restaurant" | "salon" | "fieldService" | "grocery"
  enabledIndustries: DeploymentIndustry[]
  enabledFeatures: DeploymentFeatureKey[]
  deploymentSetupCompletedAt: string | null
}
```

### Global Preferences

```typescript
GlobalPreferencesRecord {
  locale: string          // "en-US"
  currency: string        // "USD"
  timezone: string        // "America/New_York"
  dateStyle: "short" | "medium" | "long"
}
```

---

### Commerce

#### Product

```typescript
ProductRecord {
  id: string
  name: string
  category: string
  price: number
  stock: number
  reorderLevel: number
}
```

#### Category

```typescript
CategoryRecord {
  id: string
  name: string
}
```

#### Order

```typescript
OrderRecord {
  id: string
  createdAt: string
  updatedAt: string
  status: "completed" | "cancelled" | "refunded"
  statusNote: string
  items: OrderItemRecord[]
  subTotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paymentMethod: "cash" | "card" | "digital"
  customerId: string
  customerName: string
  customFieldValues: Record<string, string>
  deliveryStatus: string
  deliveryDate: string
}

OrderItemRecord {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}
```

#### Invoice

```typescript
InvoiceRecord {
  id: string
  invoiceNumber: string
  createdAt: string
  updatedAt: string
  linkedOrderId: string
  customerName: string
  amount: number
  issueDate: string
  dueDate: string
  reminderDate: string
  status: "draft" | "issued" | "paid" | "overdue" | "cancelled"
  notes: string
  reminderNotified: boolean
}
```

#### Register Session

```typescript
RegisterSessionRecord {
  isOpen: boolean
  openingCash: number
  currentCash: number
  openedAt: string
  closedAt: string
}
```

---

### Customers

```typescript
CustomerRecord {
  id: string
  fullName: string
  phone: string
  email: string
  loyaltyPoints: number
  creditBalance: number
}

CustomerActivityRecord {
  id: string
  customerId: string
  type: string
  description: string
  timestamp: string
}
```

---

### HR & Workforce

#### Staff

```typescript
StaffRecord {
  id: string
  fullName: string
  role: string
  department: string
  assignedLocation: string
  joinedOn: string
  isActive: boolean
  monthlySalary: number
  loanBalance: number
  isClockedIn: boolean
  lastAttendanceActionAt: string
  breakStartedAt: string | null
  breakMinutesToday: number
  commissionRate: number
  totalSalesAmount: number
  totalSalesCount: number
  commissionEarned: number
  tipsEarned: number
}
```

#### Attendance

```typescript
AttendanceSessionRecord {
  id: string
  staffId: string
  staffName: string
  clockInAt: string
  clockOutAt: string | null
  breakStartedAt: string | null
  breakMinutes: number
  totalHours: number
  overtimeHours: number
  complianceFlag: string
}
```

#### Shift Plan

```typescript
ShiftPlanRecord {
  id: string
  staffId: string
  staffName: string
  date: string
  startTime: string
  endTime: string
  roleDuringShift: string
}
```

#### Leave Request

```typescript
LeaveRequestRecord {
  id: string
  staffId: string
  staffName: string
  dateFrom: string
  dateTo: string
  reason: string
  status: "pending" | "approved" | "rejected"
}
```

#### Payroll

```typescript
PayrollRecord {
  id: string
  staffId: string
  staffName: string
  periodLabel: string
  baseSalary: number
  overtimeHours: number
  overtimePay: number
  loanDeduction: number
  netSalary: number
  generatedAt: string
}
```

#### Department Change

```typescript
DepartmentChangeRecord {
  id: string
  staffId: string
  staffName: string
  fromDepartment: string
  toDepartment: string
  reason: string
  changedBy: string
  changeMode: "onboarding" | "manualUpdate" | "transferRequest" | "promotion"
  changedAt: string
}
```

---

### Scheduling

```typescript
MeetingRecord {
  id: string
  title: string
  assigneeId: string
  assigneeName: string
  date: string
  time: string
}

AppointmentRecord {
  id: string
  title: string
  customerName: string
  assigneeId: string
  assigneeName: string
  date: string
  startTime: string
  endTime: string
  status: "scheduled" | "completed" | "cancelled"
  notes: string
}
```

---

### Counter Management

```typescript
CounterRecord {
  id: string
  name: string
  currentStaffId: string
  currentStaffName: string
  currentTask: string
  ordersHandledToday: number
  isOpen: boolean
  updatedAt: string
}
```

---

### User Accounts & Audit

```typescript
UserAccountRecord {
  id: string
  username: string
  fullName: string
  role: string
  status: "active" | "locked" | "disabled"
  storeId: string
  grantedFeatureKeys: string[]
  revokedFeatureKeys: string[]
  linkedStaffId: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string
  passwordUpdatedAt: string
}

UserAccountAuditRecord {
  id: string
  userAccountId: string
  username: string
  action: "created" | "roleUpdated" | "statusUpdated" | "featureOverridesUpdated" | "passwordReset"
  summary: string
  changedBy: string
  changedAt: string
}
```

---

### Industry: Restaurant

```typescript
RestaurantTableRecord {
  id: string
  name: string
  area: string
  seats: number
  status: "available" | "occupied" | "reserved" | "cleaning"
  currentTicketId: string
  currentOrderId: string
}

KitchenTicketRecord {
  id: string
  ticketNumber: string
  tableId: string
  tableName: string
  channel: "dineIn" | "pickup" | "delivery" | "driveThru"
  itemSummary: string
  course: string
  modifiers: string
  status: "queued" | "preparing" | "ready" | "served"
  assigneeStaffId: string
  assigneeStaffName: string
  createdAt: string
}
```

---

### Industry: Salon

```typescript
SalonServiceRecord {
  id: string
  name: string
  category: string
  durationMinutes: number
  price: number
  depositRequired: number
  noShowFee: number
}

SalonBookingRecord {
  id: string
  serviceId: string
  serviceName: string
  customerName: string
  assigneeId: string
  assigneeName: string
  date: string
  startTime: string
  status: "scheduled" | "checkedIn" | "completed" | "noShow" | "cancelled"
  depositAmount: number
  notes: string
}
```

---

### Industry: Field Service

```typescript
PriceBookItemRecord {
  id: string
  name: string
  trade: "plumbing" | "electrical" | "general"
  unit: string
  unitPrice: number
}

FieldJobRecord {
  id: string
  customerName: string
  serviceAddress: string
  trade: string
  scheduledDate: string
  scheduledWindow: string
  technicianId: string
  technicianName: string
  status: "scheduled" | "enRoute" | "inProgress" | "completed" | "cancelled"
  summary: string
}

FieldEstimateRecord {
  id: string
  jobId: string
  customerName: string
  lineItems: FieldEstimateLineItemRecord[]
  totalAmount: number
  status: "draft" | "sent" | "approved" | "declined" | "invoiced"
  createdAt: string
}
```

---

### Industry: Grocery & Dairy

```typescript
DeliverySubscriptionRecord {
  id: string
  customerName: string
  frequency: "daily" | "weekly" | "custom"
  deliveryDays: string[]
  itemSummary: string
  nextDeliveryDate: string
  status: "active" | "paused"
}

RouteManifestRecord {
  id: string
  routeDate: string
  driverId: string
  driverName: string
  vehicleLabel: string
  stops: RouteManifestStopRecord[]
  status: "planned" | "inProgress" | "completed"
}
```

---

### Sync

```typescript
StoreSyncStatusRecord {
  serverUrl: string
  pendingChanges: number
  lastSyncedAt: string | null
  lastError: string | null
  isSyncing: boolean
}
```

---

### Feature Keys

```typescript
type DeploymentFeatureKey =
  | "dashboard" | "businessSuite" | "pos" | "orders" | "inventory"
  | "customers" | "hr" | "counters" | "reports" | "settings"
  | "restaurantTables" | "kitchenDisplay"
  | "salonServices" | "salonDeposits"
  | "fieldDispatch" | "fieldEstimates"
  | "routeSubscriptions" | "routeManifests"

type DeploymentIndustry =
  | "retail" | "restaurant" | "salon" | "fieldService" | "grocery"
```
