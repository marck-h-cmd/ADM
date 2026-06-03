import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { cn } from '@/utils/helpers';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  mark?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Modal({ open, onClose, title, mark, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-10 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(5,5,7,0.78)] backdrop-blur-sm"
      />
      <div
        className={cn(
          'relative w-full surface reveal mt-12',
          sizes[size],
        )}
      >
        {(title || mark) && (
          <header className="flex items-baseline justify-between gap-4 px-7 pt-6 pb-4 hairline-b">
            <div className="flex items-baseline gap-3">
              {mark && <span className="mark">{mark}</span>}
              {title && (
                <h2 className="display text-2xl text-[var(--color-ink-900)]">
                  {title}
                </h2>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="text-[var(--color-ink-600)] hover:text-[var(--color-gold-500)] transition text-lg leading-none"
            >
              ✕
            </button>
          </header>
        )}
        <div className="px-7 py-6">{children}</div>
        {footer && (
          <footer className="px-7 py-5 hairline-t bg-[rgba(232,230,224,0.02)]">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
