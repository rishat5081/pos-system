import { InvoiceReminderCenter } from '@/components/layout/invoiceReminderCenter';
import { Outlet } from 'react-router-dom';
import { ScreenGuideBanner } from '@/components/layout/screenGuideBanner';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export function MainLayout() {
  return (
    <div className="flex h-screen min-w-[1024px] bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.9),_transparent_35%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)]">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <InvoiceReminderCenter />
        <main className="relative flex-1 overflow-auto px-4 py-4 md:px-5">
          <ScreenGuideBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
