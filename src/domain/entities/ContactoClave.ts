import { Uuid } from '../value-objects/Uuid';

export class ContactoClave {
  constructor(
    public readonly id: Uuid,
    public readonly usuarioId: string,
    public nombre: string,
    public email: string,
    public telefono: string
  ) {}
}
