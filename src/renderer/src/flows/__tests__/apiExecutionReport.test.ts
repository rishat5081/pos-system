import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { authService } from '@main/services/authService';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

type ApiStatus = 'passed' | 'failed';

interface ApiRunResult {
  apiName: string;
  status: ApiStatus;
  durationMs: number;
  detail: string;
}

interface StressSummary {
  seededCategories: number;
  seededProducts: number;
  seededCustomers: number;
  stressOrders: number;
  seedDurationMs: number;
  stressDurationMs: number;
  throughputOrdersPerSecond: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  maxLatencyMs: number;
  finalCategoryCount: number;
  finalProductCount: number;
  finalCustomerCount: number;
  finalOrderCount: number;
}

const reportDirectory = resolve(process.cwd(), 'reports');

function resetStoreOpsState(): void {
  useStoreOpsStore.setState({
    taxRate: 0.07,
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
        lastAttendanceActionAt: '2026-03-01T09:00:00.000Z',
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
        lastAttendanceActionAt: '2026-03-01T09:00:00.000Z',
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
    ],
    meetings: [
      {
        id: 'meeting-standup',
        title: 'Daily Shift Standup',
        assigneeId: 'staff-aiden',
        assigneeName: 'Aiden Brooks',
        date: '2026-03-02',
        time: '09:30'
      }
    ],
    orders: [],
    departmentChanges: [],
    registerSession: {
      isOpen: false,
      openingCash: 0,
      currentCash: 0,
      openedAt: null,
      closedAt: null
    }
  });
}

function runApi(apiName: string, fn: () => unknown): ApiRunResult {
  const startedAt = performance.now();

  try {
    const result = fn();
    const durationMs = performance.now() - startedAt;

    return {
      apiName,
      status: 'passed',
      durationMs,
      detail: `ok (${typeof result === 'object' ? 'object result' : String(result)})`
    };
  } catch (error) {
    const durationMs = performance.now() - startedAt;
    const message = error instanceof Error ? error.message : 'unknown error';

    return {
      apiName,
      status: 'failed',
      durationMs,
      detail: message
    };
  }
}

function runExpectedError(apiName: string, fn: () => unknown): ApiRunResult {
  const startedAt = performance.now();

  try {
    fn();
    return {
      apiName,
      status: 'failed',
      durationMs: performance.now() - startedAt,
      detail: 'expected an error but call succeeded'
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    return {
      apiName,
      status: 'passed',
      durationMs: performance.now() - startedAt,
      detail: `expected error: ${message}`
    };
  }
}

function writeApiReport(results: ApiRunResult[]): void {
  mkdirSync(reportDirectory, { recursive: true });

  const failedCount = results.filter((result) => result.status === 'failed').length;
  const passedCount = results.length - failedCount;

  const jsonPath = resolve(reportDirectory, 'apiReport.json');
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalApis: results.length,
        passedCount,
        failedCount,
        results
      },
      null,
      2
    ),
    'utf8'
  );

  const markdownLines = [
    '# Api Execution Report',
    '',
    `Generated At: ${new Date().toISOString()}`,
    `Total APIs: ${results.length}`,
    `Passed: ${passedCount}`,
    `Failed: ${failedCount}`,
    '',
    '| Api | Status | Duration (ms) | Detail |',
    '| --- | --- | ---: | --- |'
  ];

  for (const result of results) {
    markdownLines.push(
      `| ${result.apiName} | ${result.status.toUpperCase()} | ${result.durationMs.toFixed(3)} | ${result.detail} |`
    );
  }

  const markdownPath = resolve(reportDirectory, 'apiReport.md');
  writeFileSync(markdownPath, `${markdownLines.join('\n')}\n`, 'utf8');
}

