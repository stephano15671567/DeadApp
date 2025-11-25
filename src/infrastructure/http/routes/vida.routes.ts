import { Router } from 'express';
import { pingController } from '../controllers/VidaController';
import { validateJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/ping', validateJwt, pingController);

export { router as vidaRoutes };