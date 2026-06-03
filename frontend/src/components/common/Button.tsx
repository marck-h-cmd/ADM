import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/helpers';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const base =
  'relative inline-flex items-center justify-center gap-2 font-sans font-medium ' +
  'uppercase tracking-[0.12em] text-[0.7rem] select-none transition-all duration-200 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none ' +
  'focus-visible:ring-1 focus-visible:ring-[var(--color-gold-500)] ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ink-50)]';

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-5',
  lg: 'h-12 px-7 text-[0.75rem]',
};

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--color-gold-500)] text-[var(--color-ink-50)] hover:bg-[var(--color-gold-400)] ' +
    'active:bg-[var(--color-gold-600)]',
  secondary:
    'bg-transparent text-[var(--color-ink-900)] hairline hover:border-[var(--color-gold-500)] ' +
    'hover:text-[var(--color-gold-500)]',
  ghost:
    'bg-transparent text-[var(--color-ink-800)] hover:text-[var(--color-gold-500)]',
  danger:
    'bg-transparent text-[var(--color-cinnabar-500)] hairline ' +
    'hover:bg-[var(--color-cinnabar-500)] hover:text-[var(--color-ink-50)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {loading ? (
        <span className="num text-[var(--color-gold-500)]/80">···</span>
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
}
