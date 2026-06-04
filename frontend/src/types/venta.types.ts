import type { TipoDocumento } from './documento.types';

export interface ProductoVenta {
  producto: string;
  cantidad: number;
  precio: number;
}

export interface RegistrarVentaDTO {
  cliente: string;
  documento: string;
  fecha: string;
  personal: string;
  formaPago: string;
  productos: ProductoVenta[];
  credito: boolean;
  cuotas?: number;
}

export interface RegistrarCompraDTO {
  proveedor: string;
  documento: string;
  fecha: string;
  personal: string;
  productos: ProductoVenta[];
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface LoginUser {
  id: string;
  nombre: string;
  email?: string;
}

export interface LoginResponse {
  token: string;
  user: LoginUser;
}

export interface DashboardMetrics {
  ventasHoy: { total: number; cantidad: number; variacion: number };
  ventasMes: { total: number; cantidad: number; variacion: number };
  ventasAnio: number;
  stockBajo: number;
  totalProductos: number;
  totalClientes: number;
}

export interface VentaRow {
  Documento: string;
  TipoDoc: TipoDocumento;
  Fecha: string;
  Cliente: string | null;
  ClienteNombre?: string;
  Personal: string | null;
  pagado: number;
  Estado: 'C' | 'P' | 'A';
  Total: number;
}

export interface CompraRow {
  Documento: string;
  TipoDoc: TipoDocumento;
  Fecha: string;
  Proveedor: string | null;
  ProveedorNombre?: string;
  Personal: string | null;
  pagado: number;
  Total: number;
  Cantidad?: number;
  Referencia?: string | null;
}
