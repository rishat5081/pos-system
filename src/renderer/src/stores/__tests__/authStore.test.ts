import { useAuthStore } from '@/stores/authStore';

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      loading: false,
      error: null
    });
    vi.clearAllMocks();
  });

  it('hydrates session from IPC', async () => {
    vi.mocked(window.api!.auth.getSession).mockResolvedValueOnce({
      id: 'u1',
      username: 'admin',
      fullName: 'Admin',
      role: 'super_admin',
      storeId: 's1',
      grantedFeatureKeys: [],
      revokedFeatureKeys: []
    });

    await useAuthStore.getState().hydrateSession();

    expect(useAuthStore.getState().user?.id).toBe('u1');
  });

  it('captures login error', async () => {
    vi.mocked(window.api!.auth.login).mockRejectedValueOnce(new Error('Invalid username or password'));

    await expect(useAuthStore.getState().login('bad', 'bad')).rejects.toThrow('Invalid username or password');
    expect(useAuthStore.getState().error).toBe('Invalid username or password');
  });
});
