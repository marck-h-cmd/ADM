import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginUser } from '@/types/venta.types';
import { useCompraStore } from './compraStore';
import { useVentaStore } from './ventaStore';

interface AuthState {
  token: string | null;
  user: LoginUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: LoginUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: (token, user) => {
        set({ token, user, isAuthenticated: true });
        useCompraStore.getState().switchUser(user.id);
        useVentaStore.getState().switchUser(user.id);
      },
      clear: () => {
        const currentUser = get().user?.id;
        if (currentUser) {
          useCompraStore.getState().switchUser(null);
          useVentaStore.getState().switchUser(null);
        }
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
          if (state.user?.id) {
            useCompraStore.getState().switchUser(state.user.id);
            useVentaStore.getState().switchUser(state.user.id);
          }
        }
      },
    },
  ),
);
