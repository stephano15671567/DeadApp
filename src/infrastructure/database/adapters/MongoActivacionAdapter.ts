import { ActivacionModel } from '../schemas/ActivacionSchema';
import { Uuid } from '../../../domain/value-objects/Uuid';

export class MongoActivacionAdapter {
  async crearSolicitud(usuarioId: string, contactoId: string, nota?: string, evidenciaUrl?: string) {
    const id = new Uuid();
    await ActivacionModel.create({
      _id: id.value,
      usuarioId,
      contactoId,
      estado: 'INICIADA',
      nota,
      evidenciaUrl,
      fechaSolicitud: new Date()
    });
    return id.value;
  }

  async listarPorUsuarioId(usuarioId: string) {
    return await ActivacionModel.find({ usuarioId }).lean();
  }

  async obtenerPorId(id: string) {
    return await ActivacionModel.findById(id).lean();
  }
}
