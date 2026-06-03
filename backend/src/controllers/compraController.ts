import { Request, Response, NextFunction } from 'express';
import { compraService } from '../services/compraService';
import { AppError } from '../middleware/errorHandler';

export const compraController = {
  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const mensaje = await compraService.registrar(req.body);
      res.status(201).json({ status: 'success', message: mensaje });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const fechaInicio = req.query.fechaInicio as string;
      const fechaFin = req.query.fechaFin as string;
      
      const result = await compraService.getAll(page, limit, fechaInicio, fechaFin);
      
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
        throw new AppError('Formato de ID inválido', 400);
      }
      
      const compra = await compraService.getById(documento, tipoDoc);
      
      if (!compra.header) {
        throw new AppError('Compra no encontrada', 404);
      }
      
      res.json({ status: 'success', data: compra });
    } catch (error) {
      next(error);
    }
  }
};