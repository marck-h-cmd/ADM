export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').substring(0, 19);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-PE').format(num);
};

export const calcularIGV = (subtotal: number, porcentaje: number = 18): number => {
  return subtotal * (porcentaje / 100);
};

export const calcularTotal = (subtotal: number, igvPorcentaje: number = 18): number => {
  const igv = calcularIGV(subtotal, igvPorcentaje);
  return subtotal + igv;
};

export const generarNumeroDocumento = (tipo: string, correlativo: number): string => {
  const serie = tipo === 'B' ? 'B001' : 'F001';
  const numero = correlativo.toString().padStart(8, '0');
  return `${serie}${numero}`;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const removeAccents = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const paginate = <T>(items: T[], page: number, limit: number): { items: T[]; total: number; page: number; limit: number; pages: number } => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedItems = items.slice(start, end);
  
  return {
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    pages: Math.ceil(items.length / limit)
  };
};