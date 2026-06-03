import { Request, Response, NextFunction } from 'express';
import { productoService } from '../services/productoService';
import { AppError } from '../middleware/errorHandler';

export const productoController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || '';
      
      const result = await productoService.getAll(page, limit, search);
      
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
      const producto = await productoService.getById(id);
      
      if (!producto) {
        throw new AppError('Producto no encontrado', 404);
      }
      
      res.json({ status: 'success', data: producto });
    } catch (error) {
      next(error);
    }
  },

  async getStockCritico(req: Request, res: Response, next: NextFunction) {
    try {
      const productos = await productoService.getStockCritico();
      res.json({ status: 'success', data: productos });
    } catch (error) {
      next(error);
    }
  },

  async getTop(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const productos = await productoService.getTop(limit);
      res.json({ status: 'success', data: productos });
    } catch (error) {
      next(error);
    }
  },

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q) {
        throw new AppError('Parámetro de búsqueda requerido', 400);
      }
      
      const productos = await productoService.search(q as string);
      res.json({ status: 'success', data: productos });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const producto = await productoService.create(req.body);
      res.status(201).json({ status: 'success', data: producto });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const producto = await productoService.update(id, req.body);
      
      if (!producto) {
        throw new AppError('Producto no encontrado', 404);
      }
      
      res.json({ status: 'success', data: producto });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await productoService.delete(id);
      
      if (!deleted) {
        throw new AppError('Producto no encontrado', 404);
      }
      
      res.status(204).json({ status: 'success', data: null });
    } catch (error) {
      next(error);
    }
  }
};