import { Request, Response, NextFunction } from 'express';
import { ventaService } from '../services/ventaService';
import { AppError } from '../middleware/errorHandler';

export const ventaController = {
  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const mensaje = await ventaService.registrar(req.body);
      res.status(201).json({ status: 'success', message: mensaje });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const parseQueryParam = (value: any): string | undefined =>
        Array.isArray(value) ? value[0] : (typeof value === 'string' ? value : undefined);

      const page = Number.parseInt(parseQueryParam(req.query.page) ?? '1', 10) || 1;
      const limit = Number.parseInt(parseQueryParam(req.query.limit) ?? '20', 10) || 20;
      const fechaInicio = parseQueryParam(req.query.fechaInicio)?.trim() || undefined;
      const fechaFin = parseQueryParam(req.query.fechaFin)?.trim() || undefined;
      const search = parseQueryParam(req.query.search)?.trim() || undefined;
      
      const result = await ventaService.getAll(page, limit, fechaInicio, fechaFin, search);
      
      res.json({
        status: 'success',
        data: result.rows,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const [documento, tipoDoc] = id.split('-');
      
      if (!documento || !tipoDoc) {
        throw new AppError('Formato de ID inválido. Use DOCUMENTO-TIPODOC', 400);
      }
      
      const venta = await ventaService.getById(documento, tipoDoc);
      
      if (!venta.header) {
        throw new AppError('Venta no encontrada', 404);
      }
      
      res.json({ status: 'success', data: venta });
    } catch (error) {
      next(error);
    }
  },

  async registrarPago(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { monto, medioPago } = req.body;
      const [documento, tipoDoc] = id.split('-');
      
      if (!documento || !tipoDoc) {
        throw new AppError('Formato de ID inválido', 400);
      }
      
      if (!monto || monto <= 0) {
        throw new AppError('Monto inválido', 400);
      }
      
      await ventaService.registrarPago(documento, tipoDoc, monto, medioPago);
      
      res.json({ status: 'success', message: 'Pago registrado correctamente' });
    } catch (error) {
      next(error);
    }
  }
};