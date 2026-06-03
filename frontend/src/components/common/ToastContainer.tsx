import { useToastStore } from '@/store/toastStore';
import { Toast } from './Toast';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div
      aria-label="Notificaciones"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[calc(100vw-2rem)] sm:w-[24rem] max-w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={remove} />
      ))}
    </div>
  );
}
