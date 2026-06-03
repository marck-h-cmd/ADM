import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  producto: string;
  descripcion: string;
  marca: string;
  precio: number;
  cantidad: number;
  stockDisponible: number;
  conIgv: boolean;
}

interface CartState {
  items: CartItem[];
  cliente: string | null;
  clienteNombre: string | null;
  formaPago: 'E' | 'T' | 'Y' | 'C';
  credito: boolean;
  cuotas: number;
  documento: string;
  personal: string;
  fecha: string;

  addItem: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  updateCantidad: (producto: string, cantidad: number) => void;
  removeItem: (producto: string) => void;
  clear: () => void;

  setCliente: (cliente: string, nombre: string) => void;
  setFormaPago: (fp: CartState['formaPago']) => void;
  setCredito: (credito: boolean) => void;
  setCuotas: (cuotas: number) => void;
  setDocumento: (doc: string) => void;
  setPersonal: (per: string) => void;
  setFecha: (f: string) => void;
}

const initial = {
  items: [] as CartItem[],
  cliente: null as string | null,
  clienteNombre: null as string | null,
  formaPago: 'E' as const,
  credito: false,
  cuotas: 1,
  documento: '',
  personal: '01',
  fecha: new Date().toISOString(),
};

export const useVentaStore = create<CartState>()(
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

      clear: () => set({ ...initial, fecha: new Date().toISOString() }),

      setCliente: (cliente, nombre) => set({ cliente, clienteNombre: nombre }),
      setFormaPago: (formaPago) => set({ formaPago }),
      setCredito: (credito) => set({ credito, formaPago: credito ? 'C' : 'E' }),
      setCuotas: (cuotas) => set({ cuotas: Math.max(1, Math.min(36, cuotas)) }),
      setDocumento: (documento) => set({ documento }),
      setPersonal: (personal) => set({ personal }),
      setFecha: (fecha) => set({ fecha }),
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
      }),
    },
  ),
);

export const selectSubtotal = (items: CartItem[]): number =>
  items.reduce((acc, it) => acc + it.cantidad * it.precio, 0);

export const selectIgv = (items: CartItem[]): number => {
  // Para items con IGV incluido, el IGV ya está dentro del precio.
  // Aproximación: si conIgv=true, precio es con IGV. El IGV extraído = subtotal * (18/118).
  const totalConIgv = items
    .filter((i) => i.conIgv)
    .reduce((acc, it) => acc + it.cantidad * it.precio, 0);
  return Math.round((totalConIgv * 18) / 118 * 100) / 100;
};

export const selectTotal = (items: CartItem[]): number =>
  Math.round((selectSubtotal(items) - selectIgv(items)) * 100) / 100;
