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
    // Regla de Negocio: Máximo 5 contactos
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

  async eliminarContacto(usuarioId: string, id: string): Promise<void> {
    // Aquí podrías validar que el contacto pertenezca al usuario antes de borrar
    await this.contactoRepo.eliminar(id);
  }
}
