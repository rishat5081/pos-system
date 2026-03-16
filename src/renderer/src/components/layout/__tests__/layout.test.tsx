import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

const initialStoreSnapshot = useStoreOpsStore.getState().getStoreSnapshot();

describe('layout components', () => {
  beforeEach(() => {
    useStoreOpsStore.getState().hydrateStoreSnapshot(initialStoreSnapshot);
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

  it('renders sidebar navigation links', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /pos system/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Business Suite' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^POS$/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Counters' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inventory' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Customers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'HR' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Super Admin' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'User Management' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reports' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('renders current user and handles logout click', async () => {
    const logoutMock = vi.fn(async () => {});
    const user = userEvent.setup();

    useAuthStore.setState({
      logout: logoutMock
    });

    render(<Topbar />);

    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('marks only orders as active on orders route', () => {
    render(
      <MemoryRouter initialEntries={['/app/orders']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current', 'page');
  });

  it('hides owner-only navigation for managers', () => {
    useAuthStore.setState({
      user: {
        id: 'u2',
        username: 'manager',
        fullName: 'Store Manager',
        role: 'manager',
        storeId: 'store-default'
      }
    });

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: 'Super Admin' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'User Management' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('shows only cashier-safe navigation for cashiers', () => {
    useAuthStore.setState({
      user: {
        id: 'u3',
        username: 'cashier1',
        fullName: 'Lane Cashier',
        role: 'cashier',
        storeId: 'store-default'
      }
    });

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^POS$/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Customers' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Business Suite' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Inventory' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'HR' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });
});
