import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyValue } from '@/lib/globalFormat';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

const salesByHour = [420, 560, 740, 680, 880, 1120, 980, 760];

export function DashboardPage(): JSX.Element {
  const todaySales = useStoreOpsStore((state) => state.todaySales);
  const todayOrders = useStoreOpsStore((state) => state.todayOrders);
  const products = useStoreOpsStore((state) => state.products);
  const customers = useStoreOpsStore((state) => state.customers);
  const staffRecords = useStoreOpsStore((state) => state.staffRecords);
  const registerSession = useStoreOpsStore((state) => state.registerSession);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const invoices = useStoreOpsStore((state) => state.invoices);

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

  const maxSalesBar = Math.max(...salesByHour);
  const overdueInvoiceCount = useMemo(
    () => invoices.filter((invoiceRecord) => invoiceRecord.status === 'overdue').length,
    [invoices]
  );

  const kpis = [
    { label: 'Sales', value: formatCurrencyValue(todaySales, globalPreferences), tone: 'from-cyan-500 to-blue-600' },
    { label: 'Orders', value: String(todayOrders), tone: 'from-orange-500 to-amber-600' },
    {
      label: 'Inventory Value',
      value: formatCurrencyValue(totalInventoryValue, globalPreferences),
      tone: 'from-emerald-500 to-green-600'
    },
    { label: 'Low Stock Items', value: String(lowStockItems), tone: 'from-slate-700 to-slate-900' }
  ];

  return (
    <section className="space-y-6 pb-8">
      <header className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Operations Command</p>
        <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Real-time KPIs, workforce health, and inventory movement.</p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="overflow-hidden border-none shadow-lg">
            <CardHeader className={`bg-gradient-to-br ${kpi.tone} pb-3`}>
              <CardTitle className="text-sm uppercase tracking-[0.1em] text-white/80">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent className="bg-white pt-4">
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Sales Activity By Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid h-56 grid-cols-8 items-end gap-2 rounded-2xl bg-slate-50 p-4">
              {salesByHour.map((value, index) => {
                const barHeight = Math.max(12, Math.round((value / maxSalesBar) * 100));

                return (
                  <div key={`hour-bar-${index + 1}`} className="flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-md bg-gradient-to-t from-sky-600 to-cyan-400"
                      style={{ height: `${barHeight}%` }}
                    />
                    <p className="text-[10px] text-slate-500">{index + 9}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Staff Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Clocked In</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-600">{clockedInCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Clocked Out</p>
                <p className="mt-1 text-2xl font-semibold text-slate-700">{staffRecords.length - clockedInCount}</p>
              </div>
            </div>
            <div className="space-y-2">
              {staffRecords.map((staffRecord) => (
                <div key={staffRecord.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{staffRecord.fullName}</p>
                    <span
                      className={
                        staffRecord.isClockedIn
                          ? 'text-xs font-semibold text-emerald-700'
                          : 'text-xs font-semibold text-slate-500'
                      }
                    >
                      {staffRecord.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{staffRecord.role}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Customer Loyalty Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Customers</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{customers.filter((customer) => customer.id !== 'customer-walk-in').length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Loyalty Points</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-700">{customers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Customer Credit</p>
              <p className="mt-1 text-2xl font-semibold text-amber-600">${customers.reduce((sum, customer) => sum + customer.creditBalance, 0).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Register Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Session</p>
              <p className={registerSession.isOpen ? 'mt-1 font-semibold text-emerald-700' : 'mt-1 font-semibold text-slate-700'}>
                {registerSession.isOpen ? 'Open' : 'Closed'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Current Cash</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatCurrencyValue(registerSession.currentCash, globalPreferences)}
              </p>
            </div>
            {registerSession.openedAt && (
              <p className="text-xs text-slate-500">Opened: {new Date(registerSession.openedAt).toLocaleString()}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>International Readiness</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Locale</p>
            <p className="mt-1 font-semibold text-slate-900">{globalPreferences.locale}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Currency</p>
            <p className="mt-1 font-semibold text-slate-900">{globalPreferences.currency}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Timezone</p>
            <p className="mt-1 font-semibold text-slate-900">{globalPreferences.timezone}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Overdue Invoices</p>
            <p className="mt-1 font-semibold text-red-600">{overdueInvoiceCount}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
