import { ContactoRepository } from '../../../domain/ports/out/ContactoRepository';
import { ContactoClave } from '../../../domain/entities/ContactoClave';
import { ContactoModel, IContactoDoc } from '../schemas/ContactoSchema';
import { Uuid } from '../../../domain/value-objects/Uuid';

export class MongoContactoAdapter implements ContactoRepository {
  
  async guardar(contacto: ContactoClave): Promise<void> {
    await ContactoModel.create({
      _id: contacto.id.value,
      usuarioId: contacto.usuarioId,
      nombre: contacto.nombre,
      email: contacto.email,
      telefono: contacto.telefono
    });
  }

  async listarPorUsuarioId(usuarioId: string): Promise<ContactoClave[]> {
    const docs = await ContactoModel.find({ usuarioId });
    return docs.map(this.mapToEntity);
  }

  async eliminar(id: string): Promise<void> {
    await ContactoModel.deleteOne({ _id: id });
  }

  async contarPorUsuarioId(usuarioId: string): Promise<number> {
    return await ContactoModel.countDocuments({ usuarioId });
  }

  private mapToEntity(doc: IContactoDoc): ContactoClave {
    return new ContactoClave(
      new Uuid(doc._id),
      doc.usuarioId,
      doc.nombre,
      doc.email,
      doc.telefono
    );
  }
}
