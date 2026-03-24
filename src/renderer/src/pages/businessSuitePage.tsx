import { useMemo, useState } from 'react';
import {
  Boxes,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  UtensilsCrossed,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrencyValue } from '@/lib/globalFormat';
import { type DeploymentFeatureKey, type DeploymentIndustry, useStoreOpsStore } from '@/stores/storeOpsStore';

type IndustryTab = {
  id: DeploymentIndustry;
  label: string;
  summary: string;
  icon: typeof Store;
};

type RestaurantTicketFormState = {
  tableId: string;
  channel: 'dineIn' | 'pickup' | 'delivery' | 'driveThru';
  itemSummary: string;
  course: string;
  modifiers: string;
  assigneeStaffId: string;
};

type SalonServiceFormState = {
  name: string;
  category: string;
  durationMinutes: string;
  price: string;
  depositRequired: boolean;
  noShowFee: string;
};

type SalonBookingFormState = {
  serviceId: string;
  customerName: string;
  assigneeId: string;
  date: string;
  startTime: string;
  depositAmount: string;
  notes: string;
};

type RestaurantTableFormState = {
  name: string;
  area: string;
  seats: string;
};

type RestaurantReservationFormState = {
  guestName: string;
  contactPhone: string;
  partySize: string;
  date: string;
  time: string;
  tableId: string;
  notes: string;
};

type PriceBookFormState = {
  name: string;
  trade: 'plumbing' | 'electrical' | 'general';
  unit: string;
  unitPrice: string;
};

type FieldJobFormState = {
  customerName: string;
  serviceAddress: string;
  trade: 'plumbing' | 'electrical' | 'general';
  scheduledDate: string;
  scheduledWindow: string;
  technicianId: string;
  summary: string;
};

type FieldEstimateFormState = {
  customerName: string;
  jobId: string;
  priceBookItemId: string;
  quantity: string;
};

type SubscriptionFormState = {
  customerName: string;
  frequency: 'daily' | 'weekly' | 'custom';
  deliveryDays: string;
  itemSummary: string;
  nextDeliveryDate: string;
};

type ManifestFormState = {
  routeDate: string;
  driverId: string;
  vehicleLabel: string;
};

const industryTabs: IndustryTab[] = [
  { id: 'retail', label: 'Retail', summary: 'Checkout, inventory, loyalty, replenishment', icon: Store },
  { id: 'restaurant', label: 'Restaurant', summary: 'Tables, kitchen, dine-in, pickup, delivery', icon: UtensilsCrossed },
  { id: 'salon', label: 'Salon', summary: 'Services, bookings, deposits, no-show handling', icon: Sparkles },
  { id: 'fieldService', label: 'Field Service', summary: 'Dispatch, jobs, estimates, price book', icon: Wrench },
  { id: 'grocery', label: 'Grocery + Dairy', summary: 'Subscriptions, routes, perishable delivery', icon: Truck }
];

