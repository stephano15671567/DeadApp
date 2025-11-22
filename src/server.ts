import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateJwt, authErrorHandler } from './infrastructure/http/middleware/auth.middleware';
import { connectToMongoDB } from './infrastructure/database/mongoose.connection';
import { bovedaRoutes } from './infrastructure/http/routes/boveda.routes'; // <--- IMPORTAR

dotenv.config();

// 1. Conectar Base de Datos
connectToMongoDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas Públicas
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// 2. Registrar Rutas de la Bóveda
// Esto creará: POST http://localhost:3000/api/boveda/activos
app.use('/api/boveda', bovedaRoutes); 

// Middleware de errores de Auth
app.use(authErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});