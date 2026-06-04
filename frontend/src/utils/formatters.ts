import { usePreferencesStore, type FormatoFecha, type FormatoMoneda } from '@/store/preferencesStore';

const NUM = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const NUM_INT = new Intl.NumberFormat('es-PE');

/**
 * Formateador numérico puro (sin `style: 'currency'`) — evita que
 * `Intl` anteponga su propio símbolo y termine duplicándose con
 * el prefijo elegido en preferencias.
 */
const MONEY_NUM = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE_FORMATS: Record<FormatoFecha, Intl.DateTimeFormatOptions> = {
  'DD/MM/YYYY': { day: '2-digit', month: '2-digit', year: 'numeric' },
  'YYYY-MM-DD': { year: 'numeric', month: '2-digit', day: '2-digit' },
  'MM/DD/YYYY': { month: '2-digit', day: '2-digit', year: 'numeric' },
};

const DATETIME_FORMATS: Record<FormatoFecha, Intl.DateTimeFormatOptions> = {
  'DD/MM/YYYY': { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  'YYYY-MM-DD': { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' },
  'MM/DD/YYYY': { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
};

function moneyPrefix(tipo: FormatoMoneda): string {
  switch (tipo) {
    case 'PEN': return 'PEN ';
    case 'US$': return 'US$ ';
    case 'S/.':
    default:
      return 'S/. ';
  }
}

export const fmt = {
  money: (n: number | null | undefined): string => {
    if (n == null) return '—';
    const { formatoMoneda } = usePreferencesStore.getState();
    return `${moneyPrefix(formatoMoneda)}${MONEY_NUM.format(n)}`;
  },
  number: (n: number | null | undefined): string =>
    n == null ? '—' : NUM.format(n),
  integer: (n: number | null | undefined): string =>
    n == null ? '—' : NUM_INT.format(n),
  date: (d: string | Date | null | undefined): string => {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return '—';
    const { formatoFecha } = usePreferencesStore.getState();
    return new Intl.DateTimeFormat('es-PE', DATE_FORMATS[formatoFecha]).format(date);
  },
  datetime: (d: string | Date | null | undefined): string => {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return '—';
    const { formatoFecha } = usePreferencesStore.getState();
    return new Intl.DateTimeFormat('es-PE', DATETIME_FORMATS[formatoFecha]).format(date);
  },
  percent: (n: number | null | undefined, digits = 1): string => {
    if (n == null) return '—';
    return `${n.toFixed(digits)}%`;
  },
};
