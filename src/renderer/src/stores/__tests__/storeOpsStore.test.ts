import { useStoreOpsStore } from '@/stores/storeOpsStore';

describe('storeOpsStore', () => {
  beforeEach(() => {
    useStoreOpsStore.setState({
      storeProfile: {
        storeName: 'Main Street Market',
        storeCode: 'MSM-001',
        address: '245 Main Street, Springfield',
        timezone: 'America/New_York',
        businessType: 'Supermarket',
        primaryIndustry: 'retail',
        enabledIndustries: ['retail', 'restaurant', 'salon', 'fieldService', 'grocery'],
        deploymentSetupCompletedAt: '2026-03-15T08:00:00.000Z',
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
        ]
      },
      taxRate: 0.07,
      standardDailyHours: 8,
      maxDailyHours: 12,
      overtimeMultiplier: 1.5,
      todaySales: 12840,
      todayOrders: 486,
      categories: [
        { id: 'category-produce', name: 'Produce', isActive: true },
        { id: 'category-dairy', name: 'Dairy', isActive: true },
        { id: 'category-grocery', name: 'Grocery', isActive: true },
        { id: 'category-snacks', name: 'Snacks', isActive: true }
      ],
      products: [
        { id: 'product-apple', name: 'Apple Pack', category: 'Produce', price: 4.2, stock: 78, reorderLevel: 20 },
        { id: 'product-milk', name: 'Whole Milk 1L', category: 'Dairy', price: 2.8, stock: 41, reorderLevel: 18 },
        { id: 'product-rice', name: 'Rice 5kg', category: 'Grocery', price: 12.5, stock: 30, reorderLevel: 12 },
        { id: 'product-chips', name: 'Potato Chips', category: 'Snacks', price: 1.75, stock: 16, reorderLevel: 22 }
      ],
      customers: [
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
      ],
      globalPreferences: {
        locale: 'en-US',
        currency: 'USD',
        timezone: 'America/New_York',
        dateStyle: 'medium'
      },
      staffRecords: [
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
          lastAttendanceActionAt: '2026-03-01T00:00:00.000Z',
          breakStartedAt: null,
          breakMinutesToday: 0,
          commissionRate: 0.02,
          totalSalesAmount: 0,
          totalSalesCount: 0,
          commissionEarned: 0,
          tipsEarned: 0
        }
      ],
      meetings: [],
      appointments: [],
      orders: [],
      orderCustomFields: [],
      invoices: [],
      restaurantTables: [],
      kitchenTickets: [],
      salonServices: [],
      salonBookings: [],
      priceBookItems: [],
      fieldJobs: [],
      fieldEstimates: [],
      deliverySubscriptions: [],
      routeManifests: [],
      shiftPlans: [],
      attendanceSessions: [
        {
          id: 'attendance-open-mia',
          staffId: 'staff-mia',
          staffName: 'Mia Carter',
          clockInAt: new Date().toISOString(),
          clockOutAt: null,
          breakStartedAt: null,
          breakMinutes: 0,
          totalHours: 0,
          overtimeHours: 0,
          complianceFlag: false
        }
      ],
      leaveRequests: [],
      payrollRecords: [],
      departmentChanges: [],
      counterRecords: [],
      userAccounts: [],
      userAccountAuditRecords: [],
      tipsPoolBalance: 0,
      registerSession: {
        isOpen: false,
        openingCash: 0,
        currentCash: 0,
        openedAt: null,
        closedAt: null
      }
    });
  });

  it('requires open register before checkout', () => {
    const state = useStoreOpsStore.getState();

    expect(() => {
      state.processCheckout({
        items: [{ productId: 'product-apple', quantity: 1 }],
        paymentMethod: 'cash'
      });
    }).toThrow('Open register session before checkout');
  });

  it('processes checkout and updates order, stock, cash, and loyalty', () => {
    let state = useStoreOpsStore.getState();
    state.startRegisterSession(100);

    state = useStoreOpsStore.getState();
    const result = state.processCheckout({
      items: [{ productId: 'product-apple', quantity: 4 }],
      paymentMethod: 'cash',
      customerId: 'customer-emily',
      discountAmount: 1
    });

    const nextState = useStoreOpsStore.getState();
    expect(result.ok).toBe(true);
    expect(nextState.orders.length).toBe(1);
    expect(nextState.products.find((product) => product.id === 'product-apple')?.stock).toBe(74);
    expect(nextState.registerSession.currentCash).toBeGreaterThan(100);
    expect(nextState.customers.find((customer) => customer.id === 'customer-emily')?.loyaltyPoints).toBeGreaterThan(180);
  });

  it('adds customer and updates credit and points', () => {
    let state = useStoreOpsStore.getState();
    state.addCustomer({ fullName: 'Jordan Miles', phone: '+1 555 000 1111', email: 'jordan@example.com' });

    state = useStoreOpsStore.getState();
    const customer = state.customers.find((item) => item.fullName === 'Jordan Miles');
    expect(customer).toBeDefined();

    if (!customer) {
      return;
    }

    state.addCustomerCredit(customer.id, 50);
    state.redeemCustomerPoints(customer.id, 0);

    const nextState = useStoreOpsStore.getState();
    const nextCustomer = nextState.customers.find((item) => item.id === customer.id);
    expect(nextCustomer?.creditBalance).toBe(50);
  });

  it('manages shifts, leave requests, and payroll generation', () => {
    const state = useStoreOpsStore.getState();

    state.addShiftPlan({
      staffId: 'staff-mia',
      date: '2026-03-04',
      startTime: '09:00',
      endTime: '18:00',
      roleDuringShift: 'Cashier'
    });
    expect(useStoreOpsStore.getState().shiftPlans.length).toBe(1);

    state.addLeaveRequest({
      staffId: 'staff-mia',
      dateFrom: '2026-03-11',
      dateTo: '2026-03-12',
      reason: 'Family event'
    });
    const leaveRequest = useStoreOpsStore.getState().leaveRequests[0];
    expect(leaveRequest.status).toBe('pending');

    state.setLeaveStatus(leaveRequest.id, 'approved');
    expect(useStoreOpsStore.getState().leaveRequests[0].status).toBe('approved');

    state.clockOutStaff('staff-mia');
    state.clockInStaff('staff-mia');
    state.clockOutStaff('staff-mia');
    state.generatePayroll('2026-03');

    const payrollRecord = useStoreOpsStore.getState().payrollRecords.find((record) => record.staffId === 'staff-mia');
    expect(payrollRecord).toBeDefined();
    expect(payrollRecord?.netSalary).toBeGreaterThan(0);

    const timesheetSummary = useStoreOpsStore.getState().getTimesheetSummaries()[0];
    expect(timesheetSummary.monthlyHours).toBeGreaterThanOrEqual(0);
  });

  it('handles break tracking, commission sales, tips, and employee onboarding', () => {
    const state = useStoreOpsStore.getState();

    state.startStaffBreak('staff-mia');
    state.endStaffBreak('staff-mia');
    state.recordStaffSale('staff-mia', 500);
    state.addTipsPool(90);
    state.distributeTipsPool();

    state.addStaffMember({
      fullName: 'Lena Ford',
      role: 'Cashier',
      department: 'sales',
      assignedLocation: 'Main Store',
      joinedOn: '2026-03-01',
      monthlySalary: 3000,
      commissionRate: 0.03
    });

    const nextState = useStoreOpsStore.getState();
    const mia = nextState.staffRecords.find((record) => record.id === 'staff-mia');
    const lena = nextState.staffRecords.find((record) => record.fullName === 'Lena Ford');

    expect(mia?.totalSalesAmount).toBe(500);
    expect(mia?.commissionEarned).toBeGreaterThan(0);
    expect(mia?.tipsEarned).toBeGreaterThan(0);
    expect(lena?.isActive).toBe(true);

    if (lena) {
      nextState.reassignStaffDepartment({
        staffId: lena.id,
        toDepartment: 'operations',
        reason: 'Cross-training',
        changedBy: 'Super Admin',
        changeMode: 'transferRequest'
      });
      nextState.deactivateStaffMember(lena.id);
    }

    expect(useStoreOpsStore.getState().staffRecords.find((record) => record.fullName === 'Lena Ford')?.isActive).toBe(false);
    expect(useStoreOpsStore.getState().departmentChanges.length).toBeGreaterThan(0);
    expect(useStoreOpsStore.getState().exportDepartmentChangeReportCsv()).toContain('toDepartment');
    expect(useStoreOpsStore.getState().exportDepartmentChangeReportText()).toContain('Department Allotment Report');
  });

  it('tracks appointments, calendar summary, and pending deliveries by day', () => {
    const state = useStoreOpsStore.getState();
    state.importOrders([
      {
        id: 'order-calendar-test',
        customerName: 'Emily Rivera',
        totalAmount: 18.5,
        paymentMethod: 'card',
        status: 'completed',
        createdAt: '2026-03-14T10:00:00.000Z',
        deliveryStatus: 'pending',
        deliveryDate: '2026-03-14'
      }
    ]);
    state.addMeeting({
      title: 'Delivery Review',
      assigneeId: 'staff-mia',
      date: '2026-03-14',
      time: '11:30'
    });
    state.addAppointment({
      title: 'Store Consultation',
      customerName: 'Jordan Miles',
      assigneeId: 'staff-mia',
      date: '2026-03-14',
      startTime: '12:00',
      endTime: '12:30',
      notes: 'New wholesale onboarding'
    });

    const appointmentId = useStoreOpsStore.getState().appointments[0]?.id;

    if (appointmentId) {
      useStoreOpsStore.getState().setAppointmentStatus(appointmentId, 'completed');
    }

    const summary = useStoreOpsStore.getState().getCalendarDaySummary('2026-03-14');

    expect(summary.meetingsCount).toBe(1);
    expect(summary.appointmentsCount).toBe(1);
    expect(summary.completedAppointmentsCount).toBe(1);
    expect(summary.ordersCount).toBe(1);
    expect(summary.pendingDeliveriesCount).toBe(1);
  });

  it('imports products, customers, meetings, appointments, shifts, and leave records', () => {
    const state = useStoreOpsStore.getState();

    state.importProducts([
      {
        name: 'Orange Juice 1L',
        category: 'Dairy',
        price: 3.4,
        stock: 14,
        reorderLevel: 6
      }
    ]);
    state.importCustomers([
      {
        fullName: 'Jordan Miles',
        phone: '+1 555 222 3333',
        email: 'jordan@example.com',
        loyaltyPoints: 45,
        creditBalance: 22
      }
    ]);
    state.importMeetings([
      {
        title: 'Inventory Standup',
        assigneeName: 'Mia Carter',
        date: '2026-03-16',
        time: '09:00'
      }
    ]);
    state.importAppointments([
      {
        title: 'Vendor Consultation',
        customerName: 'North Foods',
        assigneeName: 'Mia Carter',
        date: '2026-03-16',
        startTime: '10:00',
        endTime: '10:30',
        status: 'completed',
        notes: 'Monthly review'
      }
    ]);
    state.importShiftPlans([
      {
        staffName: 'Mia Carter',
        date: '2026-03-16',
        startTime: '09:00',
        endTime: '17:00',
        roleDuringShift: 'Lead Cashier'
      }
    ]);
    state.importLeaveRequests([
      {
        staffName: 'Mia Carter',
        dateFrom: '2026-03-20',
        dateTo: '2026-03-21',
        reason: 'Family event',
        status: 'approved'
      }
    ]);

    const nextState = useStoreOpsStore.getState();
    expect(nextState.products.some((product) => product.name === 'Orange Juice 1L')).toBe(true);
    expect(nextState.customers.some((customer) => customer.fullName === 'Jordan Miles' && customer.creditBalance === 22)).toBe(true);
    expect(nextState.meetings[0]?.title).toBe('Inventory Standup');
    expect(nextState.appointments[0]?.status).toBe('completed');
    expect(nextState.shiftPlans[0]?.roleDuringShift).toBe('Lead Cashier');
    expect(nextState.leaveRequests[0]?.status).toBe('approved');
  });

  it('supports deployment profiles and vertical operations for restaurant, salon, field service, and routes', () => {
    const state = useStoreOpsStore.getState();

    state.setDeploymentProfile({
      businessType: 'Unified Multi-Industry',
      primaryIndustry: 'restaurant',
      enabledIndustries: ['restaurant', 'salon', 'fieldService', 'grocery'],
      enabledFeatures: ['businessSuite', 'restaurantTables', 'kitchenDisplay', 'salonServices', 'fieldDispatch', 'fieldEstimates', 'routeSubscriptions', 'routeManifests', 'settings']
    });
    state.addRestaurantTable({ name: 'Table 10', area: 'Upper Hall', seats: 6 });
    const restaurantTable = useStoreOpsStore.getState().restaurantTables[0];
    state.addKitchenTicket({
      tableId: restaurantTable.id,
      channel: 'dineIn',
      itemSummary: 'Pizza Slice x4',
      course: 'Main',
      modifiers: ['Extra cheese'],
      assigneeStaffId: 'staff-mia'
    });
    const kitchenTicket = useStoreOpsStore.getState().kitchenTickets[0];
    state.setKitchenTicketStatus(kitchenTicket.id, 'served');

    state.addSalonService({
      name: 'Hydration Facial',
      category: 'Skin',
      durationMinutes: 60,
      price: 85,
      depositRequired: true,
      noShowFee: 20
    });
    const salonService = useStoreOpsStore.getState().salonServices[0];
    state.addSalonBooking({
      serviceId: salonService.id,
      customerName: 'Jordan Miles',
      assigneeId: 'staff-mia',
      date: '2026-03-20',
      startTime: '10:00',
      depositAmount: 20
    });
    const salonBooking = useStoreOpsStore.getState().salonBookings[0];
    state.setSalonBookingStatus(salonBooking.id, 'completed');

    state.addPriceBookItem({
      name: 'Breaker Reset',
      trade: 'electrical',
      unit: 'job',
      unitPrice: 120
    });
    const priceBookItem = useStoreOpsStore.getState().priceBookItems[0];
    state.addFieldJob({
      customerName: 'Taylor Parker',
      serviceAddress: '51 Green Lane',
      trade: 'electrical',
      scheduledDate: '2026-03-22',
      scheduledWindow: '12:00 - 14:00',
      technicianId: 'staff-mia',
      summary: 'Breaker troubleshooting'
    });
    const fieldJob = useStoreOpsStore.getState().fieldJobs[0];
    state.setFieldJobStatus(fieldJob.id, 'inProgress');
    state.addFieldEstimate({
      customerName: 'Taylor Parker',
      jobId: fieldJob.id,
      lineItems: [{ priceBookItemId: priceBookItem.id, quantity: 2 }]
    });
    const fieldEstimate = useStoreOpsStore.getState().fieldEstimates[0];
    state.convertFieldEstimateToInvoice(fieldEstimate.id);

    state.addDeliverySubscription({
      customerName: 'Sunrise Apartments',
      frequency: 'daily',
      deliveryDays: ['Mon', 'Tue'],
      itemSummary: 'Milk crates',
      nextDeliveryDate: '2026-03-23'
    });
    const subscription = useStoreOpsStore.getState().deliverySubscriptions[0];
    state.addRouteManifest({
      routeDate: '2026-03-23',
      driverId: 'staff-mia',
      vehicleLabel: 'Van 5',
      subscriptionIds: [subscription.id]
    });
    const manifest = useStoreOpsStore.getState().routeManifests[0];
    const stop = manifest.stops[0];
    state.setRouteManifestStopDelivered(manifest.id, stop.id, true);

    const nextState = useStoreOpsStore.getState();
    expect(nextState.storeProfile.primaryIndustry).toBe('restaurant');
    expect(nextState.kitchenTickets[0].status).toBe('served');
    expect(nextState.salonBookings[0].status).toBe('completed');
    expect(nextState.fieldJobs[0].status).toBe('inProgress');
    expect(nextState.fieldEstimates[0].status).toBe('invoiced');
    expect(nextState.invoices.length).toBe(1);
    expect(nextState.routeManifests[0].status).toBe('completed');
  });
});
