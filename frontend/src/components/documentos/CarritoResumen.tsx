import {
  type DocumentoStore,
  selectSubtotal,
  selectIgv,
  selectTotal,
} from '@/store/documento';
import { CarritoItem } from './CarritoItem';
import { fmt } from '@/utils/formatters';

interface CarritoResumenProps {
  useStore: DocumentoStore;
  /**
   * "total a cobrar" para venta, "total a pagar" para compra.
   */
  totalLabel?: string;
}

export function CarritoResumen({
  useStore,
  totalLabel = 'Total a cobrar',
}: CarritoResumenProps) {
  const items = useStore((s) => s.items);
  const subtotal = selectSubtotal(items);
  const igv = selectIgv(items);
  const total = selectTotal(items);

  return (
    <section className="surface overflow-hidden">
      <header className="flex items-baseline justify-between px-5 py-4 hairline-b">
        <p className="mark text-[0.55rem]">§ III — Carrito</p>
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
            Carrito vacío
          </p>
          <p className="display text-xl text-[var(--color-ink-700)] mt-3">
            Aún no hay productos
          </p>
          <p className="text-sm text-[var(--color-ink-600)] mt-2 max-w-xs mx-auto leading-relaxed">
            Use el buscador superior para añadir SKUs al carrito.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[rgba(232,230,224,0.06)]">
          {items.map((it, i) => (
            <CarritoItem
              key={it.producto}
              item={it}
              index={i}
              useStore={useStore}
            />
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <footer className="px-5 py-5 hairline-t space-y-2.5 bg-[var(--color-ink-100)]/40">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-[var(--color-ink-700)]">Subtotal</span>
            <span className="num text-[var(--color-ink-800)]">
              {fmt.money(subtotal)}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-[var(--color-ink-700)]">IGV (incluido)</span>
            <span className="num text-[var(--color-ink-800)]">
              − {fmt.money(igv)}
            </span>
          </div>
          <div className="rule-gold my-3" />
          <div className="flex items-baseline justify-between">
            <span className="mark text-[0.6rem]">{totalLabel}</span>
            <span className="num text-2xl text-[var(--color-gold-500)] tracking-tight">
              {fmt.money(total)}
            </span>
          </div>
        </footer>
      )}
    </section>
  );
}
