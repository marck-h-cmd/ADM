import { useCallback } from 'react';
import { useToastStore, type ToastTone } from '@/store/toastStore';

type ToastOptions = { description?: string; duration?: number };

export function useToast() {
  const add = useToastStore((s) => s.add);
  const remove = useToastStore((s) => s.remove);
  const clear = useToastStore((s) => s.clear);

  const make = useCallback(
    (tone: ToastTone) =>
      (title: string, opts?: ToastOptions) =>
        add({
          tone,
          title,
          description: opts?.description,
          duration: opts?.duration ?? 4500,
        }),
    [add],
  );

  return {
    success: make('jade'),
    error: make('cinnabar'),
    info: make('ink'),
    warning: make('gold'),
    dismiss: remove,
    clear,
  };
}
