import { Router } from 'express';
import authRoutes from './authRoutes';
import productoRoutes from './productoRoutes';
import clienteRoutes from './clienteRoutes';
import ventaRoutes from './ventaRoutes';
import compraRoutes from './compraRoutes';
import kardexRoutes from './kardexRoutes';
import dashboardRoutes from './dashboardRoutes';
import reporteRoutes from './reporteRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/productos', productoRoutes);
router.use('/clientes', clienteRoutes);
router.use('/ventas', ventaRoutes);
router.use('/compras', compraRoutes);
router.use('/kardex', kardexRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reportes', reporteRoutes);

export default router;