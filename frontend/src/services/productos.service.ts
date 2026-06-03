import { api, unwrap } from './api';
import type {
  CreateProductoDTO,
  Producto,
  ProductoStockCritico,
  TopProducto,
  UpdateProductoDTO,
} from '@/types/producto.types';
import type { ApiSuccess, PaginatedResponse } from '@/types/api.types';

export const productosService = {
  async getAll(
    page = 1,
    limit = 20,
    search = '',
  ): Promise<PaginatedResponse<Producto>> {
    const { data, pagination } = await unwrap<ApiSuccess<Producto[]>>(
      api.get('/productos', { params: { page, limit, search } }),
    );
    return { data, pagination: pagination! };
  },

  async getById(id: string): Promise<Producto> {
    const { data } = await unwrap<ApiSuccess<Producto>>(api.get(`/productos/${id}`));
    return data;
  },

  async getStockCritico(): Promise<ProductoStockCritico[]> {
    const { data } = await unwrap<ApiSuccess<ProductoStockCritico[]>>(
      api.get('/productos/stock/critico'),
    );
    return data;
  },

  async getTop(limit = 10): Promise<TopProducto[]> {
    const { data } = await unwrap<ApiSuccess<TopProducto[]>>(
      api.get('/productos/top', { params: { limit } }),
    );
    return data;
  },

  async search(q: string): Promise<Producto[]> {
    const { data } = await unwrap<ApiSuccess<Producto[]>>(
      api.get('/productos/search', { params: { q } }),
    );
    return data;
  },

  async create(payload: CreateProductoDTO): Promise<Producto> {
    const { data } = await unwrap<ApiSuccess<Producto>>(api.post('/productos', payload));
    return data;
  },

  async update(id: string, payload: UpdateProductoDTO): Promise<Producto> {
    const { data } = await unwrap<ApiSuccess<Producto>>(
      api.put(`/productos/${id}`, payload),
    );
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/productos/${id}`);
  },
};
