import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { APP_NAME } from '@/utils/constants';
import { useUiStore } from '@/store/uiStore';

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
  { to: '/ventas/historial', num: '05', label: 'Historial de ventas' },
  { to: '/compras', num: '06', label: 'Compras' },
  { to: '/compras/historial', num: '07', label: 'Historial de compras' },
  { to: '/kardex', num: '08', label: 'Kardex' },
  { to: '/reportes', num: '09', label: 'Reportes' },
];

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebar = useUiStore((s) => s.setSidebar);
  const { pathname } = useLocation();

  useEffect(() => {
    setSidebar(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSidebar(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen, setSidebar]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  return (
    <>
      <div
        aria-hidden
        onClick={() => setSidebar(false)}
        className={cn(
          'lg:hidden fixed inset-0 z-30 bg-[var(--color-backdrop)] backdrop-blur-sm',
          'transition-opacity duration-300',
          sidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
      />

      <aside
        aria-label="Navegación principal"
        aria-hidden={!sidebarOpen}
        className={cn(
          'flex flex-col bg-[var(--color-ink-100)] hairline-r',
          'fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-300 ease-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0 lg:transition-none',
        )}
      >
        <div className="px-7 py-8 hairline-b flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="display text-3xl text-[var(--color-ink-900)] tracking-tight">
                {APP_NAME}
              </span>
            </div>
            <p className="mark text-[0.55rem] mt-2 text-[var(--color-ink-600)]">
              § Sistema de Gestión
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebar(false)}
            aria-label="Cerrar menú"
            className="lg:hidden h-8 w-8 grid place-items-center hairline text-[var(--color-ink-700)] hover:text-[var(--color-gold-500)] hover:border-[var(--color-gold-500)] transition-colors shrink-0"
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              className="h-3 w-3"
              aria-hidden="true"
            >
              <path
                d="M3 3l6 6M9 3l-6 6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 min-h-0 px-3 py-6 overflow-y-auto">
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
                  onClick={() => setSidebar(false)}
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

        <div className="px-7 py-5 hairline-t shrink-0">
          <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
            № v1.0.0
          </p>
          <p className="text-[0.65rem] text-[var(--color-ink-600)] mt-1.5 leading-relaxed">
            Control de inventario
            <br />y ventas.
          </p>
        </div>
      </aside>
    </>
  );
}
