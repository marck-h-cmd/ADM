import type { StoreApi, UseBoundStore } from 'zustand';

export interface DocumentoItem {
  producto: string;
  descripcion: string;
  marca: string;
  precio: number;
  cantidad: number;
  stockDisponible: number;
  conIgv: boolean;
}

export interface DocumentoState {
  items: DocumentoItem[];
  addItem: (item: Omit<DocumentoItem, 'cantidad'>, cantidad?: number) => void;
  updateCantidad: (producto: string, cantidad: number) => void;
  removeItem: (producto: string) => void;
  clear: () => void;
}

export type DocumentoStore = UseBoundStore<StoreApi<DocumentoState>>;

export const selectSubtotal = (items: DocumentoItem[]): number =>
  items.reduce((acc, it) => acc + it.cantidad * it.precio, 0);

export const selectIgv = (items: DocumentoItem[]): number => {
  const totalConIgv = items
    .filter((i) => i.conIgv)
    .reduce((acc, it) => acc + it.cantidad * it.precio, 0);
  return Math.round((totalConIgv * 18) / 118 * 100) / 100;
};

export const selectTotal = (items: DocumentoItem[]): number =>
  Math.round((selectSubtotal(items) - selectIgv(items)) * 100) / 100;
