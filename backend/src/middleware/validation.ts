import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler';

// Esquemas de validación
export const productoSchema = z.object({
  Producto: z.string().length(4),
  Marca: z.string().length(2),
  Descripcion: z.string().min(1).max(200),
  StockAc: z.number().int().min(0).default(0),
  StockMax: z.number().int().min(0).default(0),
  StockMin: z.number().int().min(0).default(0),
  PrecVenta: z.number().min(0),
  PrecCosto: z.number().min(0),
  Peso: z.number().min(0).default(0),
  ConIgv: z.boolean().default(true),
  UniMed: z.string().default('UNIDAD')
});

export const clienteSchema = z.object({
  Cliente: z.string().length(4),
  Zona: z.string().length(2),
  Nombre: z.string().min(1).max(100),
  Direccion: z.string().max(100).optional(),
  Ruc: z.string().length(11).optional(),
  credito: z.boolean().default(false),
  topeCredito: z.number().min(0).default(0),
  TipoCliente: z.enum(['V', 'E', 'P', 'R']),
  idRepresentante: z.number().int().min(1),
  genero: z.enum(['M', 'F'])
});

export const ventaSchema = z.object({
  cliente: z.string().length(4),
  documento: z.string().length(9),
  fecha: z.string().datetime(),
  personal: z.string().length(2),
  formaPago: z.string().length(1),
  productos: z.array(z.object({
    producto: z.string().length(4),
    cantidad: z.number().min(1),
    precio: z.number().min(0)
  })).min(1),
  credito: z.boolean().default(false),
  cuotas: z.number().int().min(1).max(36).optional()
});

export const compraSchema = z.object({
  proveedor: z.string().length(4),
  documento: z.string().length(9),
  fecha: z.string().datetime(),
  personal: z.string().length(2),
  productos: z.array(z.object({
    producto: z.string().length(4),
    cantidad: z.number().min(1),
    precio: z.number().min(0)
  })).min(1)
});

export const loginSchema = z.object({
  username: z.string().email(),
  password: z.string().min(4)
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(error.errors.map(e => e.message).join(', '), 400));
      } else {
        next(error);
      }
    }
  };
};