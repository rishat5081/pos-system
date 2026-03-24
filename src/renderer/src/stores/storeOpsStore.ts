import { create } from 'zustand';
import type { BranchSnapshotRecord, OrgHierarchyData } from './orgHierarchyTypes';
import { useOrgHierarchyStore } from './orgHierarchyStore';

export interface CategoryRecord {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  reorderLevel: number;
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  creditBalance: number;
}

export interface CustomerActivityRecord {
  id: string;
  customerId: string;
  customerName: string;
  activityType:
    | 'customerCreated'
    | 'purchaseCompleted'
    | 'creditAdded'
    | 'pointsRedeemed'
    | 'refundIssued'
    | 'storeCreditIssued'
    | 'exchangeCompleted';
  summary: string;
  amount: number;
  points: number;
  occurredAt: string;
  referenceId: string;
}

export interface StaffRecord {
  id: string;
  fullName: string;
  role: string;
  department: string;
  assignedLocation: string;
  joinedOn: string;
  isActive: boolean;
  monthlySalary: number;
  loanBalance: number;
  isClockedIn: boolean;
  lastAttendanceActionAt: string | null;
  breakStartedAt: string | null;
  breakMinutesToday: number;
  commissionRate: number;
  totalSalesAmount: number;
  totalSalesCount: number;
  commissionEarned: number;
  tipsEarned: number;
}

export interface MeetingRecord {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  date: string;
  time: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface AppointmentRecord {
  id: string;
  title: string;
  customerName: string;
  assigneeId: string;
  assigneeName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
}

export interface ShiftPlanRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  roleDuringShift: string;
}

export interface AttendanceSessionRecord {
  id: string;
  staffId: string;
  staffName: string;
  clockInAt: string;
  clockOutAt: string | null;
  breakStartedAt: string | null;
  breakMinutes: number;
  totalHours: number;
  overtimeHours: number;
  complianceFlag: boolean;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequestRecord {
  id: string;
  staffId: string;
  staffName: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
  status: LeaveStatus;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  periodLabel: string;
  baseSalary: number;
  overtimeHours: number;
  overtimePay: number;
  loanDeduction: number;
  netSalary: number;
  generatedAt: string;
}

export interface TimesheetSummaryRecord {
  staffId: string;
  staffName: string;
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
  overtimeHours: number;
}

export type DepartmentChangeMode = 'onboarding' | 'manualUpdate' | 'transferRequest' | 'promotion';

export interface DepartmentChangeRecord {
  id: string;
  staffId: string;
  staffName: string;
  fromDepartment: string;
  toDepartment: string;
  reason: string;
  changedBy: string;
  changeMode: DepartmentChangeMode;
  changedAt: string;
}

export interface StoreProfileRecord {
  storeName: string;
  storeCode: string;
  address: string;
  timezone: string;
  businessType: string;
  primaryIndustry: DeploymentIndustry;
  enabledIndustries: DeploymentIndustry[];
  enabledFeatures: DeploymentFeatureKey[];
  deploymentSetupCompletedAt: string | null;
}

export type DeploymentIndustry = 'retail' | 'restaurant' | 'salon' | 'fieldService' | 'grocery';

export type DeploymentFeatureKey =
  | 'dashboard'
  | 'businessSuite'
  | 'pos'
  | 'orders'
  | 'inventory'
  | 'customers'
  | 'hr'
  | 'counters'
  | 'reports'
  | 'settings'
  | 'restaurantTables'
  | 'kitchenDisplay'
  | 'salonServices'
  | 'salonDeposits'
  | 'fieldDispatch'
  | 'fieldEstimates'
  | 'routeSubscriptions'
  | 'routeManifests'
  | 'companyAnalytics';

export interface CounterRecord {
  id: string;
  name: string;
  currentStaffId: string | null;
  currentStaffName: string;
  currentTask: string;
  ordersHandledToday: number;
  isOpen: boolean;
  updatedAt: string;
}

export interface StoreSyncStatusRecord {
  serverUrl: string;
  pendingChanges: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  isSyncing: boolean;
}

export type UserAccountRole = 'super_admin' | 'manager' | 'cashier';
export type UserAccountStatus = 'active' | 'locked' | 'disabled';

export interface UserAccountRecord {
  id: string;
  username: string;
  fullName: string;
  role: UserAccountRole;
  status: UserAccountStatus;
  grantedFeatureKeys: DeploymentFeatureKey[];
  revokedFeatureKeys: DeploymentFeatureKey[];
  linkedStaffId: string | null;
  linkedStaffName: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  passwordUpdatedAt: string | null;
}

export interface UserAccountAuditRecord {
  id: string;
  userAccountId: string;
  username: string;
  action: 'created' | 'roleUpdated' | 'statusUpdated' | 'featureOverridesUpdated' | 'passwordReset';
  summary: string;
  changedBy: string;
  changedAt: string;
}

export interface DeploymentAuditRecord {
  id: string;
  action: 'setupWizardReopened';
  summary: string;
  changedBy: string;
  changedAt: string;
}

export interface GlobalPreferencesRecord {
  locale: string;
  currency: string;
  timezone: string;
  dateStyle: 'short' | 'medium' | 'long';
}

export interface VendorRecord {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: number;
  paymentTerms: string;
  notes: string;
  isActive: boolean;
}

export type PurchaseOrderStatus = 'draft' | 'sent' | 'partiallyReceived' | 'received' | 'cancelled';

export interface PurchaseOrderLineItemRecord {
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
}

export interface PurchaseOrderRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  createdAt: string;
  updatedAt: string;
  expectedDate: string;
  status: PurchaseOrderStatus;
  note: string;
  totalCost: number;
  lineItems: PurchaseOrderLineItemRecord[];
}

export type OrderCustomFieldType = 'text' | 'number' | 'date';

export interface OrderCustomFieldRecord {
  id: string;
  key: string;
  label: string;
  type: OrderCustomFieldType;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
  linkedOrderId: string | null;
  customerName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  reminderDate: string;
  status: InvoiceStatus;
  notes: string;
  reminderNotified: boolean;
}

export type RestaurantTableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface RestaurantTableRecord {
  id: string;
  name: string;
  area: string;
  seats: number;
  status: RestaurantTableStatus;
  currentTicketId: string | null;
  currentOrderId: string | null;
}

export type KitchenTicketStatus = 'queued' | 'preparing' | 'ready' | 'served';
export type KitchenTicketChannel = 'dineIn' | 'pickup' | 'delivery' | 'driveThru';

export interface KitchenTicketRecord {
  id: string;
  ticketNumber: string;
  tableId: string | null;
  tableName: string;
  channel: KitchenTicketChannel;
  itemSummary: string;
  course: string;
  modifiers: string[];
  status: KitchenTicketStatus;
  assigneeStaffId: string | null;
  assigneeStaffName: string;
  createdAt: string;
}

export type RestaurantReservationStatus = 'waitlist' | 'reserved' | 'seated' | 'completed' | 'cancelled';

export interface RestaurantReservationRecord {
  id: string;
  guestName: string;
  contactPhone: string;
  partySize: number;
  date: string;
  time: string;
  status: RestaurantReservationStatus;
  tableId: string | null;
  tableName: string;
  notes: string;
  createdAt: string;
}

export interface SalonServiceRecord {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  depositRequired: boolean;
  noShowFee: number;
}

export type SalonBookingStatus = 'scheduled' | 'checkedIn' | 'completed' | 'noShow' | 'cancelled';

export interface SalonBookingRecord {
  id: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  assigneeId: string;
  assigneeName: string;
  date: string;
  startTime: string;
  status: SalonBookingStatus;
  depositAmount: number;
  notes: string;
}

export interface PriceBookItemRecord {
  id: string;
  name: string;
  trade: 'plumbing' | 'electrical' | 'general';
  unit: string;
  unitPrice: number;
}

export type FieldJobStatus = 'scheduled' | 'enRoute' | 'inProgress' | 'completed' | 'cancelled';

export interface FieldJobRecord {
  id: string;
  customerName: string;
  serviceAddress: string;
  trade: PriceBookItemRecord['trade'];
  scheduledDate: string;
  scheduledWindow: string;
  technicianId: string;
  technicianName: string;
  status: FieldJobStatus;
  summary: string;
}

export type FieldEstimateStatus = 'draft' | 'sent' | 'approved' | 'declined' | 'invoiced';

