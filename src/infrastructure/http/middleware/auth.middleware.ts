import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// --- MODO DESARROLLO: BYPASS TOTAL DE SEGURIDAD ---
// Esto permite probar el CRUD sin necesitar Tokens de Keycloak todavía.

export const validateJwt = (req: Request, res: Response, next: NextFunction) => {
  console.log('⚠️ [DEV MODE] Saltando validación de Token JWT');
  next(); // Deja pasar a todo el mundo
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(`⚠️ [DEV MODE] Saltando validación de Rol: ${role}`);
    next(); // Deja pasar cualquier rol
  };
};

export const authErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error de Auth:', err);
  res.status(401).json({ error: 'Error de autenticación (Bypassed)' });
};