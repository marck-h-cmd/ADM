import type { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

type Tone = 'neutral' | 'gold' | 'jade' | 'cinnabar';

const tones: Record<Tone, string> = {
  neutral: 'text-[var(--color-ink-800)] hairline-b',
  gold: 'text-[var(--color-gold-500)]',
  jade: 'text-[var(--color-jade-500)]',
  cinnabar: 'text-[var(--color-cinnabar-500)]',
};

interface AlertProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'neutral', children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'px-4 py-3 text-sm font-sans',
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
