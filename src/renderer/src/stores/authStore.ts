import { create } from 'zustand';
import { getDesktopApi } from '@/lib/desktopApi';

export interface SessionUser {
  id: string;
  username: string;
  fullName: string;
  role: 'super_admin' | 'manager' | 'cashier';
  storeId: string;
  grantedFeatureKeys?: string[];
  revokedFeatureKeys?: string[];
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  setUser: (user: SessionUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrateSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  async login(username: string, password: string): Promise<void> {
    set({ loading: true, error: null });
    try {
      const user = await getDesktopApi().auth.login({ username, password });
      set({ user, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  async logout(): Promise<void> {
    set({ loading: true, error: null });
    try {
      await getDesktopApi().auth.logout();
      set({ user: null, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  async hydrateSession(): Promise<void> {
    set({ loading: true, error: null });
    try {
      const user = await getDesktopApi().auth.getSession();
      set({ user, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Session load failed';
      set({ error: message, loading: false });
    }
  }
}));
