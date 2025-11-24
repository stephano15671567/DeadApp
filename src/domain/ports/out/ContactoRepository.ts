import { ContactoClave } from '../../entities/ContactoClave';

export interface ContactoRepository {
  guardar(contacto: ContactoClave): Promise<void>;
  listarPorUsuarioId(usuarioId: string): Promise<ContactoClave[]>;
  eliminar(id: string): Promise<void>;
  contarPorUsuarioId(usuarioId: string): Promise<number>;
  buscarPorId(id: string): Promise<ContactoClave | null>;
}
