import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, type Column } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/common/Spinner';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Field } from '@/components/common/Input';
import {
  TipoClienteChip,
  CalificacionBadge,
  CreditGauge,
} from '@/components/clientes/ClienteAtoms';

import { fmt } from '@/utils/formatters';
import { cn } from '@/utils/helpers';
import {
  useClientesList,
  useClienteAcciones,
  type FiltrosCliente,
} from '@/hooks/useClientes';
import type { Cliente } from '@/types/cliente.types';

const TIPOS: Array<{ key: FiltrosCliente['tipo']; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'V', label: 'VIP' },
  { key: 'E', label: 'Empresa' },
  { key: 'P', label: 'Persona' },
  { key: 'R', label: 'Regular' },
];

export default function Clientes() {
  const {
    data,
    rawTotal,
    pages,
    page,
    setPage,
    filtros,
    setFiltros,
    loading,
    error,
    refresh,
  } = useClientesList();
  const navigate = useNavigate();
  const { eliminar } = useClienteAcciones();

  const [borrar, setBorrar] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Aggregate KPIs (in-page)
  const conCredito = data.filter((c) => c.credito).length;
  const saldoTotal = data.reduce((acc, c) => acc + c.Saldo, 0);
  const vip = data.filter((c) => c.TipoCliente === 'V').length;

  const columns: Column<Cliente>[] = [
    {
      key: 'id',
      header: 'Código',
      width: '110px',
      render: (v) => (
        <span className="num text-sm text-[var(--color-gold-500)] tracking-[0.12em]">
          {v.Cliente}
        </span>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (v) => (
        <div className="space-y-1.5">
          <p className="text-sm text-[var(--color-ink-900)]">{v.Nombre}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <TipoClienteChip tipo={v.TipoCliente} size="sm" />
            {v.Ruc && (
              <span className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                RUC {v.Ruc}
              </span>
            )}
            <span className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Zona {v.Zona}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'credito',
      header: 'Línea de crédito',
      width: '220px',
      render: (v) =>
        v.credito ? (
          <CreditGauge saldo={v.Saldo} tope={v.topeCredito} size="sm" />
        ) : (
          <span className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Sólo contado
          </span>
        ),
    },
    {
      key: 'calificacion',
      header: 'Calificación',
      width: '170px',
      render: (v) => <CalificacionBadge calificacion={v.Calificacion} />,
    },
    {
      key: 'acc',
      header: '',
      width: '90px',
      align: 'right',
      render: (v) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/clientes/${v.Cliente}`}
            className="mark text-[0.55rem] text-[var(--color-ink-700)] hover:text-[var(--color-gold-500)] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Editar ↗
          </Link>
          <button
            type="button"
            className="mark text-[0.55rem] text-[var(--color-ink-600)] hover:text-[var(--color-cinnabar-500)] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setBorrar(v);
            }}
          >
            Dar de baja
          </button>
        </div>
      ),
    },
  ];

  async function handleDelete() {
    if (!borrar) return;
    setDeleting(true);
    setDeleteError(null);
    const r = await eliminar(borrar.Cliente);
    setDeleting(false);
    if (r.ok) {
      setBorrar(null);
      void refresh();
    } else {
      setDeleteError(r.error ?? 'Error al eliminar');
    }
  }

  const hayFiltros =
    filtros.search.length > 0 || filtros.tipo !== 'todos' || filtros.soloCredito;

  function clearFiltros() {
    setFiltros({ search: '', tipo: 'todos', soloCredito: false });
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between reveal">
        <div>
          <p className="mark text-[0.55rem]">§ 03 — Cartera</p>
          <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
            Clientes
          </h2>
          <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
            Cartera, líneas de crédito y calificaciones. Filtros por tipo, zona y exposición.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/clientes/nuevo')}>
          Nuevo cliente
        </Button>
      </header>

      <section className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-4 reveal" style={{ animationDelay: '60ms' }}>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Cartera total
          </p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {rawTotal}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Con crédito
          </p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {conCredito}
            <span className="text-[var(--color-ink-600)] text-xl ml-1.5">
              / {data.length}
            </span>
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            VIPs
          </p>
          <p className="num text-3xl text-[var(--color-gold-500)] mt-1.5">
            {vip}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            Saldo expuesto
          </p>
          <p className="num text-2xl text-[var(--color-ink-900)] mt-1.5">
            {fmt.money(saldoTotal)}
          </p>
        </div>
      </section>

      <section className="surface p-6 space-y-5 reveal" style={{ animationDelay: '90ms' }}>
        <div className="grid gap-5 md:grid-cols-[1fr_auto]">
          <Field mark="Q" label="Búsqueda">
            <Input
              placeholder="Nombre, RUC o código"
              value={filtros.search}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, search: e.target.value }))
              }
            />
          </Field>

          <Field mark="F" label="Filtros activos">
            <div className="flex items-center gap-2 min-h-[2.5rem]">
              {hayFiltros ? (
                <Button variant="ghost" onClick={clearFiltros}>
                  Limpiar
                </Button>
              ) : (
                <span className="mark text-[0.5rem] text-[var(--color-ink-600)] py-2.5">
                  Sin filtros
                </span>
              )}
            </div>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2 hairline-t pt-5">
          <span className="mark text-[0.5rem] text-[var(--color-ink-600)] mr-1">
            Tipo
          </span>
          {TIPOS.map((t) => {
            const active = filtros.tipo === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setFiltros((f) => ({ ...f, tipo: t.key }))}
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

          <span className="mark text-[0.5rem] text-[var(--color-ink-600)] mx-2 ml-4">
            Condición
          </span>
          <button
            type="button"
            onClick={() =>
              setFiltros((f) => ({ ...f, soloCredito: !f.soloCredito }))
            }
            className={cn(
              'mark text-[0.55rem] px-3 py-1.5 hairline transition-all',
              filtros.soloCredito
                ? 'bg-[var(--color-gold-500)] text-[var(--color-ink-50)] border-[var(--color-gold-500)]'
                : 'text-[var(--color-ink-700)] hover:border-[var(--color-ink-700)]',
            )}
          >
            Con crédito
          </button>
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
              <Spinner label="cargando cartera" />
            </div>
          ) : (
            <Table
              columns={columns}
              rows={data}
              rowKey={(v) => v.Cliente}
              empty={
                <div className="space-y-2">
                  <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
                    Cartera vacía
                  </p>
                  <p className="display text-2xl text-[var(--color-ink-800)]">
                    {hayFiltros
                      ? 'Ningún cliente coincide con los filtros'
                      : 'Aún no hay clientes registrados'}
                  </p>
                  {!hayFiltros && (
                    <Button
                      variant="primary"
                      onClick={() => navigate('/clientes/nuevo')}
                    >
                      Registrar el primero
                    </Button>
                  )}
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

      <Modal
        open={!!borrar}
        onClose={() => {
          if (!deleting) {
            setBorrar(null);
            setDeleteError(null);
          }
        }}
        mark="¶ Dar de baja"
        title={borrar?.Nombre ?? ''}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setBorrar(null);
                setDeleteError(null);
              }}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Confirmar baja
            </Button>
          </div>
        }
      >
        {borrar && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-ink-800)]">
              Va a dar de baja al cliente{' '}
              <span className="text-[var(--color-gold-500)] num">
                {borrar.Cliente}
              </span>{' '}
              — {borrar.Nombre}.
            </p>
            {borrar.Saldo > 0 && (
              <div className="surface p-4 space-y-1.5 hairline border-[var(--color-cinnabar-500)]/30">
                <p className="mark text-[0.55rem] text-[var(--color-cinnabar-500)]">
                  Atención
                </p>
                <p className="text-sm text-[var(--color-ink-800)]">
                  El cliente mantiene un saldo pendiente de{' '}
                  <span className="num text-[var(--color-cinnabar-500)]">
                    {fmt.money(borrar.Saldo)}
                  </span>
                  . No es posible eliminarlo hasta que regularice.
                </p>
              </div>
            )}
            <p className="text-xs text-[var(--color-ink-700)]">
              Esta acción requiere que el cliente no tenga documentos
              asociados. Use esta operación con cuidado.
            </p>
            {deleteError && (
              <p className="text-sm text-[var(--color-cinnabar-500)]">
                {deleteError}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