const workflowByIndustry: Record<DeploymentIndustry, string[]> = {
  retail: [
    'Sell through POS while inventory and customer history update in one transaction.',
    'Track omnichannel orders and deliveries from the shared order system.',
    'Use inventory thresholds and low-stock alerts for replenishment.'
  ],
  restaurant: [
    'Assign tables, fire kitchen tickets, and track course progress.',
    'Handle dine-in, pickup, delivery, and drive-thru from the same order layer.',
    'Move tables and kitchen tickets through live operational states.'
  ],
  salon: [
    'Maintain service menu, booking rules, deposits, and no-show fees.',
    'Book services against staff, dates, and time slots.',
    'Track bookings from scheduled to checked-in to completed.'
  ],
  fieldService: [
    'Create price-book items, schedule field jobs, and assign technicians.',
    'Generate estimates from price book entries and convert approved work into invoices.',
    'Track technician dispatch through live job statuses.'
  ],
  grocery: [
    'Create recurring delivery subscriptions for households or reseller accounts.',
    'Generate route manifests from subscription selections.',
    'Track stop completion while using shared order and delivery status data.'
  ]
};

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function BusinessSuitePage() {
  const storeProfile = useStoreOpsStore((state) => state.storeProfile);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const customers = useStoreOpsStore((state) => state.customers);
  const orders = useStoreOpsStore((state) => state.orders);
  const products = useStoreOpsStore((state) => state.products);
  const appointments = useStoreOpsStore((state) => state.appointments);
  const invoices = useStoreOpsStore((state) => state.invoices);
  const staffRecords = useStoreOpsStore((state) => state.staffRecords);
  const restaurantTables = useStoreOpsStore((state) => state.restaurantTables);
  const kitchenTickets = useStoreOpsStore((state) => state.kitchenTickets);
  const restaurantReservations = useStoreOpsStore((state) => state.restaurantReservations);
  const salonServices = useStoreOpsStore((state) => state.salonServices);
  const salonBookings = useStoreOpsStore((state) => state.salonBookings);
  const priceBookItems = useStoreOpsStore((state) => state.priceBookItems);
  const fieldJobs = useStoreOpsStore((state) => state.fieldJobs);
  const fieldEstimates = useStoreOpsStore((state) => state.fieldEstimates);
  const deliverySubscriptions = useStoreOpsStore((state) => state.deliverySubscriptions);
  const routeManifests = useStoreOpsStore((state) => state.routeManifests);

  const addRestaurantTable = useStoreOpsStore((state) => state.addRestaurantTable);
  const setRestaurantTableStatus = useStoreOpsStore((state) => state.setRestaurantTableStatus);
  const addKitchenTicket = useStoreOpsStore((state) => state.addKitchenTicket);
  const setKitchenTicketStatus = useStoreOpsStore((state) => state.setKitchenTicketStatus);
  const addRestaurantReservation = useStoreOpsStore((state) => state.addRestaurantReservation);
  const setRestaurantReservationStatus = useStoreOpsStore((state) => state.setRestaurantReservationStatus);
  const addSalonService = useStoreOpsStore((state) => state.addSalonService);
  const addSalonBooking = useStoreOpsStore((state) => state.addSalonBooking);
  const setSalonBookingStatus = useStoreOpsStore((state) => state.setSalonBookingStatus);
  const addPriceBookItem = useStoreOpsStore((state) => state.addPriceBookItem);
  const addFieldJob = useStoreOpsStore((state) => state.addFieldJob);
  const setFieldJobStatus = useStoreOpsStore((state) => state.setFieldJobStatus);
  const addFieldEstimate = useStoreOpsStore((state) => state.addFieldEstimate);
  const setFieldEstimateStatus = useStoreOpsStore((state) => state.setFieldEstimateStatus);
  const convertFieldEstimateToInvoice = useStoreOpsStore((state) => state.convertFieldEstimateToInvoice);
  const addDeliverySubscription = useStoreOpsStore((state) => state.addDeliverySubscription);
  const addRouteManifest = useStoreOpsStore((state) => state.addRouteManifest);
  const setRouteManifestStopDelivered = useStoreOpsStore((state) => state.setRouteManifestStopDelivered);

  const enabledIndustries = useMemo(
    () => (storeProfile.enabledIndustries.length > 0 ? storeProfile.enabledIndustries : [storeProfile.primaryIndustry]),
    [storeProfile.enabledIndustries, storeProfile.primaryIndustry]
  );
  const visibleTabs = industryTabs.filter((tab) => enabledIndustries.includes(tab.id));
  const [selectedIndustry, setSelectedIndustry] = useState<DeploymentIndustry>(storeProfile.primaryIndustry);
  const activeIndustry = visibleTabs.some((tab) => tab.id === selectedIndustry)
    ? selectedIndustry
    : visibleTabs[0]?.id ?? storeProfile.primaryIndustry;

  const enabledFeatures = storeProfile.enabledFeatures;
  const hasFeature = (featureKey: DeploymentFeatureKey): boolean => enabledFeatures.includes(featureKey);
  const activeStaff = staffRecords.filter((staffRecord) => staffRecord.isActive);
  const nonWalkInCustomers = customers.filter((customer) => customer.id !== 'customer-walk-in');
  const lowStockCount = products.filter((product) => product.stock <= product.reorderLevel).length;
  const pendingDeliveries = orders.filter((order) => order.deliveryStatus === 'pending' || order.deliveryStatus === 'outForDelivery').length;
  const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue').length;

  const [restaurantTableForm, setRestaurantTableForm] = useState<RestaurantTableFormState>({ name: '', area: '', seats: '4' });
  const [restaurantReservationForm, setRestaurantReservationForm] = useState<RestaurantReservationFormState>({
    guestName: '',
    contactPhone: '',
    partySize: '2',
    date: '2026-03-20',
    time: '19:00',
    tableId: restaurantTables[0]?.id ?? '',
    notes: ''
  });
  const [restaurantTicketForm, setRestaurantTicketForm] = useState<RestaurantTicketFormState>({
    tableId: restaurantTables[0]?.id ?? '',
    channel: 'dineIn',
    itemSummary: '',
    course: 'Main',
    modifiers: '',
    assigneeStaffId: activeStaff[0]?.id ?? ''
  });
  const [salonServiceForm, setSalonServiceForm] = useState<SalonServiceFormState>({
    name: '',
    category: '',
    durationMinutes: '45',
    price: '',
    depositRequired: false,
    noShowFee: '0'
  });
  const [salonBookingForm, setSalonBookingForm] = useState<SalonBookingFormState>({
    serviceId: salonServices[0]?.id ?? '',
    customerName: '',
    assigneeId: activeStaff[0]?.id ?? '',
    date: '2026-03-18',
    startTime: '10:00',
    depositAmount: '0',
    notes: ''
  });
  const [priceBookForm, setPriceBookForm] = useState<PriceBookFormState>({
    name: '',
    trade: 'general',
    unit: 'job',
    unitPrice: ''
  });
  const [fieldJobForm, setFieldJobForm] = useState<FieldJobFormState>({
    customerName: '',
    serviceAddress: '',
    trade: 'general',
    scheduledDate: '2026-03-19',
    scheduledWindow: '09:00 - 11:00',
    technicianId: activeStaff[0]?.id ?? '',
    summary: ''
  });
  const [fieldEstimateForm, setFieldEstimateForm] = useState<FieldEstimateFormState>({
    customerName: '',
    jobId: fieldJobs[0]?.id ?? '',
    priceBookItemId: priceBookItems[0]?.id ?? '',
    quantity: '1'
  });
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionFormState>({
    customerName: '',
    frequency: 'daily',
    deliveryDays: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    itemSummary: '',
    nextDeliveryDate: '2026-03-20'
  });
  const [manifestForm, setManifestForm] = useState<ManifestFormState>({
    routeDate: '2026-03-20',
    driverId: activeStaff[0]?.id ?? '',
    vehicleLabel: 'Van 1'
  });
  const [selectedSubscriptionIds, setSelectedSubscriptionIds] = useState<string[]>(deliverySubscriptions.map((subscription) => subscription.id));

  const industrySummaryCards = {
    retail: [
      { label: 'Inventory Value', value: formatCurrencyValue(products.reduce((sum, product) => sum + product.price * product.stock, 0), globalPreferences) },
      { label: 'Low Stock', value: String(lowStockCount) },
      { label: 'Customer Profiles', value: String(nonWalkInCustomers.length) },
      { label: 'Pending Deliveries', value: String(pendingDeliveries) }
    ],
    restaurant: [
      { label: 'Tables', value: String(restaurantTables.length) },
      { label: 'Kitchen Tickets', value: String(kitchenTickets.length) },
      { label: 'Reservations', value: String(restaurantReservations.length) },
      { label: 'Active Staff', value: String(activeStaff.length) }
    ],
    salon: [
      { label: 'Services', value: String(salonServices.length) },
      { label: 'Bookings', value: String(salonBookings.length) },
      { label: 'Appointments', value: String(appointments.length) },
      { label: 'Customers', value: String(nonWalkInCustomers.length) }
    ],
    fieldService: [
      { label: 'Price Book', value: String(priceBookItems.length) },
      { label: 'Jobs', value: String(fieldJobs.length) },
      { label: 'Estimates', value: String(fieldEstimates.length) },
      { label: 'Overdue Invoices', value: String(overdueInvoices) }
    ],
    grocery: [
      { label: 'Subscriptions', value: String(deliverySubscriptions.length) },
      { label: 'Route Manifests', value: String(routeManifests.length) },
      { label: 'Pending Deliveries', value: String(pendingDeliveries) },
      { label: 'Low Stock', value: String(lowStockCount) }
    ]
  }[activeIndustry];

  const handleCreateRestaurantTable = (): void => {
    addRestaurantTable({
      name: restaurantTableForm.name,
      area: restaurantTableForm.area,
      seats: toNumber(restaurantTableForm.seats)
    });
    setRestaurantTableForm({ name: '', area: '', seats: '4' });
  };

  const handleCreateKitchenTicket = (): void => {
    addKitchenTicket({
      tableId: restaurantTicketForm.channel === 'dineIn' ? restaurantTicketForm.tableId || null : null,
      channel: restaurantTicketForm.channel,
      itemSummary: restaurantTicketForm.itemSummary,
      course: restaurantTicketForm.course,
      modifiers: toCommaList(restaurantTicketForm.modifiers),
      assigneeStaffId: restaurantTicketForm.assigneeStaffId || null
    });
    setRestaurantTicketForm((previous) => ({
      ...previous,
      itemSummary: '',
      modifiers: ''
    }));
  };

  const handleCreateRestaurantReservation = (): void => {
    addRestaurantReservation({
      guestName: restaurantReservationForm.guestName,
      contactPhone: restaurantReservationForm.contactPhone,
      partySize: toNumber(restaurantReservationForm.partySize),
      date: restaurantReservationForm.date,
      time: restaurantReservationForm.time,
      tableId: restaurantReservationForm.tableId || null,
      notes: restaurantReservationForm.notes
    });
    setRestaurantReservationForm((previous) => ({
      ...previous,
      guestName: '',
      contactPhone: '',
      notes: ''
    }));
  };

  const handleCreateSalonService = (): void => {
    addSalonService({
      name: salonServiceForm.name,
      category: salonServiceForm.category,
      durationMinutes: toNumber(salonServiceForm.durationMinutes),
      price: toNumber(salonServiceForm.price),
      depositRequired: salonServiceForm.depositRequired,
      noShowFee: toNumber(salonServiceForm.noShowFee)
    });
    setSalonServiceForm({
      name: '',
      category: '',
      durationMinutes: '45',
      price: '',
      depositRequired: false,
      noShowFee: '0'
    });
  };

  const handleCreateSalonBooking = (): void => {
    addSalonBooking({
      serviceId: salonBookingForm.serviceId,
      customerName: salonBookingForm.customerName,
      assigneeId: salonBookingForm.assigneeId,
      date: salonBookingForm.date,
      startTime: salonBookingForm.startTime,
      depositAmount: toNumber(salonBookingForm.depositAmount),
      notes: salonBookingForm.notes
    });
    setSalonBookingForm((previous) => ({
      ...previous,
      customerName: '',
      depositAmount: '0',
      notes: ''
    }));
  };

  const handleCreatePriceBookItem = (): void => {
    addPriceBookItem({
      name: priceBookForm.name,
      trade: priceBookForm.trade,
      unit: priceBookForm.unit,
      unitPrice: toNumber(priceBookForm.unitPrice)
    });
    setPriceBookForm({ name: '', trade: 'general', unit: 'job', unitPrice: '' });
  };

  const handleCreateFieldJob = (): void => {
    addFieldJob({
      customerName: fieldJobForm.customerName,
      serviceAddress: fieldJobForm.serviceAddress,
      trade: fieldJobForm.trade,
      scheduledDate: fieldJobForm.scheduledDate,
      scheduledWindow: fieldJobForm.scheduledWindow,
      technicianId: fieldJobForm.technicianId,
      summary: fieldJobForm.summary
    });
    setFieldJobForm((previous) => ({
      ...previous,
      customerName: '',
      serviceAddress: '',
      summary: ''
    }));
  };

  const handleCreateFieldEstimate = (): void => {
    addFieldEstimate({
      customerName: fieldEstimateForm.customerName,
      jobId: fieldEstimateForm.jobId || null,
      lineItems: [{ priceBookItemId: fieldEstimateForm.priceBookItemId, quantity: toNumber(fieldEstimateForm.quantity) }]
    });
    setFieldEstimateForm((previous) => ({
      ...previous,
      customerName: '',
      quantity: '1'
    }));
  };

  const handleCreateSubscription = (): void => {
    addDeliverySubscription({
      customerName: subscriptionForm.customerName,
      frequency: subscriptionForm.frequency,
      deliveryDays: toCommaList(subscriptionForm.deliveryDays),
      itemSummary: subscriptionForm.itemSummary,
      nextDeliveryDate: subscriptionForm.nextDeliveryDate
    });
    setSubscriptionForm((previous) => ({
      ...previous,
      customerName: '',
      itemSummary: ''
    }));
  };

  const handleCreateManifest = (): void => {
    addRouteManifest({
      routeDate: manifestForm.routeDate,
      driverId: manifestForm.driverId,
      vehicleLabel: manifestForm.vehicleLabel,
      subscriptionIds: selectedSubscriptionIds
    });
  };

  const renderRestaurantSection = () => (
    <div className="grid gap-6 xl:grid-cols-3">
      {hasFeature('restaurantTables') && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Restaurant Table Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input aria-label="Restaurant Table Name" placeholder="Table name" value={restaurantTableForm.name} onChange={(event) => setRestaurantTableForm((previous) => ({ ...previous, name: event.target.value }))} />
              <Input aria-label="Restaurant Table Area" placeholder="Area" value={restaurantTableForm.area} onChange={(event) => setRestaurantTableForm((previous) => ({ ...previous, area: event.target.value }))} />
              <Input aria-label="Restaurant Table Seats" type="number" placeholder="Seats" value={restaurantTableForm.seats} onChange={(event) => setRestaurantTableForm((previous) => ({ ...previous, seats: event.target.value }))} />
            </div>
            <Button type="button" className="w-full" onClick={handleCreateRestaurantTable}>
              Add Restaurant Table
            </Button>
            <div className="space-y-2">
              {restaurantTables.map((tableRecord) => (
                <div key={tableRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{tableRecord.name}</p>
                      <p className="text-xs text-slate-500">{tableRecord.area} • {tableRecord.seats} seats</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{tableRecord.status}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['available', 'occupied', 'reserved', 'cleaning'] as const).map((statusItem) => (
                      <Button key={statusItem} type="button" variant="outline" className="h-8 rounded-md px-3 text-xs" onClick={() => setRestaurantTableStatus(tableRecord.id, statusItem)}>
                        {statusItem}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Reservations And Waitlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              aria-label="Reservation Guest Name"
              placeholder="Guest name"
              value={restaurantReservationForm.guestName}
              onChange={(event) => setRestaurantReservationForm((previous) => ({ ...previous, guestName: event.target.value }))}
            />
            <Input
              aria-label="Reservation Contact Phone"
              placeholder="Contact phone"
              value={restaurantReservationForm.contactPhone}
              onChange={(event) => setRestaurantReservationForm((previous) => ({ ...previous, contactPhone: event.target.value }))}
            />
            <Input
              aria-label="Reservation Party Size"
              type="number"
              min="1"
              value={restaurantReservationForm.partySize}
              onChange={(event) => setRestaurantReservationForm((previous) => ({ ...previous, partySize: event.target.value }))}
            />
            <select
              aria-label="Reservation Table"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={restaurantReservationForm.tableId}
              onChange={(event) => setRestaurantReservationForm((previous) => ({ ...previous, tableId: event.target.value }))}
            >
              <option value="">Waitlist only</option>
              {restaurantTables.map((tableRecord) => (
                <option key={tableRecord.id} value={tableRecord.id}>
                  {tableRecord.name}
                </option>
              ))}
            </select>
            <Input
              aria-label="Reservation Date"
              type="date"
              value={restaurantReservationForm.date}
              onChange={(event) => setRestaurantReservationForm((previous) => ({ ...previous, date: event.target.value }))}
            />
            <Input
              aria-label="Reservation Time"
              type="time"
              value={restaurantReservationForm.time}
              onChange={(event) => setRestaurantReservationForm((previous) => ({ ...previous, time: event.target.value }))}
            />
          </div>
          <Input
            aria-label="Reservation Notes"
            placeholder="Notes"
            value={restaurantReservationForm.notes}
            onChange={(event) => setRestaurantReservationForm((previous) => ({ ...previous, notes: event.target.value }))}
          />
          <Button type="button" className="w-full" onClick={handleCreateRestaurantReservation}>
            Add Reservation
          </Button>
          <div className="space-y-2">
            {restaurantReservations.map((reservationRecord) => (
              <div key={reservationRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{reservationRecord.guestName}</p>
                    <p className="text-xs text-slate-500">
                      {reservationRecord.date} {reservationRecord.time} • party {reservationRecord.partySize} • {reservationRecord.tableName}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{reservationRecord.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['waitlist', 'reserved', 'seated', 'completed', 'cancelled'] as const).map((statusItem) => (
                    <Button
                      key={statusItem}
                      type="button"
                      variant="outline"
                      className="h-8 rounded-md px-3 text-xs"
                      onClick={() => setRestaurantReservationStatus(reservationRecord.id, statusItem)}
                    >
                      {statusItem}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {hasFeature('kitchenDisplay') && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Kitchen And Ticket Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <select aria-label="Restaurant Ticket Table" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={restaurantTicketForm.tableId} onChange={(event) => setRestaurantTicketForm((previous) => ({ ...previous, tableId: event.target.value }))}>
                <option value="">No table</option>
                {restaurantTables.map((tableRecord) => (
                  <option key={tableRecord.id} value={tableRecord.id}>
                    {tableRecord.name}
                  </option>
                ))}
              </select>
              <select aria-label="Restaurant Ticket Channel" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={restaurantTicketForm.channel} onChange={(event) => setRestaurantTicketForm((previous) => ({ ...previous, channel: event.target.value as RestaurantTicketFormState['channel'] }))}>
                <option value="dineIn">Dine In</option>
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
                <option value="driveThru">Drive Thru</option>
              </select>
              <Input aria-label="Restaurant Ticket Items" placeholder="Item summary" value={restaurantTicketForm.itemSummary} onChange={(event) => setRestaurantTicketForm((previous) => ({ ...previous, itemSummary: event.target.value }))} />
              <Input aria-label="Restaurant Ticket Course" placeholder="Course" value={restaurantTicketForm.course} onChange={(event) => setRestaurantTicketForm((previous) => ({ ...previous, course: event.target.value }))} />
              <Input aria-label="Restaurant Ticket Modifiers" placeholder="Modifiers comma separated" value={restaurantTicketForm.modifiers} onChange={(event) => setRestaurantTicketForm((previous) => ({ ...previous, modifiers: event.target.value }))} />
              <select aria-label="Restaurant Ticket Assignee" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={restaurantTicketForm.assigneeStaffId} onChange={(event) => setRestaurantTicketForm((previous) => ({ ...previous, assigneeStaffId: event.target.value }))}>
                <option value="">No assignee</option>
                {activeStaff.map((staffRecord) => (
                  <option key={staffRecord.id} value={staffRecord.id}>
                    {staffRecord.fullName}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" className="w-full" onClick={handleCreateKitchenTicket}>
              Create Kitchen Ticket
            </Button>
            <div className="space-y-2">
              {kitchenTickets.map((ticketRecord) => (
                <div key={ticketRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{ticketRecord.ticketNumber} • {ticketRecord.itemSummary}</p>
                      <p className="text-xs text-slate-500">{ticketRecord.tableName} • {ticketRecord.channel} • {ticketRecord.course}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{ticketRecord.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Modifiers: {ticketRecord.modifiers.join(', ') || 'None'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['queued', 'preparing', 'ready', 'served'] as const).map((statusItem) => (
                      <Button key={statusItem} type="button" variant="outline" className="h-8 rounded-md px-3 text-xs" onClick={() => setKitchenTicketStatus(ticketRecord.id, statusItem)}>
                        {statusItem}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSalonSection = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      {hasFeature('salonServices') && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Service Menu And Deposit Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input aria-label="Salon Service Name" placeholder="Service name" value={salonServiceForm.name} onChange={(event) => setSalonServiceForm((previous) => ({ ...previous, name: event.target.value }))} />
              <Input aria-label="Salon Service Category" placeholder="Category" value={salonServiceForm.category} onChange={(event) => setSalonServiceForm((previous) => ({ ...previous, category: event.target.value }))} />
              <Input aria-label="Salon Service Duration" type="number" placeholder="Duration minutes" value={salonServiceForm.durationMinutes} onChange={(event) => setSalonServiceForm((previous) => ({ ...previous, durationMinutes: event.target.value }))} />
              <Input aria-label="Salon Service Price" type="number" placeholder="Price" value={salonServiceForm.price} onChange={(event) => setSalonServiceForm((previous) => ({ ...previous, price: event.target.value }))} />
              <Input aria-label="Salon No Show Fee" type="number" placeholder="No-show fee" value={salonServiceForm.noShowFee} onChange={(event) => setSalonServiceForm((previous) => ({ ...previous, noShowFee: event.target.value }))} />
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <input type="checkbox" checked={salonServiceForm.depositRequired} onChange={(event) => setSalonServiceForm((previous) => ({ ...previous, depositRequired: event.target.checked }))} />
                Deposit required
              </label>
            </div>
            <Button type="button" className="w-full" onClick={handleCreateSalonService}>
              Add Salon Service
            </Button>
            <div className="space-y-2">
              {salonServices.map((serviceRecord) => (
                <div key={serviceRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{serviceRecord.name}</p>
                  <p className="text-xs text-slate-500">
                    {serviceRecord.category} • {serviceRecord.durationMinutes} min • {formatCurrencyValue(serviceRecord.price, globalPreferences)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Deposit: {serviceRecord.depositRequired ? 'Required' : 'Optional'} • No-show fee: {formatCurrencyValue(serviceRecord.noShowFee, globalPreferences)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Salon Booking Flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <select aria-label="Salon Booking Service" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={salonBookingForm.serviceId} onChange={(event) => setSalonBookingForm((previous) => ({ ...previous, serviceId: event.target.value }))}>
              {salonServices.map((serviceRecord) => (
                <option key={serviceRecord.id} value={serviceRecord.id}>
                  {serviceRecord.name}
                </option>
              ))}
            </select>
            <Input aria-label="Salon Booking Customer" placeholder="Customer name" value={salonBookingForm.customerName} onChange={(event) => setSalonBookingForm((previous) => ({ ...previous, customerName: event.target.value }))} />
            <select aria-label="Salon Booking Assignee" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={salonBookingForm.assigneeId} onChange={(event) => setSalonBookingForm((previous) => ({ ...previous, assigneeId: event.target.value }))}>
              {activeStaff.map((staffRecord) => (
                <option key={staffRecord.id} value={staffRecord.id}>
                  {staffRecord.fullName}
                </option>
              ))}
            </select>
            <Input aria-label="Salon Booking Date" type="date" value={salonBookingForm.date} onChange={(event) => setSalonBookingForm((previous) => ({ ...previous, date: event.target.value }))} />
            <Input aria-label="Salon Booking Start Time" type="time" value={salonBookingForm.startTime} onChange={(event) => setSalonBookingForm((previous) => ({ ...previous, startTime: event.target.value }))} />
            {hasFeature('salonDeposits') && (
              <Input aria-label="Salon Booking Deposit" type="number" value={salonBookingForm.depositAmount} onChange={(event) => setSalonBookingForm((previous) => ({ ...previous, depositAmount: event.target.value }))} />
            )}
          </div>
          <Input aria-label="Salon Booking Notes" placeholder="Notes" value={salonBookingForm.notes} onChange={(event) => setSalonBookingForm((previous) => ({ ...previous, notes: event.target.value }))} />
          <Button type="button" className="w-full" onClick={handleCreateSalonBooking}>
            Create Salon Booking
          </Button>
          <div className="space-y-2">
            {salonBookings.map((bookingRecord) => (
              <div key={bookingRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{bookingRecord.serviceName} • {bookingRecord.customerName}</p>
                    <p className="text-xs text-slate-500">{bookingRecord.date} {bookingRecord.startTime} • {bookingRecord.assigneeName}</p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{bookingRecord.status}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Deposit: {formatCurrencyValue(bookingRecord.depositAmount, globalPreferences)} • Notes: {bookingRecord.notes || 'None'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['scheduled', 'checkedIn', 'completed', 'noShow', 'cancelled'] as const).map((statusItem) => (
                    <Button key={statusItem} type="button" variant="outline" className="h-8 rounded-md px-3 text-xs" onClick={() => setSalonBookingStatus(bookingRecord.id, statusItem)}>
                      {statusItem}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFieldServiceSection = () => (
    <div className="grid gap-6 xl:grid-cols-3">
      {hasFeature('fieldEstimates') && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Price Book</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Input aria-label="Price Book Name" placeholder="Line item" value={priceBookForm.name} onChange={(event) => setPriceBookForm((previous) => ({ ...previous, name: event.target.value }))} />
              <select aria-label="Price Book Trade" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={priceBookForm.trade} onChange={(event) => setPriceBookForm((previous) => ({ ...previous, trade: event.target.value as PriceBookFormState['trade'] }))}>
                <option value="general">General</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
              </select>
              <Input aria-label="Price Book Unit" placeholder="Unit" value={priceBookForm.unit} onChange={(event) => setPriceBookForm((previous) => ({ ...previous, unit: event.target.value }))} />
              <Input aria-label="Price Book Amount" type="number" placeholder="Unit price" value={priceBookForm.unitPrice} onChange={(event) => setPriceBookForm((previous) => ({ ...previous, unitPrice: event.target.value }))} />
            </div>
            <Button type="button" className="w-full" onClick={handleCreatePriceBookItem}>
              Add Price Book Item
            </Button>
            <div className="space-y-2">
              {priceBookItems.map((priceBookItem) => (
                <div key={priceBookItem.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{priceBookItem.name}</p>
                  <p className="text-xs text-slate-500">{priceBookItem.trade} • {priceBookItem.unit}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatCurrencyValue(priceBookItem.unitPrice, globalPreferences)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasFeature('fieldDispatch') && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Dispatch Board</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Input aria-label="Field Job Customer" placeholder="Customer" value={fieldJobForm.customerName} onChange={(event) => setFieldJobForm((previous) => ({ ...previous, customerName: event.target.value }))} />
              <Input aria-label="Field Job Address" placeholder="Service address" value={fieldJobForm.serviceAddress} onChange={(event) => setFieldJobForm((previous) => ({ ...previous, serviceAddress: event.target.value }))} />
              <select aria-label="Field Job Trade" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={fieldJobForm.trade} onChange={(event) => setFieldJobForm((previous) => ({ ...previous, trade: event.target.value as FieldJobFormState['trade'] }))}>
                <option value="general">General</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
              </select>
              <Input aria-label="Field Job Date" type="date" value={fieldJobForm.scheduledDate} onChange={(event) => setFieldJobForm((previous) => ({ ...previous, scheduledDate: event.target.value }))} />
              <Input aria-label="Field Job Window" placeholder="Window" value={fieldJobForm.scheduledWindow} onChange={(event) => setFieldJobForm((previous) => ({ ...previous, scheduledWindow: event.target.value }))} />
              <select aria-label="Field Job Technician" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={fieldJobForm.technicianId} onChange={(event) => setFieldJobForm((previous) => ({ ...previous, technicianId: event.target.value }))}>
                {activeStaff.map((staffRecord) => (
                  <option key={staffRecord.id} value={staffRecord.id}>
                    {staffRecord.fullName}
                  </option>
                ))}
              </select>
              <Input aria-label="Field Job Summary" placeholder="Work summary" value={fieldJobForm.summary} onChange={(event) => setFieldJobForm((previous) => ({ ...previous, summary: event.target.value }))} />
            </div>
            <Button type="button" className="w-full" onClick={handleCreateFieldJob}>
              Create Field Job
            </Button>
            <div className="space-y-2">
              {fieldJobs.map((jobRecord) => (
                <div key={jobRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{jobRecord.customerName}</p>
                      <p className="text-xs text-slate-500">{jobRecord.serviceAddress} • {jobRecord.scheduledDate} {jobRecord.scheduledWindow}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{jobRecord.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{jobRecord.summary} • Technician: {jobRecord.technicianName}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['scheduled', 'enRoute', 'inProgress', 'completed', 'cancelled'] as const).map((statusItem) => (
                      <Button key={statusItem} type="button" variant="outline" className="h-8 rounded-md px-3 text-xs" onClick={() => setFieldJobStatus(jobRecord.id, statusItem)}>
                        {statusItem}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasFeature('fieldEstimates') && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Estimates And Conversion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Input aria-label="Field Estimate Customer" placeholder="Customer" value={fieldEstimateForm.customerName} onChange={(event) => setFieldEstimateForm((previous) => ({ ...previous, customerName: event.target.value }))} />
              <select aria-label="Field Estimate Job" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={fieldEstimateForm.jobId} onChange={(event) => setFieldEstimateForm((previous) => ({ ...previous, jobId: event.target.value }))}>
                <option value="">No job</option>
                {fieldJobs.map((jobRecord) => (
                  <option key={jobRecord.id} value={jobRecord.id}>
                    {jobRecord.customerName} • {jobRecord.summary}
                  </option>
                ))}
              </select>
              <select aria-label="Field Estimate Price Book Item" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={fieldEstimateForm.priceBookItemId} onChange={(event) => setFieldEstimateForm((previous) => ({ ...previous, priceBookItemId: event.target.value }))}>
                {priceBookItems.map((priceBookItem) => (
                  <option key={priceBookItem.id} value={priceBookItem.id}>
                    {priceBookItem.name}
                  </option>
                ))}
              </select>
              <Input aria-label="Field Estimate Quantity" type="number" value={fieldEstimateForm.quantity} onChange={(event) => setFieldEstimateForm((previous) => ({ ...previous, quantity: event.target.value }))} />
            </div>
            <Button type="button" className="w-full" onClick={handleCreateFieldEstimate}>
              Create Estimate
            </Button>
            <div className="space-y-2">
              {fieldEstimates.map((estimateRecord) => (
                <div key={estimateRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{estimateRecord.customerName}</p>
                      <p className="text-xs text-slate-500">{estimateRecord.lineItems.map((lineItem) => `${lineItem.name} x${lineItem.quantity}`).join(', ')}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{estimateRecord.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatCurrencyValue(estimateRecord.totalAmount, globalPreferences)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(['draft', 'sent', 'approved', 'declined'] as const).map((statusItem) => (
                      <Button key={statusItem} type="button" variant="outline" className="h-8 rounded-md px-3 text-xs" onClick={() => setFieldEstimateStatus(estimateRecord.id, statusItem)}>
                        {statusItem}
                      </Button>
                    ))}
                    <Button type="button" className="h-8 rounded-md px-3 text-xs" onClick={() => convertFieldEstimateToInvoice(estimateRecord.id)}>
                      Convert To Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderGrocerySection = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      {hasFeature('routeSubscriptions') && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Recurring Delivery Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input aria-label="Subscription Customer" placeholder="Customer" value={subscriptionForm.customerName} onChange={(event) => setSubscriptionForm((previous) => ({ ...previous, customerName: event.target.value }))} />
              <select aria-label="Subscription Frequency" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={subscriptionForm.frequency} onChange={(event) => setSubscriptionForm((previous) => ({ ...previous, frequency: event.target.value as SubscriptionFormState['frequency'] }))}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
              <Input aria-label="Subscription Days" placeholder="Mon,Wed,Fri" value={subscriptionForm.deliveryDays} onChange={(event) => setSubscriptionForm((previous) => ({ ...previous, deliveryDays: event.target.value }))} />
              <Input aria-label="Subscription Next Date" type="date" value={subscriptionForm.nextDeliveryDate} onChange={(event) => setSubscriptionForm((previous) => ({ ...previous, nextDeliveryDate: event.target.value }))} />
            </div>
            <Input aria-label="Subscription Items" placeholder="Item summary" value={subscriptionForm.itemSummary} onChange={(event) => setSubscriptionForm((previous) => ({ ...previous, itemSummary: event.target.value }))} />
            <Button type="button" className="w-full" onClick={handleCreateSubscription}>
              Add Subscription
            </Button>
            <div className="space-y-2">
              {deliverySubscriptions.map((subscriptionRecord) => (
                <label key={subscriptionRecord.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    checked={selectedSubscriptionIds.includes(subscriptionRecord.id)}
                    onChange={() =>
                      setSelectedSubscriptionIds((previous) =>
                        previous.includes(subscriptionRecord.id)
                          ? previous.filter((item) => item !== subscriptionRecord.id)
                          : [...previous, subscriptionRecord.id]
                      )
                    }
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{subscriptionRecord.customerName}</p>
                    <p className="text-xs text-slate-500">{subscriptionRecord.itemSummary}</p>
                    <p className="mt-1 text-xs text-slate-500">{subscriptionRecord.frequency} • {subscriptionRecord.deliveryDays.join(', ')} • next {subscriptionRecord.nextDeliveryDate}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasFeature('routeManifests') && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Route Manifest Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input aria-label="Manifest Route Date" type="date" value={manifestForm.routeDate} onChange={(event) => setManifestForm((previous) => ({ ...previous, routeDate: event.target.value }))} />
              <select aria-label="Manifest Driver" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={manifestForm.driverId} onChange={(event) => setManifestForm((previous) => ({ ...previous, driverId: event.target.value }))}>
                {activeStaff.map((staffRecord) => (
                  <option key={staffRecord.id} value={staffRecord.id}>
                    {staffRecord.fullName}
                  </option>
                ))}
              </select>
              <Input aria-label="Manifest Vehicle" placeholder="Vehicle" value={manifestForm.vehicleLabel} onChange={(event) => setManifestForm((previous) => ({ ...previous, vehicleLabel: event.target.value }))} />
            </div>
            <Button type="button" className="w-full" onClick={handleCreateManifest}>
              Create Route Manifest
            </Button>
            <div className="space-y-3">
              {routeManifests.map((manifestRecord) => (
                <div key={manifestRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{manifestRecord.routeDate} • {manifestRecord.driverName}</p>
                      <p className="text-xs text-slate-500">{manifestRecord.vehicleLabel} • {manifestRecord.status}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">{manifestRecord.stops.length} stops</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {manifestRecord.stops.map((stopRecord) => (
                      <label key={stopRecord.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 text-sm">
                        <input
                          type="checkbox"
                          checked={stopRecord.delivered}
                          onChange={(event) => setRouteManifestStopDelivered(manifestRecord.id, stopRecord.id, event.target.checked)}
                        />
                        <span>
                          {stopRecord.customerName} • {stopRecord.itemSummary}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <section className="space-y-6 pb-8">
      <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Unified Commerce And Service</p>
        <h1 className="mt-2 text-3xl font-semibold">Business Suite</h1>
        <p className="mt-1 max-w-4xl text-sm text-slate-500">
          One deployment can run retail, restaurant, salon, field service, or grocery delivery. The active installation is driven by the deployment profile in Settings.
        </p>
      </header>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Deployment Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Business Type</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{storeProfile.businessType}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Primary Industry</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{storeProfile.primaryIndustry}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Enabled Industries</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{enabledIndustries.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Enabled Features</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{enabledFeatures.length}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 xl:grid-cols-5">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              activeIndustry === tab.id
                ? 'rounded-2xl border border-cyan-300 bg-cyan-50 p-4 text-left shadow-sm'
                : 'rounded-2xl border border-slate-200 bg-white/90 p-4 text-left shadow-sm'
            }
            onClick={() => setSelectedIndustry(tab.id)}
          >
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-slate-900 p-2 text-white">
                <tab.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{tab.label}</p>
                <p className="mt-1 text-xs text-slate-500">{tab.summary}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>{industryTabs.find((tab) => tab.id === activeIndustry)?.label} Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            {industrySummaryCards.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Core Workflows</p>
              <div className="mt-3 space-y-2">
                {workflowByIndustry[activeIndustry].map((workflow, index) => (
                  <div key={workflow} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm text-slate-700">{workflow}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Shared Platform Layer</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {[
                  { label: 'POS + Orders', value: `${orders.length}`, icon: ClipboardList },
                  { label: 'Inventory', value: `${products.length}`, icon: Boxes },
                  { label: 'Appointments', value: `${appointments.length}`, icon: CalendarDays },
                  { label: 'Security', value: `${enabledFeatures.length} flags`, icon: ShieldCheck }
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3">
                    <item.icon className="h-4 w-4 text-slate-700" />
                    <p className="mt-2 text-xs uppercase tracking-[0.1em] text-slate-500">{item.label}</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeIndustry === 'restaurant' && renderRestaurantSection()}
      {activeIndustry === 'salon' && renderSalonSection()}
      {activeIndustry === 'fieldService' && renderFieldServiceSection()}
      {activeIndustry === 'grocery' && renderGrocerySection()}

      {activeIndustry === 'retail' && (
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Retail Core Layer</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Stock Health</p>
              <p className="mt-2 text-sm text-slate-600">Low-stock SKUs: {lowStockCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Customer Base</p>
              <p className="mt-2 text-sm text-slate-600">Profiles: {nonWalkInCustomers.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Delivery Load</p>
              <p className="mt-2 text-sm text-slate-600">Pending: {pendingDeliveries}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Procurement</p>
              <p className="mt-2 text-sm text-slate-600">Vendor-backed replenishment is live in Inventory.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
