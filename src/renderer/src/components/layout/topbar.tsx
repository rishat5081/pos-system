import { Globe2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/themeSwitcher';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const globalPreferences = useStoreOpsStore((state) => state.globalPreferences);
  const storeProfile = useStoreOpsStore((state) => state.storeProfile);

  return (
    <header className="relative z-10 flex h-16 items-center justify-between border-b border-white/70 bg-white/75 px-5 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
          <Store className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{storeProfile.storeName}</p>
          <p className="truncate text-[11px] uppercase tracking-[0.16em] text-slate-500">{storeProfile.storeCode} • {storeProfile.primaryIndustry}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 lg:inline-flex">
          <Globe2 className="h-3.5 w-3.5" />
          {globalPreferences.currency} • {globalPreferences.timezone}
        </span>
        <ThemeSwitcher />
        <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 md:inline-flex">
          {user?.fullName ?? 'Unknown User'}
        </span>
        <Button size="sm" variant="outline" className="rounded-xl px-3" onClick={() => void logout()}>
          Logout
        </Button>
      </div>
    </header>
  );
}
