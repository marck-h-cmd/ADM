import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos, useProductoStockCritico } from '@/hooks/useProductos';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductoSearch } from '@/components/productos/ProductoSearch';
import { ProductoTable } from '@/components/productos/ProductoTable';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/common/Spinner';
import type { Producto } from '@/types/producto.types';

export default function Productos() {
  const navigate = useNavigate();
  const {
    data,
    total,
    pages,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    remove,
  } = useProductos();

  const [debounced] = useDebounce(search, 350);
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data: stockCritico } = useProductoStockCritico();
  const [toDelete, setToDelete] = useState<Producto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    const res = await remove(toDelete.Producto);
    setDeleting(false);
    if (!res.ok) {
      setDeleteError(res.error);
      return;
    }
    setToDelete(null);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between reveal">
        <div>
          <p className="mark text-[0.55rem]">§ 02 — Catálogo</p>
          <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
            Productos
          </h2>
          <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
            Inventario maestro. Cada SKU trazado con su stock, precio y umbral.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ProductoSearch
            value={search}
            onChange={setSearch}
            className="w-72"
          />
          <Button
            variant="primary"
            onClick={() => navigate('/productos/nuevo')}
            iconLeft={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            }
          >
            Nuevo
          </Button>
        </div>
      </header>

      <section className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-3 reveal" style={{ animationDelay: '60ms' }}>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">Total registrado</p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {total}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">Stock crítico</p>
          <p className="num text-3xl text-[var(--color-cinnabar-500)] mt-1.5">
            {stockCritico.length}
          </p>
        </div>
        <div className="surface p-6">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">Página</p>
          <p className="num text-3xl text-[var(--color-ink-900)] mt-1.5">
            {page} <span className="text-[var(--color-ink-600)] text-xl">/ {Math.max(1, pages)}</span>
          </p>
        </div>
      </section>

      {error && (
        <div className="surface p-6 text-[var(--color-cinnabar-500)] text-sm">
          {error}
        </div>
      )}

      <section className="relative reveal" style={{ animationDelay: '120ms' }}>
        <ProductoTable
          rows={data}
          loading={loading}
          onEdit={(p) => navigate(`/productos/${p.Producto}`)}
          onDelete={(p) => setToDelete(p)}
        />
        {loading && data.length > 0 && (
          <div className="absolute top-4 right-4">
            <Spinner />
          </div>
        )}
      </section>

      <Pagination page={page} pages={Math.max(1, pages)} onChange={setPage} />

      <Modal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        mark="§ Confirme"
        title="Eliminar producto"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-[var(--color-ink-700)] leading-relaxed">
            Está a punto de retirar del catálogo el producto
            <span className="num text-[var(--color-gold-500)] mx-1.5">{toDelete?.Producto}</span>
            <span className="text-[var(--color-ink-900)]">"{toDelete?.Descripcion}"</span>.
            Esta acción no puede deshacerse.
          </p>
          {deleteError && (
            <p className="text-sm text-[var(--color-cinnabar-500)]">{deleteError}</p>
          )}
          <footer className="flex items-center justify-end gap-3 pt-2 hairline-t">
            <Button
              variant="ghost"
              onClick={() => setToDelete(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleting}
            >
              Confirmar baja
            </Button>
          </footer>
        </div>
      </Modal>
    </div>
  );
}
