import { ChequeoVidaRepository } from '../../../domain/ports/out/ChequeoVidaRepository';
import { ChequeoVida, EstadoChequeo } from '../../../domain/entities/ChequeoVida';
import { FrecuenciaChequeo, FrecuenciaFactory } from '../../../domain/strategies/FrecuenciaStrategies';
import { ChequeoVidaModel } from '../schemas/ChequeoVidaSchema';
import { Uuid } from '../../../domain/value-objects/Uuid';

export class MongoChequeoVidaAdapter implements ChequeoVidaRepository {
  
  // 1. Método Guardar (Persistencia)
  async guardar(chequeo: ChequeoVida): Promise<void> {
    // Calcular siguienteChequeo usando la estrategia
    const estrategia = FrecuenciaFactory.obtenerEstrategia(chequeo.frecuencia);
    const siguienteChequeo = estrategia.calcularFechaLimite(chequeo.ultimaSenal);
    
    await ChequeoVidaModel.findOneAndUpdate(
      { _id: chequeo.id.value },
      {
        usuarioId: chequeo.usuarioId,
        frecuencia: chequeo.frecuencia,
        ultimaSenal: chequeo.ultimaSenal,
        siguienteChequeo: siguienteChequeo, 
        estado: chequeo.estado
      },
      { upsert: true, new: true }
    );
  }

  // 2. M�todo Buscar por ID (Usado en Ping)
  async buscarPorUsuarioId(usuarioId: string): Promise<ChequeoVida | null> {
    const doc = await ChequeoVidaModel.findOne({ usuarioId });
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  // ?? 3. M�TODO CR�TICO PARA EL CRON JOB (Fix del TypeError)
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
      doc.estado as EstadoChequeo
    );
  }
}
