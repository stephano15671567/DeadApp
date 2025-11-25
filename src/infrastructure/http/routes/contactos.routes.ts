import { Router } from 'express';
import { 
  crearContactoController, 
  listarContactosController,
  obtenerContactoController,
  eliminarContactoController,
  actualizarContactoController
} from '../controllers/ContactoController';
import { validateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(validateJwt); // Proteger todas las rutas

router.post('/', crearContactoController);
router.get('/', listarContactosController);
router.get('/:id', obtenerContactoController);
router.put('/:id', actualizarContactoController);
router.delete('/:id', eliminarContactoController);

export { router as contactosRoutes };
