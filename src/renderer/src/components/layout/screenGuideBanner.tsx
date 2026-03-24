import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface GuideContent {
  title: string;
  purpose: string;
  actions: string[];
}

const guideByRoute: Record<string, GuideContent> = {
  '/app': {
    title: 'Dashboard',
    purpose: 'Live store pulse',
    actions: ['KPIs', 'Team', 'Register']
  },
  '/app/businessSuite': {
    title: 'Business Suite',
    purpose: 'Vertical operations',
    actions: ['Switch mode', 'Run board', 'Track load']
  },
  '/app/pos': {
    title: 'POS',
    purpose: 'Checkout and receipt',
    actions: ['Open register', 'Build cart', 'Print bill']
  },
  '/app/orders': {
    title: 'Orders',
    purpose: 'Orders, invoices, returns',
    actions: ['Import', 'Invoice', 'Return']
  },
  '/app/counters': {
    title: 'Counters',
    purpose: 'Lane assignment',
    actions: ['Assign', 'Track task', 'Release']
  },
  '/app/inventory': {
    title: 'Inventory',
    purpose: 'Stock and purchasing',
    actions: ['Products', 'Vendors', 'Receiving']
  },
  '/app/customers': {
    title: 'Customers',
    purpose: 'CRM and loyalty',
    actions: ['Profiles', 'History', 'Credit']
  },
  '/app/hr': {
    title: 'HR',
    purpose: 'People operations',
    actions: ['Directory', 'Payroll', 'Calendar']
  },
  '/app/superAdmin': {
    title: 'Super Admin',
    purpose: 'Owner control room',
    actions: ['Live view', 'Counters', 'Throughput']
  },
  '/app/userManagement': {
    title: 'Users',
    purpose: 'Access control',
    actions: ['Create', 'Preset', 'Audit']
  },
  '/app/reports': {
    title: 'Reports',
    purpose: 'Operational exports',
    actions: ['Finance', 'Movement', 'Export']
  },
  '/app/settings': {
    title: 'Settings',
    purpose: 'Deployment and sync',
    actions: ['Locale', 'Modules', 'Sync']
  }
};

export function ScreenGuideBanner() {
  const location = useLocation();

  const guideContent = useMemo(() => guideByRoute[location.pathname] ?? null, [location.pathname]);

  if (!guideContent) {
    return <></>;
  }

  return (
    <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{guideContent.purpose}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{guideContent.title}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {guideContent.actions.map((action) => (
          <span key={action} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700">
            {action}
          </span>
        ))}
      </div>
    </section>
  );
}
