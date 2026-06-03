import { api, unwrap } from './api';
import type { ApiSuccess } from '@/types/api.types';

export const reportesService = {
  async getVentas(
    fechaInicio: string,
    fechaFin: string,
    tipo?: string,
    vendedor?: string,
  ): Promise<unknown[]> {
    const { data } = await unwrap<ApiSuccess<unknown[]>>(
      api.get('/reportes/ventas', {
        params: { fechaInicio, fechaFin, tipo, vendedor },
      }),
    );
    return data;
  },

  async getVentasPorVendedor(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<unknown[]> {
    const { data } = await unwrap<ApiSuccess<unknown[]>>(
      api.get('/reportes/ventas/vendedor', {
        params: { fechaInicio, fechaFin },
      }),
    );
    return data;
  },

  async getRotacion(anio: number): Promise<unknown[]> {
    const { data } = await unwrap<ApiSuccess<unknown[]>>(
      api.get('/reportes/productos/rotacion', { params: { anio } }),
    );
    return data;
  },

  async getVencimientos(): Promise<unknown[]> {
    const { data } = await unwrap<ApiSuccess<unknown[]>>(
      api.get('/reportes/vencimientos'),
    );
    return data;
  },
};
