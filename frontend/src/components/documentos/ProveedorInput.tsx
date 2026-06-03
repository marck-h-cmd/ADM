import { useEffect, useState, useRef } from 'react';
import { comprasService } from '@/services/compras.service';
import { cn } from '@/utils/helpers';
import { required } from '@/utils/validators';
import { useCompraStore } from '@/store/compraStore';

interface ProveedorSugerido {
  id: string;
  nombre: string;
}

export function ProveedorInput() {
  const proveedor = useCompraStore((s) => s.proveedor);
  const proveedorNombre = useCompraStore((s) => s.proveedorNombre);
  const setProveedor = useCompraStore((s) => s.setProveedor);
  const [sugerencias, setSugerencias] = useState<ProveedorSugerido[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carga inicial de proveedores frecuentes (extraídos del historial)
  useEffect(() => {
    let cancelled = false;
    comprasService
      .getAll(1, 50)
      .then((res) => {
        if (cancelled) return;
        const map = new Map<string, ProveedorSugerido>();
        for (const c of res.data) {
          if (c.Proveedor && c.ProveedorNombre) {
            if (!map.has(c.Proveedor)) {
              map.set(c.Proveedor, { id: c.Proveedor, nombre: c.ProveedorNombre });
            }
          }
        }
        setSugerencias(Array.from(map.values()));
      })
      .catch(() => {
        if (!cancelled) setSugerencias([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = proveedorNombre
    ? sugerencias.filter(
        (s) =>
          s.nombre.toLowerCase().includes(proveedorNombre.toLowerCase()) ||
          s.id.toLowerCase().includes(proveedorNombre.toLowerCase()),
      )
    : sugerencias;

  function select(s: ProveedorSugerido) {
    setProveedor(s.id, s.nombre);
    setOpen(false);
    setHighlight(0);
  }

  const hasError = proveedor !== null && !required(proveedor);

  return (
    <div ref={containerRef} className="relative">
      <header className="flex items-baseline justify-between mb-3">
        <p className="mark text-[0.55rem]">§ I — Proveedor</p>
        {proveedor && (
          <p className="mark text-[0.5rem] text-[var(--color-jade-500)]">
            ✓ {proveedorNombre}
          </p>
        )}
      </header>

      <div className="grid gap-3 md:grid-cols-[140px_1fr]">
        <div>
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
            Código
          </p>
          <input
            value={proveedor ?? ''}
            onChange={(e) => setProveedor(e.target.value.toUpperCase(), proveedorNombre ?? '')}
            onFocus={() => setOpen(true)}
            placeholder="PR01"
            maxLength={6}
            className={cn(
              'w-full bg-[var(--color-ink-100)] text-[var(--color-ink-900)]',
              'border border-[rgba(232,230,224,0.08)] px-3.5 h-10',
              'font-sans num uppercase tracking-wider text-sm',
              'placeholder:text-[var(--color-ink-600)]',
              'transition-colors duration-200',
              'hover:border-[rgba(232,230,224,0.18)]',
              'focus:outline-none focus:border-[var(--color-gold-500)]',
              'focus:bg-[var(--color-ink-200)]',
            )}
          />
        </div>
        <div>
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
            Razón social
          </p>
          <input
            value={proveedorNombre ?? ''}
            onChange={(e) => setProveedor(proveedor ?? '', e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Nombre del proveedor"
            maxLength={120}
            className={cn(
              'w-full bg-[var(--color-ink-100)] text-[var(--color-ink-900)]',
              'border border-[rgba(232,230,224,0.08)] px-3.5 h-10',
              'font-sans text-sm placeholder:text-[var(--color-ink-600)]',
              'transition-colors duration-200',
              'hover:border-[rgba(232,230,224,0.18)]',
              'focus:outline-none focus:border-[var(--color-gold-500)]',
              'focus:bg-[var(--color-ink-200)]',
            )}
          />
        </div>
      </div>

      {hasError && (
        <p className="text-[0.7rem] text-[var(--color-cinnabar-500)] mt-1.5">
          Código de proveedor requerido
        </p>
      )}

      {open && filtered.length > 0 && (
        <ul
          className="absolute z-20 left-0 right-0 mt-1 surface max-h-80 overflow-y-auto reveal"
          style={{ animationDuration: '0.2s' }}
        >
          <li className="px-4 py-2 hairline-b">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Proveedores recientes ({filtered.length})
            </p>
          </li>
          {filtered.map((s, i) => {
            const active = i === highlight;
            return (
              <li
                key={s.id}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => select(s)}
                className={cn(
                  'px-4 py-2.5 hairline-b last:border-0 cursor-pointer transition-colors',
                  active
                    ? 'bg-[var(--color-ink-300)]'
                    : 'hover:bg-[var(--color-ink-300)]',
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm text-[var(--color-ink-900)] truncate">
                    {s.nombre}
                  </p>
                  <p className="num text-[0.6rem] text-[var(--color-gold-500)] tracking-[0.15em] shrink-0">
                    {s.id}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {open && filtered.length === 0 && sugerencias.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 surface p-4 text-center">
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
            Sin coincidencias — ingrese manualmente
          </p>
        </div>
      )}
    </div>
  );
}
