import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    nombre: string;
    personal: string;
    email?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No autorizado. Token no proporcionado', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      nombre: string;
      personal: string;
      email?: string;
    };

    req.user = {
      id: decoded.id,
      nombre: decoded.nombre,
      personal: decoded.personal,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token inválido o expirado', 401));
    } else if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Error de autenticación', 401));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('No autorizado', 401));
    }
    // Aquí puedes agregar lógica de roles
    // Por ejemplo: if (!roles.includes(req.user.rol)) { ... }
    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        nombre: string;
        personal: string;
      };
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Si el token es inválido, simplemente continuamos sin usuario
    next();
  }
};