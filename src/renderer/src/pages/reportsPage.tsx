import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyValue } from '@/lib/globalFormat';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

export function ReportsPage() {
  const orders = useStoreOpsStore((state) => state.orders);
  const invoices = useStoreOpsStore((state) => state.invoices);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const staffRecords = useStoreOpsStore((state) => state.staffRecords);
  const getDepartmentChangeReport = useStoreOpsStore((state) => state.getDepartmentChangeReport);
  const exportDepartmentChangeReportCsv = useStoreOpsStore((state) => state.exportDepartmentChangeReportCsv);
  const exportDepartmentChangeReportText = useStoreOpsStore((state) => state.exportDepartmentChangeReportText);
  const departmentChangeReport = getDepartmentChangeReport();

  const paymentSummary = useMemo(() => {
    return {
      cash: orders.filter((order) => order.paymentMethod === 'cash').length,
      card: orders.filter((order) => order.paymentMethod === 'card').length,
      digital: orders.filter((order) => order.paymentMethod === 'digital').length
    };
  }, [orders]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalAmount, 0),
    [orders]
  );

  const avgOrderValue = useMemo(() => {
    if (!orders.length) {
      return 0;
    }

    return totalRevenue / orders.length;
  }, [orders, totalRevenue]);

  const activeStaffRecords = useMemo(
    () => staffRecords.filter((staffRecord) => staffRecord.isActive),
    [staffRecords]
  );

  const departmentHeadcount = useMemo(() => {
    return activeStaffRecords.reduce<Record<string, number>>((accumulator, staffRecord) => {
      accumulator[staffRecord.department] = (accumulator[staffRecord.department] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [activeStaffRecords]);

  const departmentCount = useMemo(
    () => Object.keys(departmentHeadcount).length,
    [departmentHeadcount]
  );

  const handleDownloadReportFile = (fileName: string, content: string): void => {
    if (!content || typeof window === 'undefined') {
      return;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Reporting & Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Review order history, payment breakdown, and transaction metrics.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Recorded Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">{formatCurrencyValue(totalRevenue, globalPreferences)}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-700">{formatCurrencyValue(avgOrderValue, globalPreferences)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Total Invoices</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{invoices.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Paid</p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">{invoices.filter((invoiceRecord) => invoiceRecord.status === 'paid').length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Overdue</p>
            <p className="mt-1 text-xl font-semibold text-red-700">{invoices.filter((invoiceRecord) => invoiceRecord.status === 'overdue').length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Outstanding Value</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">
              {formatCurrencyValue(
                invoices
                  .filter((invoiceRecord) => invoiceRecord.status !== 'paid' && invoiceRecord.status !== 'cancelled')
                  .reduce((sum, invoiceRecord) => sum + invoiceRecord.amount, 0),
                globalPreferences
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Cash</span>
                <span className="font-semibold">{paymentSummary.cash}</span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Card</span>
                <span className="font-semibold">{paymentSummary.card}</span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Digital</span>
                <span className="font-semibold">{paymentSummary.digital}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {!orders.length && <p className="text-sm text-slate-500">No orders yet. Complete POS checkout to populate reports.</p>}
            <div className="space-y-2">
              {orders.slice(0, 8).map((order) => (
                <div key={order.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{order.id}</p>
                    <p className="text-slate-600">{formatCurrencyValue(order.totalAmount, globalPreferences)}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleString()} • {order.paymentMethod.toUpperCase()} • {order.customerName}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Department Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-700">{departmentChangeReport.length}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Active Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{departmentCount}</p>
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-slate-600">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">{activeStaffRecords.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Department Allotment Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {Object.entries(departmentHeadcount)
                .sort(([leftDepartment], [rightDepartment]) => leftDepartment.localeCompare(rightDepartment))
                .map(([department, count]) => (
                  <div key={department} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>{department}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  </div>
                ))}
              {!Object.keys(departmentHeadcount).length && (
                <p className="text-sm text-slate-500">No active department data available.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownloadReportFile('departmentAllotmentReport.csv', exportDepartmentChangeReportCsv())}
              >
                Export CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownloadReportFile('departmentAllotmentReport.txt', exportDepartmentChangeReportText())}
              >
                Export Text
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle>Department Transfer History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!departmentChangeReport.length && <p className="text-sm text-slate-500">No department transfers recorded yet.</p>}
            {departmentChangeReport.slice(0, 12).map((departmentChange) => (
              <div key={departmentChange.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{departmentChange.staffName}</p>
                  <p className="text-xs text-slate-500">{departmentChange.changeMode}</p>
                </div>
                <p className="text-xs text-slate-500">
                  {departmentChange.fromDepartment || 'none'} to {departmentChange.toDepartment}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(departmentChange.changedAt).toLocaleString()} • by {departmentChange.changedBy}
                </p>
                <p className="text-xs text-slate-500">Reason: {departmentChange.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
