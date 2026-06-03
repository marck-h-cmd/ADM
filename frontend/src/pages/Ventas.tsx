import { useState } from 'react';
import { useVentaStore } from '@/store/ventaStore';
import { selectTotal, selectSubtotal, selectIgv } from '@/store/documento';
import { ventasService } from '@/services/ventas.service';
import { useAuth } from '@/hooks/useAuth';
import { ClienteSelector } from '@/components/ventas/ClienteSelector';
import { ProductoBuscador } from '@/components/documentos/ProductoBuscador';
import { CarritoResumen } from '@/components/documentos/CarritoResumen';
import { PagoForm } from '@/components/ventas/PagoForm';
import { CuotasForm } from '@/components/ventas/CuotasForm';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { fmt } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/helpers';

export default function Ventas() {
  const { user } = useAuth();
  const {
    items,
    cliente,
    formaPago,
    credito,
    cuotas,
    personal,
    clear,
  } = useVentaStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const subtotal = selectSubtotal(items);
  const igv = selectIgv(items);
  const total = selectTotal(items);
  const canSubmit = !!cliente && items.length > 0 && !submitting;

  async function handleRegistrar() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const docNumero = `B${Date.now().toString().slice(-8)}`;
      const mensaje = await ventasService.registrar({
        cliente: cliente!,
        documento: docNumero,
        fecha: new Date().toISOString(),
        personal,
        formaPago,
        productos: items.map((i) => ({
          producto: i.producto,
          cantidad: i.cantidad,
          precio: i.precio,
        })),
        credito,
        cuotas: credito ? cuotas : undefined,
      });
      setSuccess(mensaje);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  function handleNuevaVenta() {
    clear();
    setSuccess(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="mark text-[0.55rem]">§ 04 — Emisión</p>
        <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
          Nueva venta
        </h2>
        <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
          Registre el documento. Cada paso se archiva en el kardex con su
          trazabilidad completa.
        </p>
      </header>

      {success && (
        <Alert tone="jade">
          <div className="flex items-center justify-between gap-4">
            <span>{success}</span>
            <button
              onClick={handleNuevaVenta}
              className="mark text-[0.55rem] text-[var(--color-jade-500)] hover:text-[var(--color-ink-900)] underline underline-offset-4"
            >
              Iniciar nueva ↻
            </button>
          </div>
        </Alert>
      )}
      {error && <Alert tone="cinnabar">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        {/* LEFT — selección */}
        <div className="space-y-6 reveal" style={{ animationDelay: '60ms' }}>
          <div className="surface p-6">
            <ClienteSelector />
          </div>

          <div className="surface p-6">
            <ProductoBuscador useStore={useVentaStore} validarStock />
          </div>

          <CarritoResumen useStore={useVentaStore} />
        </div>

        {/* RIGHT — recibo */}
        <aside className="space-y-6 reveal" style={{ animationDelay: '120ms' }}>
          <div className="surface p-7 sticky top-6">
            <header className="flex items-baseline justify-between mb-6">
              <p className="mark text-[0.55rem]">¶ Recibo</p>
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
                Total documento
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
                <span className="text-[var(--color-ink-700)]">Forma de pago</span>
                <span className="text-[var(--color-ink-900)]">
                  {formaPago === 'C' ? 'Crédito' : formaPago === 'E' ? 'Efectivo' : formaPago === 'T' ? 'Tarjeta' : 'Yape/Plin'}
                </span>
              </div>
              {credito && (
                <div className="flex items-baseline justify-between">
                  <span className="text-[var(--color-ink-700)]">Cuotas</span>
                  <span className="num text-[var(--color-gold-500)]">
                    {cuotas} × {fmt.money(total / Math.max(1, cuotas))}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-[var(--color-ink-700)]">Vendedor</span>
                <span className="text-[var(--color-ink-900)]">
                  {user?.nombre ?? '—'}
                </span>
              </div>
            </div>

            <PagoForm />

            <div className="my-6">
              <CuotasForm />
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!canSubmit}
                loading={submitting}
                onClick={handleRegistrar}
              >
                {submitting ? 'Registrando' : 'Registrar venta'}
              </Button>
              <div className="flex items-center justify-between text-[0.65rem] text-[var(--color-ink-600)]">
                <button
                  onClick={handleNuevaVenta}
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
