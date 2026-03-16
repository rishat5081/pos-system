import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function toHourLabel(value: number): string {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric' });
}

export function SuperAdminPage(): JSX.Element {
  const currentUser = useAuthStore((state) => state.user);
  const storeProfile = useStoreOpsStore((state) => state.storeProfile);
  const todaySales = useStoreOpsStore((state) => state.todaySales);
  const todayOrders = useStoreOpsStore((state) => state.todayOrders);
  const registerSession = useStoreOpsStore((state) => state.registerSession);
  const staffRecords = useStoreOpsStore((state) => state.staffRecords);
  const counterRecords = useStoreOpsStore((state) => state.counterRecords);
  const orders = useStoreOpsStore((state) => state.orders);
  const assignStaffToCounter = useStoreOpsStore((state) => state.assignStaffToCounter);
  const setCounterTask = useStoreOpsStore((state) => state.setCounterTask);
  const releaseCounter = useStoreOpsStore((state) => state.releaseCounter);

  const activeStaffRecords = useMemo(
    () => staffRecords.filter((staffRecord) => staffRecord.isActive),
    [staffRecords]
  );

  const clockedInStaffRecords = useMemo(
    () => activeStaffRecords.filter((staffRecord) => staffRecord.isClockedIn),
    [activeStaffRecords]
  );

  const clockedInStaffCount = clockedInStaffRecords.length;

  const activeCounterCount = useMemo(
    () => counterRecords.filter((counterRecord) => counterRecord.isOpen).length,
    [counterRecords]
  );

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  const salesByHour = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const hourDate = new Date(now);
      hourDate.setHours(now.getHours() - (5 - index), 0, 0, 0);
      const hourStart = hourDate.getTime();
      const hourEnd = hourStart + 60 * 60 * 1000;

      const total = orders.reduce((sum, order) => {
        const createdAt = new Date(order.createdAt).getTime();
        return createdAt >= hourStart && createdAt < hourEnd ? sum + order.totalAmount : sum;
      }, 0);

      return {
        hourStart,
        label: toHourLabel(hourStart),
        total
      };
    });

    const maxTotal = Math.max(1, ...buckets.map((bucket) => bucket.total));

    return buckets.map((bucket) => ({
      ...bucket,
      barPercent: Math.max(8, Math.round((bucket.total / maxTotal) * 100))
    }));
  }, [orders]);

  const departmentCoverage = useMemo(() => {
    const counts = clockedInStaffRecords.reduce<Record<string, number>>((accumulator, staffRecord) => {
      const key = staffRecord.department || 'general';
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .map(([department, count]) => ({
        department,
        count
      }))
      .sort((left, right) => right.count - left.count);
  }, [clockedInStaffRecords]);

  const counterThroughput = useMemo(() => {
    const maxOrders = Math.max(1, ...counterRecords.map((counterRecord) => counterRecord.ordersHandledToday));

    return counterRecords.map((counterRecord) => ({
      ...counterRecord,
      loadPercent: Math.max(8, Math.round((counterRecord.ordersHandledToday / maxOrders) * 100))
    }));
  }, [counterRecords]);

  const coveragePercent = activeStaffRecords.length
    ? Math.round((clockedInStaffCount / activeStaffRecords.length) * 100)
    : 0;

  const liveWorkRows = useMemo(() => {
    return activeStaffRecords.map((staffRecord) => {
      const counter = counterRecords.find((counterRecord) => counterRecord.currentStaffId === staffRecord.id);

      const workStatus = !staffRecord.isClockedIn
        ? 'Off shift'
        : staffRecord.breakStartedAt
          ? 'On break'
          : counter
            ? `At ${counter.name}`
            : 'Floor operations';

      const workTask = !staffRecord.isClockedIn
        ? 'Unavailable'
        : staffRecord.breakStartedAt
          ? 'Break in progress'
          : counter
            ? counter.currentTask
            : `${staffRecord.department} support`;

      return {
        staffId: staffRecord.id,
        staffName: staffRecord.fullName,
        role: staffRecord.role,
        department: staffRecord.department,
        workStatus,
        workTask,
        counterName: counter?.name ?? 'Not assigned'
      };
    });
  }, [activeStaffRecords, counterRecords]);

  const [selectedCounterId, setSelectedCounterId] = useState<string>(counterRecords[0]?.id ?? '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(clockedInStaffRecords[0]?.id ?? '');
  const [counterTaskInput, setCounterTaskInput] = useState<string>('Checkout lane active');

  useEffect(() => {
    if (!counterRecords.some((counterRecord) => counterRecord.id === selectedCounterId)) {
      setSelectedCounterId(counterRecords[0]?.id ?? '');
    }
  }, [counterRecords, selectedCounterId]);

  useEffect(() => {
    if (!clockedInStaffRecords.some((staffRecord) => staffRecord.id === selectedStaffId)) {
      setSelectedStaffId(clockedInStaffRecords[0]?.id ?? '');
    }
  }, [clockedInStaffRecords, selectedStaffId]);

  const handleAssignCounter = (): void => {
    if (!selectedCounterId || !selectedStaffId) {
      return;
    }

    assignStaffToCounter({
      counterId: selectedCounterId,
      staffId: selectedStaffId,
      task: counterTaskInput.trim() || 'Checkout lane active'
    });
  };

  const handleUpdateCounterTask = (): void => {
    if (!selectedCounterId) {
      return;
    }

    setCounterTask(selectedCounterId, counterTaskInput.trim() || 'Checkout lane active');
  };

  const handleReleaseCounter = (): void => {
    if (!selectedCounterId) {
      return;
    }

    releaseCounter(selectedCounterId);
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <section className="space-y-6">
        <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">Owner Control</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">Super Admin Control Room</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Access restricted to store owner accounts.</p>
        </header>
      </section>
    );
  }

  return (
    <section className="space-y-6 pb-8">
      <header className="overflow-hidden rounded-3xl border border-cyan-300/50 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-6 text-white shadow-2xl">
        <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
          Owner Control
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Super Admin Control Room</h1>
        <p className="mt-1 text-sm text-slate-200">
          Real-time view of store activity, staff workload, and counter operations from one command center.
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.1em] text-cyan-100/90">
          Live status at {new Date().toLocaleTimeString()} / {storeProfile.storeName}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-emerald-200/60 bg-emerald-50/70 shadow-lg dark:border-emerald-500/30 dark:bg-emerald-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-300">Today Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(todaySales)}</p>
          </CardContent>
        </Card>
        <Card className="border-cyan-200/60 bg-cyan-50/70 shadow-lg dark:border-cyan-500/30 dark:bg-cyan-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-cyan-700 dark:text-cyan-300">Today Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-700 dark:text-cyan-300">{todayOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-violet-200/60 bg-violet-50/70 shadow-lg dark:border-violet-500/30 dark:bg-violet-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-violet-700 dark:text-violet-300">Clocked In Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-violet-700 dark:text-violet-300">{clockedInStaffCount}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/60 bg-amber-50/70 shadow-lg dark:border-amber-500/30 dark:bg-amber-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-amber-700 dark:text-amber-300">Open Counters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-700 dark:text-amber-300">{activeCounterCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-white/70 bg-white/90 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Sales Trend (Last 6 Hours)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex h-44 items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              {salesByHour.map((bucket) => (
                <div key={bucket.hourStart} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-cyan-600 to-sky-300"
                    style={{ height: `${bucket.barPercent}%` }}
                    title={`${bucket.label}: ${formatCurrency(bucket.total)}`}
                  />
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">{bucket.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300">Updated automatically from incoming transactions.</p>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Workforce Coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <div
                className="relative h-20 w-20 rounded-full"
                style={{
                  background: `conic-gradient(rgb(14 116 144) ${coveragePercent}%, rgb(226 232 240) ${coveragePercent}% 100%)`
                }}
              >
                <div className="absolute inset-2 grid place-items-center rounded-full bg-white text-sm font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {coveragePercent}%
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Clocked In</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  {clockedInStaffCount} of {activeStaffRecords.length} active staff
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {departmentCoverage.map((departmentRow) => (
                <div key={departmentRow.department} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs dark:bg-slate-950/60">
                  <span className="font-medium uppercase tracking-[0.08em] text-slate-600 dark:text-slate-300">{departmentRow.department}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{departmentRow.count} staff</span>
                </div>
              ))}
              {!departmentCoverage.length && <p className="text-xs text-slate-500 dark:text-slate-300">No clocked-in staff right now.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Counter Throughput</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {counterThroughput.map((counterRecord) => (
              <div key={counterRecord.id} className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{counterRecord.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300">{counterRecord.ordersHandledToday} orders</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500" style={{ width: `${counterRecord.loadPercent}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-300">{counterRecord.currentStaffName || 'Unassigned'} / {counterRecord.currentTask}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Store Live Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{storeProfile.storeName}</p>
              <p className="text-slate-600 dark:text-slate-300">Code: {storeProfile.storeCode}</p>
              <p className="text-slate-600 dark:text-slate-300">{storeProfile.address}</p>
              <p className="text-slate-600 dark:text-slate-300">Timezone: {storeProfile.timezone}</p>
              <p className="text-slate-600 dark:text-slate-300">Type: {storeProfile.businessType}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300">Register Status</p>
              <p
                className={
                  registerSession.isOpen
                    ? 'mt-1 font-semibold text-emerald-700 dark:text-emerald-300'
                    : 'mt-1 font-semibold text-slate-700 dark:text-slate-200'
                }
              >
                {registerSession.isOpen ? 'Open' : 'Closed'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300">Cash: {formatCurrency(registerSession.currentCash)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300">Latest Transactions</p>
              <div className="mt-2 space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900/70">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{order.customerName}</p>
                    <p className="text-slate-500 dark:text-slate-300">
                      {formatCurrency(order.totalAmount)} / {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {!recentOrders.length && <p className="text-xs text-slate-500 dark:text-slate-300">No transactions yet.</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Live Workforce Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {liveWorkRows.map((workRow) => (
              <div key={workRow.staffId} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{workRow.staffName}</p>
                  <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">{workRow.workStatus}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  {workRow.role} / {workRow.department} / {workRow.counterName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">Task: {workRow.workTask}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Counter Command Board</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {counterRecords.map((counterRecord) => (
              <div key={counterRecord.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{counterRecord.name}</p>
                  <span
                    className={
                      counterRecord.isOpen
                        ? 'rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200'
                    }
                  >
                    {counterRecord.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Staff: {counterRecord.currentStaffName || 'Unassigned'}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">Task: {counterRecord.currentTask}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">Orders handled: {counterRecord.ordersHandledToday}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">Updated: {new Date(counterRecord.updatedAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Counter Assignment Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              aria-label="Counter Selector"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={selectedCounterId}
              onChange={(event) => setSelectedCounterId(event.target.value)}
            >
              {counterRecords.map((counterRecord) => (
                <option key={counterRecord.id} value={counterRecord.id}>
                  {counterRecord.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Counter Staff Selector"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={selectedStaffId}
              onChange={(event) => setSelectedStaffId(event.target.value)}
            >
              {clockedInStaffRecords.map((staffRecord) => (
                <option key={staffRecord.id} value={staffRecord.id}>
                  {staffRecord.fullName}
                </option>
              ))}
            </select>
            <Input
              aria-label="Counter Task Input"
              placeholder="Task for selected counter"
              value={counterTaskInput}
              onChange={(event) => setCounterTaskInput(event.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                className="bg-sky-600 hover:bg-sky-700"
                disabled={!selectedCounterId || !selectedStaffId}
                onClick={handleAssignCounter}
              >
                Assign
              </Button>
              <Button type="button" variant="outline" disabled={!selectedCounterId} onClick={handleUpdateCounterTask}>
                Update Task
              </Button>
              <Button type="button" variant="outline" disabled={!selectedCounterId} onClick={handleReleaseCounter}>
                Release
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
