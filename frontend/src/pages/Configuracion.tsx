import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { usePreferencesStore, type DensidadUI, type FormatoFecha, type FormatoMoneda } from '@/store/preferencesStore';
import { useTheme } from '@/hooks/useTheme';
import { Field, Input, Select } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';
import { cn } from '@/utils/helpers';
import type { ThemeMode } from '@/store/themeStore';

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-4 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 hairline transition-colors mt-0.5',
          checked
            ? 'bg-[var(--color-gold-500)] border-[var(--color-gold-500)]'
            : 'bg-transparent',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 transition-all',
            checked
              ? 'left-[1.4rem] bg-[var(--color-ink-50)]'
              : 'left-0.5 bg-[var(--color-ink-700)] group-hover:bg-[var(--color-ink-600)]',
          )}
        />
      </button>
      <div className="flex-1">
        <p className="text-sm text-[var(--color-ink-900)]">{label}</p>
        {description && (
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

function ThemeSelector() {
  const { theme, resolved, setTheme } = useTheme();
  const options: {
    key: ThemeMode;
    label: string;
    mark: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'light',
      label: 'Claro',
      mark: '01',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
          <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.3" />
          <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M8 1.8v1.4" />
            <path d="M8 12.8v1.4" />
            <path d="M1.8 8h1.4" />
            <path d="M12.8 8h1.4" />
            <path d="M3.6 3.6l1 1" />
            <path d="M11.4 11.4l1 1" />
            <path d="M3.6 12.4l1-1" />
            <path d="M11.4 4.6l1-1" />
          </g>
        </svg>
      ),
    },
    {
      key: 'dark',
      label: 'Oscuro',
      mark: '02',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
          <path
            d="M13.2 9.6A5.2 5.2 0 0 1 6.4 2.8a5.4 5.4 0 0 0 6.8 6.8Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      key: 'system',
      label: 'Sistema',
      mark: '03',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <rect
            x="1.8"
            y="2.8"
            width="12.4"
            height="8"
            rx="0.6"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M5.8 13.2h4.4M8 11v2.2"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12.4" cy="4.6" r="0.85" fill="currentColor" />
        </svg>
      ),
    },
  ];
  return (
    <div className="mb-px bg-[var(--color-border-hairline)]">
      <div className="bg-[var(--color-ink-100)] p-5 space-y-3">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <p className="mark text-[0.55rem] text-[var(--color-ink-700)]">
            § Tema de la interfaz
          </p>
          <span className="mark text-[0.5rem] text-[var(--color-ink-600)]">
            activo: {theme === 'system' ? `sistema · ${resolved === 'dark' ? 'oscuro' : 'claro'}` : theme === 'dark' ? 'oscuro' : 'claro'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {options.map((o) => {
            const active = theme === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setTheme(o.key)}
                aria-pressed={active}
                className={cn(
                  'text-[0.7rem] font-sans font-medium uppercase tracking-[0.12em] px-3.5 py-2 hairline transition-all inline-flex items-center gap-2',
                  active
                    ? 'bg-[var(--color-ink-900)] text-[var(--color-ink-50)] border-[var(--color-ink-900)]'
                    : 'text-[var(--color-ink-700)] hover:border-[var(--color-ink-700)] hover:text-[var(--color-ink-900)]',
                )}
              >
                {o.icon}
                {o.label}
              </button>
            );
          })}
        </div>
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          Sistema sigue la preferencia del sistema operativo.
        </p>
      </div>
    </div>
  );
}

