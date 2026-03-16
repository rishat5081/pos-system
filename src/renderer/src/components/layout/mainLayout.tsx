import { InvoiceReminderCenter } from '@/components/layout/invoiceReminderCenter';
import { Outlet } from 'react-router-dom';
import { ScreenGuideBanner } from '@/components/layout/screenGuideBanner';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export function MainLayout(): JSX.Element {
  return (
    <div className="flex h-screen min-w-[1024px] bg-transparent">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <InvoiceReminderCenter />
        <main className="relative flex-1 overflow-auto p-6">
          <ScreenGuideBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
