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
 * Muestra el área rellenada con un gradiente.
 */
export function StockSparkline({
  data,
  width = 220,
  height = 56,
  color = 'gold',
  className,
}: StockSparklineProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          'grid place-items-center border border-dashed border-[rgba(232,230,224,0.08)]',
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

  const colors = {
    gold: { stroke: '#c9a961', fill: 'rgba(201,169,97,0.12)' },
    jade: { stroke: '#3d8b6a', fill: 'rgba(61,139,106,0.12)' },
    ink: { stroke: '#9c9a93', fill: 'rgba(232,230,224,0.06)' },
  } as const;

  const c = colors[color];
  const trend = data.length > 1 ? data[data.length - 1] - data[0] : 0;
  const trendUp = trend > 0;
  const trendDown = trend < 0;

  return (
    <div className={cn('inline-flex flex-col gap-1.5', className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
      >
        <defs>
          <linearGradient
            id={`spark-fill-${color}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={c.fill} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#spark-fill-${color})`} />
        <path
          d={path}
          fill="none"
          stroke={c.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="2.5"
            fill={c.stroke}
          />
        )}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill={c.stroke}
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
