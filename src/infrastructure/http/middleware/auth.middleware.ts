import { auth, claimCheck, InsufficientScopeError } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// 1. Validación REAL de JWT contra Keycloak
export const validateJwt = auth({
  issuerBaseURL: process.env.KEYCLOAK_ISSUER_URL,
  audience: process.env.KEYCLOAK_AUDIENCE, 
});

// 2. Middleware para verificar Roles (Opcional por ahora)
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = (req as any).auth?.payload;
    // Ajusta esta ruta según los roles de tu token (realm_access.roles)
    const roles = payload?.realm_access?.roles || [];

    if (roles.includes(role)) {
      next();
    } else {
      res.status(403).json({ message: `Acceso denegado: Se requiere el rol '${role}'` });
    }
  };
};

// 3. Manejo de errores
export const authErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof InsufficientScopeError) {
    res.status(403).json({ error: 'Permisos insuficientes' });
  } else if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Token inválido o no proporcionado' });
  } else {
    next(err);
  }
};