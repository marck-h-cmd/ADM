import { cn } from '@/utils/helpers';
import { fmt } from '@/utils/formatters';

interface RankingBarProps {
  label: string;
  value: number;
  max: number;
  rank?: number;
  /**
   * Formato del valor. Default: money.
   */
  format?: 'money' | 'number' | 'percent';
  /**
   * Sufijo o sub-label (ej. "ticket promedio", "12 ventas").
   */
  hint?: string;
}

/**
 * Barra horizontal para visualizaciones de ranking.
 * El color depende del rank: gold para el #1, jade para top 3, ink para el resto.
 */
export function RankingBar({
  label,
  value,
  max,
  rank,
  format = 'money',
  hint,
}: RankingBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const tone =
    rank === 1
      ? 'bg-[var(--color-gold-500)]'
      : rank !== undefined && rank <= 3
        ? 'bg-[var(--color-jade-500)]'
        : 'bg-[var(--color-ink-700)]';

  const formatted =
    format === 'money'
      ? fmt.money(value)
      : format === 'percent'
        ? fmt.percent(value)
        : fmt.number(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          {rank !== undefined && (
            <span
              className={cn(
                'num text-[0.65rem] w-5 shrink-0',
                rank === 1
                  ? 'text-[var(--color-gold-500)]'
                  : 'text-[var(--color-ink-600)]',
              )}
            >
              {String(rank).padStart(2, '0')}
            </span>
          )}
          <p className="text-sm text-[var(--color-ink-900)] truncate">
            {label}
          </p>
          {hint && (
            <span className="mark text-[0.5rem] text-[var(--color-ink-600)] shrink-0">
              · {hint}
            </span>
          )}
        </div>
        <p
          className={cn(
            'num tracking-tight shrink-0',
            rank === 1
              ? 'text-[var(--color-gold-500)]'
              : 'text-[var(--color-ink-900)]',
            format === 'money' ? 'text-base' : 'text-sm',
          )}
        >
          {formatted}
        </p>
      </div>
      <div className="h-1 w-full bg-[rgba(232,230,224,0.08)] relative overflow-hidden">
        <div
          className={cn('h-full transition-all duration-700', tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
