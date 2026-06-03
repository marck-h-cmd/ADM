import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginUser } from '@/types/venta.types';
import { tokenStore } from '@/services/tokenStore';

interface AuthState {
  token: string | null;
  user: LoginUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: LoginUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: (token, user) => {
        tokenStore.set(token);
        set({ token, user, isAuthenticated: true });
      },
      clear: () => {
        tokenStore.clear();
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'tenebrosa.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true;
          tokenStore.set(state.token);
        }
      },
    },
  ),
);
