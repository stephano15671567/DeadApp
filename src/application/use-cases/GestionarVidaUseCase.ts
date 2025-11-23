import { ChequeoVidaRepository } from '../../domain/ports/out/ChequeoVidaRepository';
import { ChequeoVida, EstadoChequeo } from '../../domain/entities/ChequeoVida';
import { FrecuenciaChequeo } from '../../domain/strategies/FrecuenciaStrategies';
import { Uuid } from '../../domain/value-objects/Uuid';

export class GestionarVidaUseCase {
  constructor(private readonly chequeoRepo: ChequeoVidaRepository) {}

  // 1. DAR SEÑAL DE VIDA (Ping)
  async darSenalDeVida(usuarioId: string, frecuenciaPreferida?: FrecuenciaChequeo): Promise<void> {
    let chequeo = await this.chequeoRepo.buscarPorUsuarioId(usuarioId);

    if (!chequeo) {
      // Si es la primera vez, creamos el registro por defecto a 3 meses
      chequeo = new ChequeoVida(
        new Uuid(),
        usuarioId,
        frecuenciaPreferida || FrecuenciaChequeo.TRES_MESES
      );
    } else {
      // Si ya existe, actualizamos fecha
      chequeo.darSenal();
      if (frecuenciaPreferida) chequeo.frecuencia = frecuenciaPreferida;
    }

    await this.chequeoRepo.guardar(chequeo);
  }

  // 2. VERIFICAR USUARIOS (Para el Cron Job)
  async verificarUsuarios(): Promise<void> {
    console.log("??? Ejecutando verificación de vida masiva...");
    const todos = await this.chequeoRepo.buscarTodos();
    let fallidos = 0;

    for (const chequeo of todos) {
      const estadoAnterior = chequeo.estado;
      
      // Aquí el Dominio aplica la Estrategia
      chequeo.verificarEstado();

      // Si cambió a FALLIDO, guardamos
      if (chequeo.estado === EstadoChequeo.FALLIDO && estadoAnterior !== EstadoChequeo.FALLIDO) {
        console.warn(`?? ALERTA: El usuario ${chequeo.usuarioId} ha caducado. Iniciando protocolo de legado...`);
        fallidos++;
        await this.chequeoRepo.guardar(chequeo);
      }
    }
    console.log(`? Verificación completada. ${fallidos} usuarios marcados como FALLIDOS.`);
  }
}
