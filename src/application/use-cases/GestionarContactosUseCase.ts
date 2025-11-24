import { ContactoRepository } from '../../domain/ports/out/ContactoRepository';
import { ContactoClave } from '../../domain/entities/ContactoClave';
import { Uuid } from '../../domain/value-objects/Uuid';

export interface CrearContactoDto {
  nombre: string;
  email: string;
  telefono: string;
}

export class GestionarContactosUseCase {
  constructor(private readonly contactoRepo: ContactoRepository) {}

  async agregarContacto(usuarioId: string, datos: CrearContactoDto): Promise<void> {
    // Regla de Negocio: M�ximo 5 contactos
    const cantidadActual = await this.contactoRepo.contarPorUsuarioId(usuarioId);
    if (cantidadActual >= 5) {
      throw new Error('MAX_CONTACTOS_REACHED');
    }

    const nuevoContacto = new ContactoClave(
      new Uuid(),
      usuarioId,
      datos.nombre,
      datos.email,
      datos.telefono
    );

    await this.contactoRepo.guardar(nuevoContacto);
  }

  async listarContactos(usuarioId: string): Promise<ContactoClave[]> {
    return await this.contactoRepo.listarPorUsuarioId(usuarioId);
  }

  async obtenerContacto(usuarioId: string, id: string): Promise<ContactoClave | null> {
    const contacto = await this.contactoRepo.buscarPorId(id);
    if (!contacto || contacto.usuarioId !== usuarioId) {
      return null;
    }
    return contacto;
  }

  async eliminarContacto(usuarioId: string, id: string): Promise<void> {
    // Aquí podrías validar que el contacto pertenezca al usuario antes de borrar
    await this.contactoRepo.eliminar(id);
  }

  async actualizarContacto(usuarioId: string, id: string, datos: Partial<CrearContactoDto>): Promise<void> {
    const contacto = await this.contactoRepo.buscarPorId(id);
    if (!contacto) {
      throw new Error('CONTACTO_NOT_FOUND');
    }
    
    // Validar que el contacto pertenezca al usuario
    if (contacto.usuarioId !== usuarioId) {
      throw new Error('CONTACTO_NOT_OWNED');
    }
    
    contacto.actualizar(datos);
    await this.contactoRepo.guardar(contacto);
  }
}
