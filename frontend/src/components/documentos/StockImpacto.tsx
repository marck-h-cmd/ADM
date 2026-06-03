import type { DocumentoStore } from '@/store/documento';
import { cn } from '@/utils/helpers';

interface StockImpactoProps {
  useStore: DocumentoStore;
}

/**
 * Para Compras: muestra cuánto se sumará al stock por producto.
 * Pieza informativa que reemplaza la "forma de pago" (que no aplica a compras).
 */
export function StockImpacto({ useStore }: StockImpactoProps) {
  const items = useStore((s) => s.items);

  if (items.length === 0) {
    return (
      <div className="surface p-4 space-y-1.5 bg-[rgba(61,139,106,0.04)] border-[var(--color-jade-500)]/20">
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          Impacto en stock
        </p>
        <p className="mark text-[0.5rem] text-[var(--color-ink-700)]">
          Vacío — agregue productos para previsualizar.
        </p>
      </div>
    );
  }

  const totalUnidades = items.reduce((acc, it) => acc + it.cantidad, 0);
  const skus = items.length;

  return (
    <div className="surface p-4 space-y-3 bg-[rgba(61,139,106,0.04)] border-[var(--color-jade-500)]/20">
      <header className="flex items-baseline justify-between">
        <p className="mark text-[0.55rem] text-[var(--color-jade-500)]">
          § Impacto en stock
        </p>
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          {skus} {skus === 1 ? 'SKU' : 'SKUs'}
        </p>
      </header>

      <ul className="space-y-1.5">
        {items.map((it) => (
          <li
            key={it.producto}
            className="flex items-baseline justify-between text-sm"
          >
            <span className="truncate text-[var(--color-ink-800)] mr-3">
              {it.descripcion}
            </span>
            <span
              className={cn(
                'num text-[var(--color-jade-500)] shrink-0',
                'before:content-["+"] before:mr-0.5',
              )}
            >
              {it.cantidad}
            </span>
          </li>
        ))}
      </ul>

      <footer className="pt-2 hairline-t flex items-baseline justify-between">
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          Total unidades
        </p>
        <p className="num text-base text-[var(--color-jade-500)] tracking-tight">
          +{totalUnidades}
        </p>
      </footer>
    </div>
  );
}
