import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';

function routeTitle(path: string): { mark: string; title: string } {
  if (path === '/') return { mark: '§ 01', title: 'Panel de control' };
  if (path.startsWith('/productos'))
    return { mark: '§ 02', title: 'Productos' };
  if (path.startsWith('/clientes'))
    return { mark: '§ 03', title: 'Clientes' };
  if (path === '/ventas') return { mark: '§ 04', title: 'Nueva venta' };
  if (path.startsWith('/ventas/historial'))
    return { mark: '§ 05', title: 'Historial de ventas' };
  if (path.startsWith('/compras'))
    return { mark: '§ 06', title: 'Compras' };
  if (path.startsWith('/kardex'))
    return { mark: '§ 07', title: 'Kardex' };
  if (path.startsWith('/reportes'))
    return { mark: '§ 08', title: 'Reportes' };
  if (path.startsWith('/configuracion'))
    return { mark: '§ 09', title: 'Configuración' };
  return { mark: '§', title: 'Tenebrosa' };
}

export function Header() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const t = routeTitle(pathname);

  const initials = (user?.nombre ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <header className="hairline-b bg-[var(--color-ink-50)]/60 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6 px-8 lg:px-12 py-5">
        <div className="flex items-baseline gap-3">
          <span className="mark">{t.mark}</span>
          <h1 className="display text-2xl text-[var(--color-ink-900)]">
            {t.title}
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <span className="hidden md:flex items-center gap-2 text-[0.65rem] text-[var(--color-jade-500)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-jade-500)] pulse-soft" />
            <span className="mark text-[0.55rem]">en línea</span>
          </span>

          <div className="flex items-center gap-3 pl-5 hairline-l" style={{ borderColor: 'rgba(232,230,224,0.08)' }}>
            <div className="hidden md:block text-right leading-tight">
              <p className="text-sm text-[var(--color-ink-900)]">
                {user?.nombre ?? '—'}
              </p>
              <p className="text-[0.65rem] text-[var(--color-ink-600)]">
                {user?.email ?? ''}
              </p>
            </div>
            <div className="h-9 w-9 grid place-items-center hairline text-[var(--color-gold-500)] num text-xs">
              {initials || '◊'}
            </div>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
