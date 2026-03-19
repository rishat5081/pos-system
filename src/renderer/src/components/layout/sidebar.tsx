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
  Warehouse
} from 'lucide-react';
import { canAccessRoute } from '@/lib/accessControl';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const enabledFeatures = useStoreOpsStore((state) => state.storeProfile.enabledFeatures);
  const navItems = !user
    ? []
    : [
        { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/businessSuite', label: 'Business Suite', icon: BriefcaseBusiness },
        { to: '/app/pos', label: 'POS', icon: ShoppingCart },
        { to: '/app/orders', label: 'Orders', icon: ClipboardList },
        { to: '/app/counters', label: 'Counters', icon: ClipboardList },
        { to: '/app/inventory', label: 'Inventory', icon: Warehouse },
        { to: '/app/customers', label: 'Customers', icon: UserRound },
        { to: '/app/hr', label: 'HR', icon: Users },
        { to: '/app/superAdmin', label: 'Super Admin', icon: ShieldCheck },
        { to: '/app/userManagement', label: 'User Management', icon: UserRound },
        { to: '/app/reports', label: 'Reports', icon: ChartColumnBig },
        { to: '/app/settings', label: 'Settings', icon: Settings }
      ].filter((item) => canAccessRoute(item.to, user, enabledFeatures));

  return (
    <aside className="w-64 border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 text-slate-100 shadow-xl">
      <div className="border-b border-slate-800/90 px-5 py-5">
        <Link to="/app" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-sm font-bold text-cyan-100">
            PS
          </span>
          POS System
        </Link>
      </div>
      <nav className="space-y-2 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-cyan-200 text-slate-900 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
