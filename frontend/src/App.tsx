import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { useTheme } from '@/hooks/useTheme';

function ThemeBridge() {
  useTheme();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeBridge />
      <AppRoutes />
    </BrowserRouter>
  );
}
