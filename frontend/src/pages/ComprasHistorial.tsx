import { useEffect, useState } from 'react';
import { useCompras, useCompraDetalle, docId } from '@/hooks/useCompras';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { fmt } from '@/utils/formatters';
import { isoDate } from '@/utils/helpers';
import { TIPO_DOC_LABELS } from '@/utils/constants';
import type { CompraRow } from '@/types/venta.types';

function PagoBadge({ pagado, total }: { pagado: number; total: number }) {
  const ratio = total > 0 ? pagado / total : 0;
  if (ratio >= 1) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-jade-500)]" />
        <span className="mark text-[0.55rem] text-[var(--color-jade-500)]">
          Pagado
        </span>
      </span>
    );
  }
  if (ratio > 0) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold-500)]" />
        <span className="mark text-[0.55rem] text-[var(--color-gold-500)]">
          Parcial · {fmt.percent(ratio * 100, 0)}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cinnabar-500)]" />
      <span className="mark text-[0.55rem] text-[var(--color-cinnabar-500)]">
        Pendiente
      </span>
    </span>
  );
}

function CompraDetalleModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { detalle, loading, error } = useCompraDetalle(id);

  return (
    <Modal
      open={!!id}
      onClose={onClose}
      mark="¶ Comprobante de compra"
      title={detalle ? TIPO_DOC_LABELS['C'] : 'Cargando…'}
      size="xl"
    >
      {loading && (
        <div className="flex items-center gap-3 text-[var(--color-ink-700)] py-8">
          <Spinner label="recuperando comprobante" />
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--color-cinnabar-500)] py-4">
          {error}
        </p>
      )}

      {detalle && (
        <div className="space-y-7">
          <section className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-2">
            <div className="bg-[var(--color-ink-100)] p-5 space-y-2">
              <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
                Recepcionado por
              </p>
              <p className="text-sm text-[var(--color-ink-900)]">
                {detalle.header.Personal ?? '—'}
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                Personal {detalle.header.Personal ?? '—'}
              </p>
            </div>
            <div className="bg-[var(--color-ink-100)] p-5 space-y-2">
              <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
                Proveedor
              </p>
              <p className="text-sm text-[var(--color-ink-900)]">
                {detalle.header.ProveedorNombre ?? detalle.header.Proveedor ?? '—'}
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                {detalle.header.Proveedor ?? '—'}
              </p>
            </div>
          </section>

          <section className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-3">
            <div className="bg-[var(--color-ink-100)] p-4 space-y-1.5">
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                Fecha
              </p>
              <p className="num text-sm text-[var(--color-ink-900)]">
                {fmt.datetime(detalle.header.Fecha)}
              </p>
            </div>
            <div className="bg-[var(--color-ink-100)] p-4 space-y-1.5">
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                Documento
              </p>
              <p className="num text-sm text-[var(--color-gold-500)] tracking-[0.1em]">
                {detalle.header.Documento}
              </p>
            </div>
            <div className="bg-[var(--color-ink-100)] p-4 space-y-1.5">
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                Pagado
              </p>
              <p className="num text-sm text-[var(--color-ink-900)]">
                {fmt.money(detalle.header.pagado)}
              </p>
            </div>
          </section>

          <section>
            <header className="flex items-baseline justify-between mb-3">
              <p className="mark text-[0.55rem]">§ I — Mercaderías ingresadas</p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                {detalle.detalle.length}{' '}
                {detalle.detalle.length === 1 ? 'ítem' : 'ítems'}
              </p>
            </header>
            <div className="surface overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="hairline-b">
                    <th className="py-3 px-4 mark text-[0.55rem] text-left w-10">
                      #
                    </th>
                    <th className="py-3 px-4 mark text-[0.55rem] text-left">
                      Producto
                    </th>
                    <th className="py-3 px-4 mark text-[0.55rem] text-right">
                      Cant.
                    </th>
                    <th className="py-3 px-4 mark text-[0.55rem] text-right">
                      Costo
                    </th>
                    <th className="py-3 px-4 mark text-[0.55rem] text-right">
                      Importe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.detalle.map((d, i) => (
                    <tr key={i} className="hairline-b last:border-0">
                      <td className="py-3 px-4 num text-[0.65rem] text-[var(--color-ink-600)]">
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-[var(--color-ink-900)]">
                          {d.ProductoDescripcion ?? d.Producto}
                        </p>
                        <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
                          {d.Marca} ·
                          <span className="num ml-1.5 text-[var(--color-gold-500)] tracking-[0.12em]">
                            {d.Producto}
                          </span>
                        </p>
                      </td>
                      <td className="py-3 px-4 num text-sm text-[var(--color-jade-500)] text-right">
                        +{d.Cantidad}
                      </td>
                      <td className="py-3 px-4 num text-sm text-[var(--color-ink-800)] text-right">
                        {fmt.money(d.PrecUnit)}
                      </td>
                      <td className="py-3 px-4 num text-sm text-[var(--color-ink-900)] text-right">
                        {fmt.money(d.Cantidad * d.PrecUnit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex items-baseline justify-between pt-2 hairline-t">
            <p className="mark text-[0.6rem]">Total del comprobante</p>
            <p className="num text-3xl text-[var(--color-gold-500)] tracking-tight">
              {fmt.money(
                detalle.detalle.reduce(
                  (acc, d) => acc + d.Cantidad * d.PrecUnit,
                  0,
                ),
              )}
            </p>
          </section>
        </div>
      )}
    </Modal>
  );
}

export default function ComprasHistorial() {
  const {
    data,
    total,
    pages,
    page,
    setPage,
    filtros,
    setFiltros,
    loading,
    error,
  } = useCompras();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [filtros, setPage]);

  function clearFiltros() {
    setFiltros({ fechaInicio: '', fechaFin: '' });
  }

  const hayFiltros = filtros.fechaInicio || filtros.fechaFin;

  const columns: Column<CompraRow>[] = [
    {
      key: 'doc',
      header: 'Comprobante',
      width: '180px',
      render: (v) => (
        <span className="num text-[var(--color-gold-500)] tracking-[0.1em] text-sm">
          {v.Documento}
        </span>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      width: '170px',
      render: (v) => (
        <div>
          <p className="num text-sm text-[var(--color-ink-900)]">
            {fmt.date(v.Fecha)}
          </p>
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
            {new Date(v.Fecha).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'proveedor',
      header: 'Proveedor',
      render: (v) => (
        <div>
          <p className="text-sm text-[var(--color-ink-900)]">
            {v.ProveedorNombre ?? '—'}
          </p>
          {v.Proveedor && (
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
              ID {v.Proveedor}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'unidades',
      header: 'Unidades',
      align: 'right',
      width: '110px',
      render: () => (
        <p className="num text-sm text-[var(--color-ink-600)]">
          —
        </p>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      width: '140px',
      render: (v) => (
        <p className="num text-base text-[var(--color-ink-900)]">
          {fmt.money(v.Total)}
        </p>
      ),
    },
    {
      key: 'pagado',
      header: 'Pago',
      align: 'right',
      width: '120px',
      render: (v) => <PagoBadge pagado={v.pagado} total={v.Total} />,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between reveal">
        <div>
          <p className="mark text-[0.55rem]">§ 07 — Archivo</p>
          <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
            Historial de compras
          </h2>
          <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
            Ingresos de mercadería, saldos con proveedores y trazabilidad de stock.
          </p>
        </div>
      </header>

      <section
        className="surface p-6 grid gap-5 md:grid-cols-[1fr_1fr_auto_auto] reveal"
        style={{ animationDelay: '60ms' }}
      >
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
                fechaInicio: isoDate(new Date(Date.now() - 7 * 86400000)),
                fechaFin: isoDate(),
              }));
            }}
          >
            Últimos 7d
          </Button>
        </div>
        <div className="flex items-end">
          {hayFiltros ? (
            <Button variant="ghost" onClick={clearFiltros}>
              Limpiar
            </Button>
          ) : (
            <span className="mark text-[0.5rem] text-[var(--color-ink-600)] pb-2.5">
              Sin filtros
            </span>
          )}
        </div>
      </section>

      <section
        className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-4 reveal"
        style={{ animationDelay: '90ms' }}
      >
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Comprobantes
          </p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {total}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Página
          </p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {page}
            <span className="text-[var(--color-ink-600)] text-xl ml-2">
              / {Math.max(1, pages)}
            </span>
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Esta vista
          </p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {data.length}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Acumulado
          </p>
          <p className="num text-2xl text-[var(--color-gold-500)] mt-1.5">
            {fmt.money(data.reduce((acc, v) => acc + Number(v.Total ?? 0), 0))}
          </p>
        </div>
      </section>

      {error && (
        <div className="surface p-6 text-[var(--color-cinnabar-500)] text-sm">
          {error}
        </div>
      )}

      <section
        className="relative reveal"
        style={{ animationDelay: '120ms' }}
      >
        <div className="surface overflow-hidden">
          {loading && data.length === 0 ? (
            <div className="py-24 text-center">
              <Spinner label="cargando archivo" />
            </div>
          ) : (
            <Table
              columns={columns}
              rows={data}
              rowKey={(v) => docId(v.Documento, v.TipoDoc)}
              onRowClick={(v) => setSelectedId(docId(v.Documento, v.TipoDoc))}
              empty={
                <div className="space-y-2">
                  <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
                    Archivo vacío
                  </p>
                  <p className="display text-2xl text-[var(--color-ink-800)]">
                    No hay compras en este rango
                  </p>
                  <p className="text-sm text-[var(--color-ink-600)]">
                    Ajuste las fechas o limpie los filtros.
                  </p>
                </div>
              }
            />
          )}
        </div>
        {loading && data.length > 0 && (
          <div className="absolute top-4 right-4">
            <Spinner />
          </div>
        )}
      </section>

      <Pagination page={page} pages={Math.max(1, pages)} onChange={setPage} />

      <CompraDetalleModal
        id={selectedId ?? ''}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
