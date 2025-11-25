import { Request, Response } from 'express';
import { GestionarActivacionUseCase } from '../../../application/use-cases/GestionarActivacionUseCase';

const useCase = new GestionarActivacionUseCase();

export const solicitarActivacionController = async (req: Request, res: Response) => {
  try {
    const contactoId = req.body.contactoId || req.body.contacto_id;
    const usuarioId = req.body.usuarioId || req.body.usuario_id;
    const nota = req.body.nota;
    const evidenciaUrl = req.body.evidenciaUrl;

    if (!contactoId || !usuarioId) return res.status(400).json({ error: 'contactoId y usuarioId son requeridos' });

    const solicitudId = await useCase.solicitarActivacion(usuarioId, contactoId, nota, evidenciaUrl);
    return res.status(201).json({ solicitudId });
  } catch (err: any) {
    console.error('Error solicitar activacion:', err);
    if (err.message === 'CONTACTO_NO_ASIGNADO') return res.status(403).json({ error: 'CONTACTO_NO_ASIGNADO' });
    return res.status(500).json({ error: String(err) });
  }
};

export const listarSolicitudesController = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.params.usuarioId;
    if (!usuarioId) return res.status(400).json({ error: 'usuarioId es requerido' });
    const data = await useCase.listarSolicitudes(usuarioId);
    return res.status(200).json({ solicitudes: data });
  } catch (err) {
    console.error('Error listar solicitudes:', err);
    return res.status(500).json({ error: String(err) });
  }
};
