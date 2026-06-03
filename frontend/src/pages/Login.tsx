import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { Field, Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { APP_NAME } from '@/utils/constants';

interface LocationState {
  from?: { pathname?: string };
}

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login({ username, password });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const name = useAuthStore.getState().user?.nombre?.split(' ')[0] ?? '';
    toast.success(
      'Sesión iniciada',
      { description: name ? `Bienvenido de vuelta, ${name}.` : undefined },
    );
    navigate(from, { replace: true });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-[var(--color-ink-50)]">
      {/* Left — editorial panel */}
      <section className="relative hidden lg:flex flex-col justify-between p-14 bg-[var(--color-ink-100)] hairline-r overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(232,230,224,0.6) 0 1px, transparent 1px 64px), repeating-linear-gradient(90deg, rgba(232,230,224,0.6) 0 1px, transparent 1px 64px)',
          }}
        />

        <header className="relative flex items-baseline gap-3">
          <span className="mark text-[0.55rem]">§ MMXXVI</span>
          <span className="display text-2xl text-[var(--color-ink-900)]">
            {APP_NAME}
          </span>
        </header>

        <div className="relative space-y-10">
          <div className="space-y-3">
            <p className="mark text-[0.55rem] text-[var(--color-ink-600)]">
              ¶ Vol. I — Sistema de Gestión
            </p>
            <h2 className="display text-[5.5rem] leading-[0.95] text-[var(--color-ink-900)] tracking-tight text-balance">
              El archivo
              <br />
              <em className="text-[var(--color-gold-500)] not-italic">nocturno</em>
              <br />
              del inventario.
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-[var(--color-ink-700)] mt-6">
              Cada movimiento queda registrado. Cada producto, cada cliente,
              cada venta — trazado en una sola línea de tiempo que respira
              con la noche.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-px bg-[rgba(232,230,224,0.08)] max-w-lg">
            {[
              { k: '01', v: 'Kardex perpetuo' },
              { k: '02', v: 'Stock validado' },
              { k: '03', v: 'Trazabilidad' },
            ].map((m) => (
              <div key={m.k} className="bg-[var(--color-ink-100)] p-4 space-y-1.5">
                <span className="num text-[var(--color-gold-500)] text-xs">
                  {m.k}
                </span>
                <p className="text-[0.7rem] text-[var(--color-ink-700)] leading-snug">
                  {m.v}
                </p>
              </div>
            ))}
          </div>
        </div>

        <footer className="relative flex items-center justify-between text-[0.6rem] text-[var(--color-ink-600)]">
          <span className="mark">№ Edición limitada</span>
          <span className="num">Hora · {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
        </footer>
      </section>

      {/* Right — form */}
      <section className="flex items-center justify-center p-8 lg:p-14">
        <div className="w-full max-w-sm reveal">
          <div className="lg:hidden mb-10 flex items-baseline gap-2">
            <span className="display text-2xl text-[var(--color-ink-900)]">
              {APP_NAME}
            </span>
          </div>

          <div className="space-y-2 mb-10">
            <p className="mark text-[0.55rem]">¶ Acceso</p>
            <h1 className="display text-4xl text-[var(--color-ink-900)]">
              Identifíquese.
            </h1>
            <p className="text-sm text-[var(--color-ink-700)] mt-3 leading-relaxed">
              Ingrese sus credenciales para continuar.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <Field mark="01" label="Correo electrónico" required>
              <Input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario@tenebrosa.com"
                autoComplete="email"
                required
                autoFocus
              />
            </Field>

            <Field mark="02" label="Contraseña" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </Field>

            {error && (
              <Alert tone="cinnabar">{error}</Alert>
            )}

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Verificando' : 'Ingresar'}
            </Button>

            <p className="text-[0.65rem] text-[var(--color-ink-600)] text-center pt-2">
              <span className="mark text-[0.55rem]">Nota — </span>
              Las sesiones se conservan durante 7 días.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
