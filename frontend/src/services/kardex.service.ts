import { api, unwrap } from './api';
import type {
  KardexItem,
  RotacionItem,
  StockResumenItem,
  ValorizacionItem,
} from '@/types/kardex.types';
import type { ApiSuccess } from '@/types/api.types';

export const kardexService = {
  async getKardex(
    productoId: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<KardexItem[]> {
    const { data } = await unwrap<ApiSuccess<KardexItem[]>>(
      api.get(`/kardex/producto/${productoId}`, {
        params: { fechaInicio, fechaFin },
      }),
    );
    return data;
  },

  async getStockResumen(
    marca?: string,
    stockMinimo = false,
  ): Promise<StockResumenItem[]> {
    const { data } = await unwrap<ApiSuccess<StockResumenItem[]>>(
      api.get('/kardex/stock/resumen', {
        params: { marca, stockMinimo: String(stockMinimo) },
      }),
    );
    return data;
  },

  async getValorizacion(): Promise<ValorizacionItem[]> {
    const { data } = await unwrap<ApiSuccess<ValorizacionItem[]>>(
      api.get('/kardex/stock/valorizacion'),
    );
    return data;
  },

  async getRotacion(anio: number, mes?: number): Promise<RotacionItem[]> {
    const { data } = await unwrap<ApiSuccess<RotacionItem[]>>(
      api.get('/kardex/stock/rotacion', { params: { anio, mes } }),
    );
    return data;
  },
};
