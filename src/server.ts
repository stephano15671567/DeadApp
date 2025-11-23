import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateJwt, authErrorHandler } from './infrastructure/http/middleware/auth.middleware';
import { connectToMongoDB } from './infrastructure/database/mongoose.connection';
import { bovedaRoutes } from './infrastructure/http/routes/boveda.routes';
import { vidaRoutes } from './infrastructure/http/routes/vida.routes'; // <--- NUEVO
import { initLifeCheckJob } from './infrastructure/jobs/lifeCheckJob';   // <--- NUEVO
import { contactosRoutes } from './infrastructure/http/routes/contactos.routes'

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

app.use(authErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
});