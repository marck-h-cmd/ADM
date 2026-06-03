import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePreferencesStore, type DensidadUI, type FormatoFecha, type FormatoMoneda } from '@/store/preferencesStore';
import { Field, Input, Select } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { PasswordInput } from '@/components/common/PasswordInput';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';
import { cn } from '@/utils/helpers';

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

function PasswordForm() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'jade' | 'cinnabar' | 'gold';
    msg: string;
  } | null>(null);

  const errors = {
    actual: !actual ? 'Requerida' : null,
    nueva:
      nueva.length < 8
        ? 'Mínimo 8 caracteres'
        : nueva === actual
          ? 'Debe ser diferente a la actual'
          : null,
    confirm: confirm !== nueva ? 'No coincide con la nueva' : null,
  };
  const hasErrors = !!errors.actual || !!errors.nueva || !!errors.confirm;

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (hasErrors) return;
    setSubmitting(true);
    setFeedback(null);
    // Backend actual no expone endpoint de cambio de contraseña
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setFeedback({
      tone: 'gold',
      msg: 'El backend actual no expone endpoint de cambio de contraseña. La validación pasó correctamente.',
    });
    setActual('');
    setNueva('');
    setConfirm('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {feedback && <Alert tone={feedback.tone}>{feedback.msg}</Alert>}

      <Field mark="01" label="Contraseña actual" required error={errors.actual ?? undefined}>
        <PasswordInput
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </Field>

      <Field
        mark="02"
        label="Nueva contraseña"
        required
        error={errors.nueva ?? undefined}
        hint="Mínimo 8 caracteres · mayúscula, minúscula, número y símbolo"
      >
        <PasswordInput
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          showStrength
        />
      </Field>

      <Field
        mark="03"
        label="Confirmar nueva contraseña"
        required
        error={errors.confirm ?? undefined}
      >
        <PasswordInput
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field>

      <div className="pt-2 hairline-t flex items-center justify-end">
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={hasErrors}
        >
          Actualizar contraseña
        </Button>
      </div>
    </form>
  );
}

export default function Configuracion() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const prefs = usePreferencesStore();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
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
          Sesión activa, credenciales, preferencias del sistema e información
          del entorno.
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

        <div className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-2">
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
          <p className="mark text-[0.55rem]">§ II — Cambiar contraseña</p>
          <span className="mark text-[0.5rem] text-[var(--color-ink-600)]">
            JWT local
          </span>
        </header>
        <PasswordForm />
      </section>

      <section
        className="surface p-7 reveal"
        style={{ animationDelay: '180ms' }}
      >
        <header className="flex items-baseline justify-between mb-5">
          <p className="mark text-[0.55rem]">§ III — Preferencias</p>
          <button
            type="button"
            onClick={() => prefs.reset()}
            className="mark text-[0.55rem] text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)] transition-colors"
          >
            Restablecer ↻
          </button>
        </header>

        <div className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-2">
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

        <div className="grid gap-px bg-[rgba(232,230,224,0.08)] md:grid-cols-4">
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
