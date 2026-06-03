/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { comprasService } from '@/services/compras.service';
import { useDebounce } from '@/hooks/useDebounce';
import type { CompraRow } from '@/types/venta.types';
import type { CompraDetalle } from '@/types/documento.types';
import type { PaginatedResponse } from '@/types/api.types';
import { getErrorMessage, docId } from '@/utils/helpers';

const LIMITE = 15;

export function useCompras() {
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
  });
  const debouncedFiltros = useDebounce(filtros, 300);
  const [data, setData] = useState<CompraRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (
      p: number,
      f: { fechaInicio: string; fechaFin: string },
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res: PaginatedResponse<CompraRow> = await comprasService.getAll(
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

  useEffect(() => {
    void fetch(page, debouncedFiltros);
  }, [fetch, page, debouncedFiltros]);

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
    refresh: () => fetch(page, debouncedFiltros),
  };
}

export function useCompraDetalle(id: string | null) {
  const [detalle, setDetalle] = useState<CompraDetalle | null>(null);
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
      const data = await comprasService.getById(id);
      setDetalle(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { detalle, loading, error, refetch: fetch, id };
}

export { docId };
