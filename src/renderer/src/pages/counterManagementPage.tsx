import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

export function CounterManagementPage() {
  const currentUser = useAuthStore((state) => state.user);
  const counterRecords = useStoreOpsStore((state) => state.counterRecords);
  const staffRecords = useStoreOpsStore((state) => state.staffRecords);
  const assignStaffToCounter = useStoreOpsStore((state) => state.assignStaffToCounter);
  const setCounterTask = useStoreOpsStore((state) => state.setCounterTask);
  const releaseCounter = useStoreOpsStore((state) => state.releaseCounter);

  const assignableStaffRecords = useMemo(
    () => staffRecords.filter((staffRecord) => staffRecord.isActive && staffRecord.isClockedIn),
    [staffRecords]
  );

  const openCounterCount = useMemo(
    () => counterRecords.filter((counterRecord) => counterRecord.isOpen).length,
    [counterRecords]
  );

  const unassignedCounterCount = useMemo(
    () => counterRecords.filter((counterRecord) => !counterRecord.currentStaffId).length,
    [counterRecords]
  );

  const handledOrdersTotal = useMemo(
    () => counterRecords.reduce((sum, counterRecord) => sum + counterRecord.ordersHandledToday, 0),
    [counterRecords]
  );

  const maxHandledOrders = useMemo(
    () => Math.max(1, ...counterRecords.map((counterRecord) => counterRecord.ordersHandledToday)),
    [counterRecords]
  );

  const [selectedCounterIdRaw, setSelectedCounterId] = useState<string>(counterRecords[0]?.id ?? '');
  const [selectedStaffIdRaw, setSelectedStaffId] = useState<string>(assignableStaffRecords[0]?.id ?? '');
  const [counterTaskInput, setCounterTaskInput] = useState<string>('Checkout lane active');

  const selectedCounterId = useMemo(
    () => counterRecords.some((r) => r.id === selectedCounterIdRaw) ? selectedCounterIdRaw : (counterRecords[0]?.id ?? ''),
    [counterRecords, selectedCounterIdRaw]
  );

  const selectedStaffId = useMemo(
    () => assignableStaffRecords.some((r) => r.id === selectedStaffIdRaw) ? selectedStaffIdRaw : (assignableStaffRecords[0]?.id ?? ''),
    [assignableStaffRecords, selectedStaffIdRaw]
  );

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

  if (currentUser?.role === 'cashier') {
    return (
      <section className="space-y-6">
        <header className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">Store Operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">Counter Management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            Access restricted to manager and super admin accounts.
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-sky-300/40 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-6 text-white shadow-2xl">
        <p className="inline-flex rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100">
          Store Operations
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Counter Management</h1>
        <p className="mt-1 text-sm text-slate-200">
          Manage counter assignment, active tasks, and live counter utilization in one place.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-cyan-200/60 bg-cyan-50/70 shadow-lg dark:border-cyan-500/30 dark:bg-cyan-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-cyan-700 dark:text-cyan-300">Total Counters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-cyan-700 dark:text-cyan-300">{counterRecords.length}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200/60 bg-emerald-50/70 shadow-lg dark:border-emerald-500/30 dark:bg-emerald-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-300">Open Counters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-700 dark:text-emerald-300">{openCounterCount}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/60 bg-amber-50/70 shadow-lg dark:border-amber-500/30 dark:bg-amber-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-amber-700 dark:text-amber-300">Unassigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-700 dark:text-amber-300">{unassignedCounterCount}</p>
          </CardContent>
        </Card>
        <Card className="border-violet-200/60 bg-violet-50/70 shadow-lg dark:border-violet-500/30 dark:bg-violet-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-[0.1em] text-violet-700 dark:text-violet-300">Orders Handled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-violet-700 dark:text-violet-300">{handledOrdersTotal}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/70 bg-white/90 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Counter Command Board</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {counterRecords.map((counterRecord) => {
              const loadPercent = Math.max(8, Math.round((counterRecord.ordersHandledToday / maxHandledOrders) * 100));

              return (
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
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                    Staff: {counterRecord.currentStaffName || 'Unassigned'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Task: {counterRecord.currentTask}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">Orders handled: {counterRecord.ordersHandledToday}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400" style={{ width: `${loadPercent}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                    Updated: {new Date(counterRecord.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              );
            })}
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
              {assignableStaffRecords.map((staffRecord) => (
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
