import { cn } from '@/utils/helpers';

interface StockSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /**
   * Color base del trazo. Default: gold.
   */
  color?: 'gold' | 'jade' | 'ink';
  className?: string;
}

/**
 * Mini gráfico SVG inline. No usa dependencias externas.
 * Normaliza los datos al rango [0, 1] y dibuja una línea poligonal.
 * El color del trazo y del área se hereda de `currentColor`, así que
 * respeta el tema activo sin valores hardcoded.
 */
export function StockSparkline({
  data,
  width = 220,
  height = 56,
  color = 'gold',
  className,
}: StockSparklineProps) {
  const colorClass = {
    gold: 'text-[var(--color-gold-500)]',
    jade: 'text-[var(--color-jade-500)]',
    ink: 'text-[var(--color-ink-700)]',
  } as const;

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'grid place-items-center border border-dashed border-[var(--color-border-hairline)]',
          className,
        )}
        style={{ width, height }}
      >
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          Sin datos
        </p>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padX = 4;
  const padY = 6;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = data.map((v, i) => {
    const x = padX + (i / Math.max(1, data.length - 1)) * innerW;
    const y = padY + (1 - (v - min) / range) * innerH;
    return { x, y };
  });

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const areaPath =
    `M ${points[0].x.toFixed(2)} ${(height - padY).toFixed(2)} ` +
    points
      .map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ') +
    ` L ${points[points.length - 1].x.toFixed(2)} ${(height - padY).toFixed(2)} Z`;

  const trend = data.length > 1 ? data[data.length - 1] - data[0] : 0;
  const trendUp = trend > 0;
  const trendDown = trend < 0;

  return (
    <div className={cn('inline-flex flex-col gap-1.5', colorClass[color], className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
      >
        <path d={areaPath} fill="currentColor" fillOpacity="0.14" />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="2.5"
            fill="currentColor"
          />
        )}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill="currentColor"
            opacity="0.25"
          />
        )}
      </svg>
      <div className="flex items-center justify-between mark text-[0.5rem] text-[var(--color-ink-600)]">
        <span>
          mín {min} · máx {max}
        </span>
        {trend !== 0 && (
          <span
            className={cn(
              'num',
              trendUp && 'text-[var(--color-jade-500)]',
              trendDown && 'text-[var(--color-cinnabar-500)]',
            )}
          >
            {trendUp ? '↑' : '↓'} {Math.abs(trend)}
          </span>
        )}
      </div>
    </div>
  );
}
