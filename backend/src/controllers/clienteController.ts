import { Request, Response, NextFunction } from 'express';
import { clienteService } from '../services/clienteService';
import { AppError } from '../middleware/errorHandler';

export const clienteController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const parseQueryParam = (value: any): string | undefined =>
        Array.isArray(value) ? value[0] : (typeof value === 'string' ? value : undefined);

      const page = Number.parseInt(parseQueryParam(req.query.page) ?? '1', 10) || 1;
      const limit = Number.parseInt(parseQueryParam(req.query.limit) ?? '20', 10) || 20;
      const search = parseQueryParam(req.query.search)?.trim() || '';
      
      const result = await clienteService.getAll(page, limit, search);
      
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
      const cliente = await clienteService.getById(id);
      
      if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
      }
      
      res.json({ status: 'success', data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async getCredito(req: Request, res: Response, next: NextFunction) {
    try {
      const clientes = await clienteService.getCredito();
      res.json({ status: 'success', data: clientes });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clienteService.create(req.body);
      res.status(201).json({ status: 'success', data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cliente = await clienteService.update(id, req.body);
      
      if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
      }
      
      res.json({ status: 'success', data: cliente });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await clienteService.delete(id);
      
      if (!deleted) {
        throw new AppError('Cliente no encontrado', 404);
      }
      
      res.status(204).json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  }
};