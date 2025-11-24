import { BovedaRepository } from '../../../domain/ports/out/BovedaRepository';
import { Boveda, EstadoBoveda } from '../../../domain/entities/Boveda';
import { ActivoDigital } from '../../../domain/entities/ActivoDigital';
import { BovedaModel } from '../schemas/BovedaSchema';
import { Uuid } from '../../../domain/value-objects/Uuid';

export class MongoBovedaAdapter implements BovedaRepository {
  
  // Asumimos que los detalles del constructor de ActivoDigital son conocidos
  private mapActivos(activos: any[]): ActivoDigital[] {
    return activos.map(a => new ActivoDigital(
        new Uuid(a._id),
        a.plataforma,
        a.usuarioCuenta,
        a.passwordCifrada,
        a.notas || '',
        (a.categoria as any) || 'OTRO',
        a.gestionado || false,
        a.fechaGestionado ? new Date(a.fechaGestionado) : undefined
    ));
  }

  private mapToEntity(doc: any): Boveda {
    // Reconstruye la CLASE Boveda con todos sus m�todos.
    return new Boveda(
      new Uuid(doc._id),
      doc.usuarioId,
      doc.nombre || 'B�veda Principal',
      doc.descripcion || 'B�veda Personal',
      doc.clave || 'CLAVE',
      doc.fechaCreacion || new Date(),
      doc.fechaActualizacion || new Date(),
      doc.estado as EstadoBoveda,
      this.mapActivos(doc.activos || [])
    );
  }
  
  // 3. M�TODO GUARDAR (Write)
  async guardar(boveda: Boveda): Promise<void> {
    const activosDoc = boveda.activos.map(a => ({
      _id: a.id.value,
      plataforma: a.plataforma,
      usuarioCuenta: a.usuarioCuenta,
      passwordCifrada: a.passwordCifrada,
      notas: a.notas,
      categoria: a.categoria,
      gestionado: a.gestionado,
      fechaGestionado: a.fechaGestionado
    }));

    await BovedaModel.findOneAndUpdate(
      { _id: boveda.id.value },
      {
        usuarioId: boveda.usuarioId,
        activos: activosDoc,
        fechaActualizacion: boveda.fechaActualizacion,
        estado: boveda.estado,
        nombre: boveda.nombre,
        descripcion: boveda.descripcion,
        clave: boveda.clave,
        fechaCreacion: boveda.fechaCreacion,
      },
      { upsert: true, new: true }
    );
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<Boveda | null> {
    const doc = await BovedaModel.findOne({ usuarioId }); 
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  // ?? FIX: IMPLEMENTACI�N DEL M�TODO QUE FALTABA
  async listarPorUsuarioId(usuarioId: string): Promise<Boveda[]> {
    const docs = await BovedaModel.find({ usuarioId });
    // Dado que s�lo hay una b�veda por usuario, devuelve un array con ella
    return docs.map(doc => this.mapToEntity(doc));
  }
}
