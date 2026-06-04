import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { useTheme } from '@/hooks/useTheme';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import { useSoundBridge } from '@/hooks/useSoundBridge';

function ThemeBridge() {
  useTheme();
  return null;
}

function PrefsBridge() {
  const densidad = usePreferencesStore((s) => s.densidad);
  useEffect(() => {
    document.documentElement.dataset.density = densidad;
  }, [densidad]);
  return null;
}

function AutoLogoutBridge() {
  useAutoLogout();
  return null;
}

function SoundBridge() {
  useSoundBridge();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeBridge />
      <PrefsBridge />
      <AutoLogoutBridge />
      <SoundBridge />
      <AppRoutes />
    </BrowserRouter>
  );
}
