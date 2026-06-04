import { Request, Response, NextFunction } from 'express';
import { reporteService } from '../services/reporteService';
import { AppError } from '../middleware/errorHandler';

export const reporteController = {
  async getVentas(req: Request, res: Response, next: NextFunction) {
    try {
      const { fechaInicio, fechaFin, tipo } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        throw new AppError('Fechas de inicio y fin requeridas', 400);
      }
      
      const ventas = await reporteService.getVentas(
        fechaInicio as string,
        fechaFin as string,
        tipo as string
      );
      
      res.json({ status: 'success', data: ventas });
    } catch (error) {
      next(error);
    }
  },

  async getVentasPorVendedor(req: Request, res: Response, next: NextFunction) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        throw new AppError('Fechas de inicio y fin requeridas', 400);
      }
      
      const ventas = await reporteService.getVentasPorVendedor(
        fechaInicio as string,
        fechaFin as string
      );
      
      res.json({ status: 'success', data: ventas });
    } catch (error) {
      next(error);
    }
  },

  async getRotacion(req: Request, res: Response, next: NextFunction) {
    try {
      const parseQueryParam = (value: any): string | undefined =>
        Array.isArray(value) ? value[0] : (typeof value === 'string' ? value : undefined);
      const anio = parseQueryParam(req.query.anio) ? Number.parseInt(parseQueryParam(req.query.anio)!, 10) : new Date().getFullYear();
      const rotacion = await reporteService.getRotacion(anio);
      res.json({ status: 'success', data: rotacion });
    } catch (error) {
      next(error);
    }
  },

  async getVencimientos(req: Request, res: Response, next: NextFunction) {
    try {
      const vencimientos = await reporteService.getVencimientos();
      res.json({ status: 'success', data: vencimientos });
    } catch (error) {
      next(error);
    }
  }
};