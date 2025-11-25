import { Router } from 'express';
import { 
  agregarActivoController, 
  obtenerActivosController,
  obtenerActivoController,
  eliminarActivoController,
  actualizarActivoController
} from '../controllers/BovedaController';
import { validateJwt, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren un token válido
router.use(validateJwt);

// CREAR, LEER, ACTUALIZAR, ELIMINAR solo para el Titular del Legado
router.post('/activos', requireRole('usuario_titular'), agregarActivoController);
router.get('/activos', requireRole('usuario_titular'), obtenerActivosController);
router.get('/activos/:id', requireRole('usuario_titular'), obtenerActivoController);
router.put('/activos/:id', requireRole('usuario_titular'), actualizarActivoController);
router.delete('/activos/:id', requireRole('usuario_titular'), eliminarActivoController);

export { router as bovedaRoutes };
