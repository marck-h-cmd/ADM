import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type DensidadUI = 'compacta' | 'normal' | 'holgada';
export type FormatoFecha = 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
export type FormatoMoneda = 'S/.' | 'PEN' | 'US$';

interface PreferencesState {
  densidad: DensidadUI;
  formatoFecha: FormatoFecha;
  formatoMoneda: FormatoMoneda;
  /**
   * Si true, muestra sonidos de feedback (no implementado aún,
   * pero queda como preferencia para futuro).
   */
  sonidos: boolean;
  /**
   * Si true, el sistema cierra sesión automáticamente tras inactividad.
   */
  autoLogout: boolean;
  minutosAutoLogout: number;

  setDensidad: (d: DensidadUI) => void;
  setFormatoFecha: (f: FormatoFecha) => void;
  setFormatoMoneda: (m: FormatoMoneda) => void;
  setSonidos: (s: boolean) => void;
  setAutoLogout: (a: boolean) => void;
  setMinutosAutoLogout: (m: number) => void;
  reset: () => void;
}

const initial = {
  densidad: 'normal' as const,
  formatoFecha: 'DD/MM/YYYY' as const,
  formatoMoneda: 'S/.' as const,
  sonidos: false,
  autoLogout: true,
  minutosAutoLogout: 30,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initial,
      setDensidad: (densidad) => set({ densidad }),
      setFormatoFecha: (formatoFecha) => set({ formatoFecha }),
      setFormatoMoneda: (formatoMoneda) => set({ formatoMoneda }),
      setSonidos: (sonidos) => set({ sonidos }),
      setAutoLogout: (autoLogout) => set({ autoLogout }),
      setMinutosAutoLogout: (minutosAutoLogout) =>
        set({ minutosAutoLogout: Math.max(5, Math.min(120, minutosAutoLogout)) }),
      reset: () => set(initial),
    }),
    {
      name: 'tenebrosa.preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
