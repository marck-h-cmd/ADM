export interface KardexItem {
  documento: string;
  tipomov: 'INGRESO' | 'SALIDA';
  fecha: string;
  cantidad: number;
  stock: number;
  documento_ref?: string;
  proveedor?: string;
  personal?: string;
}

export interface StockResumenItem {
  marca: string;
  totalProductos?: number;
  totalStock?: number;
  valorTotal?: number;
  estado?: string;
  [key: string]: unknown;
}

export interface ValorizacionItem {
  [key: string]: unknown;
}

export interface RotacionItem {
  producto?: string;
  descripcion?: string;
  [key: string]: unknown;
}
