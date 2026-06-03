import { useVentaStore } from '@/store/ventaStore';
import { FORMA_PAGO_LABELS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

const formas: Array<{ key: 'E' | 'T' | 'Y' | 'C'; label: string; hint: string }> = [
  { key: 'E', label: 'Efectivo', hint: 'Pago al contado' },
  { key: 'T', label: 'Tarjeta', hint: 'Débito o crédito' },
  { key: 'Y', label: 'Yape / Plin', hint: 'Transferencia inmediata' },
  { key: 'C', label: 'Crédito', hint: 'A plazos' },
];

export function PagoForm() {
  const formaPago = useVentaStore((s) => s.formaPago);
  const setFormaPago = useVentaStore((s) => s.setFormaPago);
  const credito = useVentaStore((s) => s.credito);
  const setCredito = useVentaStore((s) => s.setCredito);

  return (
    <section>
      <header className="flex items-baseline justify-between mb-4">
        <p className="mark text-[0.55rem]">§ IV — Forma de pago</p>
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          {FORMA_PAGO_LABELS[formaPago]}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        {formas.map((f) => {
          const active = formaPago === f.key || (f.key === 'C' && credito);
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                if (f.key === 'C') {
                  setCredito(true);
                } else {
                  setCredito(false);
                  setFormaPago(f.key);
                }
              }}
              className={cn(
                'text-left p-4 hairline transition-all group',
                active
                  ? 'bg-[var(--color-gold-500)] text-[var(--color-ink-50)] border-[var(--color-gold-500)]'
                  : 'hover:border-[var(--color-gold-500)] hover:bg-[var(--color-ink-300)]',
              )}
            >
              <p
                className={cn(
                  'font-sans font-medium text-sm tracking-wide',
                  active ? 'text-[var(--color-ink-50)]' : 'text-[var(--color-ink-900)]',
                )}
              >
                {f.label}
              </p>
              <p
                className={cn(
                  'mark text-[0.5rem] mt-1.5',
                  active
                    ? 'text-[var(--color-ink-50)]/70'
                    : 'text-[var(--color-ink-600)]',
                )}
              >
                {f.hint}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
