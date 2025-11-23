import { Request, Response } from 'express';
import { GestionarVidaUseCase } from '../../../application/use-cases/GestionarVidaUseCase';
import { MongoChequeoVidaAdapter } from '../../database/adapters/MongoChequeoVidaAdapter';
import { FrecuenciaChequeo } from '../../../domain/strategies/FrecuenciaStrategies';

const repo = new MongoChequeoVidaAdapter();
const useCase = new GestionarVidaUseCase(repo);

export const pingController = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).auth?.payload?.sub;
    // const usuarioId = "usuario-prueba-123"; // Descomentar si pruebas sin Keycloak

    if (!usuarioId) return res.status(401).json({ error: 'Usuario no identificado' });

    const { frecuencia } = req.body; // Opcional: '3_MESES', '6_MESES'

    await useCase.darSenalDeVida(usuarioId, frecuencia as FrecuenciaChequeo);
    
    res.status(200).json({ message: 'Señal de vida recibida. Reloj reiniciado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar señal de vida' });
  }
};