export default function Configuracion() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const prefs = usePreferencesStore();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      toast.info('Sesión cerrada', { description: 'Has salido del sistema correctamente.' });
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  const tokenPreview = token
    ? `${token.slice(0, 8)}…${token.slice(-6)}`
    : '—';

  return (
    <div className="space-y-8">
      <header className="reveal">
        <p className="mark text-[0.55rem]">§ 10 — Preferencias</p>
        <h2 className="display text-4xl text-[var(--color-ink-900)] mt-2 tracking-tight">
          Configuración
        </h2>
        <p className="text-sm text-[var(--color-ink-700)] mt-2 max-w-xl">
          Sesión activa, preferencias del sistema e información del entorno.
        </p>
      </header>

      <section
        className="surface p-7 reveal"
        style={{ animationDelay: '60ms' }}
      >
        <header className="flex items-baseline justify-between mb-5">
          <p className="mark text-[0.55rem]">§ I — Sesión activa</p>
          <span className="mark text-[0.5rem] text-[var(--color-jade-500)] inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-jade-500)] pulse-soft" />
            Conectado
          </span>
        </header>

        <div className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-2">
          <div className="bg-[var(--color-ink-100)] p-5 space-y-1.5">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Identificador
            </p>
            <p className="num text-base text-[var(--color-ink-900)]">
              {user?.id ?? '—'}
            </p>
          </div>
          <div className="bg-[var(--color-ink-100)] p-5 space-y-1.5">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Nombre
            </p>
            <p className="text-base text-[var(--color-ink-900)]">
              {user?.nombre ?? '—'}
            </p>
          </div>
          <div className="bg-[var(--color-ink-100)] p-5 space-y-1.5">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Email
            </p>
            <p className="num text-sm text-[var(--color-ink-800)]">
              {user?.email ?? '—'}
            </p>
          </div>
          <div className="bg-[var(--color-ink-100)] p-5 space-y-1.5">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Token de sesión
            </p>
            <p className="num text-sm text-[var(--color-gold-500)] tracking-[0.1em]">
              {tokenPreview}
            </p>
          </div>
        </div>

        <footer className="pt-5 mt-5 hairline-t flex items-center justify-between">
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
            La sesión persiste en este navegador hasta que la cierre o expire
            el token.
          </p>
          <Button
            variant="danger"
            onClick={handleLogout}
            loading={loggingOut}
          >
            Cerrar sesión
          </Button>
        </footer>
      </section>

      <section
        className="surface p-7 reveal"
        style={{ animationDelay: '120ms' }}
      >
        <header className="flex items-baseline justify-between mb-5">
          <p className="mark text-[0.55rem]">§ II — Preferencias</p>
          <button
            type="button"
            onClick={() => prefs.reset()}
            className="mark text-[0.55rem] text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] transition-colors"
          >
            Restablecer ↻
          </button>
        </header>

        <ThemeSelector />

        <div className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-2">
          <div className="bg-[var(--color-ink-100)] p-5 space-y-3">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
              § Densidad de UI
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {(['compacta', 'normal', 'holgada'] as DensidadUI[]).map((d) => {
                const active = prefs.densidad === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => prefs.setDensidad(d)}
                    className={cn(
                      'mark text-[0.55rem] px-3 py-1.5 hairline transition-all capitalize',
                      active
                        ? 'bg-[var(--color-ink-900)] text-[var(--color-ink-50)] border-[var(--color-ink-900)]'
                        : 'text-[var(--color-ink-700)] hover:border-[var(--color-ink-700)]',
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Espaciado entre filas y elementos.
            </p>
          </div>

          <div className="bg-[var(--color-ink-100)] p-5 space-y-3">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
              § Formato de fecha
            </p>
            <Field>
              <Select
                value={prefs.formatoFecha}
                onChange={(e) =>
                  prefs.setFormatoFecha(e.target.value as FormatoFecha)
                }
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY · 15/06/2026</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD · 2026-06-15</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY · 06/15/2026</option>
              </Select>
            </Field>
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Aplicado en tablas, listados y comprobantes.
            </p>
          </div>

          <div className="bg-[var(--color-ink-100)] p-5 space-y-3">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
              § Prefijo monetario
            </p>
            <Field>
              <Select
                value={prefs.formatoMoneda}
                onChange={(e) =>
                  prefs.setFormatoMoneda(e.target.value as FormatoMoneda)
                }
              >
                <option value="S/.">S/. · Sol peruano</option>
                <option value="PEN">PEN · Código ISO</option>
                <option value="US$">US$ · Dólar americano</option>
              </Select>
            </Field>
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Prefijo mostrado en importes y totales.
            </p>
          </div>

          <div className="bg-[var(--color-ink-100)] p-5 space-y-5">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mb-1.5">
              § Comportamiento
            </p>
            <Toggle
              checked={prefs.autoLogout}
              onChange={prefs.setAutoLogout}
              label="Cerrar sesión por inactividad"
              description="Protege la cuenta cuando el navegador queda desatendido."
            />
            {prefs.autoLogout && (
              <Field mark="T" label="Minutos de inactividad" hint="Entre 5 y 120">
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={prefs.minutosAutoLogout}
                  onChange={(e) =>
                    prefs.setMinutosAutoLogout(Number(e.target.value))
                  }
                  className="num"
                />
              </Field>
            )}
            <Toggle
              checked={prefs.sonidos}
              onChange={prefs.setSonidos}
              label="Sonidos de feedback"
              description="Tonos suaves al registrar comprobantes."
            />
          </div>
        </div>
      </section>

      <section
        className="surface p-7 reveal"
        style={{ animationDelay: '240ms' }}
      >
        <header className="flex items-baseline justify-between mb-5">
          <p className="mark text-[0.55rem]">§ IV — Sistema</p>
          <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
            № v1.0.0
          </p>
        </header>

        <div className="grid gap-px bg-[var(--color-border-hairline)] md:grid-cols-4">
          <div className="bg-[var(--color-ink-100)] p-5 space-y-1">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Aplicación
            </p>
            <p className="display text-base text-[var(--color-ink-900)]">
              {APP_NAME}
            </p>
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
              {APP_TAGLINE}
            </p>
          </div>
          <div className="bg-[var(--color-ink-100)] p-5 space-y-1">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Build
            </p>
            <p className="num text-base text-[var(--color-ink-900)]">v1.0.0</p>
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
              Producción
            </p>
          </div>
          <div className="bg-[var(--color-ink-100)] p-5 space-y-1">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Stack
            </p>
            <p className="text-sm text-[var(--color-ink-900)]">
              React 19 · TS 6
            </p>
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
              Express + PostgreSQL
            </p>
          </div>
          <div className="bg-[var(--color-ink-100)] p-5 space-y-1">
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
              Zona horaria
            </p>
            <p className="num text-base text-[var(--color-ink-900)]">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
            <p className="mark text-[0.5rem] text-[var(--color-ink-600)] mt-1">
              Hora local
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
