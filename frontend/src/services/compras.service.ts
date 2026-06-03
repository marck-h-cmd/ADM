import { api, unwrap } from './api';
import type { CompraRow, RegistrarCompraDTO } from '@/types/venta.types';
import type { CompraDetalle } from '@/types/documento.types';
import type { ApiSuccess, PaginatedResponse } from '@/types/api.types';

export const comprasService = {
  async registrar(payload: RegistrarCompraDTO): Promise<string> {
    const res = await api.post<{ status: 'success'; message: string }>(
      '/compras',
      payload,
    );
    return res.data.message;
  },

  async getAll(
    page = 1,
    limit = 20,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<PaginatedResponse<CompraRow>> {
    const { data, pagination } = await unwrap<ApiSuccess<CompraRow[]>>(
      api.get('/compras', {
        params: { page, limit, fechaInicio, fechaFin },
      }),
    );
    return { data, pagination: pagination! };
  },

  async getById(id: string): Promise<CompraDetalle> {
    const { data } = await unwrap<ApiSuccess<CompraDetalle>>(
      api.get(`/compras/${id}`),
    );
    return data;
  },
};
