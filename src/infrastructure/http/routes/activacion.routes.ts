import { Router } from 'express';
import { solicitarActivacionController, listarSolicitudesController } from '../controllers/ActivacionController';
import { validateJwt, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Solicitud de activacion: solo contactos clave pueden solicitar
router.post('/solicitar', validateJwt, requireRole('contacto_clave'), solicitarActivacionController);

// Listar solicitudes por usuario: titular o admin
router.get('/usuario/:usuarioId', validateJwt, (req, res, next) => {
  // allow usuario_titular or admin via requireRole checks
  const role = (req as any).auth?.payload?.realm_access?.roles || [];
  if (role.includes('usuario_titular') || role.includes('admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado' });
}, listarSolicitudesController);

export { router as activacionRoutes };
