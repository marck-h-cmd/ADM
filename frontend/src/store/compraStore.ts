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
  currentUser: string | null;
  carts: Record<string, { items: DocumentoItem[]; proveedor: string | null; proveedorNombre: string | null; documento: string }>;

  setProveedor: (proveedor: string, nombre: string) => void;
  setPersonal: (per: string) => void;
  setDocumento: (doc: string) => void;
  setFecha: (f: string) => void;
  switchUser: (userId: string | null) => void;
}

const initial = {
  items: [] as DocumentoItem[],
  proveedor: null as string | null,
  proveedorNombre: null as string | null,
  personal: '01',
  documento: '',
  fecha: new Date().toISOString(),
  currentUser: null as string | null,
  carts: {} as Record<string, { items: DocumentoItem[]; proveedor: string | null; proveedorNombre: string | null; documento: string }>,
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

      clear: () => set({ ...initial, carts: get().carts, currentUser: get().currentUser, fecha: new Date().toISOString() }),

      setProveedor: (proveedor, nombre) =>
        set({ proveedor, proveedorNombre: nombre }),
      setPersonal: (personal) => set({ personal }),
      setDocumento: (documento) => set({ documento }),
      setFecha: (fecha) => set({ fecha }),

      switchUser: (newUserId) => {
        const { currentUser, items, proveedor, proveedorNombre, documento, carts } = get();
        const nextCarts = { ...carts };
        if (currentUser) {
          nextCarts[currentUser] = { items, proveedor, proveedorNombre, documento };
        }
        const nextCart = newUserId ? nextCarts[newUserId] : null;
        set({
          currentUser: newUserId,
          carts: nextCarts,
          items: nextCart ? nextCart.items : [],
          proveedor: nextCart ? nextCart.proveedor : null,
          proveedorNombre: nextCart ? nextCart.proveedorNombre : null,
          documento: nextCart ? nextCart.documento : '',
        });
      },
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
        currentUser: s.currentUser,
        carts: s.carts,
      }),
    },
  ),
);
