# API Reference

Complete reference for all IPC channels, store actions, and utility functions.

---

## IPC Channels

All IPC calls go through `window.api` (exposed by preload). In renderer code, access via:

```typescript
import { getDesktopApi } from '@/lib/desktopApi';
const api = getDesktopApi();
```

### Authentication Channels

#### `auth:login`
Authenticate a user with credentials.

```typescript
api.login({ username: string, password: string }): Promise<SessionUser>
```

**Returns**: `SessionUser` with `id`, `username`, `fullName`, `role`, `storeId`, `grantedFeatureKeys`, `revokedFeatureKeys`

**Errors**: Invalid credentials, account locked/disabled

---

#### `auth:get-session`
Retrieve the current session (used on app load).

```typescript
api.getSession(): Promise<SessionUser | null>
```

---

#### `auth:logout`
Clear the current session.

```typescript
api.logout(): Promise<{ ok: true }>
```

---

#### `auth:list-users`
List all user accounts (admin only).

```typescript
api.listUsers(): Promise<AuthAdminUserRecord[]>
```

---

#### `auth:create-user`
Create a new user account.

```typescript
api.createUser({
  username: string,
  fullName: string,
  role: 'super_admin' | 'manager' | 'cashier',
  storeId: string,
  temporaryPassword: string
}): Promise<AuthAdminUserRecord>
```

---

#### `auth:update-user-role`
Change a user's role.

```typescript
api.updateUserRole({ userId: string, role: string }): Promise<AuthAdminUserRecord>
```

---

#### `auth:update-user-status`
Lock, disable, or activate a user.

```typescript
api.updateUserStatus({ userId: string, status: 'active' | 'locked' | 'disabled' }): Promise<AuthAdminUserRecord>
```

---

#### `auth:update-user-permissions`
Set per-user feature overrides.

```typescript
api.updateUserPermissions({
  userId: string,
  grantedFeatureKeys: string[],
  revokedFeatureKeys: string[]
}): Promise<AuthAdminUserRecord>
```

---

#### `auth:reset-user-password`
Reset a user's password (admin action).

```typescript
api.resetUserPassword({ userId: string, temporaryPassword: string }): Promise<AuthAdminUserRecord>
```

---

### Sync Channels

#### `sync:get-status`
Get current sync state for a store.

```typescript
api.getSyncStatus({ storeId: string }): Promise<SyncStatusRecord>
```

---

#### `sync:set-server-url`
Configure the sync server URL.

```typescript
api.setSyncServerUrl({ storeId: string, serverUrl: string }): Promise<SyncStatusRecord>
```

---

#### `sync:queue-store-snapshot`
Queue a store state snapshot for sync.

```typescript
api.queueStoreSnapshot({ storeId: string, snapshot: object }): Promise<SyncStatusRecord>
```

---

#### `sync:force`
Force an immediate sync attempt.

```typescript
api.forceSync({ storeId: string }): Promise<SyncRunResult>
```

---

#### `sync:get-latest-remote-snapshot`
Pull the latest state from the server.

```typescript
api.getLatestRemoteSnapshot({ storeId: string }): Promise<Record<string, unknown> | null>
```

---

## Store Actions (storeOpsStore)

### Commerce

| Action | Params | Effect |
|--------|--------|--------|
| `addCategory` | `{ name }` | Add product category |
| `addProduct` | `ProductRecord` fields | Add product to inventory |
| `importProducts` | `ProductRecord[]` | Bulk import products |
| `adjustStock` | `{ productId, delta }` | Adjust product stock level |
| `processCheckout` | `{ cart, paymentMethod, customerId? }` | Full POS transaction |
| `startRegisterSession` | `{ openingCash }` | Open register |
| `endRegisterSession` | - | Close register with totals |

### Orders

| Action | Params | Effect |
|--------|--------|--------|
| `setOrderStatus` | `{ orderId, status, note? }` | Update order status |
| `importOrders` | `OrderRecord[]` | Bulk import orders |
| `addOrderCustomField` | `{ orderId, key, value }` | Add custom field to order |
| `setOrderDelivery` | `{ orderId, status, date }` | Set delivery tracking |
| `createInvoice` | `InvoiceRecord` fields | Create invoice from order |
| `setInvoiceStatus` | `{ invoiceId, status }` | Update invoice status |
| `markInvoiceReminderNotified` | `invoiceId` | Dismiss reminder |

### Customers

| Action | Params | Effect |
|--------|--------|--------|
| `addCustomer` | `CustomerRecord` fields | Add customer profile |
| `importCustomers` | `CustomerRecord[]` | Bulk import customers |
| `addCustomerCredit` | `{ customerId, amount }` | Add credit to account |
| `redeemCustomerPoints` | `{ customerId, points }` | Redeem loyalty points |

