import { Router } from 'express';
import { kardexController } from '../controllers/kardexController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/producto/:productoId', authenticate, kardexController.getKardex);
router.get('/stock/resumen', authenticate, kardexController.getStockResumen);
router.get('/stock/valorizacion', authenticate, kardexController.getValorizacion);
router.get('/stock/rotacion', authenticate, kardexController.getRotacion);

export default router;