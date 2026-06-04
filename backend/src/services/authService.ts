import { query } from '../config/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const authService = {
  async login(username: string, password: string): Promise<{ token: string; user: any } | null> {
    // Buscar usuario en PERSONAL
    const result = await query(
      `SELECT "Personal", "Nombre", "Email", "Password" FROM PERSONAL WHERE "Email" = $1 AND "Activo" = 1`,
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Verificar la contraseña usando bcrypt
    const isValid = await bcrypt.compare(password, user.Password || '');

    if (!isValid) {
      return null;
    }

    const token = jwt.sign(
      { id: user.Personal, nombre: user.Nombre, personal: user.Personal, email: user.Email },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    return {
      token,
      user: {
        id: user.Personal,
        nombre: user.Nombre,
        email: user.Email
      }
    };
  },

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return decoded;
    } catch (error) {
      return null;
    }
  },

  async changePassword(personalId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    // Implementar cambio de contraseña
    // Por ahora, retorna true
    return true;
  }
};