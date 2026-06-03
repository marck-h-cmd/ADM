import type { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render: (row: T, idx: number) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, idx: number) => string;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

const align = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function Table<T>({ columns, rows, rowKey, empty, onRowClick, className }: TableProps<T>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="hairline-b">
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  'py-3 px-4 mark text-[0.6rem] font-normal',
                  align[c.align ?? 'left'],
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-[var(--color-ink-600)] text-sm">
                {empty ?? 'Sin registros.'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'hairline-b transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-[var(--color-ink-300)]',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'py-3.5 px-4 text-sm text-[var(--color-ink-800)]',
                      align[c.align ?? 'left'],
                    )}
                  >
                    {c.render(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
