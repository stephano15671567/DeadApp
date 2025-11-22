import { Uuid } from '../value-objects/Uuid';

export type CategoriaActivo = 'RED_SOCIAL' | 'BANCO' | 'EMAIL' | 'OTRO';

export class ActivoDigital {
  constructor(
    public readonly id: Uuid,
    public plataforma: string,
    public usuarioCuenta: string,
    public passwordCifrada: string, // Se guarda ya cifrada
    public notas: string = '',
    public categoria: CategoriaActivo = 'OTRO',
    public gestionado: boolean = false,
    public fechaGestionado?: Date
  ) {}

  marcarComoGestionado(): void {
    this.gestionado = true;
    this.fechaGestionado = new Date();
  }
}