export interface FieldEstimateLineItemRecord {
  priceBookItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface FieldEstimateRecord {
  id: string;
  jobId: string | null;
  customerName: string;
  lineItems: FieldEstimateLineItemRecord[];
  totalAmount: number;
  status: FieldEstimateStatus;
  createdAt: string;
}

export interface DeliverySubscriptionRecord {
  id: string;
  customerName: string;
  frequency: 'daily' | 'weekly' | 'custom';
  deliveryDays: string[];
  itemSummary: string;
  nextDeliveryDate: string;
  status: 'active' | 'paused';
}

export interface RouteManifestStopRecord {
  id: string;
  customerName: string;
  itemSummary: string;
  delivered: boolean;
}

export interface RouteManifestRecord {
  id: string;
  routeDate: string;
  driverId: string;
  driverName: string;
  vehicleLabel: string;
  stops: RouteManifestStopRecord[];
  status: 'planned' | 'inProgress' | 'completed';
}

export interface StoreOpsSnapshot {
  storeProfile: StoreProfileRecord;
  globalPreferences?: GlobalPreferencesRecord;
  taxRate: number;
  standardDailyHours: number;
  maxDailyHours: number;
  overtimeMultiplier: number;
  todaySales: number;
  todayOrders: number;
  categories: CategoryRecord[];
  products: ProductRecord[];
  vendors?: VendorRecord[];
  purchaseOrders?: PurchaseOrderRecord[];
  customers: CustomerRecord[];
  customerActivityRecords?: CustomerActivityRecord[];
  staffRecords: StaffRecord[];
  meetings: MeetingRecord[];
  appointments?: AppointmentRecord[];
  orders: OrderRecord[];
  returns?: ReturnRecord[];
  orderCustomFields?: OrderCustomFieldRecord[];
  registerSession: RegisterSessionRecord;
  invoices?: InvoiceRecord[];
  restaurantTables?: RestaurantTableRecord[];
  kitchenTickets?: KitchenTicketRecord[];
  restaurantReservations?: RestaurantReservationRecord[];
  salonServices?: SalonServiceRecord[];
  salonBookings?: SalonBookingRecord[];
  priceBookItems?: PriceBookItemRecord[];
  fieldJobs?: FieldJobRecord[];
  fieldEstimates?: FieldEstimateRecord[];
  deliverySubscriptions?: DeliverySubscriptionRecord[];
  routeManifests?: RouteManifestRecord[];
  shiftPlans: ShiftPlanRecord[];
  attendanceSessions: AttendanceSessionRecord[];
  leaveRequests: LeaveRequestRecord[];
  payrollRecords: PayrollRecord[];
  departmentChanges: DepartmentChangeRecord[];
  counterRecords: CounterRecord[];
  userAccounts: UserAccountRecord[];
  userAccountAuditRecords: UserAccountAuditRecord[];
  deploymentAuditRecords?: DeploymentAuditRecord[];
  tipsPoolBalance: number;
  orgHierarchy?: OrgHierarchyData;
}

export type PaymentMethod = 'cash' | 'card' | 'digital';
export type OrderStatus = 'completed' | 'cancelled' | 'refunded';
export type DeliveryStatus = 'notRequired' | 'pending' | 'outForDelivery' | 'delivered';

export interface OrderItemRecord {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  statusNote: string;
  items: OrderItemRecord[];
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerId: string | null;
  customerName: string;
  customFieldValues: Record<string, string>;
  deliveryStatus: DeliveryStatus;
  deliveryDate: string | null;
}

export type ReturnResolution = 'refund' | 'storeCredit' | 'exchange';

export interface ReturnLineItemRecord {
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  customerId: string | null;
  customerName: string;
  reason: string;
  resolution: ReturnResolution;
  restocked: boolean;
  amount: number;
  createdAt: string;
  replacementOrderId: string | null;
  lineItems: ReturnLineItemRecord[];
}

export interface CalendarDaySummaryRecord {
  date: string;
  appointmentsCount: number;
  completedAppointmentsCount: number;
  meetingsCount: number;
  ordersCount: number;
  pendingDeliveriesCount: number;
}

export interface RegisterSessionRecord {
  isOpen: boolean;
  openingCash: number;
  currentCash: number;
  openedAt: string | null;
  closedAt: string | null;
}

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

interface CheckoutInput {
  items: CheckoutItemInput[];
  paymentMethod: PaymentMethod;
  customerId?: string;
  discountAmount?: number;
  cashierStaffId?: string;
  skipStockDeduction?: boolean;
}

interface AddProductInput {
  name: string;
  category: string;
  price: number;
  stock: number;
  reorderLevel: number;
}

interface AddCategoryInput {
  name: string;
}

interface AddCustomerInput {
  fullName: string;
  phone: string;
  email: string;
}

interface ImportProductInput {
  name: string;
  category?: string;
  price?: number;
  stock?: number;
  reorderLevel?: number;
}

interface AddVendorInput {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
  notes?: string;
}

interface ImportVendorInput {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
  notes?: string;
}

interface CreatePurchaseOrderInput {
  vendorId: string;
  expectedDate: string;
  note?: string;
  lineItems: Array<{
    productId: string;
    quantityOrdered: number;
    unitCost: number;
  }>;
}

interface ImportCustomerInput {
  fullName: string;
  phone?: string;
  email?: string;
  loyaltyPoints?: number;
  creditBalance?: number;
}

interface AddMeetingInput {
  title: string;
  assigneeId: string;
  date: string;
  time: string;
}

interface ImportMeetingInput {
  title: string;
  assigneeId?: string;
  assigneeName?: string;
  date: string;
  time: string;
}

interface AddAppointmentInput {
  title: string;
  customerName: string;
  assigneeId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

interface ImportAppointmentInput {
  title: string;
  customerName: string;
  assigneeId?: string;
  assigneeName?: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status?: AppointmentStatus;
}

interface AddShiftInput {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  roleDuringShift: string;
}

interface ImportShiftInput {
  staffId?: string;
  staffName?: string;
  date: string;
  startTime: string;
  endTime: string;
  roleDuringShift?: string;
}

interface AddLeaveRequestInput {
  staffId: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
}

interface ImportLeaveRequestInput {
  staffId?: string;
  staffName?: string;
  dateFrom: string;
  dateTo: string;
  reason: string;
  status?: LeaveStatus;
}

interface AddStaffInput {
  fullName: string;
  role: string;
  department: string;
  assignedLocation: string;
  joinedOn: string;
  monthlySalary: number;
  loanBalance?: number;
  commissionRate?: number;
  createdBy?: string;
}

interface ReassignDepartmentInput {
  staffId: string;
  toDepartment: string;
  reason: string;
  changedBy: string;
  changeMode: Exclude<DepartmentChangeMode, 'onboarding'>;
}

interface AssignCounterInput {
  counterId: string;
  staffId: string;
  task: string;
}

interface AddUserAccountInput {
  id?: string;
  username: string;
  fullName: string;
  role: UserAccountRole;
  linkedStaffId?: string;
  changedBy: string;
  status?: UserAccountStatus;
  grantedFeatureKeys?: DeploymentFeatureKey[];
  revokedFeatureKeys?: DeploymentFeatureKey[];
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  passwordUpdatedAt?: string | null;
}

interface SetGlobalPreferencesInput {
  locale: string;
  currency: string;
  timezone: string;
  dateStyle: GlobalPreferencesRecord['dateStyle'];
}

interface AddOrderCustomFieldInput {
  label: string;
  type: OrderCustomFieldType;
}

interface ImportOrderInput {
  id?: string;
  customerName: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status?: OrderStatus;
  createdAt?: string;
  customFieldValues?: Record<string, string>;
  deliveryStatus?: DeliveryStatus;
  deliveryDate?: string | null;
}

interface CreateInvoiceInput {
  linkedOrderId?: string;
  customerName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  reminderDate: string;
  notes?: string;
}

interface CreateOrderReturnInput {
  orderId: string;
  reason: string;
  resolution: ReturnResolution;
  restocked: boolean;
  lineItems: Array<{
    productId: string;
    quantity: number;
  }>;
  exchangeItems?: Array<{
    productId: string;
    quantity: number;
  }>;
}

interface SetDeploymentProfileInput {
  businessType: string;
  primaryIndustry: DeploymentIndustry;
  enabledIndustries: DeploymentIndustry[];
  enabledFeatures: DeploymentFeatureKey[];
  storeName?: string;
  storeCode?: string;
  address?: string;
}

interface AddRestaurantTableInput {
  name: string;
  area: string;
  seats: number;
}

interface AddKitchenTicketInput {
  tableId?: string | null;
  channel: KitchenTicketChannel;
  itemSummary: string;
  course: string;
  modifiers?: string[];
  assigneeStaffId?: string | null;
}

interface AddRestaurantReservationInput {
  guestName: string;
  contactPhone?: string;
  partySize: number;
  date: string;
  time: string;
  tableId?: string | null;
  notes?: string;
}

interface AddSalonServiceInput {
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  depositRequired: boolean;
  noShowFee: number;
}

interface AddSalonBookingInput {
  serviceId: string;
  customerName: string;
  assigneeId: string;
  date: string;
  startTime: string;
  depositAmount?: number;
  notes?: string;
}

interface AddPriceBookItemInput {
  name: string;
  trade: PriceBookItemRecord['trade'];
  unit: string;
  unitPrice: number;
}

interface AddFieldJobInput {
  customerName: string;
  serviceAddress: string;
  trade: PriceBookItemRecord['trade'];
  scheduledDate: string;
  scheduledWindow: string;
  technicianId: string;
  summary: string;
}

interface AddFieldEstimateInput {
  jobId?: string | null;
  customerName: string;
  lineItems: Array<{
    priceBookItemId: string;
    quantity: number;
  }>;
}

interface AddDeliverySubscriptionInput {
  customerName: string;
  frequency: DeliverySubscriptionRecord['frequency'];
  deliveryDays: string[];
  itemSummary: string;
  nextDeliveryDate: string;
}

interface AddRouteManifestInput {
  routeDate: string;
  driverId: string;
  vehicleLabel: string;
  subscriptionIds: string[];
}

interface StoreOpsState {
  syncStatus: StoreSyncStatusRecord;
  storeProfile: StoreProfileRecord;
  globalPreferences: GlobalPreferencesRecord;
  taxRate: number;
  standardDailyHours: number;
  maxDailyHours: number;
  overtimeMultiplier: number;
  todaySales: number;
  todayOrders: number;
  categories: CategoryRecord[];
  products: ProductRecord[];
  vendors: VendorRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  customers: CustomerRecord[];
  customerActivityRecords: CustomerActivityRecord[];
  staffRecords: StaffRecord[];
  meetings: MeetingRecord[];
  appointments: AppointmentRecord[];
  orders: OrderRecord[];
  returns: ReturnRecord[];
  orderCustomFields: OrderCustomFieldRecord[];
  registerSession: RegisterSessionRecord;
  invoices: InvoiceRecord[];
  restaurantTables: RestaurantTableRecord[];
  kitchenTickets: KitchenTicketRecord[];
  restaurantReservations: RestaurantReservationRecord[];
  salonServices: SalonServiceRecord[];
  salonBookings: SalonBookingRecord[];
  priceBookItems: PriceBookItemRecord[];
  fieldJobs: FieldJobRecord[];
  fieldEstimates: FieldEstimateRecord[];
  deliverySubscriptions: DeliverySubscriptionRecord[];
  routeManifests: RouteManifestRecord[];
  shiftPlans: ShiftPlanRecord[];
  attendanceSessions: AttendanceSessionRecord[];
  leaveRequests: LeaveRequestRecord[];
  payrollRecords: PayrollRecord[];
  departmentChanges: DepartmentChangeRecord[];
  counterRecords: CounterRecord[];
  userAccounts: UserAccountRecord[];
  userAccountAuditRecords: UserAccountAuditRecord[];
  deploymentAuditRecords: DeploymentAuditRecord[];
  tipsPoolBalance: number;
  setSyncStatus: (status: StoreSyncStatusRecord) => void;
  setGlobalPreferences: (input: SetGlobalPreferencesInput) => void;
  setDeploymentProfile: (input: SetDeploymentProfileInput) => void;
  resetDeploymentSetup: (changedBy?: string) => void;
  getStoreSnapshot: () => StoreOpsSnapshot;
  hydrateStoreSnapshot: (snapshot: StoreOpsSnapshot) => void;
  addCategory: (input: AddCategoryInput) => void;
  addProduct: (input: AddProductInput) => void;
  importProducts: (inputs: ImportProductInput[]) => void;
  addVendor: (input: AddVendorInput) => void;
  importVendors: (inputs: ImportVendorInput[]) => void;
  createPurchaseOrder: (input: CreatePurchaseOrderInput) => void;
  setPurchaseOrderStatus: (purchaseOrderId: string, status: PurchaseOrderStatus) => void;
  receivePurchaseOrderItems: (purchaseOrderId: string, receivedItems: Array<{ productId: string; quantity: number }>) => void;
  addCustomer: (input: AddCustomerInput) => void;
  importCustomers: (inputs: ImportCustomerInput[]) => void;
  addStaffMember: (input: AddStaffInput) => void;
  deactivateStaffMember: (staffId: string) => void;
  reassignStaffDepartment: (input: ReassignDepartmentInput) => void;
  assignStaffToCounter: (input: AssignCounterInput) => void;
  setCounterTask: (counterId: string, task: string) => void;
  releaseCounter: (counterId: string) => void;
  addUserAccount: (input: AddUserAccountInput) => void;
  setUserAccountsSnapshot: (userAccounts: UserAccountRecord[]) => void;
  setUserAccountRole: (userAccountId: string, role: UserAccountRole, changedBy: string) => void;
  setUserAccountStatus: (userAccountId: string, status: UserAccountStatus, changedBy: string) => void;
  setUserAccountFeatureOverrides: (
    userAccountId: string,
    grantedFeatureKeys: DeploymentFeatureKey[],
    revokedFeatureKeys: DeploymentFeatureKey[],
    changedBy: string
  ) => void;
  resetUserAccountPassword: (userAccountId: string, changedBy: string) => void;
  setOrderStatus: (orderId: string, status: OrderStatus, statusNote?: string) => void;
  addOrderCustomField: (input: AddOrderCustomFieldInput) => void;
  importOrders: (inputs: ImportOrderInput[]) => void;
  processCheckout: (input: CheckoutInput) => { ok: true; orderTotal: number; orderId: string };
  createOrderReturn: (input: CreateOrderReturnInput) => { ok: true; returnId: string; replacementOrderId: string | null };
  adjustStock: (productId: string, change: number) => void;
  startRegisterSession: (openingCash: number) => void;
  endRegisterSession: () => void;
  addCustomerCredit: (customerId: string, amount: number) => void;
  redeemCustomerPoints: (customerId: string, points: number) => void;
  clockInStaff: (staffId: string) => void;
  clockOutStaff: (staffId: string) => void;
  startStaffBreak: (staffId: string) => void;
  endStaffBreak: (staffId: string) => void;
  toggleAttendance: (staffId: string) => void;
  addShiftPlan: (input: AddShiftInput) => void;
  importShiftPlans: (inputs: ImportShiftInput[]) => void;
  addLeaveRequest: (input: AddLeaveRequestInput) => void;
  importLeaveRequests: (inputs: ImportLeaveRequestInput[]) => void;
  setLeaveStatus: (leaveRequestId: string, status: LeaveStatus) => void;
  addMeeting: (input: AddMeetingInput) => void;
  importMeetings: (inputs: ImportMeetingInput[]) => void;
  addAppointment: (input: AddAppointmentInput) => void;
  importAppointments: (inputs: ImportAppointmentInput[]) => void;
  setAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  recordStaffSale: (staffId: string, orderTotal: number) => void;
  addTipsPool: (amount: number) => void;
  distributeTipsPool: () => void;
  repayLoan: (staffId: string, amount: number) => void;
  generatePayroll: (periodLabel: string) => void;
  getTimesheetSummaries: () => TimesheetSummaryRecord[];
  getDepartmentChangeReport: () => DepartmentChangeRecord[];
  exportDepartmentChangeReportCsv: () => string;
  exportDepartmentChangeReportText: () => string;
  exportPayslipText: (staffId: string, periodLabel: string) => string;
  createInvoice: (input: CreateInvoiceInput) => void;
  setInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  markInvoiceReminderNotified: (invoiceId: string) => void;
  getPendingInvoiceReminders: () => InvoiceRecord[];
  addRestaurantTable: (input: AddRestaurantTableInput) => void;
  setRestaurantTableStatus: (tableId: string, status: RestaurantTableStatus) => void;
  addKitchenTicket: (input: AddKitchenTicketInput) => void;
  setKitchenTicketStatus: (ticketId: string, status: KitchenTicketStatus) => void;
  addRestaurantReservation: (input: AddRestaurantReservationInput) => void;
  setRestaurantReservationStatus: (reservationId: string, status: RestaurantReservationStatus) => void;
  addSalonService: (input: AddSalonServiceInput) => void;
  addSalonBooking: (input: AddSalonBookingInput) => void;
  setSalonBookingStatus: (bookingId: string, status: SalonBookingStatus) => void;
  addPriceBookItem: (input: AddPriceBookItemInput) => void;
  addFieldJob: (input: AddFieldJobInput) => void;
  setFieldJobStatus: (jobId: string, status: FieldJobStatus) => void;
  addFieldEstimate: (input: AddFieldEstimateInput) => void;
  setFieldEstimateStatus: (estimateId: string, status: FieldEstimateStatus) => void;
  convertFieldEstimateToInvoice: (estimateId: string) => void;
  addDeliverySubscription: (input: AddDeliverySubscriptionInput) => void;
  addRouteManifest: (input: AddRouteManifestInput) => void;
  setRouteManifestStopDelivered: (manifestId: string, stopId: string, delivered: boolean) => void;
  setOrderDelivery: (orderId: string, deliveryStatus: DeliveryStatus, deliveryDate?: string | null) => void;
  getCalendarDaySummary: (date: string) => CalendarDaySummaryRecord;
}

const initialCategories: CategoryRecord[] = [
  { id: 'category-produce', name: 'Produce', isActive: true },
  { id: 'category-dairy', name: 'Dairy', isActive: true },
  { id: 'category-grocery', name: 'Grocery', isActive: true },
  { id: 'category-snacks', name: 'Snacks', isActive: true }
];

const initialProducts: ProductRecord[] = [
  { id: 'product-apple', name: 'Apple Pack', category: 'Produce', price: 4.2, stock: 78, reorderLevel: 20 },
  { id: 'product-milk', name: 'Whole Milk 1L', category: 'Dairy', price: 2.8, stock: 41, reorderLevel: 18 },
  { id: 'product-rice', name: 'Rice 5kg', category: 'Grocery', price: 12.5, stock: 30, reorderLevel: 12 },
  { id: 'product-chips', name: 'Potato Chips', category: 'Snacks', price: 1.75, stock: 16, reorderLevel: 22 }
];

const initialVendors: VendorRecord[] = [
  {
    id: 'vendor-north-foods',
    name: 'North Foods',
    contactName: 'Alina West',
    phone: '+1 555 300 1122',
    email: 'orders@northfoods.example',
    leadTimeDays: 3,
    paymentTerms: 'Net 15',
    notes: 'Primary chilled goods supplier',
    isActive: true
  },
  {
    id: 'vendor-fresh-harvest',
    name: 'Fresh Harvest',
    contactName: 'Ruben Clark',
    phone: '+1 555 400 5566',
    email: 'supply@freshharvest.example',
    leadTimeDays: 2,
    paymentTerms: 'Net 7',
    notes: 'Produce and seasonal fruit',
    isActive: true
  }
];

const initialPurchaseOrders: PurchaseOrderRecord[] = [
  {
    id: 'purchase-order-1001',
    vendorId: 'vendor-north-foods',
    vendorName: 'North Foods',
    createdAt: '2026-03-12T09:00:00.000Z',
    updatedAt: '2026-03-13T08:30:00.000Z',
    expectedDate: '2026-03-15',
    status: 'partiallyReceived',
    note: 'Weekend dairy restock',
    totalCost: 51.6,
    lineItems: [
      {
        productId: 'product-milk',
        productName: 'Whole Milk 1L',
        quantityOrdered: 24,
        quantityReceived: 12,
        unitCost: 2.15
      }
    ]
  }
];

const initialCustomers: CustomerRecord[] = [
  {
    id: 'customer-walk-in',
    fullName: 'Walk In Customer',
    phone: '',
    email: '',
    loyaltyPoints: 0,
    creditBalance: 0
  },
  {
    id: 'customer-emily',
    fullName: 'Emily Rivera',
    phone: '+1 555 100 2000',
    email: 'emily@example.com',
    loyaltyPoints: 180,
    creditBalance: 40
  }
];

const initialCustomerActivityRecords: CustomerActivityRecord[] = [
  {
    id: 'customerActivity-emily-created',
    customerId: 'customer-emily',
    customerName: 'Emily Rivera',
    activityType: 'customerCreated',
    summary: 'Customer profile created',
    amount: 0,
    points: 0,
    occurredAt: '2026-01-08T09:00:00.000Z',
    referenceId: ''
  }
];

const initialStaffRecords: StaffRecord[] = [
  {
    id: 'staff-mia',
    fullName: 'Mia Carter',
    role: 'Cashier',
    department: 'sales',
    assignedLocation: 'Main Store',
    joinedOn: '2025-01-04',
    isActive: true,
    monthlySalary: 3200,
    loanBalance: 1800,
    isClockedIn: true,
    lastAttendanceActionAt: new Date().toISOString(),
    breakStartedAt: null,
    breakMinutesToday: 0,
    commissionRate: 0.02,
    totalSalesAmount: 0,
    totalSalesCount: 0,
    commissionEarned: 0,
    tipsEarned: 0
  },
  {
    id: 'staff-aiden',
    fullName: 'Aiden Brooks',
    role: 'Store Manager',
    department: 'operations',
    assignedLocation: 'Main Store',
    joinedOn: '2024-09-10',
    isActive: true,
    monthlySalary: 4800,
    loanBalance: 0,
    isClockedIn: true,
    lastAttendanceActionAt: new Date().toISOString(),
    breakStartedAt: null,
    breakMinutesToday: 0,
    commissionRate: 0.01,
    totalSalesAmount: 0,
    totalSalesCount: 0,
    commissionEarned: 0,
    tipsEarned: 0
  },
  {
    id: 'staff-noah',
    fullName: 'Noah Reed',
    role: 'Inventory Clerk',
    department: 'inventory',
    assignedLocation: 'Main Store',
    joinedOn: '2024-12-21',
    isActive: true,
    monthlySalary: 3500,
    loanBalance: 2500,
    isClockedIn: false,
    lastAttendanceActionAt: null,
    breakStartedAt: null,
    breakMinutesToday: 0,
    commissionRate: 0.005,
    totalSalesAmount: 0,
    totalSalesCount: 0,
    commissionEarned: 0,
    tipsEarned: 0
  }
];

const initialUserAccounts: UserAccountRecord[] = [
  {
    id: 'user-super-admin',
    username: 'admin',
    fullName: 'Super Admin',
    role: 'super_admin',
    status: 'active',
    grantedFeatureKeys: [],
    revokedFeatureKeys: [],
    linkedStaffId: null,
    linkedStaffName: '',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
    lastLoginAt: null,
    passwordUpdatedAt: '2026-01-01T09:00:00.000Z'
  },
  {
    id: 'user-aiden',
    username: 'aiden.manager',
    fullName: 'Aiden Brooks',
    role: 'manager',
    status: 'active',
    grantedFeatureKeys: [],
    revokedFeatureKeys: [],
    linkedStaffId: 'staff-aiden',
    linkedStaffName: 'Aiden Brooks',
    createdAt: '2026-01-08T09:00:00.000Z',
    updatedAt: '2026-01-08T09:00:00.000Z',
    lastLoginAt: null,
    passwordUpdatedAt: '2026-01-08T09:00:00.000Z'
  },
  {
    id: 'user-mia',
    username: 'mia.cashier',
    fullName: 'Mia Carter',
    role: 'cashier',
    status: 'active',
    grantedFeatureKeys: [],
    revokedFeatureKeys: [],
    linkedStaffId: 'staff-mia',
    linkedStaffName: 'Mia Carter',
    createdAt: '2026-01-08T09:00:00.000Z',
    updatedAt: '2026-01-08T09:00:00.000Z',
    lastLoginAt: null,
    passwordUpdatedAt: '2026-01-08T09:00:00.000Z'
  }
];

const initialUserAccountAuditRecords: UserAccountAuditRecord[] = [
  {
    id: 'userAccountAudit-created-admin',
    userAccountId: 'user-super-admin',
    username: 'admin',
    action: 'created',
    summary: 'Super admin account created',
    changedBy: 'systemSeeder',
    changedAt: '2026-01-01T09:00:00.000Z'
  },
  {
    id: 'userAccountAudit-created-aiden',
    userAccountId: 'user-aiden',
    username: 'aiden.manager',
    action: 'created',
    summary: 'Manager account created',
    changedBy: 'systemSeeder',
    changedAt: '2026-01-08T09:00:00.000Z'
  },
  {
    id: 'userAccountAudit-created-mia',
    userAccountId: 'user-mia',
    username: 'mia.cashier',
    action: 'created',
    summary: 'Cashier account created',
    changedBy: 'systemSeeder',
    changedAt: '2026-01-08T09:00:00.000Z'
  }
];

const initialDeploymentAuditRecords: DeploymentAuditRecord[] = [];

const initialMeetings: MeetingRecord[] = [
  {
    id: 'meeting-standup',
    title: 'Daily Shift Standup',
    assigneeId: 'staff-aiden',
    assigneeName: 'Aiden Brooks',
    date: '2026-03-02',
    time: '09:30'
  },
  {
    id: 'meeting-reorder',
    title: 'Reorder Planning',
    assigneeId: 'staff-noah',
    assigneeName: 'Noah Reed',
    date: '2026-03-03',
    time: '14:00'
  }
];

const initialAppointments: AppointmentRecord[] = [
  {
    id: 'appointment-personal-shopper',
    title: 'Personal Shopper Session',
    customerName: 'Emily Rivera',
    assigneeId: 'staff-mia',
    assigneeName: 'Mia Carter',
    date: '2026-03-14',
    startTime: '11:00',
    endTime: '11:45',
    status: 'scheduled',
    notes: 'Recurring premium customer visit'
  },
  {
    id: 'appointment-vendor-demo',
    title: 'Vendor Product Demo',
    customerName: 'North Foods',
    assigneeId: 'staff-aiden',
    assigneeName: 'Aiden Brooks',
    date: '2026-03-14',
    startTime: '15:00',
    endTime: '15:30',
    status: 'completed',
    notes: 'Frozen aisle expansion review'
  }
];

const initialShiftPlans: ShiftPlanRecord[] = [
  {
    id: 'shift-1',
    staffId: 'staff-mia',
    staffName: 'Mia Carter',
    date: '2026-03-02',
    startTime: '09:00',
    endTime: '17:00',
    roleDuringShift: 'Cashier'
  },
  {
    id: 'shift-2',
    staffId: 'staff-aiden',
    staffName: 'Aiden Brooks',
    date: '2026-03-02',
    startTime: '08:30',
    endTime: '17:30',
    roleDuringShift: 'Store Manager'
  }
];

const initialAttendanceSessions: AttendanceSessionRecord[] = [
  {
    id: 'attendance-mia-open',
    staffId: 'staff-mia',
    staffName: 'Mia Carter',
    clockInAt: new Date().toISOString(),
    clockOutAt: null,
    breakStartedAt: null,
    breakMinutes: 0,
    totalHours: 0,
    overtimeHours: 0,
    complianceFlag: false
  },
  {
    id: 'attendance-aiden-open',
    staffId: 'staff-aiden',
    staffName: 'Aiden Brooks',
    clockInAt: new Date().toISOString(),
    clockOutAt: null,
    breakStartedAt: null,
    breakMinutes: 0,
    totalHours: 0,
    overtimeHours: 0,
    complianceFlag: false
  }
];

const initialLeaveRequests: LeaveRequestRecord[] = [
  {
    id: 'leave-1',
    staffId: 'staff-noah',
    staffName: 'Noah Reed',
    dateFrom: '2026-03-10',
    dateTo: '2026-03-11',
    reason: 'Medical appointment',
    status: 'pending'
  }
];

const initialDepartmentChanges: DepartmentChangeRecord[] = [
  {
    id: 'departmentChange-onboard-mia',
    staffId: 'staff-mia',
    staffName: 'Mia Carter',
    fromDepartment: '',
    toDepartment: 'sales',
    reason: 'Initial department assignment',
    changedBy: 'systemSeeder',
    changeMode: 'onboarding',
    changedAt: '2025-01-04T09:00:00.000Z'
  },
  {
    id: 'departmentChange-onboard-aiden',
    staffId: 'staff-aiden',
    staffName: 'Aiden Brooks',
    fromDepartment: '',
    toDepartment: 'operations',
    reason: 'Initial department assignment',
    changedBy: 'systemSeeder',
    changeMode: 'onboarding',
    changedAt: '2024-09-10T09:00:00.000Z'
  },
  {
    id: 'departmentChange-onboard-noah',
    staffId: 'staff-noah',
    staffName: 'Noah Reed',
    fromDepartment: '',
    toDepartment: 'inventory',
    reason: 'Initial department assignment',
    changedBy: 'systemSeeder',
    changeMode: 'onboarding',
    changedAt: '2024-12-21T09:00:00.000Z'
  }
];

const initialStoreProfile: StoreProfileRecord = {
  storeName: 'Main Street Market',
  storeCode: 'MSM-001',
  address: '245 Main Street, Springfield',
  timezone: 'America/New_York',
  businessType: 'Supermarket',
  primaryIndustry: 'retail',
  enabledIndustries: ['retail', 'restaurant', 'salon', 'fieldService', 'grocery'],
  enabledFeatures: [
    'dashboard',
    'businessSuite',
    'pos',
    'orders',
    'inventory',
    'customers',
    'hr',
    'counters',
    'reports',
    'settings',
    'restaurantTables',
    'kitchenDisplay',
    'salonServices',
    'salonDeposits',
    'fieldDispatch',
    'fieldEstimates',
    'routeSubscriptions',
    'routeManifests'
  ],
  deploymentSetupCompletedAt: null
};

const initialGlobalPreferences: GlobalPreferencesRecord = {
  locale: 'en-US',
  currency: 'USD',
  timezone: 'America/New_York',
  dateStyle: 'medium'
};

const initialOrderCustomFields: OrderCustomFieldRecord[] = [];

const initialInvoices: InvoiceRecord[] = [];

const initialRestaurantTables: RestaurantTableRecord[] = [
  { id: 'table-patio-1', name: 'Patio 1', area: 'Patio', seats: 4, status: 'occupied', currentTicketId: 'ticket-201', currentOrderId: null },
  { id: 'table-main-5', name: 'Main 5', area: 'Main Hall', seats: 2, status: 'reserved', currentTicketId: null, currentOrderId: null },
  { id: 'table-bar-2', name: 'Bar 2', area: 'Bar', seats: 2, status: 'available', currentTicketId: null, currentOrderId: null }
];

const initialKitchenTickets: KitchenTicketRecord[] = [
  {
    id: 'ticket-201',
    ticketNumber: 'KT-201',
    tableId: 'table-patio-1',
    tableName: 'Patio 1',
    channel: 'dineIn',
    itemSummary: 'Burger Combo x2',
    course: 'Main',
    modifiers: ['No onion', 'Extra sauce'],
    status: 'preparing',
    assigneeStaffId: 'staff-mia',
    assigneeStaffName: 'Mia Carter',
    createdAt: '2026-03-14T11:00:00.000Z'
  },
  {
    id: 'ticket-202',
    ticketNumber: 'KT-202',
    tableId: null,
    tableName: 'Pickup',
    channel: 'pickup',
    itemSummary: 'Veg Pizza Large',
    course: 'Main',
    modifiers: ['Thin crust'],
    status: 'queued',
    assigneeStaffId: 'staff-aiden',
    assigneeStaffName: 'Aiden Brooks',
    createdAt: '2026-03-14T11:10:00.000Z'
  }
];

const initialSalonServices: SalonServiceRecord[] = [
  { id: 'salon-service-cut', name: 'Haircut + Finish', category: 'Hair', durationMinutes: 45, price: 45, depositRequired: false, noShowFee: 10 },
  { id: 'salon-service-color', name: 'Color Retouch', category: 'Color', durationMinutes: 90, price: 110, depositRequired: true, noShowFee: 25 },
  { id: 'salon-service-beard', name: 'Beard Grooming', category: 'Barber', durationMinutes: 30, price: 22, depositRequired: false, noShowFee: 5 }
];

const initialSalonBookings: SalonBookingRecord[] = [
  {
    id: 'salon-booking-1',
    serviceId: 'salon-service-color',
    serviceName: 'Color Retouch',
    customerName: 'Emily Rivera',
    assigneeId: 'staff-aiden',
    assigneeName: 'Aiden Brooks',
    date: '2026-03-15',
    startTime: '13:00',
    status: 'scheduled',
    depositAmount: 25,
    notes: 'Patch test approved'
  }
];

const initialPriceBookItems: PriceBookItemRecord[] = [
  { id: 'pricebook-leak', name: 'Leak Inspection', trade: 'plumbing', unit: 'job', unitPrice: 95 },
  { id: 'pricebook-outlet', name: 'Outlet Replacement', trade: 'electrical', unit: 'unit', unitPrice: 65 },
  { id: 'pricebook-panel', name: 'Panel Upgrade Assessment', trade: 'electrical', unit: 'job', unitPrice: 180 }
];

const initialFieldJobs: FieldJobRecord[] = [
  {
    id: 'field-job-1',
    customerName: 'Jordan Miles',
    serviceAddress: '18 North Street',
    trade: 'plumbing',
    scheduledDate: '2026-03-16',
    scheduledWindow: '09:00 - 11:00',
    technicianId: 'staff-noah',
    technicianName: 'Noah Reed',
    status: 'scheduled',
    summary: 'Leak inspection and quote'
  }
];

const initialFieldEstimates: FieldEstimateRecord[] = [
  {
    id: 'estimate-1',
    jobId: 'field-job-1',
    customerName: 'Jordan Miles',
    lineItems: [{ priceBookItemId: 'pricebook-leak', name: 'Leak Inspection', quantity: 1, unitPrice: 95, total: 95 }],
    totalAmount: 95,
    status: 'sent',
    createdAt: '2026-03-14T10:00:00.000Z'
  }
];

const initialDeliverySubscriptions: DeliverySubscriptionRecord[] = [
  {
    id: 'subscription-1',
    customerName: 'Sunrise Apartments',
    frequency: 'daily',
    deliveryDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    itemSummary: '18 milk subscriptions',
    nextDeliveryDate: '2026-03-15',
    status: 'active'
  },
  {
    id: 'subscription-2',
    customerName: 'Maple Residency',
    frequency: 'weekly',
    deliveryDays: ['Mon', 'Wed', 'Fri'],
    itemSummary: 'Breakfast basket refill',
    nextDeliveryDate: '2026-03-15',
    status: 'active'
  }
];

const initialRouteManifests: RouteManifestRecord[] = [
  {
    id: 'manifest-1',
    routeDate: '2026-03-15',
    driverId: 'staff-noah',
    driverName: 'Noah Reed',
    vehicleLabel: 'Van 3',
    status: 'planned',
    stops: [
      { id: 'manifest-1-stop-1', customerName: 'Sunrise Apartments', itemSummary: '18 milk subscriptions', delivered: false },
      { id: 'manifest-1-stop-2', customerName: 'Maple Residency', itemSummary: 'Breakfast basket refill', delivered: false }
    ]
  }
];

const initialOrders: OrderRecord[] = [
  {
    id: 'order-seeded-1001',
    createdAt: '2026-03-14T09:15:00.000Z',
    updatedAt: '2026-03-14T09:15:00.000Z',
    status: 'completed',
    statusNote: 'Seeded demo order',
    items: [
      {
        productId: 'product-milk',
        productName: 'Whole Milk 1L',
        quantity: 2,
        unitPrice: 2.8,
        lineTotal: 5.6
      }
    ],
    subTotal: 5.6,
    discountAmount: 0,
    taxAmount: 0.39,
    totalAmount: 5.99,
    paymentMethod: 'card',
    customerId: 'customer-emily',
    customerName: 'Emily Rivera',
    customFieldValues: {},
    deliveryStatus: 'pending',
    deliveryDate: '2026-03-14'
  },
  {
    id: 'order-seeded-1002',
    createdAt: '2026-03-14T12:05:00.000Z',
    updatedAt: '2026-03-14T12:05:00.000Z',
    status: 'completed',
    statusNote: 'Counter pickup',
    items: [
      {
        productId: 'product-apple',
        productName: 'Apple Pack',
        quantity: 1,
        unitPrice: 4.2,
        lineTotal: 4.2
      }
    ],
    subTotal: 4.2,
    discountAmount: 0,
    taxAmount: 0.29,
    totalAmount: 4.49,
    paymentMethod: 'cash',
    customerId: null,
    customerName: 'Walk In Customer',
    customFieldValues: {},
    deliveryStatus: 'notRequired',
    deliveryDate: null
  }
];

const initialReturns: ReturnRecord[] = [];

const initialRestaurantReservations: RestaurantReservationRecord[] = [
  {
    id: 'reservation-1001',
    guestName: 'Taylor Monroe',
    contactPhone: '+1 555 881 0022',
    partySize: 4,
    date: '2026-03-14',
    time: '19:00',
    status: 'reserved',
    tableId: 'table-main-5',
    tableName: 'Main 5',
    notes: 'Birthday dinner',
    createdAt: '2026-03-13T16:00:00.000Z'
  },
  {
    id: 'reservation-1002',
    guestName: 'Walk-In Queue',
    contactPhone: '',
    partySize: 2,
    date: '2026-03-14',
    time: '19:20',
    status: 'waitlist',
    tableId: null,
    tableName: 'Waitlist',
    notes: 'Text when patio frees',
    createdAt: '2026-03-14T18:45:00.000Z'
  }
];

const initialCounterRecords: CounterRecord[] = [
  {
    id: 'counter-1',
    name: 'Counter 1',
    currentStaffId: 'staff-mia',
    currentStaffName: 'Mia Carter',
    currentTask: 'Checkout lane active',
    ordersHandledToday: 0,
    isOpen: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'counter-2',
    name: 'Counter 2',
    currentStaffId: 'staff-aiden',
    currentStaffName: 'Aiden Brooks',
    currentTask: 'Queue oversight',
    ordersHandledToday: 0,
    isOpen: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'counter-3',
    name: 'Counter 3',
    currentStaffId: null,
    currentStaffName: '',
    currentTask: 'Idle',
    ordersHandledToday: 0,
    isOpen: false,
    updatedAt: new Date().toISOString()
  }
];

const initialRegisterSession: RegisterSessionRecord = {
  isOpen: false,
  openingCash: 0,
  currentCash: 0,
  openedAt: null,
  closedAt: null
};

const initialSyncStatus: StoreSyncStatusRecord = {
  serverUrl: '',
  pendingChanges: 0,
  lastSyncedAt: null,
  lastError: null,
  isSyncing: false
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function cloneSnapshot(snapshot: StoreOpsSnapshot): StoreOpsSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as StoreOpsSnapshot;
}

function getStoreSnapshotFromState(state: StoreOpsState): StoreOpsSnapshot {
  return {
    storeProfile: state.storeProfile,
    globalPreferences: state.globalPreferences,
    taxRate: state.taxRate,
    standardDailyHours: state.standardDailyHours,
    maxDailyHours: state.maxDailyHours,
    overtimeMultiplier: state.overtimeMultiplier,
    todaySales: state.todaySales,
    todayOrders: state.todayOrders,
    categories: state.categories,
    products: state.products,
    vendors: state.vendors,
    purchaseOrders: state.purchaseOrders,
    customers: state.customers,
    customerActivityRecords: state.customerActivityRecords,
    staffRecords: state.staffRecords,
    meetings: state.meetings,
    appointments: state.appointments,
    orders: state.orders,
    returns: state.returns,
    orderCustomFields: state.orderCustomFields,
    registerSession: state.registerSession,
    invoices: state.invoices,
    restaurantTables: state.restaurantTables,
    kitchenTickets: state.kitchenTickets,
    restaurantReservations: state.restaurantReservations,
    salonServices: state.salonServices,
    salonBookings: state.salonBookings,
    priceBookItems: state.priceBookItems,
    fieldJobs: state.fieldJobs,
    fieldEstimates: state.fieldEstimates,
    deliverySubscriptions: state.deliverySubscriptions,
    routeManifests: state.routeManifests,
    shiftPlans: state.shiftPlans,
    attendanceSessions: state.attendanceSessions,
    leaveRequests: state.leaveRequests,
    payrollRecords: state.payrollRecords,
    departmentChanges: state.departmentChanges,
    counterRecords: state.counterRecords,
    userAccounts: state.userAccounts,
    userAccountAuditRecords: state.userAccountAuditRecords,
    deploymentAuditRecords: state.deploymentAuditRecords,
    tipsPoolBalance: state.tipsPoolBalance,
    orgHierarchy: useOrgHierarchyStore.getState().getHierarchySnapshot()
  };
}

export function isStoreOpsSnapshot(snapshot: unknown): snapshot is StoreOpsSnapshot {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return false;
  }

