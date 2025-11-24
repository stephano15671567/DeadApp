import { Uuid } from '../value-objects/Uuid';
import { FrecuenciaChequeo, FrecuenciaFactory } from '../strategies/FrecuenciaStrategies';

export enum EstadoChequeo {
  PENDIENTE = 'PENDIENTE', // Todo bien
  ALERTA = 'ALERTA',       // Se acerca la fecha (Opcional para futuro)
  FALLIDO = 'FALLIDO'      // Se pasó de la fecha
}

export class ChequeoVida {
  constructor(
    public readonly id: Uuid,
    public readonly usuarioId: string,
    public frecuencia: FrecuenciaChequeo,
    public ultimaSenal: Date = new Date(),
    public estado: EstadoChequeo = EstadoChequeo.PENDIENTE
  ) {}

  // Fecha calculada del siguiente chequeo según la estrategia de frecuencia
  get siguienteChequeo(): Date {
    const estrategia = FrecuenciaFactory.obtenerEstrategia(this.frecuencia);
    return estrategia.calcularFechaLimite(this.ultimaSenal);
  }

  // Lógica de Dominio puro: ¿Estoy vencido?
  verificarEstado(): void {
    const estrategia = FrecuenciaFactory.obtenerEstrategia(this.frecuencia);
    const fechaLimite = estrategia.calcularFechaLimite(this.ultimaSenal);
    const hoy = new Date();

    if (hoy > fechaLimite) {
      this.estado = EstadoChequeo.FALLIDO;
    } else {
      this.estado = EstadoChequeo.PENDIENTE;
    }
  }

  darSenal(): void {
    this.ultimaSenal = new Date();
    this.estado = EstadoChequeo.PENDIENTE;
  }
}