import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DocumentoState, DocumentoItem } from './documento';

export type { DocumentoItem };

export interface VentaState extends DocumentoState {
  cliente: string | null;
  clienteNombre: string | null;
  formaPago: 'E' | 'T' | 'Y' | 'C';
  credito: boolean;
  cuotas: number;
  documento: string;
  personal: string;
  fecha: string;
  currentUser: string | null;
  carts: Record<
    string,
    {
      items: DocumentoItem[];
      cliente: string | null;
      clienteNombre: string | null;
      formaPago: VentaState['formaPago'];
      credito: boolean;
      cuotas: number;
      documento: string;
    }
  >;

  setCliente: (cliente: string, nombre: string) => void;
  setFormaPago: (fp: VentaState['formaPago']) => void;
  setCredito: (credito: boolean) => void;
  setCuotas: (cuotas: number) => void;
  setDocumento: (doc: string) => void;
  setPersonal: (per: string) => void;
  setFecha: (f: string) => void;
  switchUser: (userId: string | null) => void;
}

const initial = {
  items: [] as DocumentoItem[],
  cliente: null as string | null,
  clienteNombre: null as string | null,
  formaPago: 'E' as const,
  credito: false,
  cuotas: 1,
  documento: '',
  personal: '01',
  fecha: new Date().toISOString(),
  currentUser: null as string | null,
  carts: {} as Record<
    string,
    {
      items: DocumentoItem[];
      cliente: string | null;
      clienteNombre: string | null;
      formaPago: VentaState['formaPago'];
      credito: boolean;
      cuotas: number;
      documento: string;
    }
  >,
};

export const useVentaStore = create<VentaState>()(
  persist(
    (set, get) => ({
      ...initial,

      addItem: (item, cantidad = 1) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.producto === item.producto);
        if (idx >= 0) {
          const next = [...items];
          const nueva = Math.min(items[idx].cantidad + cantidad, item.stockDisponible);
          next[idx] = { ...next[idx], cantidad: nueva };
          set({ items: next });
          return;
        }
        set({
          items: [
            ...items,
            { ...item, cantidad: Math.min(cantidad, item.stockDisponible) },
          ],
        });
      },

      updateCantidad: (producto, cantidad) => {
        set({
          items: get().items.map((i) =>
            i.producto === producto
              ? {
                  ...i,
                  cantidad: Math.max(0, Math.min(cantidad, i.stockDisponible)),
                }
              : i,
          ),
        });
      },

      removeItem: (producto) =>
        set({ items: get().items.filter((i) => i.producto !== producto) }),

      clear: () => set({ ...initial, carts: get().carts, currentUser: get().currentUser, fecha: new Date().toISOString() }),

      setCliente: (cliente, nombre) => set({ cliente, clienteNombre: nombre }),
      setFormaPago: (formaPago) => set({ formaPago }),
      setCredito: (credito) => set({ credito, formaPago: credito ? 'C' : 'E' }),
      setCuotas: (cuotas) => set({ cuotas: Math.max(1, Math.min(36, cuotas)) }),
      setDocumento: (documento) => set({ documento }),
      setPersonal: (personal) => set({ personal }),
      setFecha: (fecha) => set({ fecha }),

      switchUser: (newUserId) => {
        const { currentUser, items, cliente, clienteNombre, formaPago, credito, cuotas, documento, carts } = get();
        const nextCarts = { ...carts };
        if (currentUser) {
          nextCarts[currentUser] = { items, cliente, clienteNombre, formaPago, credito, cuotas, documento };
        }
        const nextCart = newUserId ? nextCarts[newUserId] : null;
        set({
          currentUser: newUserId,
          carts: nextCarts,
          items: nextCart ? nextCart.items : [],
          cliente: nextCart ? nextCart.cliente : null,
          clienteNombre: nextCart ? nextCart.clienteNombre : null,
          formaPago: nextCart ? nextCart.formaPago : 'E',
          credito: nextCart ? nextCart.credito : false,
          cuotas: nextCart ? nextCart.cuotas : 1,
          documento: nextCart ? nextCart.documento : '',
        });
      },
    }),
    {
      name: 'tenebrosa.venta',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        items: s.items,
        cliente: s.cliente,
        clienteNombre: s.clienteNombre,
        formaPago: s.formaPago,
        credito: s.credito,
        cuotas: s.cuotas,
        documento: s.documento,
        personal: s.personal,
        currentUser: s.currentUser,
        carts: s.carts,
      }),
    },
  ),
);
