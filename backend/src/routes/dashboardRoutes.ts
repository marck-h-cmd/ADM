import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/metrics', authenticate, dashboardController.getMetrics);
router.get('/ventas/mes', authenticate, dashboardController.getVentasPorMes);
router.get('/ventas/dia', authenticate, dashboardController.getVentasPorDia);
router.get('/vendedores/top', authenticate, dashboardController.getTopVendedores);
router.get('/alertas/stock', authenticate, dashboardController.getAlertasStock);

export default router;