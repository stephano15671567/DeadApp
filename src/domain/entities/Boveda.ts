import { Uuid } from '../value-objects/Uuid';
import { ActivoDigital } from './ActivoDigital';

export enum EstadoBoveda {
  ACTIVA = 'ACTIVA',
  LIBERADA = 'LIBERADA',
}

export class Boveda {
  constructor(
    public readonly id: Uuid,
    public readonly usuarioId: string,
    public nombre: string, 
    public descripcion: string, 
    public clave: string, 
    public fechaCreacion: Date,
    public fechaActualizacion: Date,
    public estado: EstadoBoveda = EstadoBoveda.ACTIVA,
    private _activos: ActivoDigital[] = [] 
  ) {}

  get activos(): ActivoDigital[] {
    return [...this._activos];
  }

  agregarActivo(activo: ActivoDigital): void {
    this._activos.push(activo); 
    this.fechaActualizacion = new Date();
  }

  eliminarActivo(activoId: string): void {
    const originalLength = this._activos.length;
    this._activos = this._activos.filter(a => a.id.value !== activoId);
    if (this._activos.length !== originalLength) {
      this.fechaActualizacion = new Date();
    }
  }

  static createNew(usuarioId: string): Boveda {
    const ahora = new Date();
    return new Boveda(
      new Uuid(),
      usuarioId,
      'B�veda Principal de Legado', 
      'Contenedor de todos los activos digitales del usuario.', 
      'CLAVE_MAESTRA_DEFAULT', 
      ahora,
      ahora,
      EstadoBoveda.ACTIVA,
      []
    );
  }

  liberar(): void {
    if (this.estado === EstadoBoveda.LIBERADA) {
      throw new Error('La b�veda ya est� liberada.');
    }
    this.estado = EstadoBoveda.LIBERADA;
  }
}
