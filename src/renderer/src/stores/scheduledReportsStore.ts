import { create } from 'zustand';
import type { DataExchangeFormat } from '@/lib/dataExchange';

export type ReportType = 'dailySales' | 'weeklyPerformance' | 'monthlyAnalytics' | 'branchSnapshot';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly';

export interface ScheduleConfig {
  id: string;
  reportType: ReportType;
  frequency: ReportFrequency;
  format: DataExchangeFormat;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string;
}

interface ScheduledReportsState {
  schedules: ScheduleConfig[];
  addSchedule: (input: { reportType: ReportType; frequency: ReportFrequency; format: DataExchangeFormat }) => void;
  removeSchedule: (id: string) => void;
  toggleSchedule: (id: string) => void;
  markRun: (id: string) => void;
}

const STORAGE_KEY = 'posSystemScheduledReports';

function computeNextRunAt(frequency: ReportFrequency): string {
  const now = new Date();
  if (frequency === 'daily') {
    now.setDate(now.getDate() + 1);
    now.setHours(0, 0, 0, 0);
  } else if (frequency === 'weekly') {
    now.setDate(now.getDate() + 7);
    now.setHours(0, 0, 0, 0);
  } else {
    now.setMonth(now.getMonth() + 1, 1);
    now.setHours(0, 0, 0, 0);
  }
  return now.toISOString();
}

function loadFromStorage(): ScheduleConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(schedules: ScheduleConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch { /* ignore */ }
}

export const useScheduledReportsStore = create<ScheduledReportsState>((set) => ({
  schedules: loadFromStorage(),

  addSchedule(input) {
    const id = `sched-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const config: ScheduleConfig = {
      id,
      reportType: input.reportType,
      frequency: input.frequency,
      format: input.format,
      enabled: true,
      lastRunAt: null,
      nextRunAt: computeNextRunAt(input.frequency)
    };
    set((state) => {
      const next = [...state.schedules, config];
      persist(next);
      return { schedules: next };
    });
  },

  removeSchedule(id) {
    set((state) => {
      const next = state.schedules.filter((s) => s.id !== id);
      persist(next);
      return { schedules: next };
    });
  },

  toggleSchedule(id) {
    set((state) => {
      const next = state.schedules.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      persist(next);
      return { schedules: next };
    });
  },

  markRun(id) {
    set((state) => {
      const now = new Date().toISOString();
      const next = state.schedules.map((s) => {
        if (s.id !== id) return s;
        return { ...s, lastRunAt: now, nextRunAt: computeNextRunAt(s.frequency) };
      });
      persist(next);
      return { schedules: next };
    });
  }
}));
