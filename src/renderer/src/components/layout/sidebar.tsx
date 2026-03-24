import { Link, NavLink } from 'react-router-dom';
import {
  BriefcaseBusiness,
  ChartColumnBig,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  Users,
  Building2,
  Warehouse
} from 'lucide-react';
import { canAccessRoute } from '@/lib/accessControl';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const storeProfile = useStoreOpsStore((state) => state.storeProfile);
  const enabledFeatures = useStoreOpsStore((state) => state.storeProfile.enabledFeatures);
  const navItems = !user
    ? []
    : [
        { to: '/app', label: 'Dashboard', shortLabel: 'Dash', icon: LayoutDashboard, end: true },
        { to: '/app/businessSuite', label: 'Business Suite', shortLabel: 'Suite', icon: BriefcaseBusiness },
        { to: '/app/pos', label: 'POS', shortLabel: 'POS', icon: ShoppingCart },
        { to: '/app/orders', label: 'Orders', shortLabel: 'Orders', icon: ClipboardList },
        { to: '/app/counters', label: 'Counters', shortLabel: 'Lanes', icon: ClipboardList },
        { to: '/app/inventory', label: 'Inventory', shortLabel: 'Stock', icon: Warehouse },
        { to: '/app/customers', label: 'Customers', shortLabel: 'CRM', icon: UserRound },
        { to: '/app/hr', label: 'HR', shortLabel: 'HR', icon: Users },
        { to: '/app/superAdmin', label: 'Super Admin', shortLabel: 'Admin', icon: ShieldCheck },
        { to: '/app/userManagement', label: 'User Management', shortLabel: 'Users', icon: UserRound },
        { to: '/app/reports', label: 'Reports', shortLabel: 'Data', icon: ChartColumnBig },
        { to: '/app/companyAnalytics', label: 'Company Analytics', shortLabel: 'Org', icon: Building2 },
        { to: '/app/settings', label: 'Settings', shortLabel: 'Prefs', icon: Settings }
      ].filter((item) => canAccessRoute(item.to, user, enabledFeatures));

  const storeInitials = storeProfile.storeName
    .split(' ')
    .map((segment) => segment.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="flex w-24 shrink-0 flex-col border-r border-slate-200/80 bg-white/80 px-3 py-4 shadow-xl backdrop-blur">
      <div className="mb-4 flex flex-col items-center gap-3 border-b border-slate-200/80 pb-4">
        <Link to="/app" aria-label="POS System" className="flex flex-col items-center gap-2 text-center">
          <span aria-hidden className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/15">
            {storeInitials || 'PS'}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{storeProfile.storeCode}</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'group flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center transition-all',
                isActive
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">{item.shortLabel}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