### HR & Workforce

| Action | Params | Effect |
|--------|--------|--------|
| `addStaffMember` | `StaffRecord` fields | Add employee |
| `deactivateStaffMember` | `staffId` | Mark inactive |
| `reassignStaffDepartment` | `{ staffId, dept, reason }` | Transfer + audit |
| `clockInStaff` | `staffId` | Start attendance session |
| `clockOutStaff` | `staffId` | End attendance session |
| `startStaffBreak` | `staffId` | Start break timer |
| `endStaffBreak` | `staffId` | End break timer |
| `addShiftPlan` | `ShiftPlanRecord` fields | Create shift |
| `addLeaveRequest` | `LeaveRequestRecord` fields | Submit leave request |
| `setLeaveStatus` | `{ leaveId, status }` | Approve/reject leave |
| `generatePayroll` | `{ staffId, periodLabel }` | Calculate payroll |
| `repayLoan` | `{ staffId, amount }` | Deduct from loan balance |
| `addTipsPool` | `amount` | Add to tips pool |
| `distributeTipsPool` | - | Split tips among clocked-in staff |
| `recordStaffSale` | `{ staffId, amount }` | Track for commission |

### Scheduling

| Action | Params | Effect |
|--------|--------|--------|
| `addMeeting` | `MeetingRecord` fields | Create meeting |
| `addAppointment` | `AppointmentRecord` fields | Create appointment |
| `setAppointmentStatus` | `{ appointmentId, status }` | Update status |
| `getCalendarDaySummary` | `date` | Returns day's schedule |

### Industry: Restaurant

| Action | Params | Effect |
|--------|--------|--------|
| `addRestaurantTable` | `{ name, area, seats }` | Add table |
| `setRestaurantTableStatus` | `{ tableId, status }` | Update table status |
| `addKitchenTicket` | `KitchenTicketRecord` fields | Create ticket |
| `setKitchenTicketStatus` | `{ ticketId, status }` | Update ticket status |

### Industry: Salon

| Action | Params | Effect |
|--------|--------|--------|
| `addSalonService` | `SalonServiceRecord` fields | Add service |
| `addSalonBooking` | `SalonBookingRecord` fields | Create booking |
| `setSalonBookingStatus` | `{ bookingId, status }` | Update booking status |

### Industry: Field Service

| Action | Params | Effect |
|--------|--------|--------|
| `addPriceBookItem` | `PriceBookItemRecord` fields | Add to price book |
| `addFieldJob` | `FieldJobRecord` fields | Create job |
| `setFieldJobStatus` | `{ jobId, status }` | Update job status |
| `addFieldEstimate` | `FieldEstimateRecord` fields | Create estimate |
| `setFieldEstimateStatus` | `{ estimateId, status }` | Update estimate |
| `convertFieldEstimateToInvoice` | `estimateId` | Create invoice from estimate |

### Industry: Grocery

| Action | Params | Effect |
|--------|--------|--------|
| `addDeliverySubscription` | `DeliverySubscriptionRecord` fields | Create subscription |
| `addRouteManifest` | `RouteManifestRecord` fields | Create manifest |
| `setRouteManifestStopDelivered` | `{ manifestId, stopIndex }` | Mark stop delivered |

### Platform

| Action | Params | Effect |
|--------|--------|--------|
| `setDeploymentProfile` | `StoreProfileRecord` fields | Update store config |
| `resetDeploymentSetup` | - | Reopen setup wizard |
| `setGlobalPreferences` | `GlobalPreferencesRecord` | Update locale/currency/etc |
| `getStoreSnapshot` | - | Returns full serializable state |
| `hydrateStoreSnapshot` | `snapshot` | Restore from snapshot |
| `setSyncStatus` | `StoreSyncStatusRecord` | Update sync state |

---

## Utility Functions

### Access Control (`lib/accessControl.ts`)

```typescript
canAccessFeature(user, featureKey, enabledFeatures): boolean
canAccessRoute(user, routePath, enabledFeatures): boolean
canAccessPrivilegedArea(user, area): boolean
getFirstAccessibleRoute(user, enabledFeatures): string
```

### Data Exchange (`lib/dataExchange.ts`)

```typescript
parseImportFile(file: File): Promise<{ headers: string[], rows: Record<string, string>[] }>
downloadDataExport(rows, headers, format, filename): void
findMatchingHeader(header, candidates): string | null
```

### Global Format (`lib/globalFormat.ts`)

```typescript
formatCurrencyValue(value: number, preferences): string
formatDateValue(dateString: string, preferences): string
formatDateTimeValue(dateString: string, preferences): string
```
