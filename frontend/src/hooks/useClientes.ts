/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { clientesService } from '@/services/clientes.service';
import { useDebounce } from '@/hooks/useDebounce';
import type { Cliente } from '@/types/cliente.types';
import { getErrorMessage } from '@/utils/helpers';

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
