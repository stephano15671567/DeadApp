import { ChequeoVidaRepository } from '../../../domain/ports/out/ChequeoVidaRepository';
import { ChequeoVida, EstadoChequeo } from '../../../domain/entities/ChequeoVida';
import { FrecuenciaChequeo } from '../../../domain/strategies/FrecuenciaStrategies';
import { ChequeoVidaModel } from '../schemas/ChequeoVidaSchema';
import { Uuid } from '../../../domain/value-objects/Uuid';

export class MongoChequeoVidaAdapter implements ChequeoVidaRepository {
  
  // 1. Método Guardar (Persistencia)
  async guardar(chequeo: ChequeoVida): Promise<void> {
    await ChequeoVidaModel.findOneAndUpdate(
      { _id: chequeo.id.value },
      {
        usuarioId: chequeo.usuarioId,
        frecuencia: chequeo.frecuencia,
        ultimaSenal: chequeo.ultimaSenal,
        siguienteChequeo: chequeo.siguienteChequeo, 
        estado: chequeo.estado
      },
      { upsert: true, new: true }
    );
  }

  // 2. Método Buscar por ID (Usado en Ping)
  async buscarPorUsuarioId(usuarioId: string): Promise<ChequeoVida | null> {
    const doc = await ChequeoVidaModel.findOne({ usuarioId });
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  // ?? 3. MÉTODO CRÍTICO PARA EL CRON JOB (Fix del TypeError)
  async buscarTodos(): Promise<ChequeoVida[]> {
    // Retorna todos los documentos (sin filtro, tal como el Cron lo necesita)
    const docs = await ChequeoVidaModel.find({}); 
    return docs.map(doc => this.mapToEntity(doc));
  }

  // Helper de mapeo
  private mapToEntity(doc: any): ChequeoVida {
    return new ChequeoVida(
      new Uuid(doc._id),
      doc.usuarioId,
      doc.frecuencia as FrecuenciaChequeo,
      doc.ultimaSenal,
      doc.siguienteChequeo,
      doc.estado as EstadoChequeo
    );
  }
}
