import { Request, Response } from 'express';
import { GestionarContactosUseCase } from '../../../application/use-cases/GestionarContactosUseCase';
import { MongoContactoAdapter } from '../../database/adapters/MongoContactoAdapter';

const repo = new MongoContactoAdapter();
const useCase = new GestionarContactosUseCase(repo);

const getUserId = (req: Request): string | undefined => {
  return (req as any).auth?.payload?.sub;
};

export const crearContactoController = async (req: Request, res: Response) => {
  try {
    const usuarioId = getUserId(req);
    if (!usuarioId) return res.status(401).json({ error: 'No autorizado' });

    await useCase.agregarContacto(usuarioId, req.body);
    res.status(201).json({ message: 'Contacto agregado' });
  } catch (error: any) {
    if (error.message === 'MAX_CONTACTOS_REACHED') {
      return res.status(400).json({ error: 'Has alcanzado el límite de 5 contactos.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno' });
  }
};

export const listarContactosController = async (req: Request, res: Response) => {
  try {
    const usuarioId = getUserId(req);
    if (!usuarioId) return res.status(401).json({ error: 'No autorizado' });

    const contactos = await useCase.listarContactos(usuarioId);
    res.status(200).json(contactos);
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};

export const eliminarContactoController = async (req: Request, res: Response) => {
  try {
    const usuarioId = getUserId(req);
    const id = req.params.id;
    if (!usuarioId) return res.status(401).json({ error: 'No autorizado' });

    await useCase.eliminarContacto(usuarioId, id);
    res.status(200).json({ message: 'Contacto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};
