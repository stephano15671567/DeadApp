import { MongoActivacionAdapter } from '../../infrastructure/database/adapters/MongoActivacionAdapter';
import { MongoContactoAdapter } from '../../infrastructure/database/adapters/MongoContactoAdapter';

export class GestionarActivacionUseCase {
  private activacionAdapter = new MongoActivacionAdapter();
  private contactoAdapter = new MongoContactoAdapter();

  // Crear solicitud: valida que el contacto pertenece al usuario antes de crear solicitud
  async solicitarActivacion(usuarioId: string, contactoId: string, nota?: string, evidenciaUrl?: string) {
    // validar que el contacto existe y pertenece al usuario
    const contactos = await this.contactoAdapter.listarPorUsuarioId(usuarioId);
    const existe = contactos.some(c => c.id.value === contactoId || c.id === contactoId || (c as any)._id === contactoId);
    if (!existe) {
      throw new Error('CONTACTO_NO_ASIGNADO');
    }

    const solicitudId = await this.activacionAdapter.crearSolicitud(usuarioId, contactoId, nota, evidenciaUrl);
    return solicitudId;
  }

  async listarSolicitudes(usuarioId: string) {
    return await this.activacionAdapter.listarPorUsuarioId(usuarioId);
  }
}
