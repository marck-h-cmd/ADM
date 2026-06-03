import { useCallback, useEffect, useState } from 'react';
import { productosService } from '@/services/productos.service';
import type {
  CreateProductoDTO,
  Producto,
  ProductoStockCritico,
  UpdateProductoDTO,
} from '@/types/producto.types';
import { getErrorMessage } from '@/utils/helpers';

interface State {
  data: Producto[];
  total: number;
  pages: number;
  loading: boolean;
  error: string | null;
}

const initial: State = {
  data: [],
  total: 0,
  pages: 0,
  loading: false,
  error: null,
};

export function useProductos(initialPage = 1, initialLimit = 12) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [state, setState] = useState<State>(initial);

  const fetch = useCallback(
    async (p: number, s: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await productosService.getAll(p, initialLimit, s);
        setState({
          data: res.data,
          total: res.pagination.total,
          pages: res.pagination.pages,
          loading: false,
          error: null,
        });
      } catch (e) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getErrorMessage(e),
        }));
      }
    },
    [initialLimit],
  );

  useEffect(() => {
    void fetch(page, search);
  }, [page, search, fetch]);

  const create = useCallback(async (payload: CreateProductoDTO) => {
    try {
      const created = await productosService.create(payload);
      await fetch(page, search);
      return { ok: true as const, data: created };
    } catch (e) {
      return { ok: false as const, error: getErrorMessage(e) };
    }
  }, [page, search, fetch]);

  const update = useCallback(
    async (id: string, payload: UpdateProductoDTO) => {
      try {
        const updated = await productosService.update(id, payload);
        await fetch(page, search);
        return { ok: true as const, data: updated };
      } catch (e) {
        return { ok: false as const, error: getErrorMessage(e) };
      }
    },
    [page, search, fetch],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await productosService.remove(id);
        await fetch(page, search);
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, error: getErrorMessage(e) };
      }
    },
    [page, search, fetch],
  );

  return {
    ...state,
    page,
    setPage,
    search,
    setSearch,
    refresh: () => fetch(page, search),
    create,
    update,
    remove,
  };
}

export function useProductoStockCritico() {
  const [data, setData] = useState<ProductoStockCritico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    productosService
      .getStockCritico()
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(getErrorMessage(e)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
