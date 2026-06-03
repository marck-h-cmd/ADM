import { useState } from 'react';
import { useKardexProducto, type FiltrosKardex, type TipoMovFilter } from '@/hooks/useKardex';
import { ProductoKardexSelector } from '@/components/kardex/ProductoKardexSelector';
import { MovementBadge, MovementCantidad } from '@/components/kardex/MovementBadge';
import { StockSparkline } from '@/components/kardex/StockSparkline';
import { Table, type Column } from '@/components/common/Table';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { fmt } from '@/utils/formatters';
import { cn, isoDate } from '@/utils/helpers';
import type { KardexItem } from '@/types/kardex.types';
import type { Producto } from '@/types/producto.types';

const TIPOS: Array<{ key: TipoMovFilter; label: string }> = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'INGRESO', label: 'Ingresos' },
  { key: 'SALIDA', label: 'Salidas' },
];

function TipoFilterButtons({
  value,
  onChange,
}: {
  value: TipoMovFilter;
  onChange: (v: TipoMovFilter) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="mark text-[0.5rem] text-[var(--color-ink-600)] mr-1">
        Tipo
      </span>
      {TIPOS.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              'mark text-[0.55rem] px-3 py-1.5 hairline transition-all',
              active
                ? 'bg-[var(--color-ink-900)] text-[var(--color-ink-50)] border-[var(--color-ink-900)]'
                : 'text-[var(--color-ink-700)] hover:border-[var(--color-ink-700)]',
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Kardex() {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [filtros, setFiltros] = useState<FiltrosKardex>({
    fechaInicio: '',
    fechaFin: '',
    tipo: 'TODOS',
  });

  const { movimientos, loading, error, stats } = useKardexProducto(
    producto?.Producto ?? null,
  );

  function clearFiltros() {
    setFiltros({ fechaInicio: '', fechaFin: '', tipo: 'TODOS' });
  }

  const hayFiltros =
    !!filtros.fechaInicio || !!filtros.fechaFin || filtros.tipo !== 'TODOS';

  // Datos para sparkline (secuencia de stock en orden cronológico)
  const sparklineData = movimientos.map((m) => m.stock);

  const columns: Column<KardexItem>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      width: '170px',
      render: (m) => (
        <div>
          <p className="num text-sm text-[var(--color-ink-900)]">
            {fmt.date(m.fecha)}
          </p>
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
            {new Date(m.fecha).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'doc',
      header: 'Documento',
      width: '140px',
      render: (m) => (
        <span className="num text-sm text-[var(--color-gold-500)] tracking-[0.1em]">
          {m.documento}
        </span>
      ),
    },
    {
      key: 'tipo',
      header: 'Movimiento',
      width: '150px',
      render: (m) => <MovementBadge tipo={m.tipomov} />,
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      align: 'right',
      width: '120px',
      render: (m) => <MovementCantidad tipo={m.tipomov} cantidad={m.cantidad} />,
    },
    {
      key: 'stock',
      header: 'Stock resultante',
      align: 'right',
      width: '160px',
      render: (m) => (
        <p className="num text-base text-[var(--color-ink-900)]">{m.stock}</p>
      ),
    },
    {
      key: 'ref',
      header: 'Referencia',
      render: (m) => (
        <div className="space-y-0.5">
          {m.proveedor && (
            <p className="mark text-[0.5rem] text-[var(--color-ink-700)]">
              <span className="text-[var(--color-ink-600)]">Proveedor ·</span>{' '}
              {m.proveedor}
            </p>
          )}
          {m.personal && (
            <p className="mark text-[0.5rem] text-[var(--color-ink-700)]">
              <span className="text-[var(--color-ink-600)]">Personal ·</span>{' '}
              {m.personal}
            </p>
          )}
          {m.documento_ref && (
            <p className="mark text-[0.5rem] text-[var(--color-ink-700)]">
              <span className="text-[var(--color-ink-600)]">Ref ·</span>{' '}
              {m.documento_ref}
            </p>
          )}
          {!m.proveedor && !m.personal && !m.documento_ref && (
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">—</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="mark text-[0.55rem]">§ 08 — Movimientos</p>
        <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
          Kardex
        </h2>
        <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
          Trazabilidad cronológica de cada SKU. Ingresos y salidas, stock
          resultante y referencias al documento que originó el movimiento.
        </p>
      </header>

      <div className="reveal" style={{ animationDelay: '60ms' }}>
        <ProductoKardexSelector onSelect={setProducto} />
      </div>

      {producto && (
        <>
          <section
            className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-4 reveal"
            style={{ animationDelay: '120ms' }}
          >
            <div className="surface p-6">
              <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
                Stock actual
              </p>
              <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
                {stats.stockActual}
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
                {producto.UniMed}
              </p>
            </div>
            <div className="surface p-6">
              <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
                Ingresos del período
              </p>
              <p className="num text-3xl text-[var(--color-jade-500)] mt-1.5">
                +{stats.totalIngresos}
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
                unidades sumadas
              </p>
            </div>
            <div className="surface p-6">
              <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
                Salidas del período
              </p>
              <p className="num text-3xl text-[var(--color-cinnabar-500)] mt-1.5">
                −{stats.totalSalidas}
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
                unidades retiradas
              </p>
            </div>
            <div className="surface p-6">
              <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
                Variación neta
              </p>
              <p
                className={cn(
                  'num text-3xl mt-1.5 tracking-tight',
                  stats.variacion > 0
                    ? 'text-[var(--color-jade-500)]'
                    : stats.variacion < 0
                      ? 'text-[var(--color-cinnabar-500)]'
                      : 'text-[var(--color-ink-900)]',
                )}
              >
                {stats.variacion > 0 ? '+' : ''}
                {stats.variacion}
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
                {movimientos.length} movimientos
              </p>
            </div>
          </section>

          {movimientos.length > 0 && (
            <section
              className="surface p-6 reveal flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
              style={{ animationDelay: '160ms' }}
            >
              <div>
                <header className="flex items-baseline gap-3 mb-2">
                  <p className="mark text-[0.55rem]">§ Evolución del stock</p>
                  <span className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                    {sparklineData.length} puntos
                  </span>
                </header>
                <p className="text-sm text-[var(--color-ink-700)] max-w-md">
                  Línea temporal del stock resultante tras cada movimiento.
                </p>
              </div>
              <StockSparkline
                data={sparklineData}
                width={280}
                height={72}
                color={
                  stats.variacion > 0
                    ? 'jade'
                    : stats.variacion < 0
                      ? 'ink'
                      : 'gold'
                }
              />
            </section>
          )}

          <section
            className="surface p-6 space-y-5 reveal"
            style={{ animationDelay: '200ms' }}
          >
            <div className="grid gap-5 md:grid-cols-[1fr_1fr_auto]">
              <div>
                <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
                  § Desde
                </p>
                <Input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) =>
                    setFiltros((f) => ({ ...f, fechaInicio: e.target.value }))
                  }
                  className="num"
                />
              </div>
              <div>
                <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
                  § Hasta
                </p>
                <Input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) =>
                    setFiltros((f) => ({ ...f, fechaFin: e.target.value }))
                  }
                  className="num"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFiltros((f) => ({
                      ...f,
                      fechaInicio: isoDate(new Date(Date.now() - 30 * 86400000)),
                      fechaFin: isoDate(),
                    }));
                  }}
                >
                  Últimos 30d
                </Button>
              </div>
            </div>

            <div className="hairline-t pt-5 flex items-center justify-between flex-wrap gap-3">
              <TipoFilterButtons
                value={filtros.tipo}
                onChange={(v) => setFiltros((f) => ({ ...f, tipo: v }))}
              />
              {hayFiltros && (
                <Button variant="ghost" onClick={clearFiltros}>
                  Limpiar
                </Button>
              )}
            </div>
          </section>

          {error && (
            <div className="surface p-6 text-[var(--color-cinnabar-500)] text-sm">
              {error}
            </div>
          )}

          <section
            className="surface overflow-hidden relative reveal"
            style={{ animationDelay: '240ms' }}
          >
            {loading && movimientos.length === 0 ? (
              <div className="py-24 text-center">
                <Spinner label="recuperando movimientos" />
              </div>
            ) : (
              <Table
                columns={columns}
                rows={movimientos}
                rowKey={(_m, i) => `${i}-${_m.documento}-${_m.fecha}`}
                empty={
                  <div className="space-y-2">
                    <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
                      Sin movimientos
                    </p>
                    <p className="display text-2xl text-[var(--color-ink-800)]">
                      {hayFiltros
                        ? 'Ningún movimiento en este rango'
                        : 'Este producto no tiene movimientos registrados'}
                    </p>
                  </div>
                }
              />
            )}
            {loading && movimientos.length > 0 && (
              <div className="absolute top-4 right-4">
                <Spinner />
              </div>
            )}
          </section>
        </>
      )}

      {!producto && !loading && (
        <section className="surface p-16 text-center reveal" style={{ animationDelay: '180ms' }}>
          <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
            § Esperando selección
          </p>
          <p className="display text-2xl text-[var(--color-ink-700)] mt-3 max-w-md mx-auto">
            Busque un SKU arriba para abrir su libro de movimientos.
          </p>
          <p className="text-sm text-[var(--color-ink-600)] mt-2 max-w-md mx-auto leading-relaxed">
            El kardex muestra cada ingreso y salida con la cantidad
            movimentada, el documento que la origina y el stock resultante
            tras cada operación.
          </p>
        </section>
      )}
    </div>
  );
}
