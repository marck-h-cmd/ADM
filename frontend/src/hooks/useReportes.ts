/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { reportesService } from '@/services/reportes.service';
import { kardexService } from '@/services/kardex.service';
import { getErrorMessage } from '@/utils/helpers';

export interface VentaReporte {
  Documento: string;
  TipoDoc: 'B' | 'F';
  Fecha: string;
  Cliente: string | null;
  ClienteNombre: string | null;
  Zona: string | null;
  Personal: string | null;
  Vendedor: string | null;
  pagado: number;
  Total: number;
  Productos: number;
}

export interface VendedorReporte {
  Personal: string;
  Vendedor: string;
  CantidadVentas: number;
  TotalVentas: number;
  TicketPromedio: number;
  PrimeraVenta: string;
  UltimaVenta: string;
}

export interface VencimientoReporte {
  Documento: string;
  TipoDoc: string;
  NroCuota: number;
  feVence: string;
  Importe: number;
  Interes: number;
  estado: string;
  Cliente: string | null;
  ClienteNombre: string | null;
  Telefono: string | null;
  DiasVencimiento: number;
}

export interface RotacionItem {
  Producto: string;
  Descripcion?: string;
  Marca?: string;
  CantidadVendida?: number;
  CantidadIngresos?: number;
  CantidadSalidas?: number;
  StockActual?: number;
  [key: string]: unknown;
}

export function useReporteVentas(
  fechaInicio: string,
  fechaFin: string,
  tipo?: 'B' | 'F',
) {
  const [data, setData] = useState<VentaReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!fechaInicio || !fechaFin) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = (await reportesService.getVentas(
        fechaInicio,
        fechaFin,
        tipo,
      )) as VentaReporte[];
      setData(res);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, tipo]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useReporteVendedores(fechaInicio: string, fechaFin: string) {
  const [data, setData] = useState<VendedorReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!fechaInicio || !fechaFin) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = (await reportesService.getVentasPorVendedor(
        fechaInicio,
        fechaFin,
      )) as VendedorReporte[];
      setData(res);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useReporteRotacion(anio: number) {
  const [data, setData] = useState<RotacionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await reportesService.getRotacion(anio)) as RotacionItem[];
      setData(res);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [anio]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

export function useReporteVencimientos() {
  const [data, setData] = useState<VencimientoReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await reportesService.getVencimientos()) as VencimientoReporte[];
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

export function useReporteValorizacion() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await kardexService.getValorizacion()) as Record<string, unknown>[];
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
