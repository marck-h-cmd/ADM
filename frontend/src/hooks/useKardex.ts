/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { kardexService } from '@/services/kardex.service';
import type { KardexItem, StockResumenItem } from '@/types/kardex.types';
import { getErrorMessage } from '@/utils/helpers';

export type TipoMovFilter = 'TODOS' | 'INGRESO' | 'SALIDA';

export interface FiltrosKardex {
  fechaInicio: string;
  fechaFin: string;
  tipo: TipoMovFilter;
}

const empty: FiltrosKardex = {
  fechaInicio: '',
  fechaFin: '',
  tipo: 'TODOS',
};

export function useKardexProducto(productoId: string | null) {
  const [filtros, setFiltros] = useState<FiltrosKardex>(empty);
  const [data, setData] = useState<KardexItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (id: string, f: FiltrosKardex) => {
      setLoading(true);
      setError(null);
      try {
        const res = await kardexService.getKardex(
          id,
          f.fechaInicio || undefined,
          f.fechaFin || undefined,
        );
        setData(res);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!productoId) {
      setData([]);
      return;
    }
    void fetch(productoId, filtros);
  }, [productoId, filtros, fetch]);

  const filtered =
    filtros.tipo === 'TODOS'
      ? data
      : data.filter((m) => m.tipomov === filtros.tipo);

  // Stats agregadas
  const ingresos = filtered.filter((m) => m.tipomov === 'INGRESO');
  const salidas = filtered.filter((m) => m.tipomov === 'SALIDA');
  const totalIngresos = ingresos.reduce((acc, m) => acc + m.cantidad, 0);
  const totalSalidas = salidas.reduce((acc, m) => acc + m.cantidad, 0);
  const stockActual = data.length > 0 ? data[data.length - 1].stock : 0;
  const primerStock = data.length > 0 ? data[0].stock - (data[0].tipomov === 'INGRESO' ? data[0].cantidad : -data[0].cantidad) : 0;
  const variacion = stockActual - primerStock;

  return {
    movimientos: filtered,
    allMovimientos: data,
    loading,
    error,
    filtros,
    setFiltros,
    refresh: () => productoId && fetch(productoId, filtros),
    stats: {
      totalIngresos,
      totalSalidas,
      stockActual,
      variacion,
      neto: totalIngresos - totalSalidas,
      totalMovimientos: filtered.length,
    },
  };
}

export function useStockResumen() {
  const [data, setData] = useState<StockResumenItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await kardexService.getStockResumen();
      setData(res);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
