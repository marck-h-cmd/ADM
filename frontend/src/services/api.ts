import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types/api.types';

const TOKEN_KEY = 'tenebrosa.token';

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Error desconocido de red';
    return Promise.reject(new Error(message));
  },
);

export function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  return promise.then((r) => r.data);
}
