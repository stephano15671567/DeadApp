import { Uuid } from '../value-objects/Uuid';
import { ActivoDigital } from './ActivoDigital';

export class Boveda {
  constructor(
    public readonly id: Uuid,
    public readonly usuarioId: string,
    private _activos: ActivoDigital[] = [],
    public fechaUltimoCambio: Date = new Date()
  ) {}

  get activos(): ActivoDigital[] {
    return [...this._activos];
  }

  agregarActivo(activo: ActivoDigital): void {
    this._activos.push(activo);
    this.actualizarFechaCambio();
  }

  // Lógica para eliminar un activo de la lista
  eliminarActivo(activoId: string): void {
    this._activos = this._activos.filter(a => a.id.value !== activoId);
    this.actualizarFechaCambio();
  }

  private actualizarFechaCambio(): void {
    this.fechaUltimoCambio = new Date();
  }
}