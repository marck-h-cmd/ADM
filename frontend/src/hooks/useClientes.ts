/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { clientesService } from '@/services/clientes.service';
import { useDebounce } from '@/hooks/useDebounce';
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from '@/types/cliente.types';
import { getErrorMessage } from '@/utils/helpers';

export interface FiltrosCliente {
  search: string;
  tipo: 'todos' | 'V' | 'E' | 'P' | 'R';
  soloCredito: boolean;
}

const LIMITE = 15;

export function useClientesList() {
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosCliente>({
    search: '',
    tipo: 'todos',
    soloCredito: false,
  });
  const debouncedSearch = useDebounce(filtros.search, 300);
  const [data, setData] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (p: number, search: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await clientesService.getAll(p, LIMITE, search);
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
    void fetch(page, debouncedSearch);
  }, [fetch, page, debouncedSearch]);

  const refresh = useCallback(() => fetch(page, debouncedSearch), [fetch, page, debouncedSearch]);

  const filtered = filtros.soloCredito || filtros.tipo !== 'todos'
    ? data.filter((c) => {
        if (filtros.soloCredito && !c.credito) return false;
        if (filtros.tipo !== 'todos' && c.TipoCliente !== filtros.tipo) return false;
        return true;
      })
    : data;

  return {
    data: filtered,
    rawTotal: total,
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

export function useClienteDetail(id: string | null) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCliente(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    clientesService
      .getById(id)
      .then((c) => {
        if (!cancelled) setCliente(c);
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { cliente, loading, error };
}

export function useClienteAcciones() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = useCallback(async (payload: CreateClienteDTO) => {
    setLoading(true);
    setError(null);
    try {
      const c = await clientesService.create(payload);
      return { ok: true as const, cliente: c };
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      return { ok: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizar = useCallback(
    async (id: string, payload: UpdateClienteDTO) => {
      setLoading(true);
      setError(null);
      try {
        const c = await clientesService.update(id, payload);
        return { ok: true as const, cliente: c };
      } catch (e) {
        const msg = getErrorMessage(e);
        setError(msg);
        return { ok: false as const, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const eliminar = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await clientesService.remove(id);
      return { ok: true as const };
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      return { ok: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { crear, actualizar, eliminar, loading, error };
}

export function useClienteSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    if (!debounced || debounced.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    clientesService
      .getAll(1, 10, debounced)
      .then((res) => {
        if (!cancelled) setResults(res.data);
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return { query, setQuery, results, loading, error, clear: () => setQuery('') };
}

export function useClientesWithCredit() {
  const [data, setData] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientesService.getCredito();
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
