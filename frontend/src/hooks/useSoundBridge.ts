import { useEffect, useRef } from 'react';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useToastStore, type ToastTone } from '@/store/toastStore';

/**
 * Tonos cortos diferenciados por tipo de notificación.
 * Frecuencias cálidas que combinan con la paleta de Tenebrosa.
 */
const TONE_FREQ: Record<ToastTone, { freq: number; dur: number; vol: number }> = {
  jade: { freq: 660, dur: 0.12, vol: 0.06 },
  gold: { freq: 520, dur: 0.16, vol: 0.07 },
  cinnabar: { freq: 220, dur: 0.22, vol: 0.08 },
  ink: { freq: 440, dur: 0.10, vol: 0.05 },
};

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (sharedCtx) return sharedCtx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  sharedCtx = new Ctor();
  return sharedCtx;
}

function playTone(tone: ToastTone) {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {});
  }
  const { freq, dur, vol } = TONE_FREQ[tone];
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.02);
}

export function useSoundBridge() {
  const sonidos = usePreferencesStore((s) => s.sonidos);
  const lastSeenId = useRef<string | null>(null);

  useEffect(() => {
    const unsub = useToastStore.subscribe((state) => {
      if (!sonidos) return;
      const last = state.toasts[state.toasts.length - 1];
      if (!last) return;
      if (last.id === lastSeenId.current) return;
      lastSeenId.current = last.id;
      if (last.duration > 0) playTone(last.tone);
    });
    return unsub;
  }, [sonidos]);
}
