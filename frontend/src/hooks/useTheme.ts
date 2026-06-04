import { useEffect } from 'react';
import {
  useThemeStore,
  type ResolvedTheme,
  type ThemeMode,
} from '@/store/themeStore';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveTheme(theme: ThemeMode, system: ResolvedTheme): ResolvedTheme {
  return theme === 'system' ? system : theme;
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolved;
}

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const resolved = useThemeStore((s) => s.resolved);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggle = useThemeStore((s) => s.toggle);
  const setResolved = useThemeStore((s) => s._setResolved);

  useEffect(() => {
    const system = getSystemTheme();
    const next = resolveTheme(theme, system);
    setResolved(next);
    applyTheme(next);
  }, [theme, setResolved]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      const system: ResolvedTheme = e.matches ? 'dark' : 'light';
      setResolved(system);
      applyTheme(system);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme, setResolved]);

  return { theme, resolved, setTheme, toggle };
}
