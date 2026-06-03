import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DocumentoState, DocumentoItem } from './documento';

export type { DocumentoItem };

export interface CompraState extends DocumentoState {
  proveedor: string | null;
  proveedorNombre: string | null;
  personal: string;
  documento: string;
  fecha: string;

  setProveedor: (proveedor: string, nombre: string) => void;
  setPersonal: (per: string) => void;
  setDocumento: (doc: string) => void;
  setFecha: (f: string) => void;
}

const initial = {
  items: [] as DocumentoItem[],
  proveedor: null as string | null,
  proveedorNombre: null as string | null,
  personal: '01',
  documento: '',
  fecha: new Date().toISOString(),
};

export const useCompraStore = create<CompraState>()(
  persist(
    (set, get) => ({
      ...initial,

      addItem: (item, cantidad = 1) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.producto === item.producto);
        if (idx >= 0) {
          const next = [...items];
          next[idx] = { ...next[idx], cantidad: next[idx].cantidad + cantidad };
          set({ items: next });
          return;
        }
        set({ items: [...items, { ...item, cantidad }] });
      },

      updateCantidad: (producto, cantidad) => {
        set({
          items: get().items.map((i) =>
            i.producto === producto
              ? { ...i, cantidad: Math.max(1, cantidad) }
              : i,
          ),
        });
      },

      removeItem: (producto) =>
        set({ items: get().items.filter((i) => i.producto !== producto) }),

      clear: () => set({ ...initial, fecha: new Date().toISOString() }),

      setProveedor: (proveedor, nombre) =>
        set({ proveedor, proveedorNombre: nombre }),
      setPersonal: (personal) => set({ personal }),
      setDocumento: (documento) => set({ documento }),
      setFecha: (fecha) => set({ fecha }),
    }),
    {
      name: 'tenebrosa.compra',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        items: s.items,
        proveedor: s.proveedor,
        proveedorNombre: s.proveedorNombre,
        personal: s.personal,
        documento: s.documento,
      }),
    },
  ),
);
