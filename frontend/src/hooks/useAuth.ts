import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/utils/helpers';
import type { LoginDTO } from '@/types/venta.types';

export function useAuth() {
  const { token, user, isAuthenticated, setSession, clear } = useAuthStore();

  const login = useCallback(
    async (creds: LoginDTO) => {
      try {
        const { token, user } = await authService.login(creds);
        setSession(token, user);
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: getErrorMessage(err) };
      }
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    clear();
  }, [clear]);

  return { token, user, isAuthenticated, login, logout };
}
