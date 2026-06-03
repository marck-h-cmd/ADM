import type { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

export interface TabItem {
  key: string;
  label: string;
  mark?: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  right?: ReactNode;
}

export function Tabs({ items, active, onChange, right }: TabsProps) {
  return (
    <div className="hairline-b">
      <div className="flex items-end gap-1 overflow-x-auto">
        {items.map((it) => {
          const isActive = it.key === active;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onChange(it.key)}
              className={cn(
                'group flex items-baseline gap-2 px-5 py-3 transition-colors relative',
                isActive
                  ? 'text-[var(--color-ink-900)]'
                  : 'text-[var(--color-ink-600)] hover:text-[var(--color-ink-800)]',
              )}
            >
              {it.mark && (
                <span className="mark text-[0.5rem] text-[var(--color-ink-600)]">
                  {it.mark}
                </span>
              )}
              <span
                className={cn(
                  'text-sm tracking-wide',
                  isActive
                    ? 'display text-base text-[var(--color-ink-900)]'
                    : 'font-sans',
                )}
              >
                {it.label}
              </span>
              {it.count !== undefined && (
                <span
                  className={cn(
                    'num text-[0.6rem] px-1.5 py-0.5 tracking-tight',
                    isActive
                      ? 'text-[var(--color-gold-500)]'
                      : 'text-[var(--color-ink-600)]',
                  )}
                >
                  {it.count}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[var(--color-gold-500)]" />
              )}
            </button>
          );
        })}
        {right && <div className="ml-auto pb-3 pl-4">{right}</div>}
      </div>
    </div>
  );
}
