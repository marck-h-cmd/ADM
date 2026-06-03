const PEN = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const NUM = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const NUM_INT = new Intl.NumberFormat('es-PE');

const DATE = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const DATETIME = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const fmt = {
  money: (n: number | null | undefined): string =>
    n == null ? '—' : PEN.format(n),
  number: (n: number | null | undefined): string =>
    n == null ? '—' : NUM.format(n),
  integer: (n: number | null | undefined): string =>
    n == null ? '—' : NUM_INT.format(n),
  date: (d: string | Date | null | undefined): string => {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    return Number.isNaN(date.getTime()) ? '—' : DATE.format(date);
  },
  datetime: (d: string | Date | null | undefined): string => {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    return Number.isNaN(date.getTime()) ? '—' : DATETIME.format(date);
  },
  percent: (n: number | null | undefined, digits = 1): string => {
    if (n == null) return '—';
    return `${n.toFixed(digits)}%`;
  },
};
