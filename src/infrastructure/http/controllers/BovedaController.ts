import { Request, Response } from 'express';
import { GestionarBovedaUseCase } from '../../../application/use-cases/GestionarBovedaUseCase';
import { MongoBovedaAdapter } from '../../database/adapters/MongoBovedaAdapter';

const bovedaRepository = new MongoBovedaAdapter();
const gestionarBovedaUseCase = new GestionarBovedaUseCase(bovedaRepository);

// Helper para obtener usuario (con fallback para pruebas)
const getUserId = (req: Request) => (req as any).auth?.payload?.sub || "usuario-prueba-123";

export const agregarActivoController = async (req: Request, res: Response) => {
  try {
    await gestionarBovedaUseCase.agregarActivo(getUserId(req), req.body);
    res.status(201).json({ message: 'Activo guardado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno' });
  }
};

export const obtenerActivosController = async (req: Request, res: Response) => {
  try {
    const activos = await gestionarBovedaUseCase.obtenerActivos(getUserId(req));
    res.status(200).json(activos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno' });
  }
};

export const eliminarActivoController = async (req: Request, res: Response) => {
  try {
    const activoId = req.params.id;
    if (!activoId) return res.status(400).json({ error: 'Falta el ID' });

    await gestionarBovedaUseCase.eliminarActivo(getUserId(req), activoId);
    res.status(200).json({ message: 'Activo eliminado correctamente' });
  } catch (error: any) {
    if (error.message === 'BOVEDA_NOT_FOUND') return res.status(404).json({ error: 'Bóveda no encontrada' });
    console.error(error);
    res.status(500).json({ error: 'Error interno' });
  }
};