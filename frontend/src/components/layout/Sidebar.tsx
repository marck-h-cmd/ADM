import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { APP_NAME } from '@/utils/constants';

interface NavItem {
  to: string;
  label: string;
  num: string;
  end?: boolean;
}

const items: NavItem[] = [
  { to: '/', num: '01', label: 'Panel', end: true },
  { to: '/productos', num: '02', label: 'Productos' },
  { to: '/clientes', num: '03', label: 'Clientes' },
  { to: '/ventas', num: '04', label: 'Ventas' },
  { to: '/ventas/historial', num: '05', label: 'Historial' },
  { to: '/compras', num: '06', label: 'Compras' },
  { to: '/kardex', num: '07', label: 'Kardex' },
  { to: '/reportes', num: '08', label: 'Reportes' },
  { to: '/configuracion', num: '09', label: 'Configuración' },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[var(--color-ink-100)] hairline-r">
      <div className="px-7 py-8 hairline-b">
        <div className="flex items-baseline gap-2">
          <span className="display text-3xl text-[var(--color-ink-900)] tracking-tight">
            {APP_NAME}
          </span>
        </div>
        <p className="mark text-[0.55rem] mt-2 text-[var(--color-ink-600)]">
          § Sistema de Gestión
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <p className="mark text-[0.55rem] px-4 mb-3 text-[var(--color-ink-600)]">
          ¶ Navegación
        </p>
        <ul className="space-y-0.5">
          {items.map((it, i) => (
            <li
              key={it.to}
              className="reveal"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <NavLink
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 px-4 py-2.5 transition-colors relative',
                    isActive
                      ? 'text-[var(--color-gold-500)] bg-[var(--color-ink-200)]'
                      : 'text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)] hover:bg-[var(--color-ink-200)]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[var(--color-gold-500)]" />
                    )}
                    <span className="num text-[0.65rem] text-[var(--color-ink-600)] w-5">
                      {it.num}
                    </span>
                    <span className="font-sans text-sm tracking-wide">
                      {it.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-7 py-5 hairline-t">
        <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">№ v1.0.0</p>
        <p className="text-[0.65rem] text-[var(--color-ink-600)] mt-1.5 leading-relaxed">
          Control de inventario
          <br />y ventas.
        </p>
      </div>
    </aside>
  );
}