  const candidate = snapshot as Partial<StoreOpsSnapshot>;

  return (
    typeof candidate.taxRate === 'number' &&
    !!candidate.storeProfile &&
    typeof candidate.todaySales === 'number' &&
    typeof candidate.todayOrders === 'number' &&
    Array.isArray(candidate.products) &&
    (Array.isArray(candidate.vendors) || candidate.vendors === undefined) &&
    (Array.isArray(candidate.purchaseOrders) || candidate.purchaseOrders === undefined) &&
    Array.isArray(candidate.customers) &&
    (Array.isArray(candidate.customerActivityRecords) || candidate.customerActivityRecords === undefined) &&
    Array.isArray(candidate.staffRecords) &&
    (Array.isArray(candidate.appointments) || candidate.appointments === undefined) &&
    Array.isArray(candidate.orders) &&
    (Array.isArray(candidate.returns) || candidate.returns === undefined) &&
    (Array.isArray(candidate.orderCustomFields) || candidate.orderCustomFields === undefined) &&
    (Array.isArray(candidate.invoices) || candidate.invoices === undefined) &&
    (Array.isArray(candidate.restaurantTables) || candidate.restaurantTables === undefined) &&
    (Array.isArray(candidate.kitchenTickets) || candidate.kitchenTickets === undefined) &&
    (Array.isArray(candidate.restaurantReservations) || candidate.restaurantReservations === undefined) &&
    (Array.isArray(candidate.salonServices) || candidate.salonServices === undefined) &&
    (Array.isArray(candidate.salonBookings) || candidate.salonBookings === undefined) &&
    (Array.isArray(candidate.priceBookItems) || candidate.priceBookItems === undefined) &&
    (Array.isArray(candidate.fieldJobs) || candidate.fieldJobs === undefined) &&
    (Array.isArray(candidate.fieldEstimates) || candidate.fieldEstimates === undefined) &&
    (Array.isArray(candidate.deliverySubscriptions) || candidate.deliverySubscriptions === undefined) &&
    (Array.isArray(candidate.routeManifests) || candidate.routeManifests === undefined) &&
    Array.isArray(candidate.counterRecords) &&
    Array.isArray(candidate.userAccounts) &&
    Array.isArray(candidate.userAccountAuditRecords) &&
    (Array.isArray(candidate.deploymentAuditRecords) || candidate.deploymentAuditRecords === undefined)
  );
}

export function computeCurrentBranchSnapshot(state: StoreOpsSnapshot): BranchSnapshotRecord {
  const currentBranch = useOrgHierarchyStore.getState().getCurrentBranch();
  const totalRevenue = state.todaySales;
  const totalOrders = state.todayOrders;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProducts = state.products.length;
  const lowStockCount = state.products.filter((p) => p.stock <= p.reorderLevel).length;
  const staffCount = state.staffRecords.length;
  const clockedInStaff = state.staffRecords.filter((s) => s.isClockedIn).length;
  const customerCount = state.customers.length;
  const totalInventoryValue = state.products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return {
    branchId: currentBranch?.id ?? 'current',
    snapshotDate: new Date().toISOString().slice(0, 10),
    totalRevenue,
    totalOrders,
    averageTicket: Math.round(averageTicket * 100) / 100,
    totalProducts,
    lowStockCount,
    staffCount,
    clockedInStaff,
    customerCount,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
    updatedAt: new Date().toISOString()
  };
}

function sanitizeMoney(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, roundCurrency(value));
}

