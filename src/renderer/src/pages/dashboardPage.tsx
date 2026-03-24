import { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyValue } from '@/lib/globalFormat';
import { useDashboardLayoutStore } from '@/stores/dashboardLayoutStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

type TrendPoint = {
  dateKey: string;
  label: string;
  shortLabel: string;
  total: number;
  ordersCount: number;
  averageTicket: number;
};

function formatDateKey(dateValue: Date): string {
  const year = String(dateValue.getFullYear());
  const month = String(dateValue.getMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function getAnchorDate(isoValues: string[]): Date {
  if (isoValues.length === 0) {
    return new Date();
  }

  const latestValue = isoValues.reduce((latest, current) => (current > latest ? current : latest));
  return new Date(latestValue);
}

function buildScaleLabels(maxValue: number): number[] {
  return [maxValue, maxValue * 0.66, maxValue * 0.33, 0];
}

export function DashboardPage() {
  const [showCustomize, setShowCustomize] = useState(false);
  const dashboardLayout = useDashboardLayoutStore((s) => s.dashboardLayout);
  const toggleTile = useDashboardLayoutStore((s) => s.toggleTile);
  const moveTileUp = useDashboardLayoutStore((s) => s.moveTileUp);
  const moveTileDown = useDashboardLayoutStore((s) => s.moveTileDown);
  const resetLayout = useDashboardLayoutStore((s) => s.resetLayout);
  const sortedLayout = [...dashboardLayout].sort((a, b) => a.order - b.order);
  const isTileVisible = (id: string) => sortedLayout.find((t) => t.id === id)?.visible !== false;

  const products = useStoreOpsStore((state) => state.products);
  const customers = useStoreOpsStore((state) => state.customers);
  const orders = useStoreOpsStore((state) => state.orders);
  const staffRecords = useStoreOpsStore((state) => state.staffRecords);
  const registerSession = useStoreOpsStore((state) => state.registerSession);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const invoices = useStoreOpsStore((state) => state.invoices);
  const [selectedRange, setSelectedRange] = useState<7 | 30 | 90>(30);

  const lowStockItems = useMemo(
    () => products.filter((product) => product.stock <= product.reorderLevel).length,
    [products]
  );

  const totalInventoryValue = useMemo(
    () => products.reduce((sum, product) => sum + product.price * product.stock, 0),
    [products]
  );

  const clockedInCount = useMemo(
    () => staffRecords.filter((staffRecord) => staffRecord.isClockedIn).length,
    [staffRecords]
  );

  const completedOrders = useMemo(
    () => orders.filter((orderRecord) => orderRecord.status === 'completed'),
    [orders]
  );

  const overdueInvoiceCount = useMemo(
    () => invoices.filter((invoiceRecord) => invoiceRecord.status === 'overdue').length,
    [invoices]
  );

  const pendingDeliveries = useMemo(
    () =>
      orders.filter(
        (orderRecord) =>
          orderRecord.deliveryStatus === 'pending' || orderRecord.deliveryStatus === 'outForDelivery'
      ).length,
    [orders]
  );

  const trendPoints = useMemo<TrendPoint[]>(() => {
    const anchorDate = getAnchorDate(completedOrders.map((orderRecord) => orderRecord.createdAt));
    anchorDate.setHours(0, 0, 0, 0);

    return Array.from({ length: selectedRange }, (_, index) => {
      const pointDate = new Date(anchorDate);
      pointDate.setDate(anchorDate.getDate() - (selectedRange - index - 1));
      const dateKey = formatDateKey(pointDate);
      const matchingOrders = completedOrders.filter(
        (orderRecord) => orderRecord.createdAt.slice(0, 10) === dateKey
      );
      const total = matchingOrders.reduce((sum, orderRecord) => sum + orderRecord.totalAmount, 0);
      const ordersCount = matchingOrders.length;

      return {
        dateKey,
        label: pointDate.toLocaleDateString(globalPreferences.locale, {
          month: 'short',
          day: 'numeric'
        }),
        shortLabel: pointDate.toLocaleDateString(globalPreferences.locale, {
          month: 'short',
          day: 'numeric'
        }),
        total,
        ordersCount,
        averageTicket: ordersCount > 0 ? total / ordersCount : 0
      };
    });
  }, [completedOrders, globalPreferences.locale, selectedRange]);

  const chartMax = Math.max.apply(
    null,
    trendPoints.map((point) => point.total).concat([1])
  );
  const selectedWindowSales = trendPoints.reduce((sum, point) => sum + point.total, 0);
  const selectedWindowOrders = trendPoints.reduce((sum, point) => sum + point.ordersCount, 0);
  const selectedWindowAverageTicket =
    selectedWindowOrders > 0 ? selectedWindowSales / selectedWindowOrders : 0;
  const activeDays = trendPoints.filter((point) => point.ordersCount > 0).length;
  const scaleLabels = buildScaleLabels(chartMax);
  const breakdownPoints = trendPoints.slice(-6).reverse();
  const labelStep = Math.max(1, Math.floor((trendPoints.length - 1) / 4));

  const last7Revenue = trendPoints.slice(-7).map((p) => p.total);
  const last7Orders = trendPoints.slice(-7).map((p) => p.ordersCount);

  const kpis = [
    { label: 'Revenue', value: formatCurrencyValue(selectedWindowSales, globalPreferences), sparkline: last7Revenue },
    { label: 'Orders', value: String(selectedWindowOrders), sparkline: last7Orders },
    {
      label: 'Avg Ticket',
      value: formatCurrencyValue(selectedWindowAverageTicket, globalPreferences),
      sparkline: undefined as number[] | undefined
    },
    { label: 'Low Stock', value: String(lowStockItems), sparkline: undefined as number[] | undefined }
  ];

  return (
    <section className="space-y-4 pb-5">
      <header className="rounded-[1.6rem] border border-white/80 bg-white/80 px-5 py-4 shadow-md shadow-sky-100/60 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Operations Command
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[7, 30, 90].map((rangeValue) => (
              <button
                key={rangeValue}
                type="button"
                className={
                  selectedRange === rangeValue
                    ? 'rounded-full bg-slate-950 px-3.5 py-1.5 text-[11px] font-semibold text-white'
                    : 'rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-slate-500'
                }
                onClick={() => setSelectedRange(rangeValue as 7 | 30 | 90)}
              >
                {rangeValue}D
              </button>
            ))}
            <Button type="button" variant="outline" size="sm" className="ml-2 h-7 rounded-full text-[11px]" onClick={() => setShowCustomize(!showCustomize)}>
              <Settings2 className="mr-1 h-3 w-3" />
              Customize
            </Button>
          </div>
        </div>
      </header>

      {showCustomize && (
        <Card className="rounded-[1.6rem] border-white/80 bg-white/85 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Customize Tiles</CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => resetLayout('dashboard')}>Reset</Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowCustomize(false)}>Done</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {sortedLayout.map((tile) => (
              <div key={tile.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <input type="checkbox" checked={tile.visible} onChange={() => toggleTile('dashboard', tile.id)} />
                <span className="flex-1 text-sm text-slate-700">{tile.label}</span>
                <button type="button" className="text-slate-400 hover:text-slate-700" onClick={() => moveTileUp('dashboard', tile.id)}><ArrowUp className="h-3.5 w-3.5" /></button>
                <button type="button" className="text-slate-400 hover:text-slate-700" onClick={() => moveTileDown('dashboard', tile.id)}><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isTileVisible('storeMomentum') && <div className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden rounded-[1.8rem] border-slate-900 bg-slate-950 text-slate-100 shadow-2xl shadow-slate-900/20">
          <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pb-3 pt-5">
            <div>
              <CardTitle className="text-lg font-semibold">Store Momentum</CardTitle>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Daily revenue across the selected range
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                {selectedRange} day window
              </span>
              <span className="text-[10px] text-slate-500">Blue bars show completed-sales revenue</span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 pb-5 xl:grid-cols-[1fr_0.32fr]">
            <div className="rounded-[1.6rem] border border-slate-800 bg-[linear-gradient(180deg,_rgba(8,47,73,0.24),_rgba(15,23,42,0.2))] p-4">
              <div className="mb-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/65 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Range Revenue</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatCurrencyValue(selectedWindowSales, globalPreferences)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/65 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Orders</p>
                  <p className="mt-1 text-sm font-semibold text-white">{selectedWindowOrders}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/65 px-3 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Active Days</p>
                  <p className="mt-1 text-sm font-semibold text-white">{activeDays}</p>
                </div>
              </div>

              <div className="grid grid-cols-[56px_1fr] gap-3">
                <div className="flex h-[240px] flex-col justify-between pb-6">
                  {scaleLabels.map((scaleValue, index) => (
                    <div key={scaleValue + '-' + index} className="text-[10px] font-medium text-slate-500">
                      {formatCurrencyValue(scaleValue, globalPreferences)}
                    </div>
                  ))}
                </div>

                <div>
                  <svg
                    viewBox="0 0 100 100"
                    className="h-[240px] w-full"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Sales activity trend chart"
                  >
                    {[16, 39, 62, 85].map((gridValue) => (
                      <line
                        key={gridValue}
                        x1="0"
                        x2="100"
                        y1={gridValue}
                        y2={gridValue}
                        stroke="rgba(148,163,184,0.18)"
                        strokeWidth="0.45"
                      />
                    ))}
                    {trendPoints.map((point, index) => {
                      const slotWidth = 100 / trendPoints.length;
                      const barWidth = Math.max(1.2, slotWidth * 0.58);
                      const barHeight = Math.max(1.6, (point.total / chartMax) * 76);
                      const x = index * slotWidth + (slotWidth - barWidth) / 2;
                      const y = 85 - barHeight;

                      return (
                        <g key={point.dateKey}>
                          <title>
                            {point.label}
                            {' - '}
                            {formatCurrencyValue(point.total, globalPreferences)}
                            {' - '}
                            {point.ordersCount}
                            {' orders'}
                          </title>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx="0.8"
                            fill={point.ordersCount > 0 ? '#22d3ee' : 'rgba(51,65,85,0.7)'}
                            opacity={point.ordersCount > 0 ? 0.95 : 0.4}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    {trendPoints.map((point, index) => {
                      const showLabel =
                        index === 0 ||
                        index === trendPoints.length - 1 ||
                        index % labelStep === 0;

                      return (
                        <div
                          key={'axis-' + point.dateKey}
                          className="min-w-0 flex-1 text-center text-[10px] font-medium text-slate-500"
                        >
                          {showLabel ? point.shortLabel : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-[1.4rem] border border-slate-800 bg-slate-900/80 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Daily Breakdown
                </p>
                <p className="mt-1 text-xs text-slate-400">Latest six operating days</p>
              </div>
              {breakdownPoints.map((point) => (
                <div
                  key={'load-' + point.dateKey}
                  className="rounded-[1.4rem] border border-slate-800 bg-slate-900/80 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-200">{point.label}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {point.ordersCount} ord
                    </p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <p className="uppercase tracking-[0.14em] text-slate-500">Revenue</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {formatCurrencyValue(point.total, globalPreferences)}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.14em] text-slate-500">Avg Ticket</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {formatCurrencyValue(point.averageTicket, globalPreferences)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {kpis.map((kpi) => (
            <Card
              key={kpi.label}
              className="rounded-[1.6rem] border-white/80 bg-white/85 shadow-lg shadow-slate-200/60"
            >
              <CardContent className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {kpi.label}
                </p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950">{kpi.value}</p>
                {kpi.sparkline && kpi.sparkline.length >= 2 && (
                  <svg width={80} height={24} viewBox="0 0 80 24" className="mt-1.5">
                    <polyline
                      points={kpi.sparkline.map((v, i) => {
                        const max = Math.max(...kpi.sparkline!, 1);
                        const min = Math.min(...kpi.sparkline!, 0);
                        const range = max - min || 1;
                        return `${(i / (kpi.sparkline!.length - 1)) * 80},${24 - ((v - min) / range) * 24}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#0ea5e9"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>}

      <div className="grid gap-3 xl:grid-cols-3">
        {isTileVisible('team') && <Card className="rounded-[1.6rem] border-white/80 bg-white/85 shadow-lg shadow-slate-200/60">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm">Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">In</p>
                <p className="mt-1 text-xl font-semibold text-emerald-600">{clockedInCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Out</p>
                <p className="mt-1 text-xl font-semibold text-slate-700">
                  {staffRecords.length - clockedInCount}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Staff</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{staffRecords.length}</p>
              </div>
            </div>
            <div className="space-y-2">
              {staffRecords.slice(0, 5).map((staffRecord) => (
                <div
                  key={staffRecord.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{staffRecord.fullName}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      {staffRecord.role}
                    </p>
                  </div>
                  <span
                    className={
                      staffRecord.isClockedIn
                        ? 'text-[11px] font-semibold text-emerald-700'
                        : 'text-[11px] font-semibold text-slate-400'
                    }
                  >
                    {staffRecord.isClockedIn ? 'In' : 'Out'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>}

        {isTileVisible('customers') && <Card className="rounded-[1.6rem] border-white/80 bg-white/85 shadow-lg shadow-slate-200/60">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm">Customers</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Profiles</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {customers.filter((customer) => customer.id !== 'customer-walk-in').length}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Credit</p>
              <p className="mt-1 text-xl font-semibold text-amber-600">
                {formatCurrencyValue(
                  customers.reduce((sum, customer) => sum + customer.creditBalance, 0),
                  globalPreferences
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Points</p>
              <p className="mt-1 text-xl font-semibold text-cyan-700">
                {customers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0)}
              </p>
            </div>
          </CardContent>
        </Card>}

        {isTileVisible('financePulse') && <Card className="rounded-[1.6rem] border-white/80 bg-white/85 shadow-lg shadow-slate-200/60">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm">Finance Pulse</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Register</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {registerSession.isOpen ? 'Open' : 'Closed'}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {formatCurrencyValue(registerSession.currentCash, globalPreferences)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Invoices</p>
              <p className="mt-1 text-lg font-semibold text-red-600">{overdueInvoiceCount}</p>
              <p className="mt-1 text-[11px] text-slate-500">Overdue</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Delivery</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">{pendingDeliveries}</p>
              <p className="mt-1 text-[11px] text-slate-500">Pending</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Inventory</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {formatCurrencyValue(totalInventoryValue, globalPreferences)}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">On hand value</p>
            </div>
          </CardContent>
        </Card>}
      </div>
    </section>
  );
}
