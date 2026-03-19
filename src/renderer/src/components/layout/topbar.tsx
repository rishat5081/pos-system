import { Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/themeSwitcher';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);

  return (
    <header className="relative z-10 flex h-14 items-center justify-between border-b border-slate-200/70 bg-white/80 px-5 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Active Store</p>
        <p className="text-sm font-semibold text-slate-800">Default Store</p>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-700">
        <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 md:inline-flex">
          <Globe2 className="h-3 w-3" />
          {globalPreferences.currency} / {globalPreferences.timezone}
        </span>
        <ThemeSwitcher />
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-cyan-900">
          {user?.fullName ?? 'Unknown User'}
        </span>
        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => void logout()}>
          Logout
        </Button>
      </div>
    </header>
  );
}
