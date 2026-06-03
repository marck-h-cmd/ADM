import { api, tokenStore } from './api';
import type { ApiSuccess } from '@/types/api.types';
import type { LoginDTO, LoginResponse } from '@/types/venta.types';

export const authService = {
  async login(credentials: LoginDTO): Promise<LoginResponse> {
    const res = await api.post<ApiSuccess<LoginResponse>>('/auth/login', credentials);
    const { token } = res.data.data;
    tokenStore.set(token);
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStore.clear();
    }
  },
};
