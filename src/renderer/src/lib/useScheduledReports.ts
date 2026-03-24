import { useEffect } from 'react';
import { downloadDataExport } from '@/lib/dataExchange';
import { useScheduledReportsStore } from '@/stores/scheduledReportsStore';
import type { ReportType } from '@/stores/scheduledReportsStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

function buildReportRows(reportType: ReportType, snapshot: ReturnType<typeof useStoreOpsStore.getState>): Record<string, string | number | boolean>[] {
  const completedOrders = snapshot.orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((s, o) => s + o.totalAmount, 0);

  if (reportType === 'dailySales') {
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = completedOrders.filter((o) => o.createdAt.slice(0, 10) === today);
    return [{
      date: today,
      orders: todayOrders.length,
      revenue: todayOrders.reduce((s, o) => s + o.totalAmount, 0),
      avgTicket: todayOrders.length > 0 ? Math.round(todayOrders.reduce((s, o) => s + o.totalAmount, 0) / todayOrders.length * 100) / 100 : 0
    }];
  }

  if (reportType === 'weeklyPerformance') {
    return [{
      period: 'Last 7 Days',
      totalOrders: completedOrders.length,
      totalRevenue,
      avgTicket: completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length * 100) / 100 : 0,
      products: snapshot.products.length,
      lowStock: snapshot.products.filter((p) => p.stock <= p.reorderLevel).length
    }];
  }

  if (reportType === 'monthlyAnalytics') {
    return [{
      period: 'Monthly',
      totalOrders: completedOrders.length,
      totalRevenue,
      customers: snapshot.customers.length,
      staff: snapshot.staffRecords.length,
      products: snapshot.products.length
    }];
  }

  // branchSnapshot
  return [{
    storeName: snapshot.storeProfile.storeName,
    products: snapshot.products.length,
    orders: completedOrders.length,
    revenue: totalRevenue,
    staff: snapshot.staffRecords.length,
    customers: snapshot.customers.length,
    inventoryValue: snapshot.products.reduce((s, p) => s + p.price * p.stock, 0)
  }];
}

const REPORT_TITLES: Record<ReportType, string> = {
  dailySales: 'Daily Sales Report',
  weeklyPerformance: 'Weekly Performance Report',
  monthlyAnalytics: 'Monthly Analytics Report',
  branchSnapshot: 'Branch Snapshot Report'
};

export function useScheduledReports(): void {
  const schedules = useScheduledReportsStore((s) => s.schedules);
  const markRun = useScheduledReportsStore((s) => s.markRun);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const snapshot = useStoreOpsStore.getState();

      for (const schedule of schedules) {
        if (!schedule.enabled) continue;
        if (new Date(schedule.nextRunAt).getTime() > now) continue;

        const rows = buildReportRows(schedule.reportType, snapshot);
        void downloadDataExport({
          title: REPORT_TITLES[schedule.reportType],
          fileBaseName: `${schedule.reportType}-${new Date().toISOString().slice(0, 10)}`,
          rows,
          format: schedule.format
        });
        markRun(schedule.id);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [schedules, markRun]);
}