function writeStressReport(summary: StressSummary): void {
  mkdirSync(reportDirectory, { recursive: true });

  writeFileSync(resolve(reportDirectory, 'stressReport.json'), JSON.stringify(summary, null, 2), 'utf8');

  const markdown = [
    '# Stress Test Report',
    '',
    `Generated At: ${new Date().toISOString()}`,
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Seeded Categories | ${summary.seededCategories} |`,
    `| Seeded Products | ${summary.seededProducts} |`,
    `| Seeded Customers | ${summary.seededCustomers} |`,
    `| Stress Orders | ${summary.stressOrders} |`,
    `| Seed Duration (ms) | ${summary.seedDurationMs.toFixed(3)} |`,
    `| Stress Duration (ms) | ${summary.stressDurationMs.toFixed(3)} |`,
    `| Throughput (orders/s) | ${summary.throughputOrdersPerSecond.toFixed(2)} |`,
    `| Average Latency (ms) | ${summary.averageLatencyMs.toFixed(4)} |`,
    `| P95 Latency (ms) | ${summary.p95LatencyMs.toFixed(4)} |`,
    `| Max Latency (ms) | ${summary.maxLatencyMs.toFixed(4)} |`,
    `| Final Category Count | ${summary.finalCategoryCount} |`,
    `| Final Product Count | ${summary.finalProductCount} |`,
    `| Final Customer Count | ${summary.finalCustomerCount} |`,
    `| Final Order Count | ${summary.finalOrderCount} |`
  ].join('\n');

  writeFileSync(resolve(reportDirectory, 'stressReport.md'), `${markdown}\n`, 'utf8');
}

describe('api execution and stress testing', () => {
  beforeEach(() => {
    authService.logout();
    resetStoreOpsState();
  });

  it('runs each implemented simple api and writes complete api report', () => {
    const results: ApiRunResult[] = [];

    results.push(
      runExpectedError('auth.login.invalidCredentials', () => {
        authService.login({ username: 'admin', password: 'wrongPassword' });
      })
    );

    results.push(
      runApi('auth.login.validCredentials', () => {
        return authService.login({ username: 'admin', password: 'admin123' });
      })
    );

    results.push(
      runApi('auth.getSession', () => {
        return authService.getSession();
      })
    );

    results.push(
      runApi('auth.logout', () => {
        authService.logout();
        return authService.getSession();
      })
    );

    results.push(
      runApi('store.addCategory', () => {
        useStoreOpsStore.getState().addCategory({ name: 'Frozen Foods' });
        return useStoreOpsStore.getState().categories.length;
      })
    );

    results.push(
      runApi('store.addProduct', () => {
        useStoreOpsStore.getState().addProduct({
          name: 'Frozen Peas',
          category: 'Frozen Foods',
          price: 3.25,
          stock: 90,
          reorderLevel: 25
        });
        return useStoreOpsStore.getState().products.length;
      })
    );

    results.push(
      runApi('store.addCustomer', () => {
        useStoreOpsStore.getState().addCustomer({
          fullName: 'Sam Harper',
          phone: '+1 555 111 2222',
          email: 'sam.harper@example.com'
        });
        return useStoreOpsStore.getState().customers.length;
      })
    );

    results.push(
      runExpectedError('store.processCheckout.closedRegisterValidation', () => {
        useStoreOpsStore.getState().processCheckout({
          items: [{ productId: 'product-apple', quantity: 1 }],
          paymentMethod: 'cash'
        });
      })
    );

    results.push(
      runApi('store.startRegisterSession', () => {
        useStoreOpsStore.getState().startRegisterSession(500);
        return useStoreOpsStore.getState().registerSession;
      })
    );

    results.push(
      runApi('store.processCheckout', () => {
        return useStoreOpsStore.getState().processCheckout({
          items: [{ productId: 'product-apple', quantity: 3 }],
          paymentMethod: 'cash',
          customerId: 'customer-emily',
          discountAmount: 1
        });
      })
    );

    results.push(
      runApi('store.adjustStock', () => {
        const previousStock = useStoreOpsStore.getState().products.find((item) => item.id === 'product-apple')?.stock ?? 0;
        useStoreOpsStore.getState().adjustStock('product-apple', 5);
        return {
          previousStock,
          nextStock: useStoreOpsStore.getState().products.find((item) => item.id === 'product-apple')?.stock ?? 0
        };
      })
    );

    results.push(
      runApi('store.addCustomerCredit', () => {
        useStoreOpsStore.getState().addCustomerCredit('customer-emily', 50);
        return useStoreOpsStore.getState().customers.find((item) => item.id === 'customer-emily')?.creditBalance ?? 0;
      })
    );

    results.push(
      runApi('store.redeemCustomerPoints', () => {
        useStoreOpsStore.getState().redeemCustomerPoints('customer-emily', 20);
        return useStoreOpsStore.getState().customers.find((item) => item.id === 'customer-emily')?.loyaltyPoints ?? 0;
      })
    );

    results.push(
      runApi('store.toggleAttendance', () => {
        const previousValue = useStoreOpsStore.getState().staffRecords.find((item) => item.id === 'staff-noah')?.isClockedIn ?? false;
        useStoreOpsStore.getState().toggleAttendance('staff-noah');
        return {
          previousValue,
          nextValue: useStoreOpsStore.getState().staffRecords.find((item) => item.id === 'staff-noah')?.isClockedIn ?? false
        };
      })
    );

    results.push(
      runApi('store.addMeeting', () => {
        useStoreOpsStore.getState().addMeeting({
          title: 'Stock Sync',
          assigneeId: 'staff-noah',
          date: '2026-03-04',
          time: '10:15'
        });
        return useStoreOpsStore.getState().meetings.length;
      })
    );

    results.push(
      runApi('store.repayLoan', () => {
        const previousValue = useStoreOpsStore.getState().staffRecords.find((item) => item.id === 'staff-noah')?.loanBalance ?? 0;
        useStoreOpsStore.getState().repayLoan('staff-noah', 200);
        return {
          previousValue,
          nextValue: useStoreOpsStore.getState().staffRecords.find((item) => item.id === 'staff-noah')?.loanBalance ?? 0
        };
      })
    );

    results.push(
      runApi('store.endRegisterSession', () => {
        useStoreOpsStore.getState().endRegisterSession();
        return useStoreOpsStore.getState().registerSession;
      })
    );

    writeApiReport(results);

    const failures = results.filter((result) => result.status === 'failed');
    expect(failures).toHaveLength(0);
  });

  it('creates hundreds of dummy records and runs stress test', () => {
    const seededCategories = 250;
    const seededProducts = 450;
    const seededCustomers = 300;
    const stressOrders = 1500;

    const seedStartedAt = performance.now();

    for (let index = 0; index < seededCategories; index += 1) {
      useStoreOpsStore.getState().addCategory({ name: `stressCategory${index}` });
    }

    const availableCategories = useStoreOpsStore.getState().categories;

    for (let index = 0; index < seededProducts; index += 1) {
      const category = availableCategories[index % availableCategories.length];

      useStoreOpsStore.getState().addProduct({
        name: `stressProduct${index}`,
        category: category.name,
        price: 1 + (index % 25),
        stock: 500,
        reorderLevel: 50
      });
    }

    for (let index = 0; index < seededCustomers; index += 1) {
      useStoreOpsStore.getState().addCustomer({
        fullName: `stressCustomer${index}`,
        phone: `+1 555 700 ${String(index).padStart(4, '0')}`,
        email: `stressCustomer${index}@example.com`
      });
    }

    const seedDurationMs = performance.now() - seedStartedAt;

    useStoreOpsStore.getState().startRegisterSession(20000);

    const stressProducts = useStoreOpsStore
      .getState()
      .products.filter((product) => product.name.startsWith('stressProduct'));

    const stressCustomers = useStoreOpsStore
      .getState()
      .customers.filter((customer) => customer.fullName.startsWith('stressCustomer'));

    const paymentMethods: Array<'cash' | 'card' | 'digital'> = ['cash', 'card', 'digital'];
    const latencies: number[] = [];

    const stressStartedAt = performance.now();

    for (let index = 0; index < stressOrders; index += 1) {
      const product = stressProducts[index % stressProducts.length];
      const customer = stressCustomers[index % stressCustomers.length];
      const paymentMethod = paymentMethods[index % paymentMethods.length];

      const requestStartedAt = performance.now();
      useStoreOpsStore.getState().processCheckout({
        items: [{ productId: product.id, quantity: 1 }],
        paymentMethod,
        customerId: customer.id,
        discountAmount: index % 10 === 0 ? 0.25 : 0
      });
      latencies.push(performance.now() - requestStartedAt);
    }

    const stressDurationMs = performance.now() - stressStartedAt;

    const sortedLatencies = [...latencies].sort((left, right) => left - right);
    const p95Index = Math.max(0, Math.floor(sortedLatencies.length * 0.95) - 1);
    const totalLatency = latencies.reduce((sum, latency) => sum + latency, 0);

    const summary: StressSummary = {
      seededCategories,
      seededProducts,
      seededCustomers,
      stressOrders,
      seedDurationMs,
      stressDurationMs,
      throughputOrdersPerSecond: stressOrders / (stressDurationMs / 1000),
      averageLatencyMs: totalLatency / latencies.length,
      p95LatencyMs: sortedLatencies[p95Index] ?? 0,
      maxLatencyMs: sortedLatencies[sortedLatencies.length - 1] ?? 0,
      finalCategoryCount: useStoreOpsStore.getState().categories.length,
      finalProductCount: useStoreOpsStore.getState().products.length,
      finalCustomerCount: useStoreOpsStore.getState().customers.length,
      finalOrderCount: useStoreOpsStore.getState().orders.length
    };

    writeStressReport(summary);

    expect(summary.finalCategoryCount).toBeGreaterThanOrEqual(250);
    expect(summary.finalProductCount).toBeGreaterThanOrEqual(450);
    expect(summary.finalCustomerCount).toBeGreaterThanOrEqual(300);
    expect(summary.finalOrderCount).toBe(stressOrders);
    expect(summary.throughputOrdersPerSecond).toBeGreaterThan(0);
  });
});
