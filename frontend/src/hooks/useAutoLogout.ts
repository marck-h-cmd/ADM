import { useEffect, useRef } from 'react';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
];

const THROTTLE_MS = 30_000;
const POLL_MS = 5_000;
const WARN_OFFSET_MS = 30_000;

export function useAutoLogout() {
  const autoLogout = usePreferencesStore((s) => s.autoLogout);
  const minutos = usePreferencesStore((s) => s.minutosAutoLogout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const toast = useToast();

  const lastActivity = useRef<number | null>(null);
  const warned = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!autoLogout) return;

    const ms = minutos * 60_000;
    const warnAt = Math.max(0, ms - WARN_OFFSET_MS);
    lastActivity.current = Date.now();
    warned.current = false;

  function markActive() {
    if (lastActivity.current == null) lastActivity.current = Date.now();
    lastActivity.current = Date.now();
    if (warned.current) warned.current = false;
  }

    function onVisibility() {
      if (!document.hidden) markActive();
    }

    let lastThrottle = 0;
    function throttledMarkActive() {
      const now = Date.now();
      if (now - lastThrottle < THROTTLE_MS) return;
      lastThrottle = now;
      markActive();
    }

    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, throttledMarkActive, { passive: true }),
    );
    document.addEventListener('visibilitychange', onVisibility);

    const interval = window.setInterval(() => {
      if (lastActivity.current == null) return;
      const idle = Date.now() - lastActivity.current;
      if (!warned.current && idle >= warnAt && idle < ms) {
        warned.current = true;
        toast.warning('Sesión por expirar', {
          description: 'Mueva el cursor o presione una tecla para mantener la sesión activa.',
          duration: 10_000,
        });
      }
      if (idle >= ms) {
        clear();
        toast.info('Sesión cerrada por inactividad', {
          description: `Se cerró automáticamente tras ${minutos} minutos sin actividad.`,
        });
        navigate('/login', { replace: true });
      }
    }, POLL_MS);

    return () => {
      window.clearInterval(interval);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, throttledMarkActive));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isAuthenticated, autoLogout, minutos, clear, navigate, toast]);
}
