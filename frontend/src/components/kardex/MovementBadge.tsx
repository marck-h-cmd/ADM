import { cn } from '@/utils/helpers';
import type { KardexItem } from '@/types/kardex.types';

export function MovementBadge({ tipo }: { tipo: KardexItem['tipomov'] }) {
  const isIngreso = tipo === 'INGRESO';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2',
        isIngreso
          ? 'text-[var(--color-jade-500)]'
          : 'text-[var(--color-cinnabar-500)]',
      )}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        className="shrink-0"
      >
        {isIngreso ? (
          <path
            d="M5 1.5 L5 8.5 M1.5 5 L5 1.5 L8.5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M5 8.5 L5 1.5 M1.5 5 L5 8.5 L8.5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <span className="mark text-[0.55rem] tracking-[0.14em]">
        {isIngreso ? 'Ingreso' : 'Salida'}
      </span>
    </span>
  );
}

export function MovementCantidad({
  tipo,
  cantidad,
  size = 'md',
}: {
  tipo: KardexItem['tipomov'];
  cantidad: number;
  size?: 'sm' | 'md';
}) {
  const isIngreso = tipo === 'INGRESO';
  return (
    <span
      className={cn(
        'num tracking-tight',
        size === 'sm' ? 'text-sm' : 'text-base',
        isIngreso
          ? 'text-[var(--color-jade-500)]'
          : 'text-[var(--color-cinnabar-500)]',
      )}
    >
      <span className="mr-0.5">{isIngreso ? '+' : '−'}</span>
      {cantidad}
    </span>
  );
}
