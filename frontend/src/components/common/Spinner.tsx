import { cn } from '@/utils/helpers';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 16, className, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? 'Cargando'}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        style={{ animationDuration: '1.2s' }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span className="mark text-[0.6rem]">{label}</span>
      )}
    </span>
  );
}
