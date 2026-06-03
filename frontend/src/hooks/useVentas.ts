import { useCallback, useState } from 'react';
import { ventasService } from '@/services/ventas.service';
import type { VentaDetalle } from '@/types/documento.types';
import type { VentaRow } from '@/types/venta.types';
import type { PaginatedResponse } from '@/types/api.types';
import { getErrorMessage, docId } from '@/utils/helpers';

interface Filtros {
  fechaInicio: string;
  fechaFin: string;
}

const LIMITE = 15;

export function useVentas() {
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState<Filtros>({
    fechaInicio: '',
    fechaFin: '',
  });
  const [data, setData] = useState<VentaRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (p: number, f: Filtros) => {
      setLoading(true);
      setError(null);
      try {
        const res: PaginatedResponse<VentaRow> = await ventasService.getAll(
          p,
          LIMITE,
          f.fechaInicio || undefined,
          f.fechaFin || undefined,
        );
        setData(res.data);
        setTotal(res.pagination.total);
        setPages(res.pagination.pages);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refresh = useCallback(
    () => fetch(page, filtros),
    [fetch, page, filtros],
  );

  return {
    data,
    total,
    pages,
    page,
    setPage,
    filtros,
    setFiltros,
    loading,
    error,
    refresh,
  };
}

export function useVentaDetalle(id: string | null) {
  const [detalle, setDetalle] = useState<VentaDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setDetalle(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ventasService.getById(id);
      setDetalle(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { detalle, loading, error, refetch: fetch, id };
}

export { docId };
