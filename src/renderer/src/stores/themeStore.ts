import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

const themeStorageKey = 'posSystemTheme';

function getSystemPreferredTheme(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem(themeStorageKey);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return getSystemPreferredTheme();
}

function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  hydrateTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),

  setTheme(theme: ThemeMode): void {
    set({ theme });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(themeStorageKey, theme);
    }
    applyTheme(theme);
  },

  toggleTheme(): void {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  hydrateTheme(): void {
    const theme = getInitialTheme();
    set({ theme });
    applyTheme(theme);
  }
}));
