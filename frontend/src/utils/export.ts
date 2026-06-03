/**
 * Exporta datos tabulares a CSV con BOM UTF-8.
 * Crea un Blob y dispara la descarga vía <a download>.
 */
export function exportCSV(
  filename: string,
  rows: Record<string, unknown>[],
  columns?: string[],
) {
  if (rows.length === 0) {
    return;
  }

  const cols = columns ?? Object.keys(rows[0]);

  const escape = (val: unknown): string => {
    if (val == null) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    cols.join(','),
    ...rows.map((row) => cols.map((c) => escape(row[c])).join(',')),
  ];

  const csv = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
