import { useVentaStore } from '@/store/ventaStore';
import { selectTotal } from '@/store/documento';
import { fmt } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

export function CuotasForm() {
  const credito = useVentaStore((s) => s.credito);
  const cuotas = useVentaStore((s) => s.cuotas);
  const setCuotas = useVentaStore((s) => s.setCuotas);
  const items = useVentaStore((s) => s.items);
  const total = selectTotal(items);

  if (!credito) return null;

  const opciones = [1, 3, 6, 12, 18, 24, 36];
  const montoPorCuota = total / Math.max(1, cuotas);
  const hoy = new Date();

  return (
    <section className="reveal" style={{ animationDuration: '0.4s' }}>
      <header className="flex items-baseline justify-between mb-4">
        <p className="mark text-[0.55rem]">§ V — Plan de cuotas</p>
        <p className="mark text-[0.5rem] text-[var(--color-gold-500)]">
          {cuotas} {cuotas === 1 ? 'cuota' : 'cuotas'}
        </p>
      </header>

      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {opciones.map((n) => {
          const active = cuotas === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setCuotas(n)}
              className={cn(
                'h-10 num text-xs transition-all hairline',
                active
                  ? 'bg-[var(--color-gold-500)] text-[var(--color-ink-50)] border-[var(--color-gold-500)]'
                  : 'text-[var(--color-ink-700)] hover:border-[var(--color-gold-500)] hover:text-[var(--color-gold-500)]',
              )}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="surface p-4 max-h-56 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[var(--color-ink-200)]">
            <tr className="hairline-b">
              <th className="py-2 px-2 mark text-[0.5rem] text-left">N°</th>
              <th className="py-2 px-2 mark text-[0.5rem] text-left">Vence</th>
              <th className="py-2 px-2 mark text-[0.5rem] text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: cuotas }, (_, i) => {
              const fecha = new Date(hoy);
              fecha.setMonth(fecha.getMonth() + i);
              return (
                <tr key={i} className="hairline-b last:border-0">
                  <td className="py-2 px-2 num text-[0.65rem] text-[var(--color-ink-700)]">
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td className="py-2 px-2 num text-[0.7rem] text-[var(--color-ink-800)]">
                    {fmt.date(fecha)}
                  </td>
                  <td className="py-2 px-2 num text-[0.7rem] text-[var(--color-ink-900)] text-right">
                    {fmt.money(montoPorCuota)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
