export type TipoCliente = 'V' | 'E' | 'P' | 'R';
export type Calificacion = 'A' | 'B' | 'C' | null;
export type Genero = 'M' | 'F';

export interface Cliente {
  Cliente: string;
  Zona: string;
  ZonaDesc?: string;
  Ruc: string | null;
  Nombre: string;
  Direccion: string | null;
  Saldo: number;
  credito: boolean;
  topeCredito: number;
  TipoCliente: TipoCliente;
  Calificacion: Calificacion;
  idRepresentante?: number;
  genero?: Genero;
  idCliente?: number;
  Telefono?: string | null;
}

export type CreateClienteDTO = {
  Cliente: string;
  Zona: string;
  Nombre: string;
  Direccion?: string;
  Ruc?: string;
  credito?: boolean;
  topeCredito?: number;
  TipoCliente: TipoCliente;
  idRepresentante: number;
  genero: Genero;
};

export type UpdateClienteDTO = Partial<{
  Nombre: string;
  Direccion: string;
  Zona: string;
  Ruc: string;
  credito: boolean;
  topeCredito: number;
  TipoCliente: TipoCliente;
  Calificacion: Calificacion;
}>;
