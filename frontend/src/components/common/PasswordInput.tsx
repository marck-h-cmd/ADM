import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrength?: boolean;
  value?: string;
}

const baseInput =
  'w-full bg-[var(--color-ink-100)] text-[var(--color-ink-900)] ' +
  'border border-[var(--color-border-hairline)] pl-3.5 pr-11 h-10 ' +
  'font-sans text-sm placeholder:text-[var(--color-ink-600)] ' +
  'transition-colors duration-200 ' +
  'hover:border-[var(--color-border-hairline-strong)] ' +
  'focus:outline-none focus:border-[var(--color-gold-500)] ' +
  'focus:bg-[var(--color-ink-200)]';

function passwordStrength(v: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
  tone: 'ink' | 'cinnabar' | 'gold' | 'jade';
} {
  if (!v) return { score: 0, label: '—', tone: 'ink' };
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
  if (score === 0) return { score: 0, label: 'Muy débil', tone: 'cinnabar' };
  if (score === 1) return { score: 1, label: 'Débil', tone: 'cinnabar' };
  if (score === 2) return { score: 2, label: 'Aceptable', tone: 'gold' };
  return { score: 3, label: 'Fuerte', tone: 'jade' };
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className, showStrength = false, value, ...rest },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const strength = passwordStrength(String(value ?? ''));
    const toneColors = {
      ink: 'text-[var(--color-ink-600)]',
      cinnabar: 'text-[var(--color-cinnabar-500)]',
      gold: 'text-[var(--color-gold-500)]',
      jade: 'text-[var(--color-jade-500)]',
    } as const;
    const barTone = {
      ink: 'bg-[var(--color-ink-700)]/30',
      cinnabar: 'bg-[var(--color-cinnabar-500)]',
      gold: 'bg-[var(--color-gold-500)]',
      jade: 'bg-[var(--color-jade-500)]',
    } as const;

    return (
      <div className="space-y-1.5">
        <div className="relative">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            value={value}
            className={cn(baseInput, className)}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-600)] hover:text-[var(--color-gold-500)] transition-colors"
          >
            {visible ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M3 3l18 18M10.7 6.2A9.7 9.7 0 0 1 12 6c5 0 9 4 10 6-.5 1-1.7 2.6-3.4 3.9M6.6 6.6C4.1 8.1 2.5 10.4 2 12c1 2 5 6 10 6 1.5 0 2.9-.3 4.1-.8M9.9 9.9a3 3 0 1 0 4.2 4.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {showStrength && value && (
          <div className="space-y-1">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-0.5 flex-1 transition-colors',
                    i < strength.score ? barTone[strength.tone] : 'bg-[var(--color-ink-700)]/30',
                  )}
                />
              ))}
            </div>
            <p
              className={cn(
                'mark text-[0.5rem]',
                toneColors[strength.tone],
              )}
            >
              {strength.label}
            </p>
          </div>
        )}
      </div>
    );
  },
);
