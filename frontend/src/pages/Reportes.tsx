import { useState } from 'react';
import { Tabs, type TabItem } from '@/components/common/Tabs';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Table, type Column } from '@/components/common/Table';
import { Spinner } from '@/components/common/Spinner';
import { ExportButton } from '@/components/common/ExportButton';
import { RankingBar } from '@/components/reportes/RankingBar';
import {
  useReporteVentas,
  useReporteVendedores,
  useReporteRotacion,
  useReporteVencimientos,
  useReporteValorizacion,
  type VentaReporte,
  type VencimientoReporte,
  type RotacionItem,
} from '@/hooks/useReportes';
import { TIPO_DOC_SHORT, TIPO_DOC_LABELS } from '@/utils/constants';
import { fmt } from '@/utils/formatters';
import { cn, isoDate } from '@/utils/helpers';

const TABS: TabItem[] = [
  { key: 'ventas', label: 'Ventas', mark: '§ I' },
  { key: 'rotacion', label: 'Rotación', mark: '§ II' },
  { key: 'valorizacion', label: 'Valorización', mark: '§ III' },
  { key: 'vencimientos', label: 'Vencimientos', mark: '§ IV' },
];

function TipoDocTag({ tipo }: { tipo: 'B' | 'F' }) {
  return (
    <span
      className={cn(
        'num text-[0.6rem] tracking-[0.18em] px-2 py-0.5 hairline inline-block',
        tipo === 'F'
          ? 'text-[var(--color-gold-500)]'
          : 'text-[var(--color-ink-800)]',
      )}
    >
      {TIPO_DOC_SHORT[tipo]}
    </span>
  );
}

function VencBadge({ dias }: { dias: number }) {
  const tone =
    dias < 0
      ? { text: 'text-[var(--color-cinnabar-500)]', label: 'Vencida' }
      : dias <= 7
        ? { text: 'text-[var(--color-cinnabar-500)]', label: `${dias}d` }
        : dias <= 15
          ? { text: 'text-[var(--color-gold-500)]', label: `${dias}d` }
          : { text: 'text-[var(--color-jade-500)]', label: `${dias}d` };
  return (
    <span className={cn('num text-[0.65rem] tracking-tight', tone.text)}>
      {tone.label}
    </span>
  );
}

