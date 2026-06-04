import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { Spinner } from '@/components/common/Spinner';
import { fmt } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/helpers';
import type { DashboardMetrics } from '@/types/venta.types';
import type { ProductoStockCritico } from '@/types/producto.types';

function MetricCard({
  mark,
  label,
  value,
  delta,
  format = 'money',
}: {
  mark: string;
  label: string;
  value: number;
  delta?: number;
  format?: 'money' | 'integer';
}) {
  const formatted =
    format === 'money' ? fmt.money(value) : fmt.integer(value);
  const positive = (delta ?? 0) >= 0;
  return (
    <article className="surface p-7 relative group">
      <span className="mark text-[0.55rem] absolute top-5 right-6">
        {mark}
      </span>
      <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">
        {label}
      </p>
      <p className="num text-4xl mt-3 text-[var(--color-ink-900)] tracking-tight">
        {formatted}
      </p>
      {delta !== undefined && (
        <p
          className={`num text-[0.7rem] mt-3 ${positive ? 'text-[var(--color-jade-500)]' : 'text-[var(--color-cinnabar-500)]'}`}
        >
          {positive ? '▲' : '▼'} {fmt.percent(Math.abs(delta))}
          <span className="text-[var(--color-ink-600)] ml-2">vs. ayer</span>
        </p>
      )}
    </article>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alertas, setAlertas] = useState<ProductoStockCritico[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([dashboardService.getMetrics(), dashboardService.getAlertasStock()])
      .then(([m, a]) => {
        if (!mounted) return;
        setMetrics(m);
        setAlertas(a);
      })
      .catch((e) => mounted && setError(getErrorMessage(e)));
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <p className="text-[var(--color-cinnabar-500)] text-sm">
        Error al cargar el panel: {error}
      </p>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center gap-3 text-[var(--color-ink-700)]">
        <Spinner label="cargando métricas" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          mark="01"
          label="Ventas de hoy"
          value={metrics.ventasHoy.total}
          delta={metrics.ventasHoy.variacion}
        />
        <MetricCard
          mark="02"
          label="Ventas del mes"
          value={metrics.ventasMes.total}
          delta={metrics.ventasMes.variacion}
        />
        <MetricCard
          mark="03"
          label="Ventas del año"
          value={metrics.ventasAnio}
          format="money"
        />
        <MetricCard
          mark="04"
          label="Stock crítico"
          value={metrics.stockBajo}
          format="integer"
        />
      </section>

      <section className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-2 lg:grid-cols-3">
        <div className="surface p-7">
          <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">Catálogo</p>
          <p className="num text-3xl mt-2 text-[var(--color-ink-900)]">
            {fmt.integer(metrics.totalProductos)}
          </p>
          <p className="text-[0.7rem] text-[var(--color-ink-700)] mt-1">
            productos registrados
          </p>
        </div>
        <div className="surface p-7">
          <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">Cartera</p>
          <p className="num text-3xl mt-2 text-[var(--color-ink-900)]">
            {fmt.integer(metrics.totalClientes)}
          </p>
          <p className="text-[0.7rem] text-[var(--color-ink-700)] mt-1">
            clientes activos
          </p>
        </div>
        <div className="surface p-7">
          <p className="mark text-[0.6rem] text-[var(--color-ink-600)]">Hoy</p>
          <p className="num text-3xl mt-2 text-[var(--color-ink-900)]">
            {fmt.integer(metrics.ventasHoy.cantidad)}
          </p>
          <p className="text-[0.7rem] text-[var(--color-ink-700)] mt-1">
            documentos emitidos
          </p>
        </div>
      </section>

      {alertas.length > 0 && (
        <section className="surface p-7">
          <header className="flex items-baseline justify-between mb-6">
            <h2 className="display text-2xl text-[var(--color-ink-900)]">
              Alertas de stock
            </h2>
            <span className="mark text-[0.55rem]">¶ Prioridad</span>
          </header>
          <ul className="divide-y divide-[var(--color-tint-ink-soft)]">
            {alertas.map((a, i) => (
              <li
                key={a.producto ?? i}
                className="flex items-baseline justify-between py-3 reveal"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div>
                  <p className="text-sm text-[var(--color-ink-900)]">
                    {a.descripcion ?? a.producto}
                  </p>
                  <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
                    {a.producto}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-sm text-[var(--color-cinnabar-500)]">
                    {fmt.integer(a.stock_actual)} / {fmt.integer(a.stock_minimo)}
                  </p>
                  <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
                    faltan {fmt.integer(a.faltante)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
