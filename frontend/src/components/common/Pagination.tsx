import { cn } from '@/utils/helpers';

interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pages, onChange, className }: PaginationProps) {
  if (pages <= 1) return null;
  const canPrev = page > 1;
  const canNext = page < pages;

  const pageItems = (() => {
    const set = new Set<number>([1, pages, page - 1, page, page + 1]);
    return [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  })();

  return (
    <nav
      className={cn('flex items-center justify-between gap-4 mt-6', className)}
      aria-label="Paginación"
    >
      <span className="mark text-[0.6rem]">
        Página {page} / {pages}
      </span>

      <div className="flex items-center gap-1">
        <button
          disabled={!canPrev}
          onClick={() => onChange(page - 1)}
          className="h-8 w-8 grid place-items-center text-[var(--color-ink-700)] hairline hover:text-[var(--color-gold-500)] hover:border-[var(--color-gold-500)] disabled:opacity-30 disabled:hover:text-[var(--color-ink-700)] disabled:hover:border-[rgba(232,230,224,0.08)] transition"
          aria-label="Anterior"
        >
          ‹
        </button>

        {pageItems.map((p, i) => {
          const prev = pageItems[i - 1];
          const gap = prev !== undefined && p - prev > 1;
          return (
            <span key={p} className="flex items-center">
              {gap && <span className="px-1 text-[var(--color-ink-600)]">···</span>}
              <button
                onClick={() => onChange(p)}
                className={cn(
                  'h-8 min-w-[2rem] px-2 num text-xs transition',
                  p === page
                    ? 'bg-[var(--color-gold-500)] text-[var(--color-ink-50)]'
                    : 'text-[var(--color-ink-700)] hairline hover:text-[var(--color-gold-500)] hover:border-[var(--color-gold-500)]',
                )}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          disabled={!canNext}
          onClick={() => onChange(page + 1)}
          className="h-8 w-8 grid place-items-center text-[var(--color-ink-700)] hairline hover:text-[var(--color-gold-500)] hover:border-[var(--color-gold-500)] disabled:opacity-30 disabled:hover:text-[var(--color-ink-700)] disabled:hover:border-[rgba(232,230,224,0.08)] transition"
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>
    </nav>
  );
}
