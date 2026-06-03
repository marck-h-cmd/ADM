import { create } from 'zustand';

export type ToastTone = 'jade' | 'cinnabar' | 'gold' | 'ink';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  duration: number;
  createdAt: number;
}

export type ToastInput = Omit<Toast, 'id' | 'createdAt'>;

interface ToastState {
  toasts: Toast[];
  add: (toast: ToastInput) => string;
  remove: (id: string) => void;
  clear: () => void;
}

const MAX_TOASTS = 5;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((s) => {
      const next = [...s.toasts, { ...toast, id, createdAt: Date.now() }];
      return { toasts: next.slice(-MAX_TOASTS) };
    });
    return id;
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
