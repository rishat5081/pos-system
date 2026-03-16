import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/loginPage';
import { useAuthStore } from '@/stores/authStore';

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      loading: false,
      error: null
    });
    vi.clearAllMocks();
  });

  it('shows validation errors when fields are empty', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.clear(screen.getByLabelText('Username'));
    await user.clear(screen.getByLabelText('Password'));
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('submits valid credentials', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.clear(screen.getByLabelText('Username'));
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(window.api!.auth.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin123' });
  });
});
