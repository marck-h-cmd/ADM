import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        throw new AppError('Usuario y contraseña requeridos', 400);
      }
      
      const loginResult = await authService.login(username, password);
      
      if (!loginResult) {
        throw new AppError('Credenciales inválidas', 401);
      }
      
      res.json({
        status: 'success',
        data: {
          token: loginResult.token,
          user: loginResult.user
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ status: 'success', message: 'Sesión cerrada correctamente' });
    } catch (error) {
      next(error);
    }
  }
};