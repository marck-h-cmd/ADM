export type TipoDocumento = 'B' | 'F' | 'C' | 'N';
export type EstadoDocumento = 'C' | 'P' | 'A';
export type TipoMovimientoKardex = 'INGRESO' | 'SALIDA';

export interface Documento {
  Documento: string;
  TipoDoc: TipoDocumento;
  Proveedor: string | null;
  Pedido: string | null;
  Cliente: string | null;
  Fecha: string;
  Estado: EstadoDocumento;
  DocRefer: string | null;
  Personal: string | null;
  pagado: number;
  IdTienda: string;
  FormaPago: string | null;
}

export interface DetalleDocumento {
  Documento: string;
  TipoDoc: TipoDocumento;
  Producto: string;
  Cantidad: number;
  Igv: number;
  PrecUnit: number;
}

export interface ProductoEnDetalle extends DetalleDocumento {
  ProductoDescripcion?: string;
  Marca?: string;
}

export interface Cuota {
  Documento: string;
  TipoDoc: TipoDocumento;
  NroCuota: number;
  Importe: number;
  Interes: number;
  feVence: string;
  Fepago: string | null;
  estado: 'P' | 'C';
  idMedioPago?: string | null;
}

export interface VentaDetalle {
  header: Documento & {
    ClienteNombre?: string;
    Zona?: string;
    TipoCliente?: string;
    PersonalNombre?: string;
    TiendaDesc?: string;
  };
  detalle: ProductoEnDetalle[];
  cronograma: Cuota[];
}

export interface CompraDetalle {
  header: Documento & { ProveedorNombre?: string };
  detalle: ProductoEnDetalle[];
}
