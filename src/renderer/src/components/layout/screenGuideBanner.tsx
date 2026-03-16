import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface GuideContent {
  title: string;
  purpose: string;
  actions: string[];
}

const guideByRoute: Record<string, GuideContent> = {
  '/app': {
    title: 'Dashboard Overview',
    purpose: 'Use this screen to monitor live KPIs and store health.',
    actions: ['Review sales and order KPIs', 'Check staff attendance status', 'Verify register and loyalty status']
  },
  '/app/businessSuite': {
    title: 'Business Suite Guide',
    purpose: 'Use this screen to switch between retail, restaurant, salon, field service, and route-delivery operating models.',
    actions: ['Select an industry mode', 'Review workflows and shared capabilities', 'Inspect the operational boards for that business type']
  },
  '/app/pos': {
    title: 'POS Terminal Guide',
    purpose: 'Use this screen to process customer checkout from cart to payment.',
    actions: ['Open register session', 'Add products and update quantity', 'Complete checkout and confirm payment']
  },
  '/app/orders': {
    title: 'Order Management Guide',
    purpose: 'Use this screen to import orders, customize fields, manage invoices, and track lifecycle status.',
    actions: ['Analyze and map CSV columns', 'Create invoices with due reminders', 'Update order status and notes']
  },
  '/app/counters': {
    title: 'Counter Management Guide',
    purpose: 'Use this screen to control counter assignments and active tasks.',
    actions: ['Assign staff to counter', 'Update counter task', 'Release a counter when shift changes']
  },
  '/app/inventory': {
    title: 'Inventory Management Guide',
    purpose: 'Use this screen to maintain product stock and category setup.',
    actions: ['Track low stock alerts', 'Adjust product stock', 'Create category and product records']
  },
  '/app/customers': {
    title: 'Customer Management Guide',
    purpose: 'Use this screen to manage CRM, loyalty, credit, and customer history.',
    actions: ['Search and select customer', 'Review profile and timeline', 'Add credit or redeem points']
  },
  '/app/hr': {
    title: 'HR Management Guide',
    purpose: 'Use this screen to run people operations through focused HR workflows.',
    actions: ['Select workflow first', 'Complete workflow form actions', 'Review generated history and records']
  },
  '/app/superAdmin': {
    title: 'Super Admin Guide',
    purpose: 'Use this screen for owner-level live store supervision.',
    actions: ['Monitor staff and counters in real time', 'Review throughput and transactions', 'Dispatch counter operations']
  },
  '/app/userManagement': {
    title: 'User Management Guide',
    purpose: 'Use this screen to control account access and role permissions.',
    actions: ['Create new system users', 'Apply job-function permission presets', 'Review account audit trail']
  },
  '/app/reports': {
    title: 'Reports Guide',
    purpose: 'Use this screen to inspect and export operational reports.',
    actions: ['Review financial and order summaries', 'Track department transfers', 'Export required reports']
  },
  '/app/settings': {
    title: 'Settings Guide',
    purpose: 'Use this screen to configure deployment scope, review module access, and control sync behavior.',
    actions: ['Update deployment and locale settings', 'Review role access per enabled module', 'Re-run setup or trigger sync if needed']
  }
};

export function ScreenGuideBanner(): JSX.Element {
  const location = useLocation();

  const guideContent = useMemo(() => {
    return guideByRoute[location.pathname] ?? null;
  }, [location.pathname]);

  if (!guideContent) {
    return <></>;
  }

  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Screen Purpose</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{guideContent.title}</p>
      <p className="mt-1 text-sm text-slate-600">{guideContent.purpose}</p>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {guideContent.actions.map((action) => (
          <p key={action} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            {action}
          </p>
        ))}
      </div>
    </section>
  );
}
