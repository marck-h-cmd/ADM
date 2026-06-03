import { useState } from 'react';
import { useCompraStore } from '@/store/compraStore';
import { selectTotal, selectSubtotal, selectIgv } from '@/store/documento';
import { comprasService } from '@/services/compras.service';
import { useAuth } from '@/hooks/useAuth';
import { ProveedorInput } from '@/components/documentos/ProveedorInput';
import { ProductoBuscador } from '@/components/documentos/ProductoBuscador';
import { CarritoResumen } from '@/components/documentos/CarritoResumen';
import { StockImpacto } from '@/components/documentos/StockImpacto';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { fmt } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/helpers';

export default function Compras() {
  const { user } = useAuth();
  const { items, proveedor, proveedorNombre, personal, clear } = useCompraStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const subtotal = selectSubtotal(items);
  const igv = selectIgv(items);
  const total = selectTotal(items);
  const canSubmit = !!proveedor && items.length > 0 && !submitting;

  async function handleRegistrar() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const docNumero = `C${Date.now().toString().slice(-8)}`;
      const mensaje = await comprasService.registrar({
        proveedor: proveedor!,
        documento: docNumero,
        fecha: new Date().toISOString(),
        personal,
        productos: items.map((i) => ({
          producto: i.producto,
          cantidad: i.cantidad,
          precio: i.precio,
        })),
      });
      setSuccess(mensaje);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  function handleNuevaCompra() {
    clear();
    setSuccess(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="mark text-[0.55rem]">§ 06 — Ingreso</p>
        <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
          Nueva compra
        </h2>
        <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
          Registre el ingreso de mercadería contra el proveedor. Cada línea
          actualiza el kardex con la trazabilidad del movimiento.
        </p>
      </header>

      {success && (
        <Alert tone="jade">
          <div className="flex items-center justify-between gap-4">
            <span>{success}</span>
            <button
              onClick={handleNuevaCompra}
              className="mark text-[0.55rem] text-[var(--color-jade-500)] hover:text-[var(--color-ink-900)] underline underline-offset-4"
            >
              Iniciar nueva ↻
            </button>
          </div>
        </Alert>
      )}
      {error && <Alert tone="cinnabar">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        <div className="space-y-6 reveal" style={{ animationDelay: '60ms' }}>
          <div className="surface p-6">
            <ProveedorInput />
          </div>

          <div className="surface p-6">
            <ProductoBuscador
              useStore={useCompraStore}
              validarStock={false}
            />
          </div>

          <CarritoResumen
            useStore={useCompraStore}
            totalLabel="Total a pagar"
          />
        </div>

        <aside className="space-y-6 reveal" style={{ animationDelay: '120ms' }}>
          <div className="surface p-7 sticky top-6">
            <header className="flex items-baseline justify-between mb-6">
              <p className="mark text-[0.55rem]">¶ Orden de compra</p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                {new Date().toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </header>

            <div className="text-center py-6 mb-6 border-y border-[rgba(232,230,224,0.08)]">
              <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
                Total a pagar
              </p>
              <p className="display text-6xl text-[var(--color-gold-500)] tracking-tighter mt-3 num">
                {fmt.money(total)}
              </p>
              <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-2">
                inc. IGV · {items.length}{' '}
                {items.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-[var(--color-ink-700)]">Subtotal</span>
                <span className="num text-[var(--color-ink-800)]">
                  {fmt.money(subtotal)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[var(--color-ink-700)]">IGV (18%)</span>
                <span className="num text-[var(--color-ink-800)]">
                  {fmt.money(igv)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[var(--color-ink-700)]">Proveedor</span>
                <span className="text-[var(--color-ink-900)] truncate ml-3 max-w-[200px] text-right">
                  {proveedorNombre ?? '—'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[var(--color-ink-700)]">Recepcionado por</span>
                <span className="text-[var(--color-ink-900)]">
                  {user?.nombre ?? '—'}
                </span>
              </div>
            </div>

            <StockImpacto useStore={useCompraStore} />

            <div className="space-y-3 mt-6">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!canSubmit}
                loading={submitting}
                onClick={handleRegistrar}
              >
                {submitting ? 'Registrando' : 'Registrar compra'}
              </Button>
              <div className="flex items-center justify-between text-[0.65rem] text-[var(--color-ink-600)]">
                <button
                  onClick={handleNuevaCompra}
                  className="mark text-[0.55rem] hover:text-[var(--color-cinnabar-500)] transition"
                >
                  descartar carrito
                </button>
                <span className="mark text-[0.5rem]">
                  ⌥ + ↵ registrar
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
