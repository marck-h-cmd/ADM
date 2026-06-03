import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductoForm } from '@/components/productos/ProductoForm';
import { Spinner } from '@/components/common/Spinner';
import { productosService } from '@/services/productos.service';
import type {
  CreateProductoDTO,
  Producto,
  UpdateProductoDTO,
} from '@/types/producto.types';
import { getErrorMessage } from '@/utils/helpers';

export default function ProductoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [fetching, setFetching] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    productosService
      .getById(id)
      .then((p) => {
        if (!cancelled) setProducto(p);
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSubmit(payload: CreateProductoDTO | UpdateProductoDTO) {
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && id) {
        const res = await productosService.update(id, payload as UpdateProductoDTO);
        if (!res) throw new Error('No se pudo guardar');
      } else {
        const res = await productosService.create(payload as CreateProductoDTO);
        if (!res) throw new Error('No se pudo registrar');
      }
      navigate('/productos', { replace: true });
      return { ok: true };
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      setSubmitting(false);
      return { ok: false, error: msg };
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center gap-3 text-[var(--color-ink-700)]">
        <Spinner label="cargando producto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl reveal">
      <header className="mb-10">
        <p className="mark text-[0.55rem]">
          {isEdit ? '§ 02 — Edición' : '§ 02 — Registro'}
        </p>
        <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </h2>
        <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
          {isEdit
            ? 'Modifique los datos comerciales o de inventario. El SKU y la marca son inmutables.'
            : 'Registre un nuevo SKU en el catálogo maestro. La información aparecerá disponible inmediatamente en ventas y kardex.'}
        </p>
      </header>

      <div className="surface p-8 md:p-12 relative">
        {isEdit && producto && (
          <div className="absolute top-6 right-8 text-right">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">SKU</p>
            <p className="num text-lg text-[var(--color-gold-500)] tracking-[0.15em]">
              {producto.Producto}
            </p>
          </div>
        )}

        <ProductoForm
          mode={isEdit ? 'edit' : 'create'}
          initial={producto}
          loading={submitting}
          error={error}
          onSubmit={onSubmit}
          onCancel={() => navigate('/productos')}
        />
      </div>
    </div>
  );
}
