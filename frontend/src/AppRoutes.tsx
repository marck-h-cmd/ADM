import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Productos from '@/pages/Productos';
import ProductoFormPage from '@/pages/ProductoFormPage';
import Clientes from '@/pages/Clientes';
import ClienteFormPage from '@/pages/ClienteFormPage';
import Ventas from '@/pages/Ventas';
import VentasHistorial from '@/pages/VentasHistorial';
import Compras from '@/pages/Compras';
import ComprasHistorial from '@/pages/ComprasHistorial';
import Kardex from '@/pages/Kardex';
import Reportes from '@/pages/Reportes';
import Configuracion from '@/pages/Configuracion';
import NotFound from '@/pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/nuevo" element={<ProductoFormPage />} />
        <Route path="/productos/:id" element={<ProductoFormPage />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/nuevo" element={<ClienteFormPage />} />
        <Route path="/clientes/:id" element={<ClienteFormPage />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/ventas/historial" element={<VentasHistorial />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/compras/historial" element={<ComprasHistorial />} />
        <Route path="/kardex" element={<Kardex />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
