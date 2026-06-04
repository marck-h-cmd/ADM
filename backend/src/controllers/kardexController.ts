import { Request, Response, NextFunction } from 'express';
import { kardexService } from '../services/kardexService';
import { AppError } from '../middleware/errorHandler';

export const kardexController = {
  async getKardex(req: Request, res: Response, next: NextFunction) {
    try {
      const { productoId } = req.params;
      const { fechaInicio, fechaFin } = req.query;
      
      if (!productoId) {
        throw new AppError('ID de producto requerido', 400);
      }
      
      const movimientos = await kardexService.getKardex(
        productoId,
        fechaInicio as string,
        fechaFin as string
      );
      
      res.json({ status: 'success', data: movimientos });
    } catch (error) {
      next(error);
    }
  },

  async getStockResumen(req: Request, res: Response, next: NextFunction) {
    try {
      const { marca, stockMinimo } = req.query;
      const resumen = await kardexService.getStockResumen(
        marca as string,
        stockMinimo === 'true'
      );
      res.json({ status: 'success', data: resumen });
    } catch (error) {
      next(error);
    }
  },

  async getValorizacion(req: Request, res: Response, next: NextFunction) {
    try {
      const valorizacion = await kardexService.getValorizacion();
      res.json({ status: 'success', data: valorizacion });
    } catch (error) {
      next(error);
    }
  },

  async getRotacion(req: Request, res: Response, next: NextFunction) {
    try {
      const parseQueryParam = (value: any): string | undefined =>
        Array.isArray(value) ? value[0] : (typeof value === 'string' ? value : undefined);
      const anio = parseQueryParam(req.query.anio) ? Number.parseInt(parseQueryParam(req.query.anio)!, 10) : new Date().getFullYear();
      const mes = parseQueryParam(req.query.mes) ? Number.parseInt(parseQueryParam(req.query.mes)!, 10) : undefined;
      
      const rotacion = await kardexService.getRotacion(anio, mes);
      res.json({ status: 'success', data: rotacion });
    } catch (error) {
      next(error);
    }
  }
};