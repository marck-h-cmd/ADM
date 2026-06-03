import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';

export const dashboardController = {
  async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await dashboardService.getMetrics();
      res.json({ status: 'success', data: metrics });
    } catch (error) {
      next(error);
    }
  },

  async getVentasPorMes(req: Request, res: Response, next: NextFunction) {
    try {
      const anio = req.query.anio ? parseInt(req.query.anio as string) : undefined;
      const ventas = await dashboardService.getVentasPorMes(anio);
      res.json({ status: 'success', data: ventas });
    } catch (error) {
      next(error);
    }
  },

  async getVentasPorDia(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 7;
      const ventas = await dashboardService.getVentasPorDia(limit);
      res.json({ status: 'success', data: ventas });
    } catch (error) {
      next(error);
    }
  },

  async getTopVendedores(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const vendedores = await dashboardService.getTopVendedores(limit);
      res.json({ status: 'success', data: vendedores });
    } catch (error) {
      next(error);
    }
  },

  async getAlertasStock(req: Request, res: Response, next: NextFunction) {
    try {
      const alertas = await dashboardService.getAlertasStock();
      res.json({ status: 'success', data: alertas });
    } catch (error) {
      next(error);
    }
  }
};