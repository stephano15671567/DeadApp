import { BovedaRepository } from '../../../domain/ports/out/BovedaRepository';
import { Boveda } from '../../../domain/entities/Boveda';
import { ActivoDigital, CategoriaActivo } from '../../../domain/entities/ActivoDigital';
import { BovedaModel, IActivoDigitalDoc } from '../schemas/BovedaSchema';
import { Uuid } from '../../../domain/value-objects/Uuid';

export class MongoBovedaAdapter implements BovedaRepository {
  
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
        fechaUltimoCambio: boveda.fechaUltimoCambio
      },
      { upsert: true, new: true }
    );
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<Boveda | null> {
    const doc = await BovedaModel.findOne({ usuarioId });
    if (!doc) return null;

    const activosDominio = doc.activos.map((a: IActivoDigitalDoc) => 
      new ActivoDigital(
        new Uuid(a._id),
        a.plataforma,
        a.usuarioCuenta,
        a.passwordCifrada,
        a.notas,
        a.categoria as CategoriaActivo,
        a.gestionado,
        a.fechaGestionado
      )
    );

    return new Boveda(
      new Uuid(doc._id),
      doc.usuarioId,
      activosDominio,
      doc.fechaUltimoCambio
    );
  }
}