import { useEffect } from 'react';
import { cn } from '@/utils/helpers';
import type { Toast as ToastType } from '@/store/toastStore';

const TONE_STYLES: Record<
  ToastType['tone'],
  {
    borderClass: string;
    barClass: string;
    iconBg: string;
    iconColor: string;
    label: string;
  }
> = {
  jade: {
    borderClass: 'border-l-[var(--color-jade-500)]',
    barClass: 'bg-[var(--color-jade-500)]',
    iconBg: 'bg-[rgba(61,139,106,0.14)]',
    iconColor: 'text-[var(--color-jade-500)]',
    label: 'Éxito',
  },
  cinnabar: {
    borderClass: 'border-l-[var(--color-cinnabar-500)]',
    barClass: 'bg-[var(--color-cinnabar-500)]',
    iconBg: 'bg-[rgba(196,72,72,0.14)]',
    iconColor: 'text-[var(--color-cinnabar-500)]',
    label: 'Error',
  },
  gold: {
    borderClass: 'border-l-[var(--color-gold-500)]',
    barClass: 'bg-[var(--color-gold-500)]',
    iconBg: 'bg-[rgba(201,169,97,0.14)]',
    iconColor: 'text-[var(--color-gold-500)]',
    label: 'Atención',
  },
  ink: {
    borderClass: 'border-l-[var(--color-ink-700)]',
    barClass: 'bg-[var(--color-ink-600)]',
    iconBg: 'bg-[rgba(232,230,224,0.08)]',
    iconColor: 'text-[var(--color-ink-800)]',
    label: 'Información',
  },
};

const ICONS: Record<ToastType['tone'], React.ReactNode> = {
  jade: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M3 8.4l2.6 2.6L13 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  cinnabar: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  gold: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M8 2.4l5.4 9.6H2.6L8 2.4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8 6.4v2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="10.6" r="0.7" fill="currentColor" />
    </svg>
  ),
  ink: (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle
        cx="8"
        cy="8"
        r="6.4"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M8 7v3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="4.6" r="0.75" fill="currentColor" />
    </svg>
  ),
};

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const styles = TONE_STYLES[toast.tone];

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={styles.label}
      className={cn(
        'relative surface border border-[rgba(232,230,224,0.10)] border-l-[3px] overflow-hidden',
        'animate-toast-in pointer-events-auto',
        styles.borderClass,
      )}
    >
      <div className="p-4 flex items-start gap-3">
        <div
          className={cn(
            'h-7 w-7 shrink-0 flex items-center justify-center',
            styles.iconBg,
            styles.iconColor,
          )}
        >
          {ICONS[toast.tone]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1 uppercase tracking-[0.18em]">
            § {styles.label}
          </p>
          <p className="display text-[0.95rem] text-[var(--color-ink-900)] leading-snug">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-xs text-[var(--color-ink-700)] mt-1.5 leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Cerrar notificación"
          className="shrink-0 text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] transition-colors p-0.5 -mt-0.5 -mr-0.5"
        >
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
            <path
              d="M3 3l6 6M9 3l-6 6"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {toast.duration > 0 && (
        <div
          className={cn(
            'absolute bottom-0 left-0 h-[2px] origin-left',
            styles.barClass,
          )}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
            width: '100%',
          }}
        />
      )}
    </div>
  );
}
