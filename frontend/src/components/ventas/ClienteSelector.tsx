import { useEffect, useRef, useState } from 'react';
import { useVentaStore } from '@/store/ventaStore';
import { useClienteSearch } from '@/hooks/useClientes';
import { Spinner } from '@/components/common/Spinner';
import { TIPO_CLIENTE_LABELS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

export function ClienteSelector() {
  const { cliente, clienteNombre, setCliente } = useVentaStore();
  const { query, setQuery, results, loading } = useClienteSearch();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click-outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function select(id: string, nombre: string) {
    setCliente(id, nombre);
    setQuery('');
    setOpen(false);
    setHighlight(0);
  }

  function clear() {
    setCliente('', '');
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative">
      <header className="flex items-baseline justify-between mb-3">
        <p className="mark text-[0.55rem]">§ I — Cliente</p>
        {cliente && (
          <button
            onClick={clear}
            className="mark text-[0.55rem] text-[var(--color-ink-600)] hover:text-[var(--color-cinnabar-500)] transition"
          >
            cambiar ↻
          </button>
        )}
      </header>

      {cliente ? (
        <div className="surface p-5 reveal">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="display text-2xl text-[var(--color-ink-900)] tracking-tight">
                {clienteNombre}
              </p>
              <p className="mark text-[0.55rem] mt-1.5 text-[var(--color-ink-600)]">
                ID {cliente} · cliente registrado
              </p>
            </div>
            <span className="num text-[var(--color-gold-500)] text-lg tracking-[0.15em]">
              {cliente}
            </span>
          </div>
        </div>
      ) : (
        <>
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
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
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
                  const c = results[highlight];
                  if (c) select(c.Cliente, c.Nombre);
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
              placeholder="Buscar cliente por nombre, ID o RUC…"
              className={cn(
                'w-full bg-[var(--color-ink-100)] text-[var(--color-ink-900)]',
                'border border-[rgba(232,230,224,0.08)] pl-9 pr-3.5 h-12',
                'font-sans text-sm placeholder:text-[var(--color-ink-600)]',
                'transition-colors duration-200',
                'hover:border-[rgba(232,230,224,0.18)]',
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
              className="absolute z-20 left-0 right-0 mt-1 surface max-h-80 overflow-y-auto reveal"
              style={{ animationDuration: '0.2s' }}
            >
              {results.map((c, i) => (
                <li
                  key={c.Cliente}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => select(c.Cliente, c.Nombre)}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors hairline-b last:border-0',
                    i === highlight
                      ? 'bg-[var(--color-ink-300)]'
                      : 'hover:bg-[var(--color-ink-300)]',
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--color-ink-900)] truncate">
                        {c.Nombre}
                      </p>
                      <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
                        {TIPO_CLIENTE_LABELS[c.TipoCliente] ?? c.TipoCliente} ·
                        {c.credito ? ' con crédito' : ' contado'} ·
                        {c.Ruc ? ` RUC ${c.Ruc}` : ' sin RUC'}
                      </p>
                    </div>
                    <span className="num text-[0.7rem] text-[var(--color-gold-500)] tracking-[0.15em] shrink-0">
                      {c.Cliente}
                    </span>
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
              <p className="text-sm text-[var(--color-ink-700)] mt-1.5">
                No hay clientes que coincidan con "{query}"
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