function getHoursBetween(startIso: string, endIso: string): number {
  const startTime = new Date(startIso).getTime();
  const endTime = new Date(endIso).getTime();

  if (endTime <= startTime) {
    return 0;
  }

  return roundCurrency((endTime - startTime) / (1000 * 60 * 60));
}

function getStartOfWeek(date: Date): Date {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const diff = (day + 6) % 7;
  nextDate.setDate(nextDate.getDate() - diff);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatDateKey(dateValue: Date): string {
  const year = dateValue.getFullYear();
  const month = `${dateValue.getMonth() + 1}`.padStart(2, '0');
  const day = `${dateValue.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toCalendarDateKey(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value.slice(0, 10);
  }

  return formatDateKey(parsedDate);
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function getStaffCounter(counterRecords: CounterRecord[], staffId: string): CounterRecord | undefined {
  return counterRecords.find((counterRecord) => counterRecord.currentStaffId === staffId);
}

function findStaffRecord(staffRecords: StaffRecord[], staffId?: string, staffName?: string): StaffRecord | undefined {
  const normalizedStaffId = staffId?.trim() ?? '';

  if (normalizedStaffId) {
    return staffRecords.find((staffRecord) => staffRecord.id === normalizedStaffId);
  }

  const normalizedStaffName = staffName?.trim().toLowerCase() ?? '';

  if (!normalizedStaffName) {
    return undefined;
  }

  return staffRecords.find((staffRecord) => staffRecord.fullName.toLowerCase() === normalizedStaffName);
}

export const useStoreOpsStore = create<StoreOpsState>((set, get) => ({
  syncStatus: initialSyncStatus,
  storeProfile: initialStoreProfile,
  globalPreferences: initialGlobalPreferences,
  taxRate: 0.07,
  standardDailyHours: 8,
  maxDailyHours: 12,
  overtimeMultiplier: 1.5,
  todaySales: 0,
  todayOrders: 0,
  categories: initialCategories,
  products: initialProducts,
  vendors: initialVendors,
  purchaseOrders: initialPurchaseOrders,
  customers: initialCustomers,
  customerActivityRecords: initialCustomerActivityRecords,
  staffRecords: initialStaffRecords,
  meetings: initialMeetings,
  appointments: initialAppointments,
  orders: initialOrders,
  returns: initialReturns,
  orderCustomFields: initialOrderCustomFields,
  registerSession: initialRegisterSession,
  invoices: initialInvoices,
  restaurantTables: initialRestaurantTables,
  kitchenTickets: initialKitchenTickets,
  restaurantReservations: initialRestaurantReservations,
  salonServices: initialSalonServices,
  salonBookings: initialSalonBookings,
  priceBookItems: initialPriceBookItems,
  fieldJobs: initialFieldJobs,
  fieldEstimates: initialFieldEstimates,
  deliverySubscriptions: initialDeliverySubscriptions,
  routeManifests: initialRouteManifests,
  shiftPlans: initialShiftPlans,
  attendanceSessions: initialAttendanceSessions,
  leaveRequests: initialLeaveRequests,
  payrollRecords: [],
  departmentChanges: initialDepartmentChanges,
  counterRecords: initialCounterRecords,
  userAccounts: initialUserAccounts,
  userAccountAuditRecords: initialUserAccountAuditRecords,
  deploymentAuditRecords: initialDeploymentAuditRecords,
  tipsPoolBalance: 0,

  setSyncStatus(status: StoreSyncStatusRecord): void {
    set({
      syncStatus: status
    });
  },

  setGlobalPreferences(input: SetGlobalPreferencesInput): void {
    const locale = input.locale.trim() || initialGlobalPreferences.locale;
    const currency = input.currency.trim().toUpperCase() || initialGlobalPreferences.currency;
    const timezone = input.timezone.trim() || initialGlobalPreferences.timezone;
    const dateStyle = input.dateStyle;

    set({
      globalPreferences: {
        locale,
        currency,
        timezone,
        dateStyle
      }
    });
  },

  setDeploymentProfile(input: SetDeploymentProfileInput): void {
    const enabledIndustries = Array.from(
      new Set(input.enabledIndustries.length > 0 ? [...input.enabledIndustries, input.primaryIndustry] : [input.primaryIndustry])
    );
    const enabledFeatures = input.enabledFeatures.length > 0 ? input.enabledFeatures : initialStoreProfile.enabledFeatures;

    set((state) => ({
      storeProfile: {
        ...state.storeProfile,
        storeName: input.storeName?.trim() || state.storeProfile.storeName,
        storeCode: input.storeCode?.trim() || state.storeProfile.storeCode,
        address: input.address?.trim() || state.storeProfile.address,
        businessType: input.businessType.trim() || state.storeProfile.businessType,
        primaryIndustry: input.primaryIndustry,
        enabledIndustries,
        enabledFeatures,
        deploymentSetupCompletedAt: new Date().toISOString()
      }
    }));
  },

  resetDeploymentSetup(changedBy = 'system'): void {
    const normalizedChangedBy = changedBy.trim() || 'system';
    const nowIso = new Date().toISOString();
    const nextAuditRecord: DeploymentAuditRecord = {
      id: `deploymentAudit-${Date.now()}-setupWizardReopened`,
      action: 'setupWizardReopened',
      summary: 'Deployment setup wizard reopened from settings',
      changedBy: normalizedChangedBy,
      changedAt: nowIso
    };

    set((state) => ({
      storeProfile: {
        ...state.storeProfile,
        deploymentSetupCompletedAt: null
      },
      deploymentAuditRecords: [nextAuditRecord, ...state.deploymentAuditRecords]
    }));
  },

  getStoreSnapshot(): StoreOpsSnapshot {
    return cloneSnapshot(getStoreSnapshotFromState(get()));
  },

  hydrateStoreSnapshot(snapshot: StoreOpsSnapshot): void {
    if (!isStoreOpsSnapshot(snapshot)) {
      return;
    }

    const nextSnapshot = cloneSnapshot(snapshot);

    set({
      ...nextSnapshot,
      storeProfile: {
        ...nextSnapshot.storeProfile,
        deploymentSetupCompletedAt: nextSnapshot.storeProfile.deploymentSetupCompletedAt ?? null
      },
      globalPreferences: nextSnapshot.globalPreferences ?? initialGlobalPreferences,
      vendors: nextSnapshot.vendors ?? [],
      purchaseOrders: nextSnapshot.purchaseOrders ?? [],
      customerActivityRecords: nextSnapshot.customerActivityRecords ?? [],
      appointments: nextSnapshot.appointments ?? [],
      returns: nextSnapshot.returns ?? [],
      orderCustomFields: nextSnapshot.orderCustomFields ?? [],
      invoices: nextSnapshot.invoices ?? [],
      restaurantTables: nextSnapshot.restaurantTables ?? [],
      kitchenTickets: nextSnapshot.kitchenTickets ?? [],
      restaurantReservations: nextSnapshot.restaurantReservations ?? [],
      salonServices: nextSnapshot.salonServices ?? [],
      salonBookings: nextSnapshot.salonBookings ?? [],
      priceBookItems: nextSnapshot.priceBookItems ?? [],
      fieldJobs: nextSnapshot.fieldJobs ?? [],
      fieldEstimates: nextSnapshot.fieldEstimates ?? [],
      deliverySubscriptions: nextSnapshot.deliverySubscriptions ?? [],
      routeManifests: nextSnapshot.routeManifests ?? [],
      deploymentAuditRecords: nextSnapshot.deploymentAuditRecords ?? []
    });

    if (nextSnapshot.orgHierarchy) {
      useOrgHierarchyStore.getState().hydrateHierarchySnapshot(nextSnapshot.orgHierarchy);
    }
  },

  addCategory(input: AddCategoryInput): void {
    const normalizedName = input.name.trim();

    if (!normalizedName) {
      return;
    }

    const alreadyExists = get()
      .categories.some((category) => category.name.toLowerCase() === normalizedName.toLowerCase());

    if (alreadyExists) {
      return;
    }

    const nextCategory: CategoryRecord = {
      id: `category-${normalizedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: normalizedName,
      isActive: true
    };

    set((state) => ({
      categories: [nextCategory, ...state.categories]
    }));
  },

  addProduct(input: AddProductInput): void {
    const normalizedName = input.name.trim();

    if (!normalizedName) {
      return;
    }

    const nextProduct: ProductRecord = {
      id: `product-${normalizedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: normalizedName,
      category: input.category.trim() || 'General',
      price: sanitizeMoney(input.price),
      stock: Math.max(0, Math.floor(input.stock)),
      reorderLevel: Math.max(0, Math.floor(input.reorderLevel))
    };

    set((state) => ({
      products: [nextProduct, ...state.products]
    }));
  },

  importProducts(inputs: ImportProductInput[]): void {
    inputs.forEach((input) => {
      get().addProduct({
        name: input.name,
        category: input.category?.trim() || 'General',
        price: input.price ?? 0,
        stock: input.stock ?? 0,
        reorderLevel: input.reorderLevel ?? 0
      });
    });
  },

  addVendor(input: AddVendorInput): void {
    const normalizedName = input.name.trim();

    if (!normalizedName) {
      return;
    }

    const nextVendor: VendorRecord = {
      id: `vendor-${normalizedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: normalizedName,
      contactName: input.contactName?.trim() ?? '',
      phone: input.phone?.trim() ?? '',
      email: input.email?.trim() ?? '',
      leadTimeDays: Math.max(0, Math.round(input.leadTimeDays ?? 0)),
      paymentTerms: input.paymentTerms?.trim() ?? 'Net 30',
      notes: input.notes?.trim() ?? '',
      isActive: true
    };

    set((state) => ({
      vendors: [nextVendor, ...state.vendors]
    }));
  },

  importVendors(inputs: ImportVendorInput[]): void {
    inputs.forEach((input) => {
      get().addVendor(input);
    });
  },

  createPurchaseOrder(input: CreatePurchaseOrderInput): void {
    const vendor = get().vendors.find((vendorRecord) => vendorRecord.id === input.vendorId);
    const normalizedExpectedDate = input.expectedDate.trim();

    if (!vendor || !normalizedExpectedDate || input.lineItems.length === 0) {
      return;
    }

    const nextLineItems: PurchaseOrderLineItemRecord[] = input.lineItems
      .map((lineItem) => {
        const product = get().products.find((productRecord) => productRecord.id === lineItem.productId);

        if (!product) {
          return null;
        }

        const quantityOrdered = Math.max(1, Math.round(lineItem.quantityOrdered));
        const unitCost = sanitizeMoney(lineItem.unitCost);

        return {
          productId: product.id,
          productName: product.name,
          quantityOrdered,
          quantityReceived: 0,
          unitCost
        };
      })
      .filter((lineItem): lineItem is PurchaseOrderLineItemRecord => lineItem !== null);

    if (!nextLineItems.length) {
      return;
    }

    const nowIso = new Date().toISOString();
    const nextPurchaseOrder: PurchaseOrderRecord = {
      id: `purchase-order-${Date.now()}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      createdAt: nowIso,
      updatedAt: nowIso,
      expectedDate: normalizedExpectedDate,
      status: 'draft',
      note: input.note?.trim() ?? '',
      totalCost: sanitizeMoney(nextLineItems.reduce((sum, lineItem) => sum + lineItem.quantityOrdered * lineItem.unitCost, 0)),
      lineItems: nextLineItems
    };

    set((state) => ({
      purchaseOrders: [nextPurchaseOrder, ...state.purchaseOrders]
    }));
  },

  setPurchaseOrderStatus(purchaseOrderId: string, status: PurchaseOrderStatus): void {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((purchaseOrderRecord) =>
        purchaseOrderRecord.id === purchaseOrderId
          ? {
              ...purchaseOrderRecord,
              status,
              updatedAt: new Date().toISOString()
            }
          : purchaseOrderRecord
      )
    }));
  },

  receivePurchaseOrderItems(purchaseOrderId: string, receivedItems: Array<{ productId: string; quantity: number }>): void {
    if (!receivedItems.length) {
      return;
    }

    const purchaseOrder = get().purchaseOrders.find((purchaseOrderRecord) => purchaseOrderRecord.id === purchaseOrderId);

    if (!purchaseOrder || purchaseOrder.status === 'cancelled') {
      return;
    }

    const receivedByProductId = new Map(
      receivedItems.map((receivedItem) => [receivedItem.productId, Math.max(0, Math.round(receivedItem.quantity))])
    );

    const appliedReceipts = new Map<string, number>();
    const nextLineItems = purchaseOrder.lineItems.map((lineItem) => {
      const incomingQuantity = receivedByProductId.get(lineItem.productId) ?? 0;
      const remainingQuantity = Math.max(0, lineItem.quantityOrdered - lineItem.quantityReceived);
      const appliedQuantity = Math.min(remainingQuantity, incomingQuantity);

      if (appliedQuantity > 0) {
        appliedReceipts.set(lineItem.productId, appliedQuantity);
      }

      return {
        ...lineItem,
        quantityReceived: lineItem.quantityReceived + appliedQuantity
      };
    });

    if (!appliedReceipts.size) {
      return;
    }

    const isFullyReceived = nextLineItems.every((lineItem) => lineItem.quantityReceived >= lineItem.quantityOrdered);
    const nextStatus: PurchaseOrderStatus = isFullyReceived ? 'received' : 'partiallyReceived';

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((purchaseOrderRecord) =>
        purchaseOrderRecord.id === purchaseOrderId
          ? {
              ...purchaseOrderRecord,
              lineItems: nextLineItems,
              status: nextStatus,
              updatedAt: new Date().toISOString()
            }
          : purchaseOrderRecord
      ),
      products: state.products.map((productRecord) => {
        const appliedQuantity = appliedReceipts.get(productRecord.id);

        if (!appliedQuantity) {
          return productRecord;
        }

        return {
          ...productRecord,
          stock: productRecord.stock + appliedQuantity
        };
      })
    }));
  },

  addCustomer(input: AddCustomerInput): void {
    const normalizedName = input.fullName.trim();

    if (!normalizedName) {
      return;
    }

    const nextCustomer: CustomerRecord = {
      id: `customer-${normalizedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      fullName: normalizedName,
      phone: input.phone.trim(),
      email: input.email.trim(),
      loyaltyPoints: 0,
      creditBalance: 0
    };

    const nowIso = new Date().toISOString();
    const customerActivityRecord: CustomerActivityRecord = {
      id: `customerActivity-${Date.now()}-created`,
      customerId: nextCustomer.id,
      customerName: nextCustomer.fullName,
      activityType: 'customerCreated',
      summary: 'Customer profile created',
      amount: 0,
      points: 0,
      occurredAt: nowIso,
      referenceId: ''
    };

    set((state) => ({
      customers: [nextCustomer, ...state.customers],
      customerActivityRecords: [customerActivityRecord, ...state.customerActivityRecords]
    }));
  },

  importCustomers(inputs: ImportCustomerInput[]): void {
    const nextCustomers: CustomerRecord[] = [];
    const nextActivityRecords: CustomerActivityRecord[] = [];
    const nowIso = new Date().toISOString();

    inputs.forEach((input, index) => {
      const normalizedName = input.fullName.trim();

      if (!normalizedName) {
        return;
      }

      const nextCustomer: CustomerRecord = {
        id: `customer-${normalizedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index + 1}`,
        fullName: normalizedName,
        phone: input.phone?.trim() ?? '',
        email: input.email?.trim() ?? '',
        loyaltyPoints: Math.max(0, Math.floor(input.loyaltyPoints ?? 0)),
        creditBalance: sanitizeMoney(input.creditBalance ?? 0)
      };

      nextCustomers.push(nextCustomer);
      nextActivityRecords.push({
        id: `customerActivity-${Date.now()}-${index + 1}-created`,
        customerId: nextCustomer.id,
        customerName: nextCustomer.fullName,
        activityType: 'customerCreated',
        summary: 'Customer profile imported',
        amount: 0,
        points: 0,
        occurredAt: nowIso,
        referenceId: ''
      });
    });

    if (!nextCustomers.length) {
      return;
    }

    set((state) => ({
      customers: [...nextCustomers, ...state.customers],
      customerActivityRecords: [...nextActivityRecords, ...state.customerActivityRecords]
    }));
  },

  addStaffMember(input: AddStaffInput): void {
    const normalizedName = input.fullName.trim();
    const normalizedRole = input.role.trim();
    const normalizedDepartment = input.department.trim().toLowerCase();
    const normalizedLocation = input.assignedLocation.trim();

    if (!normalizedName || !normalizedRole || !normalizedDepartment || !normalizedLocation || !input.joinedOn) {
      return;
    }

    const createdBy = input.createdBy?.trim() || 'systemAdmin';
    const nextStaff: StaffRecord = {
      id: `staff-${normalizedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      fullName: normalizedName,
      role: normalizedRole,
      department: normalizedDepartment,
      assignedLocation: normalizedLocation,
      joinedOn: input.joinedOn,
      isActive: true,
      monthlySalary: sanitizeMoney(input.monthlySalary),
      loanBalance: sanitizeMoney(input.loanBalance ?? 0),
      isClockedIn: false,
      lastAttendanceActionAt: null,
      breakStartedAt: null,
      breakMinutesToday: 0,
      commissionRate: Math.max(0, Math.min(1, input.commissionRate ?? 0)),
      totalSalesAmount: 0,
      totalSalesCount: 0,
      commissionEarned: 0,
      tipsEarned: 0
    };

    const departmentChange: DepartmentChangeRecord = {
      id: `departmentChange-${Date.now()}-${nextStaff.id}`,
      staffId: nextStaff.id,
      staffName: nextStaff.fullName,
      fromDepartment: '',
      toDepartment: normalizedDepartment,
      reason: 'Initial department assignment',
      changedBy: createdBy,
      changeMode: 'onboarding',
      changedAt: new Date().toISOString()
    };

    set((state) => ({
      staffRecords: [nextStaff, ...state.staffRecords],
      departmentChanges: [departmentChange, ...state.departmentChanges]
    }));
  },

  deactivateStaffMember(staffId: string): void {
    const staff = get().staffRecords.find((record) => record.id === staffId);

    if (!staff || !staff.isActive) {
      return;
    }

    get().clockOutStaff(staffId);

    set((state) => ({
      staffRecords: state.staffRecords.map((staffRecord) => {
        if (staffRecord.id !== staffId) {
          return staffRecord;
        }

        return {
          ...staffRecord,
          isActive: false,
          isClockedIn: false,
          breakStartedAt: null,
          lastAttendanceActionAt: new Date().toISOString()
        };
      }),
      counterRecords: state.counterRecords.map((counterRecord) => {
        if (counterRecord.currentStaffId !== staffId) {
          return counterRecord;
        }

        return {
          ...counterRecord,
          currentStaffId: null,
          currentStaffName: '',
          currentTask: 'Idle',
          isOpen: false,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  reassignStaffDepartment(input: ReassignDepartmentInput): void {
    const normalizedDepartment = input.toDepartment.trim().toLowerCase();
    const normalizedReason = input.reason.trim();
    const normalizedChangedBy = input.changedBy.trim();
    const state = get();
    const staff = state.staffRecords.find((staffRecord) => staffRecord.id === input.staffId);

    if (!staff || !normalizedDepartment || !normalizedReason || !normalizedChangedBy) {
      return;
    }

    if (staff.department === normalizedDepartment) {
      return;
    }

    const departmentChange: DepartmentChangeRecord = {
      id: `departmentChange-${Date.now()}-${staff.id}`,
      staffId: staff.id,
      staffName: staff.fullName,
      fromDepartment: staff.department,
      toDepartment: normalizedDepartment,
      reason: normalizedReason,
      changedBy: normalizedChangedBy,
      changeMode: input.changeMode,
      changedAt: new Date().toISOString()
    };

    set((previous) => ({
      staffRecords: previous.staffRecords.map((staffRecord) => {
        if (staffRecord.id !== staff.id) {
          return staffRecord;
        }

        return {
          ...staffRecord,
          department: normalizedDepartment
        };
      }),
      departmentChanges: [departmentChange, ...previous.departmentChanges]
    }));
  },

  assignStaffToCounter(input: AssignCounterInput): void {
    const normalizedTask = input.task.trim();
    const state = get();
    const staff = state.staffRecords.find((staffRecord) => staffRecord.id === input.staffId);

    if (!staff || !staff.isActive || !staff.isClockedIn) {
      return;
    }

    set((previous) => ({
      counterRecords: previous.counterRecords.map((counterRecord) => {
        if (counterRecord.id !== input.counterId) {
          return counterRecord.currentStaffId === input.staffId
            ? {
                ...counterRecord,
                currentStaffId: null,
                currentStaffName: '',
                currentTask: 'Idle',
                isOpen: false,
                updatedAt: new Date().toISOString()
              }
            : counterRecord;
        }

        return {
          ...counterRecord,
          currentStaffId: staff.id,
          currentStaffName: staff.fullName,
          currentTask: normalizedTask || 'General operations',
          isOpen: true,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  setCounterTask(counterId: string, task: string): void {
    const normalizedTask = task.trim();

    if (!normalizedTask) {
      return;
    }

    set((state) => ({
      counterRecords: state.counterRecords.map((counterRecord) => {
        if (counterRecord.id !== counterId) {
          return counterRecord;
        }

        return {
          ...counterRecord,
          currentTask: normalizedTask,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  releaseCounter(counterId: string): void {
    set((state) => ({
      counterRecords: state.counterRecords.map((counterRecord) => {
        if (counterRecord.id !== counterId) {
          return counterRecord;
        }

        return {
          ...counterRecord,
          currentStaffId: null,
          currentStaffName: '',
          currentTask: 'Idle',
          isOpen: false,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  addUserAccount(input: AddUserAccountInput): void {
    const normalizedUsername = input.username.trim().toLowerCase();
    const normalizedFullName = input.fullName.trim();
    const normalizedChangedBy = input.changedBy.trim();

    if (!normalizedUsername || !normalizedFullName || !normalizedChangedBy) {
      return;
    }

    const state = get();
    const usernameExists = state.userAccounts.some(
      (userAccountRecord) => userAccountRecord.username.toLowerCase() === normalizedUsername
    );

    if (usernameExists) {
      return;
    }

    const linkedStaff = state.staffRecords.find((staffRecord) => staffRecord.id === input.linkedStaffId);
    const nowIso = new Date().toISOString();

    const nextUserAccount: UserAccountRecord = {
      id: input.id ?? `user-${Date.now()}`,
      username: normalizedUsername,
      fullName: normalizedFullName,
      role: input.role,
      status: input.status ?? 'active',
      grantedFeatureKeys: input.grantedFeatureKeys ?? [],
      revokedFeatureKeys: input.revokedFeatureKeys ?? [],
      linkedStaffId: linkedStaff?.id ?? null,
      linkedStaffName: linkedStaff?.fullName ?? '',
      createdAt: input.createdAt ?? nowIso,
      updatedAt: input.updatedAt ?? nowIso,
      lastLoginAt: input.lastLoginAt ?? null,
      passwordUpdatedAt: input.passwordUpdatedAt ?? nowIso
    };

    const nextAuditRecord: UserAccountAuditRecord = {
      id: `userAccountAudit-${Date.now()}-created`,
      userAccountId: nextUserAccount.id,
      username: nextUserAccount.username,
      action: 'created',
      summary: `Created account with role ${nextUserAccount.role}`,
      changedBy: normalizedChangedBy,
      changedAt: nowIso
    };

    set((previous) => ({
      userAccounts: [nextUserAccount, ...previous.userAccounts],
      userAccountAuditRecords: [nextAuditRecord, ...previous.userAccountAuditRecords]
    }));
  },

  setUserAccountsSnapshot(userAccounts: UserAccountRecord[]): void {
    set({
      userAccounts
    });
  },

  setUserAccountRole(userAccountId: string, role: UserAccountRole, changedBy: string): void {
    const normalizedChangedBy = changedBy.trim();
    const currentUserAccount = get().userAccounts.find((userAccountRecord) => userAccountRecord.id === userAccountId);

    if (!currentUserAccount || currentUserAccount.role === role || !normalizedChangedBy) {
      return;
    }

    const nowIso = new Date().toISOString();

    const nextAuditRecord: UserAccountAuditRecord = {
      id: `userAccountAudit-${Date.now()}-roleUpdated`,
      userAccountId: currentUserAccount.id,
      username: currentUserAccount.username,
      action: 'roleUpdated',
      summary: `Role updated from ${currentUserAccount.role} to ${role}`,
      changedBy: normalizedChangedBy,
      changedAt: nowIso
    };

    set((previous) => ({
      userAccounts: previous.userAccounts.map((userAccountRecord) => {
        if (userAccountRecord.id !== userAccountId) {
          return userAccountRecord;
        }

        return {
          ...userAccountRecord,
          role,
          updatedAt: nowIso
        };
      }),
      userAccountAuditRecords: [nextAuditRecord, ...previous.userAccountAuditRecords]
    }));
  },

  setUserAccountStatus(userAccountId: string, status: UserAccountStatus, changedBy: string): void {
    const normalizedChangedBy = changedBy.trim();
    const currentUserAccount = get().userAccounts.find((userAccountRecord) => userAccountRecord.id === userAccountId);

    if (!currentUserAccount || currentUserAccount.status === status || !normalizedChangedBy) {
      return;
    }

    const nowIso = new Date().toISOString();

    const nextAuditRecord: UserAccountAuditRecord = {
      id: `userAccountAudit-${Date.now()}-statusUpdated`,
      userAccountId: currentUserAccount.id,
      username: currentUserAccount.username,
      action: 'statusUpdated',
      summary: `Status updated from ${currentUserAccount.status} to ${status}`,
      changedBy: normalizedChangedBy,
      changedAt: nowIso
    };

    set((previous) => ({
      userAccounts: previous.userAccounts.map((userAccountRecord) => {
        if (userAccountRecord.id !== userAccountId) {
          return userAccountRecord;
        }

        return {
          ...userAccountRecord,
          status,
          updatedAt: nowIso
        };
      }),
      userAccountAuditRecords: [nextAuditRecord, ...previous.userAccountAuditRecords]
    }));
  },

  setUserAccountFeatureOverrides(
    userAccountId: string,
    grantedFeatureKeys: DeploymentFeatureKey[],
    revokedFeatureKeys: DeploymentFeatureKey[],
    changedBy: string
  ): void {
    const normalizedChangedBy = changedBy.trim();
    const currentUserAccount = get().userAccounts.find((userAccountRecord) => userAccountRecord.id === userAccountId);

    if (!currentUserAccount || !normalizedChangedBy) {
      return;
    }

    const nextGrantedFeatureKeys = Array.from(new Set(grantedFeatureKeys));
    const nextRevokedFeatureKeys = Array.from(new Set(revokedFeatureKeys.filter((featureKey) => !nextGrantedFeatureKeys.includes(featureKey))));

    if (
      JSON.stringify(currentUserAccount.grantedFeatureKeys) === JSON.stringify(nextGrantedFeatureKeys) &&
      JSON.stringify(currentUserAccount.revokedFeatureKeys) === JSON.stringify(nextRevokedFeatureKeys)
    ) {
      return;
    }

    const nowIso = new Date().toISOString();

    const nextAuditRecord: UserAccountAuditRecord = {
      id: `userAccountAudit-${Date.now()}-featureOverridesUpdated`,
      userAccountId: currentUserAccount.id,
      username: currentUserAccount.username,
      action: 'featureOverridesUpdated',
      summary: `Permission overrides updated. Granted: ${nextGrantedFeatureKeys.length}, Revoked: ${nextRevokedFeatureKeys.length}`,
      changedBy: normalizedChangedBy,
      changedAt: nowIso
    };

    set((previous) => ({
      userAccounts: previous.userAccounts.map((userAccountRecord) => {
        if (userAccountRecord.id !== userAccountId) {
          return userAccountRecord;
        }

        return {
          ...userAccountRecord,
          grantedFeatureKeys: nextGrantedFeatureKeys,
          revokedFeatureKeys: nextRevokedFeatureKeys,
          updatedAt: nowIso
        };
      }),
      userAccountAuditRecords: [nextAuditRecord, ...previous.userAccountAuditRecords]
    }));
  },

  resetUserAccountPassword(userAccountId: string, changedBy: string): void {
    const normalizedChangedBy = changedBy.trim();
    const currentUserAccount = get().userAccounts.find((userAccountRecord) => userAccountRecord.id === userAccountId);

    if (!currentUserAccount || !normalizedChangedBy) {
      return;
    }

    const nowIso = new Date().toISOString();

    const nextAuditRecord: UserAccountAuditRecord = {
      id: `userAccountAudit-${Date.now()}-passwordReset`,
      userAccountId: currentUserAccount.id,
      username: currentUserAccount.username,
      action: 'passwordReset',
      summary: 'Password reset requested',
      changedBy: normalizedChangedBy,
      changedAt: nowIso
    };

    set((previous) => ({
      userAccounts: previous.userAccounts.map((userAccountRecord) => {
        if (userAccountRecord.id !== userAccountId) {
          return userAccountRecord;
        }

        return {
          ...userAccountRecord,
          updatedAt: nowIso,
          passwordUpdatedAt: nowIso
        };
      }),
      userAccountAuditRecords: [nextAuditRecord, ...previous.userAccountAuditRecords]
    }));
  },

  setOrderStatus(orderId: string, status: OrderStatus, statusNote = ''): void {
    const normalizedStatusNote = statusNote.trim();
    const state = get();
    const order = state.orders.find((orderRecord) => orderRecord.id === orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const isReversal =
      (status === 'refunded' || status === 'cancelled') &&
      order.status === 'completed';

    set((previous) => ({
      orders: previous.orders.map((orderRecord) => {
        if (orderRecord.id !== orderId) {
          return orderRecord;
        }

        return {
          ...orderRecord,
          status,
          statusNote: normalizedStatusNote,
          updatedAt: new Date().toISOString()
        };
      }),
      products: isReversal
        ? previous.products.map((product) => {
            const orderItem = order.items.find((item) => item.productId === product.id);

            if (!orderItem) {
              return product;
            }

            return {
              ...product,
              stock: product.stock + orderItem.quantity
            };
          })
        : previous.products,
      todaySales: isReversal
        ? roundCurrency(Math.max(0, previous.todaySales - order.totalAmount))
        : previous.todaySales,
      todayOrders: isReversal
        ? Math.max(0, previous.todayOrders - 1)
        : previous.todayOrders,
      registerSession:
        isReversal && order.paymentMethod === 'cash'
          ? {
              ...previous.registerSession,
              currentCash: roundCurrency(
                Math.max(0, previous.registerSession.currentCash - order.totalAmount)
              )
            }
          : previous.registerSession,
      customers: isReversal && order.customerId
        ? previous.customers.map((customerRecord) => {
            if (customerRecord.id !== order.customerId) {
              return customerRecord;
            }

            const earnedPoints = Math.floor(order.totalAmount / 10);

            return {
              ...customerRecord,
              loyaltyPoints: Math.max(0, customerRecord.loyaltyPoints - earnedPoints)
            };
          })
        : previous.customers
    }));
  },

  setOrderDelivery(orderId: string, deliveryStatus: DeliveryStatus, deliveryDate = null): void {
    set((state) => ({
      orders: state.orders.map((orderRecord) => {
        if (orderRecord.id !== orderId) {
          return orderRecord;
        }

        return {
          ...orderRecord,
          deliveryStatus,
          deliveryDate,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  addOrderCustomField(input: AddOrderCustomFieldInput): void {
    const normalizedLabel = input.label.trim();

    if (!normalizedLabel) {
      return;
    }

    const normalizedKey = normalizedLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!normalizedKey) {
      return;
    }

    const fieldExists = get().orderCustomFields.some((fieldRecord) => fieldRecord.key === normalizedKey);

    if (fieldExists) {
      return;
    }

    const nextField: OrderCustomFieldRecord = {
      id: `orderCustomField-${Date.now()}-${normalizedKey}`,
      key: normalizedKey,
      label: normalizedLabel,
      type: input.type
    };

    set((state) => ({
      orderCustomFields: [nextField, ...state.orderCustomFields]
    }));
  },

  importOrders(inputs: ImportOrderInput[]): void {
    if (!inputs.length) {
      return;
    }

    const state = get();
    const paymentMethods: PaymentMethod[] = ['cash', 'card', 'digital'];
    const orderStatuses: OrderStatus[] = ['completed', 'cancelled', 'refunded'];
    const existingOrderIds = new Set(state.orders.map((orderRecord) => orderRecord.id));
    const nowIso = new Date().toISOString();
    const importedCustomFieldsMap = new Map<string, OrderCustomFieldRecord>();
    const nextOrders: OrderRecord[] = [];

    inputs.forEach((input, index) => {
      const totalAmount = sanitizeMoney(input.totalAmount);

      if (!totalAmount) {
        return;
      }

      const providedId = input.id?.trim() ?? '';
      const generatedId = `order-import-${Date.now()}-${index + 1}`;
      const nextOrderId = providedId || generatedId;
      const finalOrderId = existingOrderIds.has(nextOrderId) ? `${nextOrderId}-${Date.now()}` : nextOrderId;
      existingOrderIds.add(finalOrderId);

      const status = orderStatuses.includes(input.status ?? 'completed') ? input.status ?? 'completed' : 'completed';
      const paymentMethod = paymentMethods.includes(input.paymentMethod) ? input.paymentMethod : 'cash';
      const parsedCreatedAt = input.createdAt ? new Date(input.createdAt) : null;
      const createdAt = parsedCreatedAt && !Number.isNaN(parsedCreatedAt.getTime()) ? parsedCreatedAt.toISOString() : nowIso;

      const customFieldValues = Object.entries(input.customFieldValues ?? {}).reduce<Record<string, string>>(
        (accumulator, [key, value]) => {
          const normalizedKey = key
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
          const normalizedValue = value.trim();

          if (!normalizedKey || !normalizedValue) {
            return accumulator;
          }

          if (!state.orderCustomFields.some((fieldRecord) => fieldRecord.key === normalizedKey)) {
            importedCustomFieldsMap.set(normalizedKey, {
              id: `orderCustomField-import-${normalizedKey}`,
              key: normalizedKey,
              label: normalizedKey
                .split('_')
                .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
                .join(' '),
              type: 'text'
            });
          }

          accumulator[normalizedKey] = normalizedValue;
          return accumulator;
        },
        {}
      );

      nextOrders.push({
        id: finalOrderId,
        createdAt,
        updatedAt: nowIso,
        status,
        statusNote: 'Imported order',
        items: [],
        subTotal: totalAmount,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount,
        paymentMethod,
        customerId: null,
        customerName: input.customerName.trim() || 'Unknown Customer',
        customFieldValues,
        deliveryStatus: input.deliveryStatus ?? 'notRequired',
        deliveryDate: input.deliveryDate ?? null
      });
    });

    if (!nextOrders.length) {
      return;
    }

    const importedTotalAmount = nextOrders.reduce((sum, orderRecord) => sum + orderRecord.totalAmount, 0);

    set((previous) => ({
      orders: [...nextOrders, ...previous.orders],
      todayOrders: previous.todayOrders + nextOrders.length,
      todaySales: roundCurrency(previous.todaySales + importedTotalAmount),
      orderCustomFields: [
        ...Array.from(importedCustomFieldsMap.values()).filter(
          (fieldRecord) => !previous.orderCustomFields.some((existingField) => existingField.key === fieldRecord.key)
        ),
        ...previous.orderCustomFields
      ]
    }));
  },

  processCheckout(input: CheckoutInput): { ok: true; orderTotal: number; orderId: string } {
    const state = get();
    const shouldDeductStock = !input.skipStockDeduction;

    if (!state.registerSession.isOpen) {
      throw new Error('Open register session before checkout');
    }

    let subTotal = 0;

    const nextProducts = shouldDeductStock
      ? state.products.map((product) => {
          const checkoutItem = input.items.find((item) => item.productId === product.id);

          if (!checkoutItem) {
            return product;
          }

          const soldQuantity = Math.max(0, Math.min(product.stock, Math.floor(checkoutItem.quantity)));

          if (soldQuantity === 0) {
            return product;
          }

          subTotal += product.price * soldQuantity;

          return {
            ...product,
            stock: product.stock - soldQuantity
          };
        })
      : state.products.map((product) => {
          const checkoutItem = input.items.find((item) => item.productId === product.id);

          if (!checkoutItem) {
            return product;
          }

          const soldQuantity = Math.max(0, Math.floor(checkoutItem.quantity));

          if (soldQuantity === 0) {
            return product;
          }

          subTotal += product.price * soldQuantity;
          return product;
        });

    const discountAmount = sanitizeMoney(Math.min(input.discountAmount ?? 0, subTotal));
    const taxableAmount = Math.max(0, subTotal - discountAmount);
    const taxAmount = roundCurrency(taxableAmount * state.taxRate);
    const totalAmount = roundCurrency(taxableAmount + taxAmount);

    const orderItems: OrderItemRecord[] = input.items
      .map((item) => {
        const product = state.products.find((record) => record.id === item.productId);

        if (!product) {
          return null;
        }

        const quantity = shouldDeductStock
          ? Math.max(0, Math.min(product.stock, Math.floor(item.quantity)))
          : Math.max(0, Math.floor(item.quantity));

        if (quantity <= 0) {
          return null;
        }

        return {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          lineTotal: roundCurrency(product.price * quantity)
        };
      })
      .filter((item): item is OrderItemRecord => Boolean(item));

    if (!orderItems.length || totalAmount <= 0) {
      throw new Error('Cart has no valid items');
    }

    const customer = state.customers.find((record) => record.id === input.customerId);
    const orderId = `order-${Date.now()}`;
    const nextOrder: OrderRecord = {
      id: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed',
      statusNote: '',
      items: orderItems,
      subTotal: roundCurrency(subTotal),
      discountAmount,
      taxAmount,
      totalAmount,
      paymentMethod: input.paymentMethod,
      customerId: customer?.id ?? null,
      customerName: customer?.fullName ?? 'Walk In Customer',
      customFieldValues: {},
      deliveryStatus: 'notRequired',
      deliveryDate: null
    };

    const earnedPoints = Math.floor(totalAmount / 10);
    const checkoutCustomerActivityRecord: CustomerActivityRecord | null = customer
      ? {
          id: `customerActivity-${Date.now()}-purchase`,
          customerId: customer.id,
          customerName: customer.fullName,
          activityType: 'purchaseCompleted',
          summary: `Order completed / ${orderItems.length} items / total $${totalAmount.toFixed(2)}`,
          amount: totalAmount,
          points: earnedPoints,
          occurredAt: nextOrder.createdAt,
          referenceId: orderId
        }
      : null;

    set((previous) => ({
      products: nextProducts,
      todayOrders: previous.todayOrders + 1,
      todaySales: roundCurrency(previous.todaySales + totalAmount),
      orders: [nextOrder, ...previous.orders],
      customerActivityRecords: checkoutCustomerActivityRecord
        ? [checkoutCustomerActivityRecord, ...previous.customerActivityRecords]
        : previous.customerActivityRecords,
      customers: previous.customers.map((customerRecord) => {
        if (customerRecord.id !== customer?.id) {
          return customerRecord;
        }

        return {
          ...customerRecord,
          loyaltyPoints: customerRecord.loyaltyPoints + earnedPoints
        };
      }),
      registerSession:
        input.paymentMethod === 'cash'
          ? {
              ...previous.registerSession,
              currentCash: roundCurrency(previous.registerSession.currentCash + totalAmount)
            }
          : previous.registerSession
    }));

    const selectedStaffId =
      input.cashierStaffId ??
      state.staffRecords.find((staffRecord) => staffRecord.isActive && staffRecord.isClockedIn)?.id;

    if (selectedStaffId) {
      get().recordStaffSale(selectedStaffId, totalAmount);
      const selectedCounter = getStaffCounter(state.counterRecords, selectedStaffId);

      if (selectedCounter) {
        set((previous) => ({
          counterRecords: previous.counterRecords.map((counterRecord) => {
            if (counterRecord.id !== selectedCounter.id) {
              return counterRecord;
            }

            return {
              ...counterRecord,
              currentTask: 'Processing checkout',
              ordersHandledToday: counterRecord.ordersHandledToday + 1,
              isOpen: true,
              updatedAt: new Date().toISOString()
            };
          })
        }));
      }
    }

    return { ok: true, orderTotal: totalAmount, orderId };
  },

  createOrderReturn(input: CreateOrderReturnInput): { ok: true; returnId: string; replacementOrderId: string | null } {
    const state = get();
    const orderRecord = state.orders.find((order) => order.id === input.orderId);
    const normalizedReason = input.reason.trim();

    if (!orderRecord || !normalizedReason || input.lineItems.length === 0) {
      throw new Error('Valid order, reason, and return lines are required');
    }

    const nowIso = new Date().toISOString();
    const processedReturnItems: ReturnLineItemRecord[] = [];
    const restockByProductId = new Map<string, number>();
    const exchangeByProductId = new Map<string, number>();

    input.lineItems.forEach((lineItem) => {
      const orderItem = orderRecord.items.find((item) => item.productId === lineItem.productId);

      if (!orderItem) {
        return;
      }

      const quantity = Math.max(0, Math.min(orderItem.quantity, Math.round(lineItem.quantity)));

      if (quantity <= 0) {
        return;
      }

      const amount = sanitizeMoney(orderItem.unitPrice * quantity);
      processedReturnItems.push({
        productId: orderItem.productId,
        productName: orderItem.productName,
        quantity,
        amount
      });

      if (input.restocked) {
        restockByProductId.set(orderItem.productId, (restockByProductId.get(orderItem.productId) ?? 0) + quantity);
      }
    });

    if (!processedReturnItems.length) {
      throw new Error('Return lines do not match the selected order');
    }

    const returnAmount = sanitizeMoney(processedReturnItems.reduce((sum, lineItem) => sum + lineItem.amount, 0));
    let replacementOrderId: string | null = null;
    let replacementOrder: OrderRecord | null = null;

    if (input.resolution === 'exchange') {
      const replacementItems: OrderItemRecord[] = (input.exchangeItems ?? [])
        .map((exchangeItem) => {
          const product = state.products.find((productRecord) => productRecord.id === exchangeItem.productId);

          if (!product) {
            return null;
          }

          const quantity = Math.max(0, Math.min(product.stock, Math.round(exchangeItem.quantity)));

          if (quantity <= 0) {
            return null;
          }

          exchangeByProductId.set(product.id, (exchangeByProductId.get(product.id) ?? 0) + quantity);

          return {
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
            lineTotal: sanitizeMoney(product.price * quantity)
          };
        })
        .filter((item): item is OrderItemRecord => item !== null);

      if (replacementItems.length > 0) {
        const replacementSubTotal = sanitizeMoney(replacementItems.reduce((sum, item) => sum + item.lineTotal, 0));
        const replacementTaxAmount = sanitizeMoney(replacementSubTotal * state.taxRate);
        const replacementTotalAmount = sanitizeMoney(replacementSubTotal + replacementTaxAmount);
        replacementOrderId = `order-exchange-${Date.now()}`;
        replacementOrder = {
          id: replacementOrderId,
          createdAt: nowIso,
          updatedAt: nowIso,
          status: 'completed',
          statusNote:
            replacementTotalAmount > returnAmount
              ? `Exchange created with additional balance due ${formatMoney(replacementTotalAmount - returnAmount)}`
              : 'Created from return exchange',
          items: replacementItems,
          subTotal: replacementSubTotal,
          discountAmount: 0,
          taxAmount: replacementTaxAmount,
          totalAmount: replacementTotalAmount,
          paymentMethod: orderRecord.paymentMethod,
          customerId: orderRecord.customerId,
          customerName: orderRecord.customerName,
          customFieldValues: {
            exchangeForOrderId: orderRecord.id
          },
          deliveryStatus: 'notRequired',
          deliveryDate: null
        };
      }
    }

    const shouldMarkRefunded = returnAmount >= orderRecord.totalAmount;
    const nextOrderStatus: OrderStatus = shouldMarkRefunded ? 'refunded' : orderRecord.status;
    const nextOrderNote =
      input.resolution === 'exchange'
        ? 'Exchange processed from order management'
        : input.resolution === 'storeCredit'
          ? 'Return converted to store credit'
          : 'Refund processed from order management';

    const customerActivityRecord: CustomerActivityRecord | null = orderRecord.customerId
      ? {
          id: `customerActivity-${Date.now()}-return`,
          customerId: orderRecord.customerId,
          customerName: orderRecord.customerName,
          activityType:
            input.resolution === 'exchange'
              ? 'exchangeCompleted'
              : input.resolution === 'storeCredit'
                ? 'storeCreditIssued'
                : 'refundIssued',
          summary:
            input.resolution === 'exchange'
              ? `Exchange created against ${orderRecord.id}`
              : input.resolution === 'storeCredit'
                ? `Store credit issued against ${orderRecord.id}`
                : `Refund issued against ${orderRecord.id}`,
          amount: returnAmount,
          points: 0,
          occurredAt: nowIso,
          referenceId: orderRecord.id
        }
      : null;

    const nextReturnRecord: ReturnRecord = {
      id: `return-${Date.now()}`,
      orderId: orderRecord.id,
      customerId: orderRecord.customerId,
      customerName: orderRecord.customerName,
      reason: normalizedReason,
      resolution: input.resolution,
      restocked: input.restocked,
      amount: returnAmount,
      createdAt: nowIso,
      replacementOrderId,
      lineItems: processedReturnItems
    };

    set((previous) => ({
      returns: [nextReturnRecord, ...previous.returns],
      orders: [
        ...(replacementOrder ? [replacementOrder] : []),
        ...previous.orders.map((currentOrder) =>
          currentOrder.id === orderRecord.id
            ? {
                ...currentOrder,
                status: nextOrderStatus,
                statusNote: nextOrderNote,
                updatedAt: nowIso
              }
            : currentOrder
        )
      ],
      customerActivityRecords: customerActivityRecord
        ? [customerActivityRecord, ...previous.customerActivityRecords]
        : previous.customerActivityRecords,
      customers: previous.customers.map((customerRecord) => {
        if (customerRecord.id !== orderRecord.customerId || input.resolution !== 'storeCredit') {
          return customerRecord;
        }

        return {
          ...customerRecord,
          creditBalance: sanitizeMoney(customerRecord.creditBalance + returnAmount)
        };
      }),
      products: previous.products.map((productRecord) => {
        const restockedQuantity = restockByProductId.get(productRecord.id) ?? 0;
        const exchangedQuantity = exchangeByProductId.get(productRecord.id) ?? 0;

        if (restockedQuantity === 0 && exchangedQuantity === 0) {
          return productRecord;
        }

        return {
          ...productRecord,
          stock: Math.max(0, productRecord.stock + restockedQuantity - exchangedQuantity)
        };
      })
    }));

    return { ok: true, returnId: nextReturnRecord.id, replacementOrderId };
  },

  adjustStock(productId: string, change: number): void {
    set((state) => ({
      products: state.products.map((product) => {
        if (product.id !== productId) {
          return product;
        }

        return {
          ...product,
          stock: Math.max(0, product.stock + Math.floor(change))
        };
      })
    }));
  },

  startRegisterSession(openingCash: number): void {
    const normalizedOpeningCash = sanitizeMoney(openingCash);

    set({
      registerSession: {
        isOpen: true,
        openingCash: normalizedOpeningCash,
        currentCash: normalizedOpeningCash,
        openedAt: new Date().toISOString(),
        closedAt: null
      }
    });
  },

  endRegisterSession(): void {
    set((state) => ({
      registerSession: {
        ...state.registerSession,
        isOpen: false,
        closedAt: new Date().toISOString()
      }
    }));
  },

  addCustomerCredit(customerId: string, amount: number): void {
    const normalizedAmount = sanitizeMoney(amount);

    if (!normalizedAmount) {
      return;
    }

    const customer = get().customers.find((customerRecord) => customerRecord.id === customerId);

    if (!customer) {
      return;
    }

    const nowIso = new Date().toISOString();
    const customerActivityRecord: CustomerActivityRecord = {
      id: `customerActivity-${Date.now()}-creditAdded`,
      customerId: customer.id,
      customerName: customer.fullName,
      activityType: 'creditAdded',
      summary: `Credit added $${normalizedAmount.toFixed(2)}`,
      amount: normalizedAmount,
      points: 0,
      occurredAt: nowIso,
      referenceId: ''
    };

    set((state) => ({
      customerActivityRecords: [customerActivityRecord, ...state.customerActivityRecords],
      customers: state.customers.map((customer) => {
        if (customer.id !== customerId) {
          return customer;
        }

        return {
          ...customer,
          creditBalance: roundCurrency(customer.creditBalance + normalizedAmount)
        };
      })
    }));
  },

  redeemCustomerPoints(customerId: string, points: number): void {
    const normalizedPoints = Math.max(0, Math.floor(points));

    if (!normalizedPoints) {
      return;
    }

    const customer = get().customers.find((customerRecord) => customerRecord.id === customerId);

    if (!customer) {
      return;
    }

    const redeemedPoints = Math.min(customer.loyaltyPoints, normalizedPoints);

    if (!redeemedPoints) {
      return;
    }

    const nowIso = new Date().toISOString();
    const customerActivityRecord: CustomerActivityRecord = {
      id: `customerActivity-${Date.now()}-pointsRedeemed`,
      customerId: customer.id,
      customerName: customer.fullName,
      activityType: 'pointsRedeemed',
      summary: `Redeemed ${redeemedPoints} loyalty points`,
      amount: 0,
      points: redeemedPoints,
      occurredAt: nowIso,
      referenceId: ''
    };

    set((state) => ({
      customerActivityRecords: [customerActivityRecord, ...state.customerActivityRecords],
      customers: state.customers.map((customer) => {
        if (customer.id !== customerId) {
          return customer;
        }

        return {
          ...customer,
          loyaltyPoints: Math.max(0, customer.loyaltyPoints - redeemedPoints)
        };
      })
    }));
  },

  clockInStaff(staffId: string): void {
    const state = get();
    const staff = state.staffRecords.find((item) => item.id === staffId);

    if (!staff || !staff.isActive || staff.isClockedIn) {
      return;
    }

    set((previous) => ({
      staffRecords: previous.staffRecords.map((staffRecord) => {
        if (staffRecord.id !== staffId) {
          return staffRecord;
        }

        return {
          ...staffRecord,
          isClockedIn: true,
          breakStartedAt: null,
          lastAttendanceActionAt: new Date().toISOString()
        };
      }),
      attendanceSessions: [
        {
          id: `attendance-${Date.now()}-${staffId}`,
          staffId,
          staffName: staff.fullName,
          clockInAt: new Date().toISOString(),
          clockOutAt: null,
          breakStartedAt: null,
          breakMinutes: 0,
          totalHours: 0,
          overtimeHours: 0,
          complianceFlag: false
        },
        ...previous.attendanceSessions
      ]
    }));
  },

  clockOutStaff(staffId: string): void {
    const state = get();
    const openSession = state.attendanceSessions.find((session) => session.staffId === staffId && !session.clockOutAt);

    if (!openSession) {
      return;
    }

    set((previous) => ({
      staffRecords: previous.staffRecords.map((staffRecord) => {
        if (staffRecord.id !== staffId) {
          return staffRecord;
        }

        return {
          ...staffRecord,
          isClockedIn: false,
          breakStartedAt: null,
          lastAttendanceActionAt: new Date().toISOString()
        };
      }),
      attendanceSessions: previous.attendanceSessions.map((session) => {
        if (!openSession || session.id !== openSession.id) {
          return session;
        }

        const clockOutAt = new Date().toISOString();
        const totalHours = Math.max(0, getHoursBetween(session.clockInAt, clockOutAt) - session.breakMinutes / 60);
        const overtimeHours = Math.max(0, totalHours - previous.standardDailyHours);

        return {
          ...session,
          clockOutAt,
          breakStartedAt: null,
          totalHours,
          overtimeHours: roundCurrency(overtimeHours),
          complianceFlag: totalHours > previous.maxDailyHours
        };
      }),
      counterRecords: previous.counterRecords.map((counterRecord) => {
        if (counterRecord.currentStaffId !== staffId) {
          return counterRecord;
        }

        return {
          ...counterRecord,
          currentStaffId: null,
          currentStaffName: '',
          currentTask: 'Idle',
          isOpen: false,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  startStaffBreak(staffId: string): void {
    const state = get();
    const staff = state.staffRecords.find((record) => record.id === staffId);
    const openSession = state.attendanceSessions.find((session) => session.staffId === staffId && !session.clockOutAt);

    if (!staff || !staff.isClockedIn || staff.breakStartedAt || !openSession || openSession.breakStartedAt) {
      return;
    }

    const breakStartedAt = new Date().toISOString();

    set((previous) => ({
      staffRecords: previous.staffRecords.map((staffRecord) => {
        if (staffRecord.id !== staffId) {
          return staffRecord;
        }

        return {
          ...staffRecord,
          breakStartedAt
        };
      }),
      attendanceSessions: previous.attendanceSessions.map((session) => {
        if (session.id !== openSession.id) {
          return session;
        }

        return {
          ...session,
          breakStartedAt
        };
      }),
      counterRecords: previous.counterRecords.map((counterRecord) => {
        if (counterRecord.currentStaffId !== staffId) {
          return counterRecord;
        }

        return {
          ...counterRecord,
          currentTask: 'On break',
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  endStaffBreak(staffId: string): void {
    const state = get();
    const staff = state.staffRecords.find((record) => record.id === staffId);
    const openSession = state.attendanceSessions.find((session) => session.staffId === staffId && !session.clockOutAt);

    if (!staff?.breakStartedAt || !openSession?.breakStartedAt) {
      return;
    }

    const breakEndedAt = new Date().toISOString();
    const breakMinutes = Math.max(
      0,
      Math.round((new Date(breakEndedAt).getTime() - new Date(staff.breakStartedAt).getTime()) / (1000 * 60))
    );

    set((previous) => ({
      staffRecords: previous.staffRecords.map((staffRecord) => {
        if (staffRecord.id !== staffId) {
          return staffRecord;
        }

        return {
          ...staffRecord,
          breakStartedAt: null,
          breakMinutesToday: staffRecord.breakMinutesToday + breakMinutes
        };
      }),
      attendanceSessions: previous.attendanceSessions.map((session) => {
        if (session.id !== openSession.id) {
          return session;
        }

        return {
          ...session,
          breakStartedAt: null,
          breakMinutes: session.breakMinutes + breakMinutes
        };
      }),
      counterRecords: previous.counterRecords.map((counterRecord) => {
        if (counterRecord.currentStaffId !== staffId) {
          return counterRecord;
        }

        return {
          ...counterRecord,
          currentTask: 'Checkout lane active',
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  toggleAttendance(staffId: string): void {
    const staff = get().staffRecords.find((item) => item.id === staffId);

    if (!staff || !staff.isActive) {
      return;
    }

    if (staff.isClockedIn) {
      get().clockOutStaff(staffId);
      return;
    }

    get().clockInStaff(staffId);
  },

  addShiftPlan(input: AddShiftInput): void {
    const staff = get().staffRecords.find((item) => item.id === input.staffId);

    if (!staff || !staff.isActive || !input.date || !input.startTime || !input.endTime) {
      return;
    }

    const nextShift: ShiftPlanRecord = {
      id: `shift-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.fullName,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      roleDuringShift: input.roleDuringShift.trim() || staff.role
    };

    set((state) => ({
      shiftPlans: [nextShift, ...state.shiftPlans]
    }));
  },

  importShiftPlans(inputs: ImportShiftInput[]): void {
    const staffRecords = get().staffRecords;

    inputs.forEach((input) => {
      const staff = findStaffRecord(staffRecords, input.staffId, input.staffName);

      if (!staff) {
        return;
      }

      get().addShiftPlan({
        staffId: staff.id,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        roleDuringShift: input.roleDuringShift?.trim() || staff.role
      });
    });
  },

  addLeaveRequest(input: AddLeaveRequestInput): void {
    const staff = get().staffRecords.find((item) => item.id === input.staffId);

    if (!staff || !staff.isActive || !input.dateFrom || !input.dateTo || !input.reason.trim()) {
      return;
    }

    const nextRequest: LeaveRequestRecord = {
      id: `leave-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.fullName,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      reason: input.reason.trim(),
      status: 'pending'
    };

    set((state) => ({
      leaveRequests: [nextRequest, ...state.leaveRequests]
    }));
  },

  importLeaveRequests(inputs: ImportLeaveRequestInput[]): void {
    const staffRecords = get().staffRecords;
    const validStatuses: LeaveStatus[] = ['pending', 'approved', 'rejected'];
    const nextRequests: LeaveRequestRecord[] = [];

    inputs.forEach((input, index) => {
      const staff = findStaffRecord(staffRecords, input.staffId, input.staffName);
      const normalizedReason = input.reason.trim();

      if (!staff || !staff.isActive || !input.dateFrom || !input.dateTo || !normalizedReason) {
        return;
      }

      nextRequests.push({
        id: `leave-${Date.now()}-${index + 1}`,
        staffId: staff.id,
        staffName: staff.fullName,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        reason: normalizedReason,
        status: validStatuses.includes(input.status ?? 'pending') ? input.status ?? 'pending' : 'pending'
      });
    });

    if (!nextRequests.length) {
      return;
    }

    set((state) => ({
      leaveRequests: [...nextRequests, ...state.leaveRequests]
    }));
  },

  setLeaveStatus(leaveRequestId: string, status: LeaveStatus): void {
    set((state) => ({
      leaveRequests: state.leaveRequests.map((leaveRequest) => {
        if (leaveRequest.id !== leaveRequestId) {
          return leaveRequest;
        }

        return {
          ...leaveRequest,
          status
        };
      })
    }));
  },

  addMeeting(input: AddMeetingInput): void {
    const trimmedTitle = input.title.trim();
    const assignee = get().staffRecords.find((record) => record.id === input.assigneeId);

    if (!trimmedTitle || !assignee || !assignee.isActive || !input.date || !input.time) {
      return;
    }

    const nextMeeting: MeetingRecord = {
      id: `meeting-${Date.now()}`,
      title: trimmedTitle,
      assigneeId: assignee.id,
      assigneeName: assignee.fullName,
      date: input.date,
      time: input.time
    };

    set((state) => ({
      meetings: [nextMeeting, ...state.meetings]
    }));
  },

  importMeetings(inputs: ImportMeetingInput[]): void {
    const staffRecords = get().staffRecords;
    const nextMeetings: MeetingRecord[] = [];

    inputs.forEach((input, index) => {
      const trimmedTitle = input.title.trim();
      const assignee = findStaffRecord(staffRecords, input.assigneeId, input.assigneeName);

      if (!trimmedTitle || !assignee || !assignee.isActive || !input.date || !input.time) {
        return;
      }

      nextMeetings.push({
        id: `meeting-${Date.now()}-${index + 1}`,
        title: trimmedTitle,
        assigneeId: assignee.id,
        assigneeName: assignee.fullName,
        date: input.date,
        time: input.time
      });
    });

    if (!nextMeetings.length) {
      return;
    }

    set((state) => ({
      meetings: [...nextMeetings, ...state.meetings]
    }));
  },

  addAppointment(input: AddAppointmentInput): void {
    const trimmedTitle = input.title.trim();
    const trimmedCustomerName = input.customerName.trim();
    const trimmedNotes = input.notes?.trim() ?? '';
    const assignee = get().staffRecords.find((record) => record.id === input.assigneeId);

    if (!trimmedTitle || !trimmedCustomerName || !assignee || !assignee.isActive || !input.date || !input.startTime || !input.endTime) {
      return;
    }

    const nextAppointment: AppointmentRecord = {
      id: `appointment-${Date.now()}`,
      title: trimmedTitle,
      customerName: trimmedCustomerName,
      assigneeId: assignee.id,
      assigneeName: assignee.fullName,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      status: 'scheduled',
      notes: trimmedNotes
    };

    set((state) => ({
      appointments: [nextAppointment, ...state.appointments]
    }));
  },

  importAppointments(inputs: ImportAppointmentInput[]): void {
    const staffRecords = get().staffRecords;
    const validStatuses: AppointmentStatus[] = ['scheduled', 'completed', 'cancelled'];
    const nextAppointments: AppointmentRecord[] = [];

    inputs.forEach((input, index) => {
      const trimmedTitle = input.title.trim();
      const trimmedCustomerName = input.customerName.trim();
      const assignee = findStaffRecord(staffRecords, input.assigneeId, input.assigneeName);

      if (!trimmedTitle || !trimmedCustomerName || !assignee || !assignee.isActive || !input.date || !input.startTime || !input.endTime) {
        return;
      }

      nextAppointments.push({
        id: `appointment-${Date.now()}-${index + 1}`,
        title: trimmedTitle,
        customerName: trimmedCustomerName,
        assigneeId: assignee.id,
        assigneeName: assignee.fullName,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        status: validStatuses.includes(input.status ?? 'scheduled') ? input.status ?? 'scheduled' : 'scheduled',
        notes: input.notes?.trim() ?? ''
      });
    });

    if (!nextAppointments.length) {
      return;
    }

    set((state) => ({
      appointments: [...nextAppointments, ...state.appointments]
    }));
  },

  setAppointmentStatus(appointmentId: string, status: AppointmentStatus): void {
    set((state) => ({
      appointments: state.appointments.map((appointmentRecord) => {
        if (appointmentRecord.id !== appointmentId) {
          return appointmentRecord;
        }

        return {
          ...appointmentRecord,
          status
        };
      })
    }));
  },

  recordStaffSale(staffId: string, orderTotal: number): void {
    const normalizedTotal = sanitizeMoney(orderTotal);

    if (!normalizedTotal) {
      return;
    }

    set((state) => ({
      staffRecords: state.staffRecords.map((staffRecord) => {
        if (staffRecord.id !== staffId || !staffRecord.isActive) {
          return staffRecord;
        }

        const nextSalesAmount = roundCurrency(staffRecord.totalSalesAmount + normalizedTotal);
        const nextSalesCount = staffRecord.totalSalesCount + 1;
        const nextCommission = roundCurrency(staffRecord.commissionEarned + normalizedTotal * staffRecord.commissionRate);

        return {
          ...staffRecord,
          totalSalesAmount: nextSalesAmount,
          totalSalesCount: nextSalesCount,
          commissionEarned: nextCommission
        };
      })
    }));
  },

  addTipsPool(amount: number): void {
    const normalizedAmount = sanitizeMoney(amount);

    if (!normalizedAmount) {
      return;
    }

    set((state) => ({
      tipsPoolBalance: roundCurrency(state.tipsPoolBalance + normalizedAmount)
    }));
  },

  distributeTipsPool(): void {
    const state = get();
    const eligibleStaffIds = state.staffRecords.filter((staffRecord) => staffRecord.isActive).map((staffRecord) => staffRecord.id);

    if (!eligibleStaffIds.length || state.tipsPoolBalance <= 0) {
      return;
    }

    const sharePerStaff = roundCurrency(state.tipsPoolBalance / eligibleStaffIds.length);
    const baseDistributedTotal = roundCurrency(sharePerStaff * eligibleStaffIds.length);
    const remainder = roundCurrency(state.tipsPoolBalance - baseDistributedTotal);

    set((previous) => {
      let remainderAssigned = false;

      return {
        tipsPoolBalance: 0,
        staffRecords: previous.staffRecords.map((staffRecord) => {
          if (!eligibleStaffIds.includes(staffRecord.id)) {
            return staffRecord;
          }

          let bonus = sharePerStaff;

          if (!remainderAssigned && remainder > 0) {
            bonus = roundCurrency(bonus + remainder);
            remainderAssigned = true;
          }

          return {
            ...staffRecord,
            tipsEarned: roundCurrency(staffRecord.tipsEarned + bonus)
          };
        })
      };
    });
  },

  repayLoan(staffId: string, amount: number): void {
    const normalizedAmount = sanitizeMoney(amount);

    if (!normalizedAmount) {
      return;
    }

    set((state) => ({
      staffRecords: state.staffRecords.map((staffRecord) => {
        if (staffRecord.id !== staffId) {
          return staffRecord;
        }

        return {
          ...staffRecord,
          loanBalance: Math.max(0, roundCurrency(staffRecord.loanBalance - normalizedAmount))
        };
      })
    }));
  },

  generatePayroll(periodLabel: string): void {
    const state = get();

    if (!periodLabel.trim()) {
      return;
    }

    const nextPayrollRecords: PayrollRecord[] = state.staffRecords.filter((staffRecord) => staffRecord.isActive).map((staffRecord) => {
      const staffSessions = state.attendanceSessions.filter(
        (session) => session.staffId === staffRecord.id && Boolean(session.clockOutAt)
      );

      const overtimeHours = staffSessions.reduce((sum, session) => sum + session.overtimeHours, 0);
      const hourlyRate = staffRecord.monthlySalary / (Math.max(1, state.standardDailyHours) * 22);
      const overtimePay = roundCurrency(overtimeHours * hourlyRate * state.overtimeMultiplier);
      const loanDeduction = roundCurrency(Math.min(staffRecord.loanBalance, staffRecord.monthlySalary * 0.1));
      const netSalary = roundCurrency(staffRecord.monthlySalary + overtimePay - loanDeduction);

      return {
        id: `payroll-${periodLabel}-${staffRecord.id}-${Date.now()}`,
        staffId: staffRecord.id,
        staffName: staffRecord.fullName,
        periodLabel,
        baseSalary: roundCurrency(staffRecord.monthlySalary),
        overtimeHours: roundCurrency(overtimeHours),
        overtimePay,
        loanDeduction,
        netSalary,
        generatedAt: new Date().toISOString()
      };
    });

    set((previous) => ({
      payrollRecords: [
        ...nextPayrollRecords,
        ...previous.payrollRecords.filter((payroll) => payroll.periodLabel !== periodLabel)
      ],
      staffRecords: previous.staffRecords.map((staffRecord) => {
        const payroll = nextPayrollRecords.find((record) => record.staffId === staffRecord.id);

        if (!payroll) {
          return staffRecord;
        }

        return {
          ...staffRecord,
          loanBalance: Math.max(0, roundCurrency(staffRecord.loanBalance - payroll.loanDeduction))
        };
      })
    }));

  },

  createInvoice(input: CreateInvoiceInput): void {
    const normalizedCustomerName = input.customerName.trim();
    const normalizedNotes = input.notes?.trim() ?? '';
    const linkedOrder = input.linkedOrderId
      ? get().orders.find((orderRecord) => orderRecord.id === input.linkedOrderId)
      : null;

    if (!normalizedCustomerName || !input.issueDate || !input.dueDate || !input.reminderDate) {
      throw new Error('Customer name, issue date, due date, and reminder date are required');
    }

    const amount = sanitizeMoney(input.amount);

    if (!amount) {
      throw new Error('Invoice amount must be greater than zero');
    }

    if (input.linkedOrderId && !linkedOrder) {
      throw new Error(`Linked order ${input.linkedOrderId} not found`);
    }

    const nowIso = new Date().toISOString();
    const nextInvoice: InvoiceRecord = {
      id: `invoice-${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      linkedOrderId: linkedOrder?.id ?? null,
      customerName: normalizedCustomerName,
      amount,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      reminderDate: input.reminderDate,
      status: 'issued',
      notes: normalizedNotes,
      reminderNotified: false
    };

    set((state) => ({
      invoices: [nextInvoice, ...state.invoices]
    }));
  },

  setInvoiceStatus(invoiceId: string, status: InvoiceStatus): void {
    set((state) => ({
      invoices: state.invoices.map((invoiceRecord) => {
        if (invoiceRecord.id !== invoiceId) {
          return invoiceRecord;
        }

        return {
          ...invoiceRecord,
          status,
          reminderNotified: status === 'paid' || status === 'cancelled' ? true : invoiceRecord.reminderNotified,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  markInvoiceReminderNotified(invoiceId: string): void {
    set((state) => ({
      invoices: state.invoices.map((invoiceRecord) => {
        if (invoiceRecord.id !== invoiceId) {
          return invoiceRecord;
        }

        return {
          ...invoiceRecord,
          reminderNotified: true,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  },

  getPendingInvoiceReminders(): InvoiceRecord[] {
    const nowDate = new Date();
    const nowTime = nowDate.getTime();
    let hasOverdueStatusUpdate = false;

    const nextInvoices: InvoiceRecord[] = get().invoices.map((invoiceRecord): InvoiceRecord => {
      const dueAt = new Date(invoiceRecord.dueDate).getTime();

      if (invoiceRecord.status === 'issued' && Number.isFinite(dueAt) && dueAt <= nowTime) {
        hasOverdueStatusUpdate = true;
        return {
          ...invoiceRecord,
          status: 'overdue',
          updatedAt: nowDate.toISOString()
        };
      }

      return invoiceRecord;
    });

    if (hasOverdueStatusUpdate) {
      set({
        invoices: nextInvoices
      });
    }

    return nextInvoices.filter((invoiceRecord) => {
      const dueAt = new Date(invoiceRecord.dueDate).getTime();
      const reminderAt = new Date(invoiceRecord.reminderDate).getTime();
      const passedDueDate = Number.isFinite(dueAt) && dueAt <= nowTime;
      const passedReminderDate = Number.isFinite(reminderAt) && reminderAt <= nowTime;

      return (
        (invoiceRecord.status === 'issued' || invoiceRecord.status === 'overdue') &&
        !invoiceRecord.reminderNotified &&
        (passedReminderDate || passedDueDate)
      );
    });
  },

  addRestaurantTable(input: AddRestaurantTableInput): void {
    const normalizedName = input.name.trim();
    const normalizedArea = input.area.trim();
    const seats = Math.max(1, Math.round(input.seats));

    if (!normalizedName || !normalizedArea) {
      return;
    }

    set((state) => ({
      restaurantTables: [
        {
          id: `restaurant-table-${Date.now()}`,
          name: normalizedName,
          area: normalizedArea,
          seats,
          status: 'available',
          currentTicketId: null,
          currentOrderId: null
        },
        ...state.restaurantTables
      ]
    }));
  },

  setRestaurantTableStatus(tableId: string, status: RestaurantTableStatus): void {
    set((state) => ({
      restaurantTables: state.restaurantTables.map((tableRecord) =>
        tableRecord.id === tableId ? { ...tableRecord, status } : tableRecord
      )
    }));
  },

  addKitchenTicket(input: AddKitchenTicketInput): void {
    const normalizedItemSummary = input.itemSummary.trim();
    const normalizedCourse = input.course.trim();

    if (!normalizedItemSummary || !normalizedCourse) {
      return;
    }

    const tableRecord = input.tableId ? get().restaurantTables.find((item) => item.id === input.tableId) : null;
    const assignee = input.assigneeStaffId ? get().staffRecords.find((item) => item.id === input.assigneeStaffId) : null;
    const ticketId = `kitchen-ticket-${Date.now()}`;
    const nextTicket: KitchenTicketRecord = {
      id: ticketId,
      ticketNumber: `KT-${Date.now().toString().slice(-4)}`,
      tableId: tableRecord?.id ?? null,
      tableName: tableRecord?.name ?? (input.channel === 'pickup' ? 'Pickup' : input.channel === 'delivery' ? 'Delivery' : 'Counter'),
      channel: input.channel,
      itemSummary: normalizedItemSummary,
      course: normalizedCourse,
      modifiers: input.modifiers ?? [],
      status: 'queued',
      assigneeStaffId: assignee?.id ?? null,
      assigneeStaffName: assignee?.fullName ?? '',
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      kitchenTickets: [nextTicket, ...state.kitchenTickets],
      restaurantTables: state.restaurantTables.map((restaurantTable) =>
        restaurantTable.id === tableRecord?.id
          ? { ...restaurantTable, status: 'occupied', currentTicketId: ticketId }
          : restaurantTable
      )
    }));
  },

  setKitchenTicketStatus(ticketId: string, status: KitchenTicketStatus): void {
    const ticketRecord = get().kitchenTickets.find((item) => item.id === ticketId);

    set((state) => ({
      kitchenTickets: state.kitchenTickets.map((item) => (item.id === ticketId ? { ...item, status } : item)),
      restaurantTables: state.restaurantTables.map((tableRecord) => {
        if (tableRecord.id !== ticketRecord?.tableId) {
          return tableRecord;
        }

        if (status === 'served') {
          return {
            ...tableRecord,
            status: 'available',
            currentTicketId: null
          };
        }

        return tableRecord;
      })
    }));
  },

  addRestaurantReservation(input: AddRestaurantReservationInput): void {
    const normalizedGuestName = input.guestName.trim();
    const normalizedDate = input.date.trim();
    const normalizedTime = input.time.trim();
    const partySize = Math.max(1, Math.round(input.partySize));
    const tableRecord = input.tableId ? get().restaurantTables.find((table) => table.id === input.tableId) : null;

    if (!normalizedGuestName || !normalizedDate || !normalizedTime) {
      return;
    }

    const nextReservation: RestaurantReservationRecord = {
      id: `reservation-${Date.now()}`,
      guestName: normalizedGuestName,
      contactPhone: input.contactPhone?.trim() ?? '',
      partySize,
      date: normalizedDate,
      time: normalizedTime,
      status: tableRecord ? 'reserved' : 'waitlist',
      tableId: tableRecord?.id ?? null,
      tableName: tableRecord?.name ?? 'Waitlist',
      notes: input.notes?.trim() ?? '',
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      restaurantReservations: [nextReservation, ...state.restaurantReservations],
      restaurantTables: state.restaurantTables.map((table) =>
        table.id === tableRecord?.id
          ? {
              ...table,
              status: 'reserved'
            }
          : table
      )
    }));
  },

  setRestaurantReservationStatus(reservationId: string, status: RestaurantReservationStatus): void {
    const reservationRecord = get().restaurantReservations.find((reservation) => reservation.id === reservationId);

    set((state) => ({
      restaurantReservations: state.restaurantReservations.map((reservation) =>
        reservation.id === reservationId ? { ...reservation, status } : reservation
      ),
      restaurantTables: state.restaurantTables.map((table) => {
        if (table.id !== reservationRecord?.tableId) {
          return table;
        }

        if (status === 'seated') {
          return {
            ...table,
            status: 'occupied'
          };
        }

        if (status === 'completed' || status === 'cancelled') {
          return {
            ...table,
            status: table.currentTicketId ? 'occupied' : 'available'
          };
        }

        if (status === 'reserved') {
          return {
            ...table,
            status: 'reserved'
          };
        }

        return table;
      })
    }));
  },

  addSalonService(input: AddSalonServiceInput): void {
    const normalizedName = input.name.trim();
    const normalizedCategory = input.category.trim();

    if (!normalizedName || !normalizedCategory) {
      return;
    }

    set((state) => ({
      salonServices: [
        {
          id: `salon-service-${Date.now()}`,
          name: normalizedName,
          category: normalizedCategory,
          durationMinutes: Math.max(15, Math.round(input.durationMinutes)),
          price: sanitizeMoney(input.price),
          depositRequired: input.depositRequired,
          noShowFee: sanitizeMoney(input.noShowFee)
        },
        ...state.salonServices
      ]
    }));
  },

  addSalonBooking(input: AddSalonBookingInput): void {
    const serviceRecord = get().salonServices.find((item) => item.id === input.serviceId);
    const assignee = get().staffRecords.find((item) => item.id === input.assigneeId);
    const normalizedCustomerName = input.customerName.trim();

    if (!serviceRecord || !assignee || !normalizedCustomerName || !input.date || !input.startTime) {
      return;
    }

    set((state) => ({
      salonBookings: [
        {
          id: `salon-booking-${Date.now()}`,
          serviceId: serviceRecord.id,
          serviceName: serviceRecord.name,
          customerName: normalizedCustomerName,
          assigneeId: assignee.id,
          assigneeName: assignee.fullName,
          date: input.date,
          startTime: input.startTime,
          status: 'scheduled',
          depositAmount: sanitizeMoney(input.depositAmount ?? 0),
          notes: input.notes?.trim() ?? ''
        },
        ...state.salonBookings
      ]
    }));
  },

  setSalonBookingStatus(bookingId: string, status: SalonBookingStatus): void {
    set((state) => ({
      salonBookings: state.salonBookings.map((bookingRecord) =>
        bookingRecord.id === bookingId ? { ...bookingRecord, status } : bookingRecord
      )
    }));
  },

  addPriceBookItem(input: AddPriceBookItemInput): void {
    const normalizedName = input.name.trim();
    const normalizedUnit = input.unit.trim();

    if (!normalizedName || !normalizedUnit) {
      return;
    }

    set((state) => ({
      priceBookItems: [
        {
          id: `price-book-item-${Date.now()}`,
          name: normalizedName,
          trade: input.trade,
          unit: normalizedUnit,
          unitPrice: sanitizeMoney(input.unitPrice)
        },
        ...state.priceBookItems
      ]
    }));
  },

  addFieldJob(input: AddFieldJobInput): void {
    const technician = get().staffRecords.find((item) => item.id === input.technicianId);
    const normalizedCustomerName = input.customerName.trim();
    const normalizedServiceAddress = input.serviceAddress.trim();
    const normalizedWindow = input.scheduledWindow.trim();
    const normalizedSummary = input.summary.trim();

    if (!technician || !normalizedCustomerName || !normalizedServiceAddress || !input.scheduledDate || !normalizedWindow || !normalizedSummary) {
      return;
    }

    set((state) => ({
      fieldJobs: [
        {
          id: `field-job-${Date.now()}`,
          customerName: normalizedCustomerName,
          serviceAddress: normalizedServiceAddress,
          trade: input.trade,
          scheduledDate: input.scheduledDate,
          scheduledWindow: normalizedWindow,
          technicianId: technician.id,
          technicianName: technician.fullName,
          status: 'scheduled',
          summary: normalizedSummary
        },
        ...state.fieldJobs
      ]
    }));
  },

  setFieldJobStatus(jobId: string, status: FieldJobStatus): void {
    set((state) => ({
      fieldJobs: state.fieldJobs.map((jobRecord) => (jobRecord.id === jobId ? { ...jobRecord, status } : jobRecord))
    }));
  },

  addFieldEstimate(input: AddFieldEstimateInput): void {
    const normalizedCustomerName = input.customerName.trim();

    if (input.lineItems.length === 0 || !normalizedCustomerName) {
      return;
    }

    const nextLineItems: FieldEstimateLineItemRecord[] = input.lineItems
      .map((lineItem) => {
        const priceBookItem = get().priceBookItems.find((item) => item.id === lineItem.priceBookItemId);

        if (!priceBookItem) {
          return null;
        }

        const quantity = Math.max(1, Math.round(lineItem.quantity));
        const total = sanitizeMoney(priceBookItem.unitPrice * quantity);

        return {
          priceBookItemId: priceBookItem.id,
          name: priceBookItem.name,
          quantity,
          unitPrice: priceBookItem.unitPrice,
          total
        };
      })
      .filter((lineItem): lineItem is FieldEstimateLineItemRecord => lineItem !== null);

    if (nextLineItems.length === 0) {
      return;
    }

    const totalAmount = sanitizeMoney(nextLineItems.reduce((sum, lineItem) => sum + lineItem.total, 0));

    set((state) => ({
      fieldEstimates: [
        {
          id: `field-estimate-${Date.now()}`,
          jobId: input.jobId ?? null,
          customerName: normalizedCustomerName,
          lineItems: nextLineItems,
          totalAmount,
          status: 'draft',
          createdAt: new Date().toISOString()
        },
        ...state.fieldEstimates
      ]
    }));
  },

  setFieldEstimateStatus(estimateId: string, status: FieldEstimateStatus): void {
    set((state) => ({
      fieldEstimates: state.fieldEstimates.map((estimateRecord) =>
        estimateRecord.id === estimateId ? { ...estimateRecord, status } : estimateRecord
      )
    }));
  },

  convertFieldEstimateToInvoice(estimateId: string): void {
    const estimateRecord = get().fieldEstimates.find((item) => item.id === estimateId);

    if (!estimateRecord) {
      return;
    }

    get().createInvoice({
      customerName: estimateRecord.customerName,
      amount: estimateRecord.totalAmount,
      issueDate: toCalendarDateKey(new Date().toISOString()),
      dueDate: toCalendarDateKey(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
      reminderDate: toCalendarDateKey(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()),
      notes: `Converted from estimate ${estimateRecord.id}`
    });

    get().setFieldEstimateStatus(estimateId, 'invoiced');
  },

  addDeliverySubscription(input: AddDeliverySubscriptionInput): void {
    const normalizedCustomerName = input.customerName.trim();
    const normalizedItemSummary = input.itemSummary.trim();

    if (!normalizedCustomerName || !normalizedItemSummary || !input.nextDeliveryDate || input.deliveryDays.length === 0) {
      return;
    }

    set((state) => ({
      deliverySubscriptions: [
        {
          id: `delivery-subscription-${Date.now()}`,
          customerName: normalizedCustomerName,
          frequency: input.frequency,
          deliveryDays: input.deliveryDays,
          itemSummary: normalizedItemSummary,
          nextDeliveryDate: input.nextDeliveryDate,
          status: 'active'
        },
        ...state.deliverySubscriptions
      ]
    }));
  },

  addRouteManifest(input: AddRouteManifestInput): void {
    const driver = get().staffRecords.find((item) => item.id === input.driverId);
    const selectedSubscriptions = get().deliverySubscriptions.filter((subscription) => input.subscriptionIds.includes(subscription.id));

    if (!driver || !input.routeDate || !input.vehicleLabel.trim() || selectedSubscriptions.length === 0) {
      return;
    }

    set((state) => ({
      routeManifests: [
        {
          id: `route-manifest-${Date.now()}`,
          routeDate: input.routeDate,
          driverId: driver.id,
          driverName: driver.fullName,
          vehicleLabel: input.vehicleLabel.trim(),
          status: 'planned',
          stops: selectedSubscriptions.map((subscription) => ({
            id: `route-stop-${subscription.id}-${Date.now()}`,
            customerName: subscription.customerName,
            itemSummary: subscription.itemSummary,
            delivered: false
          }))
        },
        ...state.routeManifests
      ]
    }));
  },

  setRouteManifestStopDelivered(manifestId: string, stopId: string, delivered: boolean): void {
    set((state) => ({
      routeManifests: state.routeManifests.map((manifestRecord) => {
        if (manifestRecord.id !== manifestId) {
          return manifestRecord;
        }

        const nextStops = manifestRecord.stops.map((stopRecord) =>
          stopRecord.id === stopId ? { ...stopRecord, delivered } : stopRecord
        );
        const allDelivered = nextStops.length > 0 && nextStops.every((stopRecord) => stopRecord.delivered);

        return {
          ...manifestRecord,
          stops: nextStops,
          status: allDelivered ? 'completed' : manifestRecord.status === 'planned' ? 'inProgress' : manifestRecord.status
        };
      })
    }));
  },

  getCalendarDaySummary(date: string): CalendarDaySummaryRecord {
    const state = get();
    const normalizedDate = toCalendarDateKey(date);

    return {
      date: normalizedDate,
      appointmentsCount: state.appointments.filter((appointmentRecord) => appointmentRecord.date === normalizedDate).length,
      completedAppointmentsCount: state.appointments.filter(
        (appointmentRecord) => appointmentRecord.date === normalizedDate && appointmentRecord.status === 'completed'
      ).length,
      meetingsCount: state.meetings.filter((meetingRecord) => meetingRecord.date === normalizedDate).length,
      ordersCount: state.orders.filter((orderRecord) => toCalendarDateKey(orderRecord.createdAt) === normalizedDate).length,
      pendingDeliveriesCount: state.orders.filter(
        (orderRecord) => orderRecord.deliveryDate === normalizedDate && orderRecord.deliveryStatus !== 'delivered'
      ).length
    };
  },

  getTimesheetSummaries(): TimesheetSummaryRecord[] {
    const state = get();
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = getStartOfWeek(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return state.staffRecords.map((staffRecord) => {
      const staffSessions = state.attendanceSessions.filter(
        (session) => session.staffId === staffRecord.id && session.clockOutAt
      );

      const dailyHours = staffSessions
        .filter((session) => new Date(session.clockInAt) >= startOfDay)
        .reduce((sum, session) => sum + session.totalHours, 0);

      const weeklyHours = staffSessions
        .filter((session) => new Date(session.clockInAt) >= startOfWeek)
        .reduce((sum, session) => sum + session.totalHours, 0);

      const monthlyHours = staffSessions
        .filter((session) => new Date(session.clockInAt) >= startOfMonth)
        .reduce((sum, session) => sum + session.totalHours, 0);

      const overtimeHours = staffSessions.reduce((sum, session) => sum + session.overtimeHours, 0);

      return {
        staffId: staffRecord.id,
        staffName: staffRecord.fullName,
        dailyHours: roundCurrency(dailyHours),
        weeklyHours: roundCurrency(weeklyHours),
        monthlyHours: roundCurrency(monthlyHours),
        overtimeHours: roundCurrency(overtimeHours)
      };
    });
  },

  getDepartmentChangeReport(): DepartmentChangeRecord[] {
    return [...get().departmentChanges].sort(
      (left, right) => new Date(right.changedAt).getTime() - new Date(left.changedAt).getTime()
    );
  },

  exportDepartmentChangeReportCsv(): string {
    const departmentChanges = get().getDepartmentChangeReport();
    const header = [
      'staffId',
      'staffName',
      'fromDepartment',
      'toDepartment',
      'reason',
      'changedBy',
      'changeMode',
      'changedAt'
    ].join(',');

    const rows = departmentChanges.map((departmentChange) =>
      [
        departmentChange.staffId,
        departmentChange.staffName,
        departmentChange.fromDepartment,
        departmentChange.toDepartment,
        departmentChange.reason,
        departmentChange.changedBy,
        departmentChange.changeMode,
        departmentChange.changedAt
      ]
        .map((value) => escapeCsvValue(value))
        .join(',')
    );

    return [header, ...rows].join('\n');
  },

  exportDepartmentChangeReportText(): string {
    const state = get();
    const departmentChanges = state.getDepartmentChangeReport();
    const activeStaffCount = state.staffRecords.filter((staffRecord) => staffRecord.isActive).length;
    const departmentHeadcountMap = state.staffRecords.reduce<Record<string, number>>((accumulator, staffRecord) => {
      if (!staffRecord.isActive) {
        return accumulator;
      }

      accumulator[staffRecord.department] = (accumulator[staffRecord.department] ?? 0) + 1;
      return accumulator;
    }, {});

    const departmentHeadcountLines = Object.entries(departmentHeadcountMap)
      .sort(([leftDepartment], [rightDepartment]) => leftDepartment.localeCompare(rightDepartment))
      .map(([department, count]) => `- ${department}: ${count}`);

    const historyLines = departmentChanges.map((departmentChange, index) =>
      `${index + 1}. ${departmentChange.changedAt} | ${departmentChange.staffName} | ${departmentChange.fromDepartment || 'none'} -> ${departmentChange.toDepartment} | by ${departmentChange.changedBy} | ${departmentChange.changeMode} | ${departmentChange.reason}`
    );

    return [
      'Department Allotment Report',
      `Generated At: ${new Date().toISOString()}`,
      `Total Employees: ${state.staffRecords.length}`,
      `Active Employees: ${activeStaffCount}`,
      `Total Department Changes: ${departmentChanges.length}`,
      '',
      'Department Headcount',
      ...departmentHeadcountLines,
      '',
      'Department Change History',
      ...historyLines
    ].join('\n');
  },

  exportPayslipText(staffId: string, periodLabel: string): string {
    const payroll = get().payrollRecords.find(
      (record) => record.staffId === staffId && record.periodLabel === periodLabel
    );

    if (!payroll) {
      return '';
    }

    return [
      `Payslip Period: ${payroll.periodLabel}`,
      `Generated At: ${payroll.generatedAt}`,
      `Staff: ${payroll.staffName}`,
      `Base Salary: ${formatMoney(payroll.baseSalary)}`,
      `Overtime Hours: ${payroll.overtimeHours.toFixed(2)}`,
      `Overtime Pay: ${formatMoney(payroll.overtimePay)}`,
      `Loan Deduction: ${formatMoney(payroll.loanDeduction)}`,
      `Net Salary: ${formatMoney(payroll.netSalary)}`
    ].join('\n');
  }
}));
