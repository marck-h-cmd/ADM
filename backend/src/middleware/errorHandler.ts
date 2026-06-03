import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Error operacional conocido
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Error de PostgreSQL - llave duplicada
  if (err.message.includes('duplicate key value violates unique constraint')) {
    return res.status(409).json({
      status: 'fail',
      message: 'El registro ya existe',
      timestamp: new Date().toISOString()
    });
  }

  // Error de PostgreSQL - foreign key violada
  if (err.message.includes('violates foreign key constraint')) {
    const detail = (err as any).detail;
    let message = 'El registro está siendo utilizado en otra tabla';
    if (detail && detail.includes('is not present in table')) {
      const match = detail.match(/Key \((.*?)\)=\((.*?)\) is not present in table "(.*?)"/);
      if (match) {
        const [_, key, value, table] = match;
        let readableTable = table;
        if (table.toLowerCase() === 'marca') readableTable = 'marcas';
        else if (table.toLowerCase() === 'cliente') readableTable = 'clientes';
        else if (table.toLowerCase() === 'personal') readableTable = 'personal';
        else if (table.toLowerCase() === 'producto') readableTable = 'productos';
        else if (table.toLowerCase() === 'proveedor') readableTable = 'proveedores';
        else if (table.toLowerCase() === 'zona') readableTable = 'zonas';
        
        message = `El registro de referencia con ${key} '${value}' no existe en la tabla de ${readableTable}`;
      } else {
        message = 'El registro de referencia no existe';
      }
    } else if (err.message.includes('insert or update')) {
      message = 'El registro de referencia no existe';
    } else {
      message = 'El registro está siendo utilizado en otra tabla y no se puede eliminar';
    }

    return res.status(400).json({
      status: 'fail',
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Error de PostgreSQL - not null violation
  if (err.message.includes('null value in column')) {
    return res.status(400).json({
      status: 'fail',
      message: 'Faltan campos requeridos',
      timestamp: new Date().toISOString()
    });
  }

  // Error de validación de datos
  if (err.message.includes('invalid input syntax')) {
    return res.status(400).json({
      status: 'fail',
      message: 'Formato de datos inválido',
      timestamp: new Date().toISOString()
    });
  }

  // Error de conexión a BD
  if (err.message.includes('connection') || err.message.includes('timeout')) {
    return res.status(503).json({
      status: 'error',
      message: 'Error de conexión con la base de datos',
      timestamp: new Date().toISOString()
    });
  }

  // Log del error para debugging
  console.error('❌ Error no manejado:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  // Error genérico para producción
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
};

// Middleware para rutas no encontradas
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Ruta ${req.originalUrl} no encontrada`, 404));
};