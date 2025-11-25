import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateJwt, authErrorHandler } from './infrastructure/http/middleware/auth.middleware';
import { connectToMongoDB } from './infrastructure/database/mongoose.connection';
import { bovedaRoutes } from './infrastructure/http/routes/boveda.routes';
import { vidaRoutes } from './infrastructure/http/routes/vida.routes'; // <--- NUEVO
import { initLifeCheckJob } from './infrastructure/jobs/lifeCheckJob';   // <--- NUEVO
import { contactosRoutes } from './infrastructure/http/routes/contactos.routes'
import { activacionRoutes } from './infrastructure/http/routes/activacion.routes'
import { MongoBovedaAdapter } from './infrastructure/database/adapters/MongoBovedaAdapter';
import { GestionarBovedaUseCase } from './application/use-cases/GestionarBovedaUseCase';

dotenv.config();
connectToMongoDB();

// Iniciar Cron Jobs
initLifeCheckJob(); // <--- ARRANCA EL CRON

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => { res.status(200).json({ status: 'OK' }); });

app.use('/api/boveda', bovedaRoutes);
app.use('/api/vida', vidaRoutes); // <--- NUEVA RUTA
app.use('/api/contactos', contactosRoutes);
app.use('/api/activacion', activacionRoutes);

// Dev-only helper endpoint to quickly test adding an activo and returning the boveda.
const enableDev = process.env.ENABLE_DEV_ENDPOINTS === 'true';
const devSecret = process.env.DEV_ENDPOINTS_SECRET || '';

function requireDevSecret(req: any, res: any, next: any) {
  const header = (req.headers['x-dev-secret'] || req.headers['X-Dev-Secret'] || req.headers['x-dev-Secret']) as string | undefined;
  if (!devSecret) {
    // If no dev secret is configured, refuse access — safer than allowing open dev endpoints.
    return res.status(401).json({ error: 'DEV_ENDPOINTS_DISABLED' });
  }
  if (!header || header !== devSecret) {
    return res.status(401).json({ error: 'UNAUTHORIZED_DEV_ENDPOINT' });
  }
  return next();
}

if (enableDev) {
  if (!devSecret) {
    console.warn('WARNING: ENABLE_DEV_ENDPOINTS is true but DEV_ENDPOINTS_SECRET is not set. Dev endpoints will NOT be registered.');
  } else if (process.env.NODE_ENV === 'production') {
    console.warn('WARNING: Dev endpoints are disabled in production environment. Set NODE_ENV to development for local testing.');
  } else {
  app.post('/__dev/add-activo', requireDevSecret, async (req, res) => {
    try {
      const repo = new MongoBovedaAdapter();
      const useCase = new GestionarBovedaUseCase(repo);

      const usuarioId = req.body.usuarioId || 'dev-user-1';
      const datos = {
        plataforma: req.body.plataforma || 'PLATAFORMA_DEV',
        usuarioCuenta: req.body.usuarioCuenta || 'usuario.dev',
        password: req.body.password || 'Secreto123!',
        notas: req.body.notas || 'Nota de prueba',
        categoria: req.body.categoria || 'OTRO'
      };

      await useCase.agregarActivo(usuarioId, datos as any);

      const boveda = await repo.buscarPorUsuarioId(usuarioId);
      return res.status(201).json({ saved: !!boveda, boveda });
    } catch (err) {
      console.error('Dev add-activo error:', err);
      return res.status(500).json({ error: String(err) });
    }
  });
  
  // Dev-only: obtener activos descifrados para un usuario
  app.get('/__dev/get-activos/:usuarioId', requireDevSecret, async (req, res) => {
    try {
      const repo = new MongoBovedaAdapter();
      const useCase = new GestionarBovedaUseCase(repo);
      const usuarioId = req.params.usuarioId;
      if (!usuarioId) return res.status(400).json({ error: 'usuarioId es requerido' });

      const activos = await useCase.obtenerActivos(usuarioId);
      return res.status(200).json({ activos });
    } catch (err) {
      console.error('Dev get-activos error:', err);
      return res.status(500).json({ error: String(err) });
    }
  });
}

// Validate critical envs for production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.ENCRYPTION_KEY) {
    console.error('❌ ENCRYPTION_KEY is required in production environment.');
    process.exit(1);
  }
}

app.use(authErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
});