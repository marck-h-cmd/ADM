export const TIPO_DOC_LABELS: Record<string, string> = {
  B: 'Boleta de Venta',
  F: 'Factura',
  C: 'Compra',
  N: 'Nota de Crédito',
};

export const TIPO_DOC_SHORT: Record<string, string> = {
  B: 'BOL',
  F: 'FAC',
  C: 'COM',
  N: 'NC',
};

export const TIPO_CLIENTE_LABELS: Record<string, string> = {
  V: 'VIP',
  E: 'Empresa',
  P: 'Persona',
  R: 'Regular',
};

export const GENERO_LABELS: Record<string, string> = {
  M: 'Masculino',
  F: 'Femenino',
};

export const FORMA_PAGO_LABELS: Record<string, string> = {
  E: 'Efectivo',
  T: 'Tarjeta',
  Y: 'Yape/Plin',
  C: 'Crédito',
};

export const MEDIO_PAGO_LABELS: Record<string, string> = {
  E: 'Efectivo',
  T: 'Tarjeta',
  Y: 'Yape',
  P: 'Plin',
  T2: 'Transferencia',
};

export const ESTADO_DOC_LABELS: Record<string, string> = {
  C: 'Cobrado',
  P: 'Pendiente',
  A: 'Anulado',
};

export const MEDIDAS = ['UNIDAD', 'KG', 'LT', 'MT', 'CAJA', 'DOC', 'SERV'] as const;
export type UnidadMedida = (typeof MEDIDAS)[number];

export const APP_NAME = 'Tenebrosa';
export const APP_TAGLINE = 'Sistema de Gestión';
