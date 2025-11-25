import { auth, claimCheck, InsufficientScopeError } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// 1. Validaci�n REAL de JWT contra Keycloak
// The express-oauth2-jwt-bearer lib requires an issuer (or issuerBaseURL) and either a jwksUri or secret.
// If Keycloak variables are not provided, during development we provide a lightweight fallback
// that injects a dev auth payload from headers or env vars. In production we return a clear error.
const issuer = process.env.KEYCLOAK_ISSUER_URL || process.env.KEYCLOAK_ISSUER;
const audience = process.env.KEYCLOAK_AUDIENCE;

let _validateJwt: (req: Request, res: Response, next: NextFunction) => void;

if (issuer) {
  _validateJwt = auth({
    issuerBaseURL: issuer,
    audience: audience,
  }) as unknown as (req: Request, res: Response, next: NextFunction) => void;
} else {
  _validateJwt = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'production') {
      res.status(500).json({ error: 'Authentication is not configured on the server (missing KEYCLOAK_ISSUER_URL).' });
      return;
    }

    // Development fallback: allow requests and attach a mock auth payload.
    // Use `x-dev-user` and `x-dev-roles` headers to emulate different users/roles,
    // or fallback to environment variables `DEV_USER_ID` and `DEV_USER_ROLES`.
    const userId = req.header('x-dev-user') || process.env.DEV_USER_ID || 'dev-user';
    const rolesHeader = req.header('x-dev-roles') || process.env.DEV_USER_ROLES || 'usuario_titular';
    const roles = rolesHeader.split(',').map(r => r.trim()).filter(Boolean);

    (req as any).auth = { payload: { sub: userId, realm_access: { roles } } };
    next();
  };
}

export const validateJwt = _validateJwt;

// 2. Middleware para verificar Roles (Se usa en boveda.routes.ts)
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = (req as any).auth?.payload;
    // CR�TICO: Keycloak pone los roles aqu�
    const roles = payload?.realm_access?.roles || []; 

    if (roles.includes(role)) {
      next();
    } else {
      // 403 Forbidden si no tiene el rol
      res.status(403).json({ message: `Acceso denegado: Se requiere el rol '${role}'` });
    }
  };
};

// 3. Manejo de errores
export const authErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof InsufficientScopeError) {
    res.status(403).json({ error: 'Permisos insuficientes' });
  } else if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Token inv�lido o no proporcionado' });
  } else {
    next(err);
  }
};
