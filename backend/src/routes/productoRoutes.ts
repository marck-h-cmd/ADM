import { Router } from 'express';
import { productoController } from '../controllers/productoController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, productoController.getAll);
router.get('/stock/critico', authenticate, productoController.getStockCritico);
router.get('/top', authenticate, productoController.getTop);
router.get('/search', authenticate, productoController.search);
router.get('/:id', authenticate, productoController.getById);
router.post('/', authenticate, productoController.create);
router.put('/:id', authenticate, productoController.update);
router.delete('/:id', authenticate, productoController.delete);

export default router;