import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeSwitcher(): JSX.Element {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 rounded-lg border-slate-300 bg-white/80 px-3 text-xs font-semibold uppercase tracking-[0.1em] shadow-sm backdrop-blur dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100"
      onClick={toggleTheme}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
      {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
    </Button>
  );
}
