import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboardPage';
import { SettingsPage } from '@/pages/settingsPage';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

describe('dashboard and settings pages', () => {
  const initialStoreSnapshot = useStoreOpsStore.getState().getStoreSnapshot();

  beforeEach(() => {
    useStoreOpsStore.getState().hydrateStoreSnapshot({
      ...initialStoreSnapshot,
      storeProfile: {
        ...initialStoreSnapshot.storeProfile,
        deploymentSetupCompletedAt: '2026-03-15T08:00:00.000Z'
      }
    });
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'admin',
        fullName: 'Super Admin',
        role: 'super_admin',
        storeId: 'store-default'
      },
      error: null,
      loading: false
    });
  });

  it('shows KPI cards on dashboard', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Inventory Value')).toBeInTheDocument();
    expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
  });

  it('shows settings form scaffold', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('International Preferences')).toBeInTheDocument();
    expect(screen.getByText('Access Matrix')).toBeInTheDocument();
    expect(screen.getByLabelText('Locale')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toBeInTheDocument();
    expect(screen.getByLabelText('Timezone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rerun Setup Wizard' })).toBeInTheDocument();
    expect(screen.getByText('Live Sync')).toBeInTheDocument();
  });
});
