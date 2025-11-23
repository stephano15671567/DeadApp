import { ChequeoVidaRepository } from '../../../domain/ports/out/ChequeoVidaRepository';
import { ChequeoVida, EstadoChequeo } from '../../../domain/entities/ChequeoVida';
import { FrecuenciaChequeo } from '../../../domain/strategies/FrecuenciaStrategies';
import { ChequeoVidaModel } from '../schemas/ChequeoVidaSchema';
import { Uuid } from '../../../domain/value-objects/Uuid';

export class MongoChequeoVidaAdapter implements ChequeoVidaRepository {
  
  async guardar(chequeo: ChequeoVida): Promise<void> {
    await ChequeoVidaModel.findOneAndUpdate(
      { _id: chequeo.id.value },
      {
        usuarioId: chequeo.usuarioId,
        frecuencia: chequeo.frecuencia,
        ultimaSenal: chequeo.ultimaSenal,
        estado: chequeo.estado
      },
      { upsert: true, new: true }
    );
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<ChequeoVida | null> {
    const doc = await ChequeoVidaModel.findOne({ usuarioId });
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async buscarTodos(): Promise<ChequeoVida[]> {
    const docs = await ChequeoVidaModel.find({});
    return docs.map(doc => this.mapToEntity(doc));
  }

  private mapToEntity(doc: any): ChequeoVida {
    return new ChequeoVida(
      new Uuid(doc._id),
      doc.usuarioId,
      doc.frecuencia as FrecuenciaChequeo,
      doc.ultimaSenal,
      doc.estado as EstadoChequeo
    );
  }
}