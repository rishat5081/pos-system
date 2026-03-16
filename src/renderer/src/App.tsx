import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/mainLayout';
import { useStoreSync } from '@/lib/useStoreSync';
import { BusinessSuitePage } from '@/pages/businessSuitePage';
import { CounterManagementPage } from '@/pages/counterManagementPage';
import { CustomersPage } from '@/pages/customersPage';
import { DashboardPage } from '@/pages/dashboardPage';
import { HomePage } from '@/pages/homePage';
import { InventoryPage } from '@/pages/inventoryPage';
import { LoginPage } from '@/pages/loginPage';
import { OrderManagementPage } from '@/pages/orderManagementPage';
import { PosPage } from '@/pages/posPage';
import { ReportsPage } from '@/pages/reportsPage';
import { SettingsPage } from '@/pages/settingsPage';
import { SetupWizardPage } from '@/pages/setupWizardPage';
import { StaffPage } from '@/pages/staffPage';
import { SuperAdminPage } from '@/pages/superAdminPage';
import { UserManagementPage } from '@/pages/userManagementPage';
import { ProtectedRoute } from '@/routes/protectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

function NotFoundPage(): JSX.Element {
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-sm text-slate-500">Page not found.</p>
    </div>
  );
}

export default function App(): JSX.Element {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const hydrateTheme = useThemeStore((state) => state.hydrateTheme);
  useStoreSync();

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/setup" element={<SetupWizardPage />} />
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="businessSuite" element={<BusinessSuitePage />} />
            <Route path="pos" element={<PosPage />} />
            <Route path="orders" element={<OrderManagementPage />} />
            <Route path="counters" element={<CounterManagementPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="hr" element={<StaffPage />} />
            <Route path="staff" element={<Navigate to="/app/hr" replace />} />
            <Route path="superAdmin" element={<SuperAdminPage />} />
            <Route path="userManagement" element={<UserManagementPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  );
}
