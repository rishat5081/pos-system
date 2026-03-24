import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { useAuthStore } from '@/stores/authStore';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

const sessionUser = {
  id: 'user-super-admin',
  username: 'admin',
  fullName: 'Super Admin',
  role: 'super_admin' as const,
  storeId: 'store-default',
  grantedFeatureKeys: [],
  revokedFeatureKeys: []
};

const cashierSessionUser = {
  id: 'user-cashier',
  username: 'cashier1',
  fullName: 'Lane Cashier',
  role: 'cashier' as const,
  storeId: 'store-default',
  grantedFeatureKeys: [],
  revokedFeatureKeys: []
};

const initialStoreSnapshot = useStoreOpsStore.getState().getStoreSnapshot();
const configuredStoreSnapshot = {
  ...initialStoreSnapshot,
  storeProfile: {
    ...initialStoreSnapshot.storeProfile,
    deploymentSetupCompletedAt: '2026-03-15T08:00:00.000Z'
  }
};

describe('app flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStoreOpsStore.getState().hydrateStoreSnapshot(configuredStoreSnapshot);
    useAuthStore.setState({
      user: null,
      loading: false,
      error: null
    });
  });

  it('shows landing page at root', async () => {
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(null);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('All-in-One Business Platform')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Sign In$/ })).toBeInTheDocument();
  }, 10000);

  it('redirects unauthenticated users from protected route to login', async () => {
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(null);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('logs in and lands on dashboard', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(null);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Sign In' });
    await user.clear(screen.getByLabelText('Username'));
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(window.api!.auth.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin123' });
  });

  it('forces first-run users through the setup wizard', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(null);
    useStoreOpsStore.getState().hydrateStoreSnapshot(initialStoreSnapshot);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    await user.clear(screen.getByLabelText('Username'));
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('heading', { name: 'Setup Wizard' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /Restaurant/i })[0]);
    await user.clear(screen.getByLabelText('Setup Store Name'));
    await user.type(screen.getByLabelText('Setup Store Name'), 'Pilot Restaurant');
    await user.click(screen.getByRole('button', { name: 'Complete Setup' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('redirects restricted roles away from owner-only routes', async () => {
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(cashierSessionUser);

    render(
      <MemoryRouter initialEntries={['/app/settings']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('allows route access when a user has a granted feature override', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce({
      ...cashierSessionUser,
      grantedFeatureKeys: ['settings']
    });

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Settings' }));
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('lets super admin rerun the setup wizard from settings', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(sessionUser);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Settings' }));
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Rerun Setup Wizard' }));

    expect(await screen.findByRole('heading', { name: 'Setup Wizard' })).toBeInTheDocument();
  });

  it('navigates across main modules from sidebar', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(sessionUser);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Business Suite' }));
    expect(await screen.findByRole('heading', { name: 'Business Suite' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /^POS$/ }));
    expect(await screen.findByRole('heading', { name: 'POS Terminal' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Orders' }));
    expect(await screen.findByRole('heading', { name: 'Order Management' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Counters' }));
    expect(await screen.findByRole('heading', { name: 'Counter Management' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Inventory' }));
    expect(await screen.findByRole('heading', { name: 'Inventory Management' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Customers' }));
    expect(await screen.findByRole('heading', { name: 'Customers' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'HR' }));
    expect(await screen.findByRole('heading', { name: 'HR Management' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Super Admin' }));
    expect(await screen.findByRole('heading', { name: 'Super Admin Control Room' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'User Management' }));
    expect(await screen.findByRole('heading', { name: 'User Management' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Reports' }));
    expect(await screen.findByRole('heading', { name: 'Reports' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Settings' }));
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('logs out and returns to login page', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(sessionUser);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Logout' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    });
    expect(window.api!.auth.logout).toHaveBeenCalledTimes(1);
  });

  it('completes a checkout flow from pos page', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(sessionUser);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Dashboard' });
    await user.click(screen.getByRole('link', { name: /^POS$/ }));
    await screen.findByRole('heading', { name: 'POS Terminal' });
    await user.click(screen.getByRole('button', { name: 'Open Register' }));
    await user.click(screen.getAllByRole('button', { name: 'Add To Cart' })[0]);
    await user.click(screen.getByRole('button', { name: 'Checkout' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm Payment' }));

    expect(await screen.findByText(/Payment successful/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print Bill' })).toBeInTheDocument();
  });

  it('adds customer and shows it in customer list', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(sessionUser);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Dashboard' });
    await user.click(screen.getByRole('link', { name: 'Customers' }));
    await screen.findByRole('heading', { name: 'Customers' });

    await user.type(screen.getByPlaceholderText('Full name'), 'Jordan Miles');
    await user.type(screen.getByPlaceholderText('Phone'), '+1 555 000 9999');
    await user.type(screen.getByPlaceholderText('Email'), 'jordan@example.com');
    await user.click(screen.getByRole('button', { name: 'Save Customer' }));

    expect(await screen.findByText('Jordan Miles')).toBeInTheDocument();
  });

  it('runs cross-industry business suite operations', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(sessionUser);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Dashboard' });
    await user.click(screen.getByRole('link', { name: 'Business Suite' }));
    await screen.findByRole('heading', { name: 'Business Suite' });

    await user.click(screen.getByRole('button', { name: /restaurant/i }));
    await user.type(screen.getByLabelText('Restaurant Table Name'), 'Table 22');
    await user.type(screen.getByLabelText('Restaurant Table Area'), 'Sky Deck');
    await user.clear(screen.getByLabelText('Restaurant Table Seats'));
    await user.type(screen.getByLabelText('Restaurant Table Seats'), '4');
    await user.click(screen.getByRole('button', { name: 'Add Restaurant Table' }));
    expect((await screen.findAllByText('Table 22')).length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText('Restaurant Ticket Items'), 'Burger Combo x3');
    await user.clear(screen.getByLabelText('Restaurant Ticket Course'));
    await user.type(screen.getByLabelText('Restaurant Ticket Course'), 'Main');
    await user.type(screen.getByLabelText('Restaurant Ticket Modifiers'), 'No onion');
    await user.click(screen.getByRole('button', { name: 'Create Kitchen Ticket' }));
    expect(await screen.findByText(/Burger Combo x3/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Salon/i }));
    await user.type(screen.getByLabelText('Salon Service Name'), 'Express Pedicure');
    await user.type(screen.getByLabelText('Salon Service Category'), 'Nails');
    await user.clear(screen.getByLabelText('Salon Service Duration'));
    await user.type(screen.getByLabelText('Salon Service Duration'), '30');
    await user.type(screen.getByLabelText('Salon Service Price'), '35');
    await user.click(screen.getByRole('button', { name: 'Add Salon Service' }));
    expect((await screen.findAllByText('Express Pedicure')).length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText('Salon Booking Customer'), 'Jordan Miles');
    await user.click(screen.getByRole('button', { name: 'Create Salon Booking' }));
    expect(await screen.findByText(/Jordan Miles/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Field Service/i }));
    await user.type(screen.getByLabelText('Price Book Name'), 'Drain Cleaning');
    await user.type(screen.getByLabelText('Price Book Amount'), '150');
    await user.click(screen.getByRole('button', { name: 'Add Price Book Item' }));
    expect((await screen.findAllByText('Drain Cleaning')).length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText('Field Job Customer'), 'Taylor Parker');
    await user.type(screen.getByLabelText('Field Job Address'), '18 West Road');
    await user.type(screen.getByLabelText('Field Job Summary'), 'Urgent repair');
    await user.click(screen.getByRole('button', { name: 'Create Field Job' }));
    expect(await screen.findByText('Taylor Parker')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Field Estimate Customer'), 'Taylor Parker');
    await user.click(screen.getByRole('button', { name: 'Create Estimate' }));
    expect((await screen.findAllByText('Taylor Parker')).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /Grocery \+ Dairy/i }));
    await user.type(screen.getByLabelText('Subscription Customer'), 'Green Villas');
    await user.type(screen.getByLabelText('Subscription Items'), 'Milk + Bread');
    await user.click(screen.getByRole('button', { name: 'Add Subscription' }));
    expect(await screen.findByText('Green Villas')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Manifest Vehicle'));
    await user.type(screen.getByLabelText('Manifest Vehicle'), 'Van 7');
    await user.click(screen.getByRole('button', { name: 'Create Route Manifest' }));
    expect(await screen.findByText(/Van 7/i)).toBeInTheDocument();
  }, 30000);

  it('supports staff attendance, shifts, leave, payroll, and meeting flow', async () => {
    const user = userEvent.setup();
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce(sessionUser);

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Dashboard' });
    await user.click(screen.getByRole('link', { name: 'HR' }));
    await screen.findByRole('heading', { name: 'HR Management' });

    await user.click(screen.getByRole('button', { name: 'HR Module Attendance' }));
    await user.click(screen.getAllByRole('button', { name: /Clock Out|Clock In/ })[0]);

    await user.click(screen.getByRole('button', { name: 'HR Module Department' }));
    await user.selectOptions(screen.getByLabelText('Department Employee'), 'staff-mia');
    await user.clear(screen.getByLabelText('Department Name'));
    await user.type(screen.getByLabelText('Department Name'), 'operations');
    await user.selectOptions(screen.getByLabelText('Department Change Method'), 'transferRequest');
    await user.type(screen.getByLabelText('Department Change Reason'), 'Coverage for peak season');
    await user.click(screen.getByRole('button', { name: 'Update Department' }));
    expect((await screen.findAllByText(/Coverage for peak season/i)).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'HR Module Scheduling' }));
    await user.selectOptions(screen.getByLabelText('Shift Assignee'), 'staff-mia');
    await user.type(screen.getByLabelText('Shift Date'), '2026-03-09');
    await user.type(screen.getByLabelText('Shift Start Time'), '09:00');
    await user.type(screen.getByLabelText('Shift End Time'), '18:00');
    await user.clear(screen.getByLabelText('Shift Role'));
    await user.type(screen.getByLabelText('Shift Role'), 'Cashier');
    await user.click(screen.getByRole('button', { name: 'Add Shift' }));
    expect((await screen.findAllByText('Role: Cashier')).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'HR Module Leave' }));
    await user.selectOptions(screen.getByLabelText('Leave Assignee'), 'staff-mia');
    await user.type(screen.getByLabelText('Leave Date From'), '2026-03-11');
    await user.type(screen.getByLabelText('Leave Date To'), '2026-03-12');
    await user.type(screen.getByLabelText('Leave Reason'), 'Family event');
    await user.click(screen.getByRole('button', { name: 'Submit Leave Request' }));
    expect((await screen.findAllByText(/Family event/i)).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'HR Module Payroll' }));
    await user.clear(screen.getByLabelText('Payroll Period'));
    await user.type(screen.getByLabelText('Payroll Period'), '2026-03');
    await user.click(screen.getByRole('button', { name: 'Generate Payroll' }));
    expect((await screen.findAllByRole('button', { name: 'Download Payslip' })).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'HR Module Calendar' }));
    await user.type(screen.getByLabelText('Meeting Title'), 'Audit Review');
    await user.type(screen.getByLabelText('Meeting Date'), '2026-03-14');
    await user.type(screen.getByLabelText('Meeting Time'), '13:15');
    await user.click(screen.getByRole('button', { name: 'Schedule Meeting' }));

    expect((await screen.findAllByText('Audit Review')).length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText('Appointment Title'), 'Store Visit');
    await user.type(screen.getByLabelText('Appointment Customer'), 'Jordan Miles');
    await user.type(screen.getByLabelText('Appointment Date'), '2026-03-14');
    await user.type(screen.getByLabelText('Appointment Start Time'), '10:00');
    await user.type(screen.getByLabelText('Appointment End Time'), '10:30');
    await user.type(screen.getByLabelText('Appointment Notes'), 'Preferred slot');
    await user.click(screen.getByRole('button', { name: 'Schedule Appointment' }));

    expect((await screen.findAllByText('Store Visit')).length).toBeGreaterThan(0);
    expect(screen.getByText('Pending Deliveries')).toBeInTheDocument();
  }, 30000);
});
