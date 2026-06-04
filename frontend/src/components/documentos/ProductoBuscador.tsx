import { useEffect, useRef, useState } from 'react';
import { useProductoSearch } from '@/hooks/useProductos';
import { Spinner } from '@/components/common/Spinner';
import { fmt } from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import type { DocumentoStore } from '@/store/documento';
import type { Producto } from '@/types/producto.types';

interface ProductoBuscadorProps {
  useStore: DocumentoStore;
  /**
   * Si true, los productos sin stock se deshabilitan (caso venta).
   * En compras siempre se permite agregar.
   */
  validarStock?: boolean;
  /**
   * Si true, al agregar el producto se usa `PrecCosto` en lugar de `PrecVenta`.
   * Útil para el flujo de compras donde el precio es el costo.
   */
  precioCompra?: boolean;
}

export function ProductoBuscador({
  useStore,
  validarStock = true,
  precioCompra = false,
}: ProductoBuscadorProps) {
  const { query, setQuery, results, loading } = useProductoSearch();
  const addItem = useStore((s) => s.addItem);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function add(p: Producto) {
    if (validarStock && p.StockAc <= 0) return;
    addItem(
      {
        producto: p.Producto,
        descripcion: p.Descripcion,
        marca: p.MarcaDesc ?? p.Marca,
        precio: precioCompra ? (p.PrecCosto ?? p.PrecVenta) : p.PrecVenta,
        stockDisponible: p.StockAc,
        conIgv: p.ConIgv,
      },
      1,
    );
    setQuery('');
    setOpen(false);
    setHighlight(0);
  }

  return (
    <div ref={containerRef} className="relative">
      <header className="flex items-baseline justify-between mb-3">
        <p className="mark text-[0.55rem]">§ II — Agregar productos</p>
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          ↑↓ navegar · ↵ agregar · esc cerrar
        </p>
      </header>

      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-600)] pointer-events-none"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="1" />
          <path d="M9 3v18M3 9h18" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || results.length === 0) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const p = results[highlight];
              if (p) add(p);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Buscar por SKU o descripción…"
          className={cn(
            'w-full bg-[var(--color-ink-100)] text-[var(--color-ink-900)]',
            'border border-[var(--color-border-hairline)] pl-9 pr-3.5 h-12',
            'font-sans text-sm placeholder:text-[var(--color-ink-600)]',
            'transition-colors duration-200',
            'hover:border-[var(--color-border-hairline-strong)]',
            'focus:outline-none focus:border-[var(--color-gold-500)]',
            'focus:bg-[var(--color-ink-200)]',
          )}
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <Spinner />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          className="absolute z-20 left-0 right-0 mt-1 surface max-h-96 overflow-y-auto reveal"
          style={{ animationDuration: '0.2s' }}
        >
          {results.map((p, i) => {
            const sinStock = validarStock && p.StockAc <= 0;
            return (
              <li
                key={p.Producto}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => !sinStock && add(p)}
                className={cn(
                  'px-4 py-3 hairline-b last:border-0 transition-colors',
                  sinStock
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer',
                  !sinStock && i === highlight
                    ? 'bg-[var(--color-ink-300)]'
                    : !sinStock && 'hover:bg-[var(--color-ink-300)]',
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--color-ink-900)] truncate">
                      {p.Descripcion}
                    </p>
                    <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
                      {p.MarcaDesc ?? p.Marca} · stock {p.StockAc} {p.UniMed}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="num text-sm text-[var(--color-ink-900)]">
                      {fmt.money(p.PrecVenta)}
                    </p>
                    <p className="num text-[0.6rem] text-[var(--color-gold-500)] tracking-[0.15em] mt-0.5">
                      {p.Producto}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-20 left-0 right-0 mt-1 surface p-6 text-center">
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
            Sin resultados
          </p>
        </div>
      )}
    </div>
  );
}
