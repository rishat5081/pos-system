import { create } from 'zustand';

export interface TileConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

type PageKey = 'analytics' | 'dashboard';

interface DashboardLayoutState {
  analyticsLayout: TileConfig[];
  dashboardLayout: TileConfig[];
  toggleTile: (page: PageKey, id: string) => void;
  moveTileUp: (page: PageKey, id: string) => void;
  moveTileDown: (page: PageKey, id: string) => void;
  resetLayout: (page: PageKey) => void;
}

const defaultAnalyticsLayout: TileConfig[] = [
  { id: 'kpiRow', label: 'KPI Cards', visible: true, order: 0 },
  { id: 'trendAnalysis', label: 'Trend Analysis', visible: true, order: 1 },
  { id: 'entityList', label: 'Entity List', visible: true, order: 2 },
  { id: 'comparison', label: 'Comparison', visible: true, order: 3 },
  { id: 'pieChart', label: 'Revenue Distribution', visible: true, order: 4 },
  { id: 'heatMap', label: 'Heat Map', visible: true, order: 5 },
  { id: 'branchTable', label: 'Branch Details', visible: true, order: 6 }
];

const defaultDashboardLayout: TileConfig[] = [
  { id: 'storeMomentum', label: 'Store Momentum', visible: true, order: 0 },
  { id: 'kpis', label: 'KPI Cards', visible: true, order: 1 },
  { id: 'team', label: 'Team', visible: true, order: 2 },
  { id: 'customers', label: 'Customers', visible: true, order: 3 },
  { id: 'financePulse', label: 'Finance Pulse', visible: true, order: 4 }
];

const STORAGE_KEY = 'posSystemDashboardLayout';

function loadFromStorage(): { analyticsLayout: TileConfig[]; dashboardLayout: TileConfig[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { analyticsLayout?: TileConfig[]; dashboardLayout?: TileConfig[] };
    if (Array.isArray(parsed.analyticsLayout) && Array.isArray(parsed.dashboardLayout)) {
      return { analyticsLayout: parsed.analyticsLayout, dashboardLayout: parsed.dashboardLayout };
    }
    return null;
  } catch {
    return null;
  }
}

function persist(state: { analyticsLayout: TileConfig[]; dashboardLayout: TileConfig[] }): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analyticsLayout: state.analyticsLayout, dashboardLayout: state.dashboardLayout }));
  } catch { /* ignore */ }
}

function getLayoutKey(page: PageKey): 'analyticsLayout' | 'dashboardLayout' {
  return page === 'analytics' ? 'analyticsLayout' : 'dashboardLayout';
}

const stored = loadFromStorage();

export const useDashboardLayoutStore = create<DashboardLayoutState>((set) => ({
  analyticsLayout: stored?.analyticsLayout ?? [...defaultAnalyticsLayout],
  dashboardLayout: stored?.dashboardLayout ?? [...defaultDashboardLayout],

  toggleTile(page: PageKey, id: string) {
    const key = getLayoutKey(page);
    set((state) => {
      const next = { [key]: state[key].map((t) => (t.id === id ? { ...t, visible: !t.visible } : t)) };
      const result = { ...state, ...next };
      persist(result);
      return next;
    });
  },

  moveTileUp(page: PageKey, id: string) {
    const key = getLayoutKey(page);
    set((state) => {
      const sorted = [...state[key]].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((t) => t.id === id);
      if (idx <= 0) return {};
      const prev = sorted[idx - 1];
      const curr = sorted[idx];
      const next = sorted.map((t) => {
        if (t.id === curr.id) return { ...t, order: prev.order };
        if (t.id === prev.id) return { ...t, order: curr.order };
        return t;
      });
      const result = { ...state, [key]: next };
      persist(result);
      return { [key]: next };
    });
  },

  moveTileDown(page: PageKey, id: string) {
    const key = getLayoutKey(page);
    set((state) => {
      const sorted = [...state[key]].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((t) => t.id === id);
      if (idx < 0 || idx >= sorted.length - 1) return {};
      const nextTile = sorted[idx + 1];
      const curr = sorted[idx];
      const next = sorted.map((t) => {
        if (t.id === curr.id) return { ...t, order: nextTile.order };
        if (t.id === nextTile.id) return { ...t, order: curr.order };
        return t;
      });
      const result = { ...state, [key]: next };
      persist(result);
      return { [key]: next };
    });
  },

  resetLayout(page: PageKey) {
    const key = getLayoutKey(page);
    const defaults = page === 'analytics' ? [...defaultAnalyticsLayout] : [...defaultDashboardLayout];
    set((state) => {
      const result = { ...state, [key]: defaults };
      persist(result);
      return { [key]: defaults };
    });
  }
}));
