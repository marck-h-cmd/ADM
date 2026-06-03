import { api, unwrap } from './api';
import type {
  RegistrarVentaDTO,
  VentaRow,
} from '@/types/venta.types';
import type { VentaDetalle } from '@/types/documento.types';
import type { ApiSuccess, PaginatedResponse } from '@/types/api.types';

export const ventasService = {
  async registrar(payload: RegistrarVentaDTO): Promise<string> {
    const { data } = await unwrap<ApiSuccess<string>>(
      api.post('/ventas', payload),
    );
    return data as unknown as string;
  },

  async getAll(
    page = 1,
    limit = 20,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<PaginatedResponse<VentaRow>> {
    const { data, pagination } = await unwrap<ApiSuccess<VentaRow[]>>(
      api.get('/ventas', { params: { page, limit, fechaInicio, fechaFin } }),
    );
    return { data, pagination: pagination! };
  },

  async getById(id: string): Promise<VentaDetalle> {
    const { data } = await unwrap<ApiSuccess<VentaDetalle>>(api.get(`/ventas/${id}`));
    return data;
  },

  async registrarPago(
    id: string,
    monto: number,
    medioPago: string,
  ): Promise<void> {
    await api.post(`/ventas/${id}/pago`, { monto, medioPago });
  },
};
