import type { Producto } from '@/types/producto.types';
import { Table, type Column } from '@/components/common/Table';
import { StockBadge } from './StockBadge';
import { fmt } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

interface ProductoTableProps {
  rows: Producto[];
  loading?: boolean;
  onEdit?: (p: Producto) => void;
  onDelete?: (p: Producto) => void;
}

export function ProductoTable({ rows, loading, onEdit, onDelete }: ProductoTableProps) {
  const columns: Column<Producto>[] = [
    {
      key: 'sku',
      header: 'SKU',
      width: '110px',
      render: (p) => (
        <span className="num text-[var(--color-gold-500)] tracking-[0.15em]">
          {p.Producto}
        </span>
      ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (p) => (
        <div className="space-y-0.5">
          <p className="font-sans text-sm text-[var(--color-ink-900)] leading-tight">
            {p.Descripcion}
          </p>
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            {p.UniMed} · {p.Peso > 0 ? `${p.Peso} kg` : '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'marca',
      header: 'Marca',
      width: '120px',
      render: (p) => (
        <span className="num text-[0.7rem] tracking-[0.12em] text-[var(--color-ink-800)] hairline px-2.5 py-1 inline-block">
          {p.MarcaDesc ?? p.Marca}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      width: '240px',
      render: (p) => (
        <div className="space-y-1.5">
          <StockBadge actual={p.StockAc} minimo={p.StockMin} />
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            mín. {p.StockMin} · máx. {p.StockMax}
          </p>
        </div>
      ),
    },
    {
      key: 'costo',
      header: 'Costo',
      align: 'right',
      width: '110px',
      render: (p) => (
        <span className="num text-[var(--color-ink-700)] text-sm">
          {fmt.money(p.PrecCosto)}
        </span>
      ),
    },
    {
      key: 'venta',
      header: 'Venta',
      align: 'right',
      width: '120px',
      render: (p) => (
        <div className="text-right">
          <p className="num text-base text-[var(--color-ink-900)]">
            {fmt.money(p.PrecVenta)}
          </p>
          {p.ConIgv && (
            <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
              inc. IGV
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'margen',
      header: 'Margen',
      align: 'right',
      width: '90px',
      render: (p) => {
        if (p.PrecCosto === 0) return <span className="text-[var(--color-ink-600)]">—</span>;
        const margen = ((p.PrecVenta - p.PrecCosto) / p.PrecCosto) * 100;
        return (
          <span
            className={cn(
              'num text-sm',
              margen >= 30
                ? 'text-[var(--color-jade-500)]'
                : margen >= 15
                ? 'text-[var(--color-gold-500)]'
                : 'text-[var(--color-cinnabar-500)]',
            )}
          >
            {fmt.percent(margen, 0)}
          </span>
        );
      },
    },
  ];

  if (onEdit || onDelete) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      width: '100px',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(p);
              }}
              className="h-8 w-8 grid place-items-center text-[var(--color-ink-700)] hover:text-[var(--color-gold-500)] transition"
              aria-label="Editar"
              title="Editar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(p);
              }}
              className="h-8 w-8 grid place-items-center text-[var(--color-ink-700)] hover:text-[var(--color-cinnabar-500)] transition"
              aria-label="Eliminar"
              title="Eliminar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18" strokeLinecap="round" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          )}
        </div>
      ),
    });
  }

  if (loading && rows.length === 0) {
    return (
      <div className="surface py-24 text-center">
        <p className="mark text-[0.6rem]">Cargando</p>
        <p className="num text-[var(--color-ink-600)] mt-2">···</p>
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden">
      <Table
        columns={columns}
        rows={rows}
        rowKey={(p) => p.Producto}
        empty={
          <div className="space-y-2">
            <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
              Archivo vacío
            </p>
            <p className="display text-2xl text-[var(--color-ink-800)]">
              No se encontraron productos
            </p>
            <p className="text-sm text-[var(--color-ink-600)]">
              Ajusta la búsqueda o registra un nuevo producto.
            </p>
          </div>
        }
      />
    </div>
  );
}
