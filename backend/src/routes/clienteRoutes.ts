import { Router } from 'express';
import { clienteController } from '../controllers/clienteController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, clienteController.getAll);
router.get('/credito', authenticate, clienteController.getCredito);
router.get('/:id', authenticate, clienteController.getById);
router.post('/', authenticate, clienteController.create);
router.put('/:id', authenticate, clienteController.update);
router.delete('/:id', authenticate, clienteController.delete);

export default router;