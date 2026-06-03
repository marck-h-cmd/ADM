export interface Producto {
  Producto: string;
  Marca: string;
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

export interface Cliente {
  Cliente: string;
  Zona: string;
  Ruc: string | null;
  Nombre: string;
  Direccion: string | null;
  Saldo: number;
  credito: boolean;
  topeCredito: number;
  TipoCliente: 'V' | 'E' | 'P' | 'R';
  Calificacion: 'A' | 'B' | 'C' | null;
  idRepresentante?: number;
  genero?: string;
  idCliente?: number;
}

export interface Documento {
  Documento: string;
  TipoDoc: string;
  Proveedor: string | null;
  Pedido: string | null;
  Cliente: string | null;
  Fecha: Date;
  Estado: 'C' | 'P';
  DocRefer: string | null;
  Personal: string | null;
  pagado: number;
  IdTienda: string;
  FormaPago: string | null;
}

export interface DetalleDocumento {
  Documento: string;
  TipoDoc: string;
  Producto: string;
  Cantidad: number;
  Igv: number;
  PrecUnit: number;
}

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

export interface RegistrarVentaDTO {
  cliente: string;
  documento: string;
  fecha: string;
  personal: string;
  formaPago: string;
  productos: Array<{ producto: string; cantidad: number; precio: number }>;
  credito: boolean;
  cuotas?: number;
}

export interface RegistrarCompraDTO {
  proveedor: string;
  documento: string;
  fecha: string;
  personal: string;
  productos: Array<{ producto: string; cantidad: number; precio: number }>;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    nombre: string;
    rol: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}