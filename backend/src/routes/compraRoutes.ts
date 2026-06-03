import { Router } from 'express';
import { compraController } from '../controllers/compraController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, compraController.registrar);
router.get('/', authenticate, compraController.getAll);
router.get('/:id', authenticate, compraController.getById);

export default router;