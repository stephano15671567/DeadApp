import { Uuid } from '../value-objects/Uuid';
import { ActivoDigital } from './ActivoDigital'; // Asumimos este import

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
    private _activos: ActivoDigital[] = [] // ?? FIX: Inicializar la lista como array vacío
  ) {}

  get activos(): ActivoDigital[] {
    return [...this._activos];
  }

  agregarActivo(activo: ActivoDigital): void {
    // ?? FIX: Asegurar que _activos sea un array antes de hacer push (aunque ya lo inicializamos)
    this._activos.push(activo); 
    this.fechaActualizacion = new Date();
  }

  // Método estático para simplificar la creación inicial
  static createNew(usuarioId: string): Boveda {
    const ahora = new Date();
    return new Boveda(
      new Uuid(),
      usuarioId,
      'Bóveda Principal de Legado', 
      'Contenedor de todos los activos digitales del usuario.', 
      'CLAVE_MAESTRA_DEFAULT', 
      ahora,
      ahora,
      EstadoBoveda.ACTIVA,
      [] // ?? Pasar el array vacío explícitamente para la primera creación
    );
  }

  liberar(): void {
    if (this.estado === EstadoBoveda.LIBERADA) {
      throw new Error('La bóveda ya está liberada.');
    }
    this.estado = EstadoBoveda.LIBERADA;
  }
}
