import { cn } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeMode } from '@/store/themeStore';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Compact toggle: cycles light → dark → system → light.
 * Shows a sun / moon icon that reflects the *resolved* theme.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolved, setTheme } = useTheme();

  const next: ThemeMode =
    theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';

  const label =
    theme === 'system'
      ? `Tema del sistema (${resolved === 'dark' ? 'oscuro' : 'claro'}) — clic para claro`
      : `Tema ${resolved === 'dark' ? 'oscuro' : 'claro'} — clic para ${next === 'system' ? 'sistema' : next === 'dark' ? 'oscuro' : 'claro'}`;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={cn(
        'relative h-9 w-9 grid place-items-center hairline text-[var(--color-ink-800)]',
        'hover:text-[var(--color-gold-500)] hover:border-[var(--color-gold-500)] transition-colors shrink-0',
        className,
      )}
    >
      <SunIcon className="absolute h-3.5 w-3.5 transition-all duration-300 ease-out"
        style={{
          opacity: resolved === 'light' ? 1 : 0,
          transform: resolved === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
        }}
      />
      <MoonIcon className="absolute h-3.5 w-3.5 transition-all duration-300 ease-out"
        style={{
          opacity: resolved === 'dark' ? 1 : 0,
          transform: resolved === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
        }}
      />
    </button>
  );
}

function SunIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} style={style} aria-hidden="true">
      <circle cx="8" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.3" />
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M8 1.6v1.6" />
        <path d="M8 12.8v1.6" />
        <path d="M1.6 8h1.6" />
        <path d="M12.8 8h1.6" />
        <path d="M3.5 3.5l1.1 1.1" />
        <path d="M11.4 11.4l1.1 1.1" />
        <path d="M3.5 12.5l1.1-1.1" />
        <path d="M11.4 4.6l1.1-1.1" />
      </g>
    </svg>
  );
}

function MoonIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} style={style} aria-hidden="true">
      <path
        d="M13.4 9.6A5.4 5.4 0 0 1 6.4 2.6a5.5 5.5 0 0 0 7 7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
