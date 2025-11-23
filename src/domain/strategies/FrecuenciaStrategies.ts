// Enums del Dominio
export enum FrecuenciaChequeo {
  TRES_MESES = '3_MESES',
  SEIS_MESES = '6_MESES',
  DOCE_MESES = '12_MESES'
}

// Interfaz de la Estrategia
export interface IFrecuenciaStrategy {
  calcularFechaLimite(ultimaSenal: Date): Date;
}

// --- Estrategias Concretas ---

export class TresMesesStrategy implements IFrecuenciaStrategy {
  calcularFechaLimite(ultimaSenal: Date): Date {
    const fecha = new Date(ultimaSenal);
    fecha.setMonth(fecha.getMonth() + 3);
    return fecha;
  }
}

export class SeisMesesStrategy implements IFrecuenciaStrategy {
  calcularFechaLimite(ultimaSenal: Date): Date {
    const fecha = new Date(ultimaSenal);
    fecha.setMonth(fecha.getMonth() + 6);
    return fecha;
  }
}

export class DoceMesesStrategy implements IFrecuenciaStrategy {
  calcularFechaLimite(ultimaSenal: Date): Date {
    const fecha = new Date(ultimaSenal);
    fecha.setMonth(fecha.getMonth() + 12);
    return fecha;
  }
}

// Factory para obtener la estrategia correcta
export class FrecuenciaFactory {
  static obtenerEstrategia(frecuencia: FrecuenciaChequeo): IFrecuenciaStrategy {
    switch (frecuencia) {
      case FrecuenciaChequeo.TRES_MESES: return new TresMesesStrategy();
      case FrecuenciaChequeo.SEIS_MESES: return new SeisMesesStrategy();
      case FrecuenciaChequeo.DOCE_MESES: return new DoceMesesStrategy();
      default: return new TresMesesStrategy(); // Default
    }
  }
}