function VentasTab() {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return isoDate(d);
  });
  const [fechaFin, setFechaFin] = useState(() => isoDate());
  const [tipo, setTipo] = useState<'TODOS' | 'B' | 'F'>('TODOS');

  const { data, loading } = useReporteVentas(
    fechaInicio,
    fechaFin,
    tipo === 'TODOS' ? undefined : tipo,
  );
  const { data: vendedores } = useReporteVendedores(fechaInicio, fechaFin);

  const totalVendido = data.reduce((acc, v) => acc + v.Total, 0);
  const totalPagado = data.reduce((acc, v) => acc + v.pagado, 0);
  const cantidadDocs = data.length;
  const ticketPromedio = cantidadDocs > 0 ? totalVendido / cantidadDocs : 0;

  const columns: Column<VentaReporte>[] = [
    {
      key: 'doc',
      header: 'Comprobante',
      width: '180px',
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <TipoDocTag tipo={v.TipoDoc} />
          <span className="num text-sm text-[var(--color-gold-500)] tracking-[0.1em]">
            {v.Documento}
          </span>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      width: '110px',
      render: (v) => (
        <p className="num text-sm text-[var(--color-ink-900)]">
          {fmt.date(v.Fecha)}
        </p>
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
          {v.Zona && (
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
              Zona {v.Zona}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'vendedor',
      header: 'Vendedor',
      width: '170px',
      render: (v) => (
        <p className="text-sm text-[var(--color-ink-800)]">
          {v.Vendedor ?? '—'}
        </p>
      ),
    },
    {
      key: 'productos',
      header: 'Items',
      align: 'right',
      width: '70px',
      render: (v) => (
        <p className="num text-sm text-[var(--color-ink-700)]">{v.Productos}</p>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      width: '130px',
      render: (v) => (
        <p className="num text-base text-[var(--color-ink-900)]">
          {fmt.money(v.Total)}
        </p>
      ),
    },
    {
      key: 'pagado',
      header: 'Cobrado',
      align: 'right',
      width: '120px',
      render: (v) => (
        <p className="num text-sm text-[var(--color-ink-700)]">
          {fmt.money(v.pagado)}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-7">
      <section className="surface p-6 grid gap-5 md:grid-cols-[1fr_1fr_auto_auto]">
        <div>
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
            § Desde
          </p>
          <Input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="num"
          />
        </div>
        <div>
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
            § Hasta
          </p>
          <Input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="num"
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={() => {
              setFechaInicio(isoDate(new Date(Date.now() - 30 * 86400000)));
              setFechaFin(isoDate());
            }}
          >
            Últimos 30d
          </Button>
        </div>
        <div className="flex items-end">
          <ExportButton
            filename={`ventas-${fechaInicio}-${fechaFin}`}
            rows={data as unknown as Record<string, unknown>[]}
            label="Exportar Excel 📊"
          />
        </div>
      </section>

      <section className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-4">
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Total vendido
          </p>
          <p className="num text-2xl text-[var(--color-ink-900)] mt-1.5">
            {fmt.money(totalVendido)}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Total cobrado
          </p>
          <p className="num text-2xl text-[var(--color-jade-500)] mt-1.5">
            {fmt.money(totalPagado)}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Comprobantes
          </p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {cantidadDocs}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Ticket promedio
          </p>
          <p className="num text-2xl text-[var(--color-ink-900)] mt-1.5">
            {fmt.money(ticketPromedio)}
          </p>
        </div>
      </section>

      {vendedores.length > 0 && (
        <section className="surface p-7">
          <header className="flex items-baseline justify-between mb-5">
            <p className="mark text-[0.55rem]">§ Ranking de vendedores</p>
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Por total vendido en el período
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-2">
            {vendedores.slice(0, 6).map((v, i) => {
              const max = vendedores[0].TotalVentas;
              return (
                <RankingBar
                  key={v.Personal ?? i}
                  rank={i + 1}
                  label={v.Vendedor ?? v.Personal}
                  value={Number(v.TotalVentas)}
                  max={Number(max)}
                  hint={`${v.CantidadVentas} ventas · ticket ${fmt.money(
                    Number(v.TicketPromedio),
                  )}`}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="flex items-center gap-2 hairline-b pb-3">
        <span className="mark text-[0.5rem] text-[var(--color-ink-600)] mr-1">
          Tipo
        </span>
        {(['TODOS', 'B', 'F'] as const).map((t) => {
          const active = tipo === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={cn(
                'mark text-[0.55rem] px-3 py-1.5 hairline transition-all',
                active
                  ? 'bg-[var(--color-ink-900)] text-[var(--color-ink-50)] border-[var(--color-ink-900)]'
                  : 'text-[var(--color-ink-700)] hover:border-[var(--color-ink-700)]',
              )}
            >
              {t === 'TODOS' ? 'Todos' : TIPO_DOC_LABELS[t]}
            </button>
          );
        })}
      </section>

      <section className="surface overflow-hidden relative">
        {loading && data.length === 0 ? (
          <div className="py-24 text-center">
            <Spinner label="compilando reporte" />
          </div>
        ) : (
          <Table
            columns={columns}
            rows={data}
            rowKey={(v) => `${v.Documento}-${v.TipoDoc}`}
            empty={
              <div className="space-y-2">
                <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
                  Sin datos
                </p>
                <p className="display text-2xl text-[var(--color-ink-800)]">
                  No hay ventas en este período
                </p>
              </div>
            }
          />
        )}
        {loading && data.length > 0 && (
          <div className="absolute top-4 right-4">
            <Spinner />
          </div>
        )}
      </section>
    </div>
  );
}

function RotacionTab() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const { data, loading } = useReporteRotacion(anio);

  const totalVendidas = data.reduce(
    (acc, r) => acc + (Number(r.CantidadVendida ?? 0) || 0),
    0,
  );
  const totalRotacion = data.reduce(
    (acc, r) => acc + (Number(r.CantidadVendida ?? 0) || 0),
    0,
  );

  const columns: Column<RotacionItem>[] = [
    {
      key: 'producto',
      header: 'Producto',
      render: (r) => (
        <div>
          <p className="text-sm text-[var(--color-ink-900)]">
            {String(r.Descripcion ?? r.Producto ?? '—')}
          </p>
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
            {r.Marca ? `Marca ${r.Marca}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      width: '90px',
      render: (r) => (
        <span className="num text-sm text-[var(--color-gold-500)] tracking-[0.1em]">
          {String(r.Producto ?? '—')}
        </span>
      ),
    },
    {
      key: 'cantidad',
      header: 'Cant. vendida',
      align: 'right',
      width: '130px',
      render: (r) => (
        <p className="num text-base text-[var(--color-ink-900)]">
          {fmt.number(Number(r.CantidadVendida ?? 0))}
        </p>
      ),
    },
    {
      key: 'stock',
      header: 'Stock actual',
      align: 'right',
      width: '120px',
      render: (r) => (
        <p className="num text-sm text-[var(--color-ink-700)]">
          {fmt.number(Number(r.StockActual ?? 0))}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-7">
      <section className="surface p-6 grid gap-5 md:grid-cols-[180px_auto]">
        <div>
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
            § Año
          </p>
          <Input
            type="number"
            min={2000}
            max={2100}
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value) || anio)}
            className="num"
          />
        </div>
        <div className="flex items-end">
          <ExportButton
            filename={`rotacion-${anio}`}
            rows={data as unknown as Record<string, unknown>[]}
          />
        </div>
      </section>

      <section className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-3">
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            SKUs con rotación
          </p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {data.length}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Unidades vendidas
          </p>
          <p className="num text-3xl text-[var(--color-jade-500)] mt-1.5">
            {fmt.number(totalVendidas)}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Acumulado del año
          </p>
          <p className="num text-3xl text-[var(--color-gold-500)] mt-1.5">
            {fmt.number(totalRotacion)}
          </p>
        </div>
      </section>

      {data.length > 0 && (
        <section className="surface p-7">
          <header className="flex items-baseline justify-between mb-5">
            <p className="mark text-[0.55rem]">§ Top rotación</p>
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Top 8 · año {anio}
            </p>
          </header>
          <div className="grid gap-5 md:grid-cols-2">
            {data.slice(0, 8).map((r, i) => {
              const max = Number(data[0].CantidadVendida ?? 1);
              return (
                <RankingBar
                  key={String(r.Producto ?? i)}
                  rank={i + 1}
                  label={String(r.Descripcion ?? r.Producto)}
                  value={Number(r.CantidadVendida ?? 0)}
                  max={max}
                  format="number"
                  hint={`stock ${fmt.number(Number(r.StockActual ?? 0))}`}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="surface overflow-hidden relative">
        {loading && data.length === 0 ? (
          <div className="py-24 text-center">
            <Spinner label="compilando rotación" />
          </div>
        ) : (
          <Table
            columns={columns}
            rows={data}
            rowKey={(r, i) => String(r.Producto ?? i)}
            empty={
              <div className="space-y-2">
                <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
                  Sin movimientos
                </p>
                <p className="display text-2xl text-[var(--color-ink-800)]">
                  No hay rotación registrada en {anio}
                </p>
              </div>
            }
          />
        )}
      </section>
    </div>
  );
}

function ValorizacionTab() {
  const { data, loading } = useReporteValorizacion();

  // El endpoint puede retornar varias formas. Tratamos de extraer lo común.
  const totalItems = data.length;
  const totalValor = data.reduce((acc, r) => {
    const v = Number(
      r.valorTotal ??
        r.ValorTotal ??
        r.valor ??
        r.Valor ??
        r.total ??
        r.Total ??
        0,
    );
    return acc + v;
  }, 0);

  // Detectar columnas a partir de la primera fila
  const detectedKeys =
    data.length > 0 ? Object.keys(data[0]).slice(0, 6) : [];

  const columns: Column<Record<string, unknown>>[] = detectedKeys.map(
    (key) => ({
      key,
      header: key,
      render: (row) => {
        const v = row[key];
        if (typeof v === 'number') {
          return (
            <p className="num text-sm text-[var(--color-ink-900)]">
              {fmt.number(v)}
            </p>
          );
        }
        return (
          <p className="text-sm text-[var(--color-ink-800)]">
            {v == null ? '—' : String(v)}
          </p>
        );
      },
    }),
  );

  return (
    <div className="space-y-7">
      <section className="surface p-6 flex items-center justify-end">
        <ExportButton
          filename="valorizacion-inventario"
          rows={data}
        />
      </section>

      <section className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-2">
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            SKUs valorizados
          </p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {totalItems}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Valor total
          </p>
          <p className="num text-2xl text-[var(--color-gold-500)] mt-1.5">
            {fmt.money(totalValor)}
          </p>
        </div>
      </section>

      <section className="surface overflow-hidden relative">
        {loading ? (
          <div className="py-24 text-center">
            <Spinner label="compilando valorización" />
          </div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center">
            <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
              Sin datos
            </p>
            <p className="display text-2xl text-[var(--color-ink-800)] mt-3">
              No hay información de valorización disponible
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            rows={data}
            rowKey={(_r, i) => String(i)}
          />
        )}
      </section>
    </div>
  );
}

function VencimientosTab() {
  const { data, loading } = useReporteVencimientos();

  const totalImporte = data.reduce((acc, v) => acc + Number(v.Importe ?? 0), 0);
  const vencidas = data.filter((v) => Number(v.DiasVencimiento) < 0).length;
  const proximas = data.filter(
    (v) => Number(v.DiasVencimiento) >= 0 && Number(v.DiasVencimiento) <= 7,
  ).length;

  const columns: Column<VencimientoReporte>[] = [
    {
      key: 'doc',
      header: 'Comprobante',
      width: '170px',
      render: (v) => (
        <span className="num text-sm text-[var(--color-gold-500)] tracking-[0.1em]">
          {v.Documento}
          <span className="text-[var(--color-ink-600)] ml-1.5">
            /{v.NroCuota}
          </span>
        </span>
      ),
    },
    {
      key: 'vence',
      header: 'Vencimiento',
      width: '150px',
      render: (v) => (
        <div>
          <p className="num text-sm text-[var(--color-ink-900)]">
            {fmt.date(v.feVence)}
          </p>
          <VencBadge dias={Number(v.DiasVencimiento)} />
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
          {v.Telefono && (
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-0.5">
              {v.Telefono}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'importe',
      header: 'Importe',
      align: 'right',
      width: '130px',
      render: (v) => (
        <p className="num text-base text-[var(--color-ink-900)]">
          {fmt.money(Number(v.Importe))}
        </p>
      ),
    },
    {
      key: 'interes',
      header: 'Interés',
      align: 'right',
      width: '110px',
      render: (v) => (
        <p className="num text-sm text-[var(--color-ink-700)]">
          {fmt.money(Number(v.Interes))}
        </p>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '100px',
      render: (v) => (
        <span
          className={cn(
            'mark text-[0.55rem] inline-flex items-center gap-1.5',
            v.estado === 'P'
              ? 'text-[var(--color-gold-500)]'
              : 'text-[var(--color-jade-500)]',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              v.estado === 'P'
                ? 'bg-[var(--color-gold-500)]'
                : 'bg-[var(--color-jade-500)]',
            )}
          />
          {v.estado === 'P' ? 'Pendiente' : 'Cobrada'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-7">
      <section className="surface p-6 flex items-center justify-end">
        <ExportButton
          filename="vencimientos"
          rows={data as unknown as Record<string, unknown>[]}
        />
      </section>

      <section className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-4">
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Cuotas pendientes
          </p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {data.length}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Importe total
          </p>
          <p className="num text-2xl text-[var(--color-ink-900)] mt-1.5">
            {fmt.money(totalImporte)}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Vencidas
          </p>
          <p className="num text-3xl text-[var(--color-cinnabar-500)] mt-1.5">
            {vencidas}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Próximas 7d
          </p>
          <p className="num text-3xl text-[var(--color-gold-500)] mt-1.5">
            {proximas}
          </p>
        </div>
      </section>

      <section className="surface overflow-hidden relative">
        {loading ? (
          <div className="py-24 text-center">
            <Spinner label="compilando vencimientos" />
          </div>
        ) : (
          <Table
            columns={columns}
            rows={data}
            rowKey={(v, i) => `${v.Documento}-${v.TipoDoc}-${v.NroCuota}-${i}`}
            empty={
              <div className="space-y-2">
                <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
                  Cartera al día
                </p>
                <p className="display text-2xl text-[var(--color-ink-800)]">
                  No hay cuotas por vencer en los próximos 30 días
                </p>
                <p className="text-sm text-[var(--color-ink-600)]">
                  La cartera de crédito se encuentra al día.
                </p>
              </div>
            }
          />
        )}
      </section>
    </div>
  );
}

export default function Reportes() {
  const [tab, setTab] = useState('ventas');

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="mark text-[0.55rem]">§ 09 — Inteligencia</p>
        <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
          Reportes
        </h2>
        <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
          Lecturas ejecutivas del sistema. Ventas, rotación, valorización de
          stock y cartera por vencer.
        </p>
      </header>

      <div className="reveal" style={{ animationDelay: '60ms' }}>
        <Tabs
          items={TABS}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="reveal" style={{ animationDelay: '120ms' }}>
        {tab === 'ventas' && <VentasTab />}
        {tab === 'rotacion' && <RotacionTab />}
        {tab === 'valorizacion' && <ValorizacionTab />}
        {tab === 'vencimientos' && <VencimientosTab />}
      </div>
    </div>
  );
}
