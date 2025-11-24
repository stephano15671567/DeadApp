import { Uuid } from '../value-objects/Uuid';

export class ContactoClave {
  constructor(
    public readonly id: Uuid,
    public readonly usuarioId: string,
    public nombre: string,
    public email: string,
    public telefono: string
  ) {}

  actualizar(datos: { nombre?: string; email?: string; telefono?: string }): void {
    if (datos.nombre !== undefined) this.nombre = datos.nombre;
    if (datos.email !== undefined) this.email = datos.email;
    if (datos.telefono !== undefined) this.telefono = datos.telefono;
  }
}
