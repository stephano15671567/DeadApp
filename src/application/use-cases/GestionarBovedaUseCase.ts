import { BovedaRepository } from '../../domain/ports/out/BovedaRepository';
import { AgregarActivoDto } from '../dtos/AgregarActivoDto';
import { Boveda } from '../../domain/entities/Boveda';
import { ActivoDigital, CategoriaActivo } from '../../domain/entities/ActivoDigital';
import { Uuid } from '../../domain/value-objects/Uuid';

export class GestionarBovedaUseCase {
  constructor(private readonly bovedaRepository: BovedaRepository) {}

  // 1. CREAR
  async agregarActivo(usuarioId: string, datos: AgregarActivoDto): Promise<void> {
    let boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);

    if (!boveda) {
      boveda = new Boveda(new Uuid(), usuarioId);
    }

    const passwordCifrada = `[CIFRADO]_${datos.password}`; 

    const nuevoActivo = new ActivoDigital(
      new Uuid(),
      datos.plataforma,
      datos.usuarioCuenta,
      passwordCifrada,
      datos.notas || '',
      (datos.categoria as CategoriaActivo) || 'OTRO'
    );

    boveda.agregarActivo(nuevoActivo);
    await this.bovedaRepository.guardar(boveda);
  }

  // 2. LEER (GET)
  async obtenerActivos(usuarioId: string): Promise<ActivoDigital[]> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) return [];
    return boveda.activos;
  }

  // 3. BORRAR (DELETE)
  async eliminarActivo(usuarioId: string, activoId: string): Promise<void> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) throw new Error('BOVEDA_NOT_FOUND');

    boveda.eliminarActivo(activoId);
    await this.bovedaRepository.guardar(boveda);
  }
}