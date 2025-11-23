import { Router } from 'express';
import { 
  crearContactoController, 
  listarContactosController, 
  eliminarContactoController 
} from '../controllers/ContactoController';
import { validateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(validateJwt); // Proteger todas las rutas

router.post('/', crearContactoController);
router.get('/', listarContactosController);
router.delete('/:id', eliminarContactoController);

export { router as contactosRoutes };
