import { useState } from 'react';
import { useVentas, useVentaDetalle, docId } from '@/hooks/useVentas';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner as Spinner2 } from '@/components/common/Spinner';
import { fmt } from '@/utils/formatters';
import { cn, isoDate } from '@/utils/helpers';
import {
  ESTADO_DOC_LABELS,
  TIPO_DOC_SHORT,
  TIPO_DOC_LABELS,
} from '@/utils/constants';
import type { VentaRow } from '@/types/venta.types';

function EstadoBadge({ estado }: { estado: VentaRow['Estado'] }) {
  const tones = {
    C: 'text-[var(--color-jade-500)]',
    P: 'text-[var(--color-gold-500)]',
    A: 'text-[var(--color-cinnabar-500)]',
  } as const;
  const dots = {
    C: 'bg-[var(--color-jade-500)]',
    P: 'bg-[var(--color-gold-500)]',
    A: 'bg-[var(--color-cinnabar-500)]',
  } as const;
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('h-1.5 w-1.5 rounded-full', dots[estado])} />
      <span className={cn('mark text-[0.55rem]', tones[estado])}>
        {ESTADO_DOC_LABELS[estado]}
      </span>
    </span>
  );
}

function TipoDocBadge({ tipo }: { tipo: VentaRow['TipoDoc'] }) {
  return (
    <span
      className={cn(
        'num text-[0.6rem] tracking-[0.18em] px-2 py-0.5 hairline inline-block',
        tipo === 'F' ? 'text-[var(--color-gold-500)]' : 'text-[var(--color-ink-800)]',
      )}
    >
      {TIPO_DOC_SHORT[tipo] ?? tipo}
    </span>
  );
}

function VentaDetalleModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { detalle, loading, error } = useVentaDetalle(id);

  return (
    <Modal
      open={!!id}
      onClose={onClose}
      mark={`¶ Comprobante ${id.split('-')[0]}`}
      title={detalle ? TIPO_DOC_LABELS[detalle.header.TipoDoc] : 'Cargando…'}
      size="xl"
    >
      {loading && (
        <div className="flex items-center gap-3 text-[var(--color-ink-700)] py-8">
          <Spinner2 label="recuperando documento" />
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
                Emisor
              </p>
              <p className="text-sm text-[var(--color-ink-900)]">
                {detalle.header.PersonalNombre ?? '—'}
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                ID {detalle.header.Personal} · vendedor
              </p>
            </div>
            <div className="bg-[var(--color-ink-100)] p-5 space-y-2">
              <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
                Receptor
              </p>
              <p className="text-sm text-[var(--color-ink-900)]">
                {detalle.header.ClienteNombre ?? '—'}
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                {detalle.header.Zona ? `Zona ${detalle.header.Zona} · ` : ''}
                ID {detalle.header.Cliente}
              </p>
            </div>
          </section>

          <section className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-4">
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
                Forma de pago
              </p>
              <p className="text-sm text-[var(--color-ink-900)]">
                {detalle.header.FormaPago ?? '—'}
              </p>
            </div>
            <div className="bg-[var(--color-ink-100)] p-4 space-y-1.5">
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                Estado
              </p>
              <EstadoBadge estado={detalle.header.Estado} />
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
              <p className="mark text-[0.55rem]">§ I — Mercaderías</p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                {detalle.detalle.length}{' '}
                {detalle.detalle.length === 1 ? 'ítem' : 'ítems'}
              </p>
            </header>
            <div className="surface overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="hairline-b">
                    <th className="py-3 px-4 mark text-[0.55rem] text-left w-10">#</th>
                    <th className="py-3 px-4 mark text-[0.55rem] text-left">
                      Producto
                    </th>
                    <th className="py-3 px-4 mark text-[0.55rem] text-right">
                      Cant.
                    </th>
                    <th className="py-3 px-4 mark text-[0.55rem] text-right">
                      P. Unit.
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
                      <td className="py-3 px-4 num text-sm text-[var(--color-ink-900)] text-right">
                        {d.Cantidad}
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

          {detalle.cronograma.length > 0 && (
            <section>
              <header className="flex items-baseline justify-between mb-3">
                <p className="mark text-[0.55rem]">§ II — Cronograma de pagos</p>
                <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                  {detalle.cronograma.length} cuotas
                </p>
              </header>
              <div className="surface overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="hairline-b">
                      <th className="py-3 px-4 mark text-[0.55rem] text-left">
                        N°
                      </th>
                      <th className="py-3 px-4 mark text-[0.55rem] text-left">
                        Vence
                      </th>
                      <th className="py-3 px-4 mark text-[0.55rem] text-left">
                        Pagado
                      </th>
                      <th className="py-3 px-4 mark text-[0.55rem] text-right">
                        Importe
                      </th>
                      <th className="py-3 px-4 mark text-[0.55rem] text-right">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.cronograma.map((c) => (
                      <tr key={c.NroCuota} className="hairline-b last:border-0">
                        <td className="py-3 px-4 num text-sm text-[var(--color-ink-700)]">
                          {String(c.NroCuota).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4 num text-sm text-[var(--color-ink-900)]">
                          {fmt.date(c.feVence)}
                        </td>
                        <td className="py-3 px-4 num text-sm text-[var(--color-ink-800)]">
                          {c.Fepago ? fmt.date(c.Fepago) : '—'}
                        </td>
                        <td className="py-3 px-4 num text-sm text-[var(--color-ink-900)] text-right">
                          {fmt.money(c.Importe)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={cn(
                              'mark text-[0.55rem]',
                              c.estado === 'C'
                                ? 'text-[var(--color-jade-500)]'
                                : 'text-[var(--color-gold-500)]',
                            )}
                          >
                            {c.estado === 'C' ? 'Cobrada' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

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

export default function VentasHistorial() {
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
  } = useVentas();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  function clearFiltros() {
    setFiltros({ fechaInicio: '', fechaFin: '' });
  }

  const hayFiltros = filtros.fechaInicio || filtros.fechaFin;

  const columns: Column<VentaRow>[] = [
    {
      key: 'doc',
      header: 'Comprobante',
      width: '160px',
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <TipoDocBadge tipo={v.TipoDoc} />
          <span className="num text-[var(--color-gold-500)] tracking-[0.1em] text-sm">
            {v.Documento}
          </span>
        </div>
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
      key: 'cliente',
      header: 'Cliente',
      render: (v) => (
        <div>
          <p className="text-sm text-[var(--color-ink-900)]">
            {v.ClienteNombre ?? '—'}
          </p>
          {v.Cliente && (
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
              ID {v.Cliente}
            </p>
          )}
        </div>
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
      header: 'Pagado',
      align: 'right',
      width: '120px',
      render: (v) => (
        <p className="num text-sm text-[var(--color-ink-700)]">
          {fmt.money(v.pagado)}
        </p>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '140px',
      render: (v) => <EstadoBadge estado={v.Estado} />,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between reveal">
        <div>
          <p className="mark text-[0.55rem]">§ 05 — Archivo</p>
          <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
            Historial de ventas
          </h2>
          <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
            Comprobantes emitidos, filtros por fecha y trazabilidad completa.
          </p>
        </div>
      </header>

      <section className="surface p-6 grid gap-5 md:grid-cols-[1fr_1fr_auto_auto] reveal" style={{ animationDelay: '60ms' }}>
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

      <section className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-4 reveal" style={{ animationDelay: '90ms' }}>
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
          <p className="num text-3xl text-[var(--color-gold-500)] mt-1.5">
            {fmt.money(data.reduce((acc, v) => acc + v.Total, 0))}
          </p>
        </div>
      </section>

      {error && (
        <div className="surface p-6 text-[var(--color-cinnabar-500)] text-sm">
          {error}
        </div>
      )}

      <section className="relative reveal" style={{ animationDelay: '120ms' }}>
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
              onRowClick={(v) =>
                setSelectedId(docId(v.Documento, v.TipoDoc))
              }
              empty={
                <div className="space-y-2">
                  <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
                    Archivo vacío
                  </p>
                  <p className="display text-2xl text-[var(--color-ink-800)]">
                    No hay comprobantes en este rango
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

      <VentaDetalleModal
        id={selectedId ?? ''}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
