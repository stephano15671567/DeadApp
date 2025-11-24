import { BovedaRepository } from '../../domain/ports/out/BovedaRepository';
import { AgregarActivoDto } from '../dtos/AgregarActivoDto';
import { Boveda } from '../../domain/entities/Boveda';
import { ActivoDigital, CategoriaActivo } from '../../domain/entities/ActivoDigital';
import { Uuid } from '../../domain/value-objects/Uuid';

export class GestionarBovedaUseCase {
  constructor(private readonly bovedaRepository: BovedaRepository) {}

  // 1. CREAR (Ahora usa el método estático para evitar fallos de constructor)
  async agregarActivo(usuarioId: string, datos: AgregarActivoDto): Promise<void> {
    let boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);

    if (!boveda) {
      // FIX CRÍTICO: Usar el método estático para crear la Bóveda con defaults
      boveda = Boveda.createNew(usuarioId); 
    }
    // ... (El resto del código de creación de Activo Digital) ...
    
    const passwordCifrada = `[CIFRADO]_${datos.password}`; 

    const nuevoActivo = new ActivoDigital(
      new Uuid(),
      usuarioId,
      datos.plataforma,
      datos.usuarioCuenta,
      passwordCifrada,
      datos.notas || '',
      (datos.categoria as CategoriaActivo) || 'OTRO'
    );

    boveda.agregarActivo(nuevoActivo);
    await this.bovedaRepository.guardar(boveda);
  }

  // ... (otros métodos que no causan el crash) ...
  async obtenerActivos(usuarioId: string): Promise<ActivoDigital[]> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) return [];
    return boveda.activos;
  }

  async eliminarActivo(usuarioId: string, activoId: string): Promise<void> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) throw new Error('BOVEDA_NOT_FOUND');
    boveda.eliminarActivo(activoId);
    await this.bovedaRepository.guardar(boveda);
  }
}
