import { ChequeoVidaRepository } from '../../domain/ports/out/ChequeoVidaRepository';
import { BovedaRepository } from '../../domain/ports/out/BovedaRepository';
import { ContactoRepository } from '../../domain/ports/out/ContactoRepository';
import { EmailService } from '../../domain/ports/out/EmailService';
import { ChequeoVida, EstadoChequeo } from '../../domain/entities/ChequeoVida';
import { FrecuenciaChequeo, FrecuenciaFactory } from '../../domain/strategies/FrecuenciaStrategies'; // <--- FIX CR�TICO: Importar Factory
import { Uuid } from '../../domain/value-objects/Uuid';

// Asumimos que calcularSiguienteChequeo y DarSenalVidaDto est�n disponibles si el c�digo anterior existe
export interface DarSenalVidaDto {
  frecuencia?: FrecuenciaChequeo;
}
const calcularSiguienteChequeo = (ultimaSenal: Date, frecuencia: FrecuenciaChequeo): Date => {
    // Placeholder logic for calculation
    const fechaLimite = new Date(ultimaSenal);
    fechaLimite.setMonth(fechaLimite.getMonth() + (frecuencia === '3_MESES' ? 3 : 6));
    return fechaLimite;
};


export class GestionarVidaUseCase {
  private readonly LINK_ACCESO_SIMULADO = 'https://app.testamento-digital.com/acceso?token=XYZ123';

  constructor(
    private readonly chequeoVidaRepo: ChequeoVidaRepository,
    private readonly bovedaRepo: BovedaRepository,
    private readonly contactoRepo: ContactoRepository,
    private readonly emailService: EmailService
  ) {}

  // 1. DAR SEÑAL DE VIDA (Ping)
  async darSenalDeVida(usuarioId: string, { frecuencia }: DarSenalVidaDto): Promise<ChequeoVida> {
    const chequeo = await this.chequeoVidaRepo.buscarPorUsuarioId(usuarioId); 
    // ... (resto del código del ping) ...
    if (!chequeo) {
      throw new Error('Chequeo de vida no encontrado');
    }
    return chequeo;
  }

  // 2. VERIFICAR USUARIOS (El m�todo que ejecuta el Cron Job)
  async verificarUsuarios(): Promise<void> {
    console.log(`[CRON] Verificando estado de vida de todos los usuarios...`);

    const chequeosActivos = await this.chequeoVidaRepo.buscarTodos(); 
    const ahora = new Date();

    for (const chequeo of chequeosActivos) {
        const estrategia = FrecuenciaFactory.obtenerEstrategia(chequeo.frecuencia); // ?? ESTA L�NEA AHORA FUNCIONAR�
        const fechaLimite = estrategia.calcularFechaLimite(chequeo.ultimaSenal);

        if (ahora > fechaLimite && chequeo.estado !== EstadoChequeo.FALLIDO) {
            
            console.warn(`[CRON ALERTA] Usuario ${chequeo.usuarioId} ha fallado el Chequeo de Vida. L�mite: ${fechaLimite.toISOString()}`);
            
            chequeo.verificarEstado();
            await this.chequeoVidaRepo.guardar(chequeo);
            
            await this.ejecutarLiberacionLegado(chequeo.usuarioId);

        } else if (chequeo.estado === EstadoChequeo.FALLIDO) {
            console.log(`[CRON INFO] Usuario ${chequeo.usuarioId} sigue en estado FALLIDO. Notificaci�n ya enviada.`);
        }
    }
    console.log(`[CRON] Verificaci�n finalizada.`);
  }

  // M�todo auxiliar que contiene la l�gica de liberaci�n
  private async ejecutarLiberacionLegado(usuarioId: string): Promise<void> {
    console.log(`[LIBERACION] Iniciando protocolo para usuario: ${usuarioId}`);

    try {
      const bovedas = await this.bovedaRepo.listarPorUsuarioId(usuarioId);
      
      for (const boveda of bovedas) {
        if (boveda.estado !== 'LIBERADA') {
          boveda.liberar(); 
          await this.bovedaRepo.guardar(boveda); 
          console.log(`[LIBERACION] B�veda ${boveda.id.value} cambiada a estado LIBERADA.`);
        }
      }

      const contactos = await this.contactoRepo.listarPorUsuarioId(usuarioId);

      if (contactos.length === 0) {
        console.warn(`[LIBERACION WARNING] No se encontraron contactos clave para el usuario ${usuarioId}. B�veda liberada, pero sin notificaciones.`);
        return;
      }

      console.log(`[LIBERACION] Notificando a ${contactos.length} contactos clave...`);

      for (const contacto of contactos) {
        await this.emailService.enviarAcceso(
          contacto.email, 
          contacto.nombre, 
          this.LINK_ACCESO_SIMULADO
        );
      }
      console.log(`[LIBERACION] Protocolo completado exitosamente para el usuario ${usuarioId}.`);

    } catch (error) {
      console.error(`[LIBERACION ERROR] Fallo cr�tico al liberar legado para ${usuarioId}:`, error);
    }
  }
}
