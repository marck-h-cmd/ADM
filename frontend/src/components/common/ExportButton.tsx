import { useState } from 'react';
import { exportCSV } from '@/utils/export';
import { cn } from '@/utils/helpers';

interface ExportButtonProps {
  filename: string;
  rows: Record<string, unknown>[];
  columns?: string[];
  disabled?: boolean;
  label?: string;
}

export function ExportButton({
  filename,
  rows,
  columns,
  disabled = false,
  label = 'Exportar',
}: ExportButtonProps) {
  const [flash, setFlash] = useState(false);

  function handle() {
    if (rows.length === 0) return;
    exportCSV(filename, rows, columns);
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={disabled || rows.length === 0}
      className={cn(
        'mark text-[0.55rem] px-3 py-1.5 hairline transition-all inline-flex items-center gap-2',
        disabled || rows.length === 0
          ? 'text-[var(--color-ink-700)] opacity-40 cursor-not-allowed'
          : 'text-[var(--color-ink-800)] hover:border-[var(--color-ink-700)] hover:text-[var(--color-ink-900)]',
        flash && 'text-[var(--color-jade-500)] border-[var(--color-jade-500)]',
      )}
      title={`Exportar ${rows.length} filas a CSV`}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {flash ? 'Exportado' : label}
    </button>
  );
}
