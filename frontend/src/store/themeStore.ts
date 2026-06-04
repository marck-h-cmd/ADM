import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  resolved: ResolvedTheme;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
  _setResolved: (r: ResolvedTheme) => void;
}

const initial = {
  theme: 'system' as ThemeMode,
  resolved: 'dark' as ResolvedTheme,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      ...initial,
      setTheme: (theme) => set({ theme }),
      toggle: () => {
        const current = get().resolved;
        set({ theme: current === 'dark' ? 'light' : 'dark' });
      },
      _setResolved: (resolved) => set({ resolved }),
    }),
    {
      name: 'tenebrosa.theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme }),
    },
  ),
);
