import { Router } from 'express';
import { statusController } from '../controllers/StatusController';

const router = Router();

router.get('/', statusController);

export { router as statusRoutes };
