import { Router } from 'express';
import { 
  agregarActivoController, 
  obtenerActivosController, 
  eliminarActivoController 
} from '../controllers/BovedaController';
import { validateJwt } from '../middleware/auth.middleware';

const router = Router();

// Aplicamos el middleware (que ahora hace bypass y deja pasar)
router.post('/activos', validateJwt, agregarActivoController);
router.get('/activos', validateJwt, obtenerActivosController);
router.delete('/activos/:id', validateJwt, eliminarActivoController);

export { router as bovedaRoutes };