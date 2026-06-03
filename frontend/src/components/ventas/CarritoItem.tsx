import { useVentaStore, type CartItem } from '@/store/ventaStore';
import { fmt } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

interface CarritoItemProps {
  item: CartItem;
  index: number;
}

export function CarritoItem({ item, index }: CarritoItemProps) {
  const updateCantidad = useVentaStore((s) => s.updateCantidad);
  const removeItem = useVentaStore((s) => s.removeItem);
  const subtotal = item.cantidad * item.precio;
  const sinStock = item.cantidad >= item.stockDisponible;

  return (
    <li
      className="hairline-b last:border-0 py-5 px-5 flex items-center gap-5 group reveal"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span className="num text-[0.65rem] text-[var(--color-ink-600)] w-6 shrink-0">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-ink-900)] truncate">
          {item.descripcion}
        </p>
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
          {item.marca} ·
          <span className="num ml-1.5 text-[var(--color-gold-500)] tracking-[0.12em]">
            {item.producto}
          </span>
        </p>
      </div>

      <div className="flex items-center hairline shrink-0">
        <button
          onClick={() => updateCantidad(item.producto, item.cantidad - 1)}
          disabled={item.cantidad <= 1}
          className="h-9 w-9 grid place-items-center text-[var(--color-ink-700)] hover:text-[var(--color-gold-500)] disabled:opacity-30 transition"
          aria-label="Disminuir"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={item.stockDisponible}
          value={item.cantidad}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!Number.isNaN(n)) updateCantidad(item.producto, n);
          }}
          className={cn(
            'w-12 h-9 text-center num text-sm bg-transparent',
            'border-x border-[rgba(232,230,224,0.08)]',
            'focus:outline-none focus:bg-[var(--color-ink-300)]',
          )}
        />
        <button
          onClick={() => updateCantidad(item.producto, item.cantidad + 1)}
          disabled={sinStock}
          className="h-9 w-9 grid place-items-center text-[var(--color-ink-700)] hover:text-[var(--color-gold-500)] disabled:opacity-30 transition"
          aria-label="Aumentar"
        >
          +
        </button>
      </div>

      <div className="text-right shrink-0 w-32">
        <p className="num text-sm text-[var(--color-ink-900)]">
          {fmt.money(subtotal)}
        </p>
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
          {fmt.money(item.precio)} c/u
        </p>
      </div>

      <button
        onClick={() => removeItem(item.producto)}
        className="h-9 w-9 grid place-items-center text-[var(--color-ink-600)] hover:text-[var(--color-cinnabar-500)] transition shrink-0"
        aria-label="Quitar del carrito"
        title="Quitar"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 6l12 12M6 18 18 6" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}
