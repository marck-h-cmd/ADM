export interface Producto {
  Producto: string;
  Marca: string;
  MarcaDesc?: string;
  Descripcion: string;
  StockAc: number;
  StockMax: number;
  StockMin: number;
  PrecVenta: number;
  PrecCosto: number;
  Peso: number;
  ConIgv: boolean;
  UniMed: string;
}

export type CreateProductoDTO = {
  Producto: string;
  Marca: string;
  Descripcion: string;
  StockAc?: number;
  StockMax?: number;
  StockMin?: number;
  PrecVenta: number;
  PrecCosto: number;
  Peso?: number;
  ConIgv?: boolean;
  UniMed?: string;
};

export type UpdateProductoDTO = Partial<{
  Descripcion: string;
  PrecVenta: number;
  PrecCosto: number;
  StockMax: number;
  StockMin: number;
  Marca: string;
  UniMed: string;
  ConIgv: boolean;
  Peso: number;
}>;

export interface ProductoStockCritico {
  producto: string;
  descripcion: string;
  stock_actual: number;
  stock_minimo: number;
  faltante: number;
  [key: string]: unknown;
}

export interface TopProducto {
  Producto?: string;
  descripcion?: string;
  cantidad_vendida?: number;
  total_vendido?: number;
  [key: string]: unknown;
}
