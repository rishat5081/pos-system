import { useMemo, useState } from 'react';
import { ArrowLeft, Building2, ChevronRight, RotateCcw, TrendingUp, TrendingDown, Settings2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardLayoutStore } from '@/stores/dashboardLayoutStore';
import { useOrgHierarchyStore } from '@/stores/orgHierarchyStore';
import type { AggregatedKPIs, BranchSnapshotRecord, HierarchyLevel } from '@/stores/orgHierarchyTypes';
import { computeCurrentBranchSnapshot, useStoreOpsStore } from '@/stores/storeOpsStore';

const levelLabels: Record<HierarchyLevel, string> = {
  company: 'Companies',
  country: 'Countries',
  city: 'Cities',
  area: 'Areas',
  branch: 'Branches'
};

function aggregateSnapshots(snapshots: BranchSnapshotRecord[]): AggregatedKPIs {
  if (snapshots.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      averageTicket: 0,
      branchCount: 0,
      totalProducts: 0,
      lowStockCount: 0,
      staffCount: 0,
      clockedInStaff: 0,
      customerCount: 0,
      totalInventoryValue: 0
    };
  }

  const totalRevenue = snapshots.reduce((s, snap) => s + snap.totalRevenue, 0);
  const totalOrders = snapshots.reduce((s, snap) => s + snap.totalOrders, 0);

  return {
    totalRevenue,
    totalOrders,
    averageTicket: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
    branchCount: snapshots.length,
    totalProducts: snapshots.reduce((s, snap) => s + snap.totalProducts, 0),
    lowStockCount: snapshots.reduce((s, snap) => s + snap.lowStockCount, 0),
    staffCount: snapshots.reduce((s, snap) => s + snap.staffCount, 0),
    clockedInStaff: snapshots.reduce((s, snap) => s + snap.clockedInStaff, 0),
    customerCount: snapshots.reduce((s, snap) => s + snap.customerCount, 0),
    totalInventoryValue: snapshots.reduce((s, snap) => s + snap.totalInventoryValue, 0)
  };
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function Sparkline({ data, color = '#0ea5e9' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mt-1.5">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KPICard({ label, value, prefix, sparklineData }: { label: string; value: string | number; prefix?: string; sparklineData?: number[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        {prefix}
        {value}
      </p>
      {sparklineData && sparklineData.length >= 2 && <Sparkline data={sparklineData} />}
    </div>
  );
}

function RevenueBar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className="h-2 rounded-full bg-slate-800 transition-all" style={{ width: `${width}%` }} />
    </div>
  );
}

function PieChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-100">
        <span className="text-xs text-slate-400">No data</span>
      </div>
    );
  }

  let cumulativeDeg = 0;
  const gradientParts: string[] = [];

  for (const slice of slices) {
    const deg = (slice.value / total) * 360;
    gradientParts.push(`${slice.color} ${cumulativeDeg}deg ${cumulativeDeg + deg}deg`);
    cumulativeDeg += deg;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(${gradientParts.join(', ')})` }} />
      <div className="space-y-1">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="text-slate-600">{slice.label}</span>
            <span className="font-semibold text-slate-900">{total > 0 ? Math.round((slice.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#475569', '#1e293b'];

function computePeriodMetrics(orders: { createdAt: string; totalAmount: number; status: string }[], start: Date, end: Date) {
  const filtered = orders.filter((o) => {
    if (o.status !== 'completed') return false;
    const d = new Date(o.createdAt);
    return d >= start && d <= end;
  });
  const revenue = filtered.reduce((s, o) => s + o.totalAmount, 0);
  const count = filtered.length;
  return { revenue, orders: count, avgTicket: count > 0 ? revenue / count : 0 };
}

function DeltaBadge({ current, previous, label }: { current: number; previous: number; label: string }) {
  const delta = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
  const isUp = delta >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{label === 'Avg Ticket' ? '$' : ''}{formatCurrency(Math.round(current))}</p>
      <div className="mt-1 flex items-center gap-1">
        {isUp ? <TrendingUp className="h-3 w-3 text-emerald-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
        <span className={`text-xs font-semibold ${isUp ? 'text-emerald-700' : 'text-red-700'}`}>{isUp ? '+' : ''}{delta}%</span>
      </div>
    </div>
  );
}

function TrendAnalysisCard({ orders }: { orders: { createdAt: string; totalAmount: number; status: string }[] }) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - dayOfWeek);
  thisWeekStart.setHours(0, 0, 0, 0);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(thisMonthStart);
  lastMonthEnd.setMilliseconds(-1);

  const thisWeek = computePeriodMetrics(orders, thisWeekStart, now);
  const lastWeek = computePeriodMetrics(orders, lastWeekStart, lastWeekEnd);
  const thisMonth = computePeriodMetrics(orders, thisMonthStart, now);
  const lastMonth = computePeriodMetrics(orders, lastMonthStart, lastMonthEnd);

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg">
      <CardHeader>
        <CardTitle>Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Week over Week</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <DeltaBadge current={thisWeek.revenue} previous={lastWeek.revenue} label="Revenue" />
              <DeltaBadge current={thisWeek.orders} previous={lastWeek.orders} label="Orders" />
              <DeltaBadge current={thisWeek.avgTicket} previous={lastWeek.avgTicket} label="Avg Ticket" />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Month over Month</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <DeltaBadge current={thisMonth.revenue} previous={lastMonth.revenue} label="Revenue" />
              <DeltaBadge current={thisMonth.orders} previous={lastMonth.orders} label="Orders" />
              <DeltaBadge current={thisMonth.avgTicket} previous={lastMonth.avgTicket} label="Avg Ticket" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeatMapCard({
  companies,
  countries,
  cities,
  areas,
  branches,
  branchSnapshots,
  onDrillDown
}: {
  companies: { id: string; name: string }[];
  countries: { id: string; companyId: string; name: string }[];
  cities: { id: string; countryId: string; name: string }[];
  areas: { id: string; cityId: string; name: string }[];
  branches: { id: string; areaId: string; name: string }[];
  branchSnapshots: BranchSnapshotRecord[];
  onDrillDown: (id: string) => void;
}) {
  const snapMap = new Map(branchSnapshots.map((s) => [s.branchId, s.totalRevenue]));
  const allRevenues = branchSnapshots.map((s) => s.totalRevenue);
  const avgRev = allRevenues.length > 0 ? allRevenues.reduce((a, b) => a + b, 0) / allRevenues.length : 0;

  function getColor(revenue: number): string {
    if (avgRev === 0) return 'rgba(100,116,139,0.25)';
    const ratio = revenue / avgRev;
    if (ratio >= 1.2) return 'rgba(16,185,129,0.5)';
    if (ratio >= 0.8) return 'rgba(16,185,129,0.25)';
    return 'rgba(100,116,139,0.25)';
  }

  const countryMap = new Map<string, typeof countries>();
  for (const c of countries) {
    if (!countryMap.has(c.companyId)) countryMap.set(c.companyId, []);
    countryMap.get(c.companyId)!.push(c);
  }

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg">
      <CardHeader>
        <CardTitle>Performance Heat Map</CardTitle>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No hierarchy data.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {companies.map((company) => {
              const companyCountries = countryMap.get(company.id) ?? [];
              const companyBranchCount = companyCountries.reduce((sum, country) => {
                const cCities = cities.filter((c) => c.countryId === country.id);
                const cAreas = areas.filter((a) => cCities.some((c) => c.id === a.cityId));
                return sum + branches.filter((b) => cAreas.some((a) => a.id === b.areaId)).length;
              }, 0);
              const companyRevenue = companyCountries.reduce((sum, country) => {
                const cCities = cities.filter((c) => c.countryId === country.id);
                const cAreas = areas.filter((a) => cCities.some((c) => c.id === a.cityId));
                const cBranches = branches.filter((b) => cAreas.some((a) => a.id === b.areaId));
                return sum + cBranches.reduce((s, b) => s + (snapMap.get(b.id) ?? 0), 0);
              }, 0);
              return (
                <button
                  key={company.id}
                  type="button"
                  className="min-w-[80px] rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-slate-400"
                  style={{ flex: Math.max(1, companyBranchCount), backgroundColor: getColor(companyRevenue / Math.max(1, companyBranchCount) * (companyBranchCount > 0 ? companyBranchCount : 1)) }}
                  onClick={() => onDrillDown(company.id)}
                >
                  <p className="text-xs font-bold text-slate-900">{company.name}</p>
                  <p className="text-[10px] text-slate-600">${formatCurrency(companyRevenue)}</p>
                  <p className="text-[10px] text-slate-500">{companyBranchCount} branches</p>
                </button>
              );
            })}
          </div>
        )}
        <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.5)' }} /> Above avg</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.25)' }} /> Near avg</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ backgroundColor: 'rgba(100,116,139,0.25)' }} /> Below avg</span>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomizePanel({ page, onClose }: { page: 'analytics' | 'dashboard'; onClose: () => void }) {
  const layout = useDashboardLayoutStore((s) => page === 'analytics' ? s.analyticsLayout : s.dashboardLayout);
  const toggleTile = useDashboardLayoutStore((s) => s.toggleTile);
  const moveTileUp = useDashboardLayoutStore((s) => s.moveTileUp);
  const moveTileDown = useDashboardLayoutStore((s) => s.moveTileDown);
  const resetLayout = useDashboardLayoutStore((s) => s.resetLayout);
  const sorted = [...layout].sort((a, b) => a.order - b.order);

  return (
    <Card className="border-white/70 bg-white/85 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Customize Tiles</CardTitle>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => resetLayout(page)}>Reset</Button>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>Done</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {sorted.map((tile) => (
          <div key={tile.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <input type="checkbox" checked={tile.visible} onChange={() => toggleTile(page, tile.id)} />
            <span className="flex-1 text-sm text-slate-700">{tile.label}</span>
            <button type="button" className="text-slate-400 hover:text-slate-700" onClick={() => moveTileUp(page, tile.id)}><ArrowUp className="h-3.5 w-3.5" /></button>
            <button type="button" className="text-slate-400 hover:text-slate-700" onClick={() => moveTileDown(page, tile.id)}><ArrowDown className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CompanyAnalyticsPage() {
  const [showCustomize, setShowCustomize] = useState(false);
  const analyticsLayout = useDashboardLayoutStore((s) => s.analyticsLayout);
  const sortedLayout = [...analyticsLayout].sort((a, b) => a.order - b.order);
  const isTileVisible = (id: string) => sortedLayout.find((t) => t.id === id)?.visible !== false;

  const companies = useOrgHierarchyStore((s) => s.companies);
  const countries = useOrgHierarchyStore((s) => s.countries);
  const cities = useOrgHierarchyStore((s) => s.cities);
  const areas = useOrgHierarchyStore((s) => s.areas);
  const branches = useOrgHierarchyStore((s) => s.branches);
  const branchSnapshots = useOrgHierarchyStore((s) => s.branchSnapshots);
  const filterState = useOrgHierarchyStore((s) => s.filterState);
  const drillDown = useOrgHierarchyStore((s) => s.drillDown);
  const drillUp = useOrgHierarchyStore((s) => s.drillUp);
  const resetFilter = useOrgHierarchyStore((s) => s.resetFilter);
  const getBranchIdsForEntity = useOrgHierarchyStore((s) => s.getBranchIdsForEntity);

  const storeSnapshot = useStoreOpsStore((s) => s.getStoreSnapshot());
  const orders = useStoreOpsStore((s) => s.orders);

  const currentBranchLive = useMemo(() => computeCurrentBranchSnapshot(storeSnapshot), [storeSnapshot]);

  const allSnapshotsWithLive = useMemo(() => {
    const currentBranch = branches.find((b) => b.isCurrentBranch);
    if (!currentBranch) return branchSnapshots;
    return [...branchSnapshots.filter((bs) => bs.branchId !== currentBranch.id), currentBranchLive];
  }, [branchSnapshots, currentBranchLive, branches]);

  const getSnapshotsForBranchIds = useMemo(() => {
    return (branchIds: string[]): BranchSnapshotRecord[] => {
      const idSet = new Set(branchIds);
      return allSnapshotsWithLive.filter((bs) => idSet.has(bs.branchId));
    };
  }, [allSnapshotsWithLive]);

  const entities = useMemo(() => {
    const { level, selectedCompanyId, selectedCountryId, selectedCityId, selectedAreaId } = filterState;

    if (level === 'company') {
      return companies.map((c) => ({ id: c.id, name: c.name, subtitle: c.code }));
    }
    if (level === 'country' && selectedCompanyId) {
      return countries.filter((c) => c.companyId === selectedCompanyId).map((c) => ({ id: c.id, name: c.name, subtitle: c.code }));
    }
    if (level === 'city' && selectedCountryId) {
      return cities.filter((c) => c.countryId === selectedCountryId).map((c) => ({ id: c.id, name: c.name, subtitle: '' }));
    }
    if (level === 'area' && selectedCityId) {
      return areas.filter((a) => a.cityId === selectedCityId).map((a) => ({ id: a.id, name: a.name, subtitle: '' }));
    }
    if (level === 'branch' && selectedAreaId) {
      return branches.filter((b) => b.areaId === selectedAreaId).map((b) => ({ id: b.id, name: b.name, subtitle: b.storeCode }));
    }
    return [];
  }, [filterState, companies, countries, cities, areas, branches]);

  const entityKPIs = useMemo(() => {
    return entities.map((entity) => {
      const branchIds = getBranchIdsForEntity(filterState.level, entity.id);
      const snapshots = getSnapshotsForBranchIds(branchIds);
      return { entity, kpis: aggregateSnapshots(snapshots) };
    });
  }, [entities, filterState.level, getBranchIdsForEntity, getSnapshotsForBranchIds]);

  const totalKPIs = useMemo(() => {
    const allBranchIds = branches.map((b) => b.id);
    const snapshots = getSnapshotsForBranchIds(allBranchIds);
    return aggregateSnapshots(snapshots);
  }, [branches, getSnapshotsForBranchIds]);

  const visibleKPIs = useMemo(() => {
    const allSnaps = entityKPIs.map((e) => e.kpis);
    if (allSnaps.length === 0) return totalKPIs;
    return {
      totalRevenue: allSnaps.reduce((s, k) => s + k.totalRevenue, 0),
      totalOrders: allSnaps.reduce((s, k) => s + k.totalOrders, 0),
      averageTicket:
        allSnaps.reduce((s, k) => s + k.totalOrders, 0) > 0
          ? Math.round(
              (allSnaps.reduce((s, k) => s + k.totalRevenue, 0) / allSnaps.reduce((s, k) => s + k.totalOrders, 0)) * 100
            ) / 100
          : 0,
      branchCount: allSnaps.reduce((s, k) => s + k.branchCount, 0),
      totalProducts: allSnaps.reduce((s, k) => s + k.totalProducts, 0),
      lowStockCount: allSnaps.reduce((s, k) => s + k.lowStockCount, 0),
      staffCount: allSnaps.reduce((s, k) => s + k.staffCount, 0),
      clockedInStaff: allSnaps.reduce((s, k) => s + k.clockedInStaff, 0),
      customerCount: allSnaps.reduce((s, k) => s + k.customerCount, 0),
      totalInventoryValue: allSnaps.reduce((s, k) => s + k.totalInventoryValue, 0)
    };
  }, [entityKPIs, totalKPIs]);

  const maxRevenue = useMemo(() => Math.max(...entityKPIs.map((e) => e.kpis.totalRevenue), 1), [entityKPIs]);

  const avgRevenue = useMemo(() => {
    if (entityKPIs.length === 0) return 0;
    return entityKPIs.reduce((s, e) => s + e.kpis.totalRevenue, 0) / entityKPIs.length;
  }, [entityKPIs]);

  const topPerformer = useMemo(
    () => entityKPIs.reduce<(typeof entityKPIs)[number] | null>((best, e) => (!best || e.kpis.totalRevenue > best.kpis.totalRevenue ? e : best), null),
    [entityKPIs]
  );

  const bottomPerformer = useMemo(
    () =>
      entityKPIs.reduce<(typeof entityKPIs)[number] | null>(
        (worst, e) => (!worst || e.kpis.totalRevenue < worst.kpis.totalRevenue ? e : worst),
        null
      ),
    [entityKPIs]
  );

  const pieSlices = useMemo(
    () => entityKPIs.map((e, i) => ({ label: e.entity.name, value: e.kpis.totalRevenue, color: COLORS[i % COLORS.length] })),
    [entityKPIs]
  );

  const breadcrumb = useMemo(() => {
    const parts: { label: string; level: HierarchyLevel }[] = [{ label: 'All Companies', level: 'company' }];
    const { selectedCompanyId, selectedCountryId, selectedCityId, selectedAreaId } = filterState;
    if (selectedCompanyId) {
      const company = companies.find((c) => c.id === selectedCompanyId);
      if (company) parts.push({ label: company.name, level: 'country' });
    }
    if (selectedCountryId) {
      const country = countries.find((c) => c.id === selectedCountryId);
      if (country) parts.push({ label: country.name, level: 'city' });
    }
    if (selectedCityId) {
      const city = cities.find((c) => c.id === selectedCityId);
      if (city) parts.push({ label: city.name, level: 'area' });
    }
    if (selectedAreaId) {
      const area = areas.find((a) => a.id === selectedAreaId);
      if (area) parts.push({ label: area.name, level: 'branch' });
    }
    return parts;
  }, [filterState, companies, countries, cities, areas]);

  const branchDetailRows = useMemo(() => {
    if (filterState.level !== 'branch' && filterState.level !== 'area') return [];
    return entityKPIs.map((e) => {
      const branch = branches.find((b) => b.id === e.entity.id);
      return { ...e, storeCode: branch?.storeCode ?? e.entity.subtitle };
    });
  }, [filterState.level, entityKPIs, branches]);

  const sparklineRevenue = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return completedOrders.filter((o) => o.createdAt.slice(0, 10) === key).reduce((s, o) => s + o.totalAmount, 0);
    });
  }, [orders]);

  const sparklineOrders = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return completedOrders.filter((o) => o.createdAt.slice(0, 10) === key).length;
    });
  }, [orders]);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-slate-700" />
          <div>
            <h1 className="text-2xl font-semibold">Company Analytics</h1>
            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              {breadcrumb.map((crumb, index) => (
                <span key={crumb.level} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-3 w-3" />}
                  <span className={index === breadcrumb.length - 1 ? 'font-semibold text-slate-800' : ''}>{crumb.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {filterState.level !== 'company' && (
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={drillUp}>
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={resetFilter}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setShowCustomize(!showCustomize)}>
            <Settings2 className="mr-1 h-3.5 w-3.5" />
            Customize
          </Button>
        </div>
      </header>

      {showCustomize && <CustomizePanel page="analytics" onClose={() => setShowCustomize(false)} />}

      {isTileVisible('kpiRow') && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KPICard label="Total Revenue" value={formatCurrency(visibleKPIs.totalRevenue)} prefix="$" sparklineData={sparklineRevenue} />
          <KPICard label="Total Orders" value={formatCurrency(visibleKPIs.totalOrders)} sparklineData={sparklineOrders} />
          <KPICard label="Avg Ticket" value={formatCurrency(visibleKPIs.averageTicket)} prefix="$" />
          <KPICard label={levelLabels[filterState.level]} value={entities.length} />
        </div>
      )}

      {isTileVisible('trendAnalysis') && <TrendAnalysisCard orders={orders} />}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-white/70 bg-white/85 shadow-lg">
          <CardHeader>
            <CardTitle>{levelLabels[filterState.level]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {entityKPIs.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No entities at this level. Add hierarchy data in Settings.</p>
            ) : (
              entityKPIs.map((item) => {
                const delta = avgRevenue > 0 ? Math.round(((item.kpis.totalRevenue - avgRevenue) / avgRevenue) * 100) : 0;
                return (
                  <button
                    key={item.entity.id}
                    type="button"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-slate-400 hover:bg-slate-100"
                    onClick={() => {
                      if (filterState.level !== 'branch') {
                        drillDown(item.entity.id);
                      }
                    }}
                    disabled={filterState.level === 'branch'}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.entity.name}</p>
                        {item.entity.subtitle && <p className="text-xs text-slate-500">{item.entity.subtitle}</p>}
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-sm font-bold text-slate-900">${formatCurrency(item.kpis.totalRevenue)}</p>
                          <p className="text-xs text-slate-500">{item.kpis.totalOrders} orders</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                        >
                          {delta >= 0 ? '+' : ''}
                          {delta}%
                        </span>
                        {filterState.level !== 'branch' && <ChevronRight className="h-4 w-4 text-slate-400" />}
                      </div>
                    </div>
                    <div className="mt-2">
                      <RevenueBar value={item.kpis.totalRevenue} max={maxRevenue} />
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/70 bg-white/85 shadow-lg">
            <CardHeader>
              <CardTitle>Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topPerformer && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">Top Performer</p>
                  <p className="mt-1 text-sm font-bold text-emerald-900">{topPerformer.entity.name}</p>
                  <p className="text-xs text-emerald-700">${formatCurrency(topPerformer.kpis.totalRevenue)} revenue</p>
                </div>
              )}
              {bottomPerformer && entityKPIs.length > 1 && (
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-600">Lowest Performer</p>
                  <p className="mt-1 text-sm font-bold text-red-900">{bottomPerformer.entity.name}</p>
                  <p className="text-xs text-red-700">${formatCurrency(bottomPerformer.kpis.totalRevenue)} revenue</p>
                </div>
              )}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Avg Revenue</p>
                <p className="mt-1 text-lg font-bold text-slate-900">${formatCurrency(Math.round(avgRevenue))}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/85 shadow-lg">
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart slices={pieSlices} />
            </CardContent>
          </Card>
        </div>
      </div>

      {isTileVisible('heatMap') && (
        <HeatMapCard
          companies={companies}
          countries={countries}
          cities={cities}
          areas={areas}
          branches={branches}
          branchSnapshots={allSnapshotsWithLive}
          onDrillDown={(id) => { if (filterState.level === 'company') drillDown(id); }}
        />
      )}

      {isTileVisible('branchTable') && branchDetailRows.length > 0 && (
        <Card className="border-white/70 bg-white/85 shadow-lg">
          <CardHeader>
            <CardTitle>Branch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    <th className="px-3 py-2">Branch</th>
                    <th className="px-3 py-2">Revenue</th>
                    <th className="px-3 py-2">Orders</th>
                    <th className="px-3 py-2">Avg Ticket</th>
                    <th className="px-3 py-2">Staff</th>
                    <th className="px-3 py-2">Low Stock</th>
                    <th className="px-3 py-2">Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {branchDetailRows.map((row) => (
                    <tr key={row.entity.id} className="border-b border-slate-100 text-slate-700">
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-900">{row.entity.name}</p>
                        <p className="text-xs text-slate-500">{row.storeCode}</p>
                      </td>
                      <td className="px-3 py-2">${formatCurrency(row.kpis.totalRevenue)}</td>
                      <td className="px-3 py-2">{row.kpis.totalOrders}</td>
                      <td className="px-3 py-2">${row.kpis.averageTicket}</td>
                      <td className="px-3 py-2">
                        {row.kpis.clockedInStaff}/{row.kpis.staffCount}
                      </td>
                      <td className="px-3 py-2">{row.kpis.lowStockCount}</td>
                      <td className="px-3 py-2">{row.kpis.customerCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
