import { useThemeStore } from '@/stores/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    useThemeStore.setState({
      theme: 'light'
    });
  });

  it('toggles between light and dark themes', () => {
    const state = useThemeStore.getState();

    state.setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    state.toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('hydrates persisted theme', () => {
    window.localStorage.setItem('posSystemTheme', 'dark');

    useThemeStore.getState().hydrateTheme();

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
