import { api, unwrap } from './api';
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from '@/types/cliente.types';
import type { ApiSuccess, PaginatedResponse } from '@/types/api.types';

export const clientesService = {
  async getAll(
    page = 1,
    limit = 20,
    search = '',
  ): Promise<PaginatedResponse<Cliente>> {
    const { data, pagination } = await unwrap<ApiSuccess<Cliente[]>>(
      api.get('/clientes', { params: { page, limit, search } }),
    );
    return { data, pagination: pagination! };
  },

  async getById(id: string): Promise<Cliente> {
    const { data } = await unwrap<ApiSuccess<Cliente>>(api.get(`/clientes/${id}`));
    return data;
  },

  async getCredito(): Promise<Cliente[]> {
    const { data } = await unwrap<ApiSuccess<Cliente[]>>(api.get('/clientes/credito'));
    return data;
  },

  async create(payload: CreateClienteDTO): Promise<Cliente> {
    const { data } = await unwrap<ApiSuccess<Cliente>>(api.post('/clientes', payload));
    return data;
  },

  async update(id: string, payload: UpdateClienteDTO): Promise<Cliente> {
    const { data } = await unwrap<ApiSuccess<Cliente>>(
      api.put(`/clientes/${id}`, payload),
    );
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },
};
