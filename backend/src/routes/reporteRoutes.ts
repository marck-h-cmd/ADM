import { Router } from 'express';
import { reporteController } from '../controllers/reporteController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/ventas', authenticate, reporteController.getVentas);
router.get('/ventas/vendedor', authenticate, reporteController.getVentasPorVendedor);
router.get('/productos/rotacion', authenticate, reporteController.getRotacion);
router.get('/vencimientos', authenticate, reporteController.getVencimientos);

export default router;