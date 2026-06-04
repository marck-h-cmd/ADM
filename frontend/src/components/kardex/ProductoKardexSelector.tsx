import { useEffect, useRef, useState } from 'react';
import { useProductoSearch } from '@/hooks/useProductos';
import { productosService } from '@/services/productos.service';
import { Spinner } from '@/components/common/Spinner';
import { cn } from '@/utils/helpers';
import type { Producto } from '@/types/producto.types';

interface ProductoKardexSelectorProps {
  onSelect: (p: Producto | null) => void;
}

function StockDot({ stock }: { stock: number }) {
  const tone =
    stock <= 0
      ? 'bg-[var(--color-cinnabar-500)]'
      : stock < 5
        ? 'bg-[var(--color-gold-500)]'
        : 'bg-[var(--color-jade-500)]';
  return <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', tone)} />;
}

export function ProductoKardexSelector({
  onSelect,
}: ProductoKardexSelectorProps) {
  const { query, setQuery, results, loading } = useProductoSearch();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [selected, setSelected] = useState<Producto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
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

  // Cuando se selecciona por click, carga el detalle (porque search omite campos)
  async function select(p: Producto) {
    setOpen(false);
    setHighlight(0);
    setQuery('');
    setLoadingDetail(true);
    try {
      const full = await productosService.getById(p.Producto);
      setSelected(full);
      onSelect(full);
    } catch {
      // fallback: usar lo que tenemos
      setSelected(p);
      onSelect(p);
    } finally {
      setLoadingDetail(false);
    }
  }

  function clear() {
    setSelected(null);
    onSelect(null);
  }

  // Si el padre cambia selectedId externamente, no sincronizamos (single source of truth via callback)

  if (selected) {
    return (
      <div className="surface p-6 reveal">
        <header className="flex items-baseline justify-between mb-4">
          <p className="mark text-[0.55rem]">§ Producto en observación</p>
          <button
            type="button"
            onClick={clear}
            className="mark text-[0.55rem] text-[var(--color-ink-600)] hover:text-[var(--color-cinnabar-500)] transition"
          >
            Cambiar ↻
          </button>
        </header>

        <div className="flex items-baseline gap-4 flex-wrap">
          <p className="num text-[var(--color-gold-500)] text-2xl tracking-[0.15em]">
            {selected.Producto}
          </p>
          <div className="flex items-baseline gap-2 flex-1 min-w-0">
            <p className="text-xl text-[var(--color-ink-900)] truncate">
              {selected.Descripcion}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-4">
          <div className="bg-[var(--color-ink-100)] p-4 space-y-1">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Stock actual
            </p>
            <div className="flex items-baseline gap-2">
              <p className="num text-2xl text-[var(--color-ink-900)]">
                {selected.StockAc}
              </p>
              <span className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                {selected.UniMed}
              </span>
            </div>
          </div>
          <div className="bg-[var(--color-ink-100)] p-4 space-y-1">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Stock mín.
            </p>
            <p className="num text-2xl text-[var(--color-ink-800)]">
              {selected.StockMin}
            </p>
          </div>
          <div className="bg-[var(--color-ink-100)] p-4 space-y-1">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Stock máx.
            </p>
            <p className="num text-2xl text-[var(--color-ink-800)]">
              {selected.StockMax}
            </p>
          </div>
          <div className="bg-[var(--color-ink-100)] p-4 space-y-1">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Marca
            </p>
            <p className="num text-lg text-[var(--color-ink-900)]">
              {selected.MarcaDesc ?? selected.Marca}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative surface p-6">
      <header className="flex items-baseline justify-between mb-4">
        <p className="mark text-[0.55rem]">§ Seleccione un producto</p>
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          ↑↓ navegar · ↵ abrir
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
              if (p) void select(p);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Buscar por SKU o descripción…"
          className={cn(
            'w-full bg-[var(--color-ink-200)] text-[var(--color-ink-900)]',
            'border border-[var(--color-border-hairline)] pl-9 pr-3.5 h-12',
            'font-sans text-sm placeholder:text-[var(--color-ink-600)]',
            'transition-colors duration-200',
            'hover:border-[var(--color-border-hairline-strong)]',
            'focus:outline-none focus:border-[var(--color-gold-500)]',
          )}
        />
        {(loading || loadingDetail) && (
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
          {results.map((p, i) => (
            <li
              key={p.Producto}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => void select(p)}
              className={cn(
                'px-4 py-3 hairline-b last:border-0 cursor-pointer transition-colors',
                i === highlight
                  ? 'bg-[var(--color-ink-300)]'
                  : 'hover:bg-[var(--color-ink-300)]',
              )}
            >
              <div className="flex items-center gap-3">
                <StockDot stock={p.StockAc} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--color-ink-900)] truncate">
                    {p.Descripcion}
                  </p>
                  <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
                    {p.MarcaDesc ?? p.Marca} · stock {p.StockAc} {p.UniMed}
                  </p>
                </div>
                <p className="num text-[0.6rem] text-[var(--color-gold-500)] tracking-[0.15em] shrink-0">
                  {p.Producto}
                </p>
              </div>
            </li>
          ))}
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
