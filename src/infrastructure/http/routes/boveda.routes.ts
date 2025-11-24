import { Router } from 'express';
import { 
  agregarActivoController, 
  obtenerActivosController, 
  eliminarActivoController 
} from '../controllers/BovedaController';
import { validateJwt, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren un token válido
router.use(validateJwt);

// CREAR, LEER, ELIMINAR solo para el Titular del Legado
router.post('/activos', requireRole('usuario_titular'), agregarActivoController);
router.get('/activos', requireRole('usuario_titular'), obtenerActivosController);
router.delete('/activos/:id', requireRole('usuario_titular'), eliminarActivoController);

export { router as bovedaRoutes };
