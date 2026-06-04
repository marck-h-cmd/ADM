import { cn } from '@/utils/helpers';
import { fmt } from '@/utils/formatters';
import { TIPO_CLIENTE_LABELS } from '@/utils/constants';
import type { Cliente } from '@/types/cliente.types';

export function TipoClienteChip({
  tipo,
  size = 'md',
}: {
  tipo: Cliente['TipoCliente'];
  size?: 'sm' | 'md';
}) {
  const variants = {
    V: 'text-[var(--color-gold-500)] border-[var(--color-gold-500)]/40 bg-[var(--color-tint-gold)]',
    E: 'text-[var(--color-ink-900)] border-[var(--color-ink-700)]/30 bg-[var(--color-tint-ink)]',
    P: 'text-[var(--color-jade-500)] border-[var(--color-jade-500)]/40 bg-[var(--color-tint-jade)]',
    R: 'text-[var(--color-ink-600)] border-[var(--color-ink-700)]/20 bg-transparent',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border hairline',
        size === 'sm' ? 'px-1.5 py-0.5 text-[0.55rem]' : 'px-2 py-0.5 text-[0.6rem]',
        'mark tracking-[0.12em]',
        variants[tipo],
      )}
    >
      <span
        className={cn(
          'h-1 w-1 rounded-full',
          tipo === 'V'
            ? 'bg-[var(--color-gold-500)]'
            : tipo === 'P'
              ? 'bg-[var(--color-jade-500)]'
              : tipo === 'E'
                ? 'bg-[var(--color-ink-700)]'
                : 'bg-[var(--color-ink-600)]',
        )}
      />
      {TIPO_CLIENTE_LABELS[tipo] ?? tipo}
    </span>
  );
}

export function CalificacionBadge({
  calificacion,
}: {
  calificacion: Cliente['Calificacion'];
}) {
  if (!calificacion) {
    return (
      <span className="mark text-[0.55rem] text-[var(--color-ink-600)]">
        —
      </span>
    );
  }
  const tones = {
    A: { dot: 'bg-[var(--color-jade-500)]', text: 'text-[var(--color-jade-500)]' },
    B: { dot: 'bg-[var(--color-gold-500)]', text: 'text-[var(--color-gold-500)]' },
    C: { dot: 'bg-[var(--color-cinnabar-500)]', text: 'text-[var(--color-cinnabar-500)]' },
  } as const;
  const labels = { A: 'Excelente', B: 'Aceptable', C: 'Riesgo' } as const;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-1.5 w-1.5 rounded-full', tones[calificacion].dot)} />
      <span className={cn('mark text-[0.55rem]', tones[calificacion].text)}>
        {calificacion} · {labels[calificacion]}
      </span>
    </span>
  );
}

export function CreditGauge({
  saldo,
  tope,
  size = 'md',
}: {
  saldo: number;
  tope: number;
  size?: 'sm' | 'md';
}) {
  const nSaldo = Number(saldo) || 0;
  const nTope = Number(tope) || 0;
  const pct = nTope > 0 ? Math.min(100, Math.max(0, (nSaldo / nTope) * 100)) : 0;
  const tones = {
    healthy: 'bg-[var(--color-jade-500)]',
    caution: 'bg-[var(--color-gold-500)]',
    overflow: 'bg-[var(--color-cinnabar-500)]',
    none: 'bg-[var(--color-ink-700)]/30',
  } as const;
  const tone = nTope === 0 ? 'none' : pct < 50 ? 'healthy' : pct < 80 ? 'caution' : 'overflow';
  const disponible = Math.max(0, nTope - nSaldo);

  return (
    <div className="space-y-1.5 min-w-[140px]">
      <div className="flex items-baseline justify-between">
        <p className="num text-sm text-[var(--color-ink-900)]">
          {fmt.money(nSaldo)}
        </p>
        <p className="mark text-[0.5rem] text-[var(--color-ink-600)]">
          {nTope > 0 ? fmt.percent(pct) : '—'}
        </p>
      </div>
      <div
        className={cn(
          'w-full bg-[var(--color-border-hairline)] relative overflow-hidden',
          size === 'sm' ? 'h-1' : 'h-1.5',
        )}
      >
        <div
          className={cn('h-full transition-all duration-700', tones[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between">
        <p className="mark text-[0.45rem] text-[var(--color-ink-600)]">
          {nTope > 0 ? `libre ${fmt.money(disponible)}` : 'sin línea'}
        </p>
        <p className="mark text-[0.45rem] text-[var(--color-ink-600)]">
          tope {fmt.money(nTope)}
        </p>
      </div>
    </div>
  );
}

export function GeneroBadge({ genero }: { genero?: Cliente['genero'] }) {
  if (!genero) return <span className="mark text-[0.55rem] text-[var(--color-ink-600)]">—</span>;
  return (
    <span className="mark text-[0.55rem] text-[var(--color-ink-700)]">
      {genero === 'M' ? 'M' : 'F'}
    </span>
  );
}
