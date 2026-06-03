import { Router } from 'express';
import { ventaController } from '../controllers/ventaController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, ventaController.registrar);
router.get('/', authenticate, ventaController.getAll);
router.get('/:id', authenticate, ventaController.getById);
router.post('/:id/pago', authenticate, ventaController.registrarPago);

export default router;