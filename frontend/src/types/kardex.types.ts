export interface KardexItem {
  documento: string;
  tipomov: string;
  fecha: string;
  cantidad: number;
  stock_inicial: number;
  stock: number;
  saldo_inicial: number;
  cant_saldo: number;
  saldo_acumulado: number;
  referencia: string;
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
