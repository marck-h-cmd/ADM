import { api, unwrap } from './api';
import type { DashboardMetrics } from '@/types/venta.types';
import type { ProductoStockCritico } from '@/types/producto.types';
import type { ApiSuccess } from '@/types/api.types';

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { data } = await unwrap<ApiSuccess<DashboardMetrics>>(
      api.get('/dashboard/metrics'),
    );
    return data;
  },

  async getVentasPorMes(anio?: number): Promise<unknown[]> {
    const { data } = await unwrap<ApiSuccess<unknown[]>>(
      api.get('/dashboard/ventas/mes', { params: { anio } }),
    );
    return data;
  },

  async getVentasPorDia(limit = 7): Promise<unknown[]> {
    const { data } = await unwrap<ApiSuccess<unknown[]>>(
      api.get('/dashboard/ventas/dia', { params: { limit } }),
    );
    return data;
  },

  async getTopVendedores(limit = 5): Promise<unknown[]> {
    const { data } = await unwrap<ApiSuccess<unknown[]>>(
      api.get('/dashboard/vendedores/top', { params: { limit } }),
    );
    return data;
  },

  async getAlertasStock(): Promise<ProductoStockCritico[]> {
    const { data } = await unwrap<ApiSuccess<ProductoStockCritico[]>>(
      api.get('/dashboard/alertas/stock'),
    );
    return data;
  },
};
