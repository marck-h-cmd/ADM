import { cn } from '@/utils/helpers';

interface StockBadgeProps {
  actual: number;
  minimo: number;
  showValue?: boolean;
  className?: string;
}

type Nivel = 'agotado' | 'critico' | 'bajo' | 'saludable' | 'exceso';

function nivel(actual: number, minimo: number): Nivel {
  if (actual <= 0) return 'agotado';
  if (actual < minimo) return 'critico';
  if (actual < minimo * 2) return 'bajo';
  if (actual < minimo * 5) return 'saludable';
  return 'exceso';
}

const styles: Record<Nivel, { dot: string; text: string; label: string }> = {
  agotado: {
    dot: 'bg-[var(--color-cinnabar-500)]',
    text: 'text-[var(--color-cinnabar-500)]',
    label: 'Agotado',
  },
  critico: {
    dot: 'bg-[var(--color-cinnabar-500)] pulse-soft',
    text: 'text-[var(--color-cinnabar-500)]',
    label: 'Crítico',
  },
  bajo: {
    dot: 'bg-[var(--color-gold-500)]',
    text: 'text-[var(--color-gold-500)]',
    label: 'Bajo',
  },
  saludable: {
    dot: 'bg-[var(--color-jade-500)]',
    text: 'text-[var(--color-jade-500)]',
    label: 'Saludable',
  },
  exceso: {
    dot: 'bg-[var(--color-ink-600)]',
    text: 'text-[var(--color-ink-700)]',
    label: 'Exceso',
  },
};

export function StockBadge({ actual, minimo, showValue = true, className }: StockBadgeProps) {
  const n = nivel(actual, minimo);
  const s = styles[n];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {showValue && (
        <span className="num text-sm tabular-nums text-[var(--color-ink-900)]">
          {actual}
        </span>
      )}
      <span className={cn('mark text-[0.55rem]', s.text)}>{s.label}</span>
    </span>
  );
}
