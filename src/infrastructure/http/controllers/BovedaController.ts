import { Request, Response } from 'express';
import { GestionarBovedaUseCase } from '../../../application/use-cases/GestionarBovedaUseCase';
import { MongoBovedaAdapter } from '../../database/adapters/MongoBovedaAdapter';

// Inyección de Dependencias Manual
const bovedaRepository = new MongoBovedaAdapter();
const gestionarBovedaUseCase = new GestionarBovedaUseCase(bovedaRepository);

// Helper para obtener el ID del usuario desde el token de Keycloak
// El middleware 'express-oauth2-jwt-bearer' coloca el payload decodificado en 'req.auth.payload'
// 'sub' es el claim estándar para el Subject (ID del usuario)
const getUserId = (req: Request): string | undefined => {
  return (req as any).auth?.payload?.sub;
};

// --- 1. CREAR ACTIVO ---
export const agregarActivoController = async (req: Request, res: Response) => {
  try {
    const usuarioId = getUserId(req);

    if (!usuarioId) {
      return res.status(401).json({ error: 'Token inválido: No se encontró ID de usuario' });
    }

    await gestionarBovedaUseCase.agregarActivo(usuarioId, req.body);
    res.status(201).json({ message: 'Activo digital guardado exitosamente' });

  } catch (error) {
    console.error('Error en agregarActivo:', error);
    res.status(500).json({ error: 'Error interno al guardar el activo' });
  }
};

// --- 2. LEER ACTIVOS (GET) ---
export const obtenerActivosController = async (req: Request, res: Response) => {
  try {
    const usuarioId = getUserId(req);

    if (!usuarioId) {
      return res.status(401).json({ error: 'Token inválido: No se encontró ID de usuario' });
    }

    const activos = await gestionarBovedaUseCase.obtenerActivos(usuarioId);
    res.status(200).json(activos);

  } catch (error) {
    console.error('Error en obtenerActivos:', error);
    res.status(500).json({ error: 'Error interno al obtener activos' });
  }
};

// --- 3. ELIMINAR ACTIVO (DELETE) ---
export const eliminarActivoController = async (req: Request, res: Response) => {
  try {
    const usuarioId = getUserId(req);
    const activoId = req.params.id; // Viene de la URL /activos/:id

    if (!usuarioId) {
      return res.status(401).json({ error: 'Token inválido: No se encontró ID de usuario' });
    }

    if (!activoId) {
      return res.status(400).json({ error: 'ID del activo es requerido' });
    }

    await gestionarBovedaUseCase.eliminarActivo(usuarioId, activoId);
    res.status(200).json({ message: 'Activo eliminado correctamente' });

  } catch (error: any) {
    // Manejo de errores de dominio específicos
    if (error.message === 'BOVEDA_NOT_FOUND') {
      return res.status(404).json({ error: 'Bóveda no encontrada para este usuario' });
    }
    
    console.error('Error en eliminarActivo:', error);
    res.status(500).json({ error: 'Error interno al eliminar el activo' });
  }
};