import { BovedaRepository } from '../../domain/ports/out/BovedaRepository';
import { AgregarActivoDto, ActualizarActivoDto } from '../dtos/AgregarActivoDto';
import { Boveda } from '../../domain/entities/Boveda';
import { ActivoDigital, CategoriaActivo } from '../../domain/entities/ActivoDigital';
import { Uuid } from '../../domain/value-objects/Uuid';

export class GestionarBovedaUseCase {
  constructor(private readonly bovedaRepository: BovedaRepository) {}

  // 1. CREAR (Ahora usa el m�todo est�tico para evitar fallos de constructor)
  async agregarActivo(usuarioId: string, datos: AgregarActivoDto): Promise<void> {
    let boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);

    if (!boveda) {
      // FIX CR�TICO: Usar el m�todo est�tico para crear la B�veda con defaults
      boveda = Boveda.createNew(usuarioId); 
    }
    // ... (El resto del c�digo de creaci�n de Activo Digital) ...
    
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

  // ... (otros métodos que no causan el crash) ...
  async obtenerActivos(usuarioId: string): Promise<ActivoDigital[]> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) return [];
    return boveda.activos;
  }

  async obtenerActivo(usuarioId: string, activoId: string): Promise<ActivoDigital | null> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) return null;
    const activo = boveda.activos.find(a => a.id.value === activoId);
    return activo || null;
  }

  async eliminarActivo(usuarioId: string, activoId: string): Promise<void> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) throw new Error('BOVEDA_NOT_FOUND');
    boveda.eliminarActivo(activoId);
    await this.bovedaRepository.guardar(boveda);
  }

  async actualizarActivo(usuarioId: string, activoId: string, datos: ActualizarActivoDto): Promise<void> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) throw new Error('BOVEDA_NOT_FOUND');
    
    const actualizacion: {
      plataforma?: string;
      usuarioCuenta?: string;
      passwordCifrada?: string;
      notas?: string;
      categoria?: CategoriaActivo;
    } = {};
    
    if (datos.plataforma !== undefined) actualizacion.plataforma = datos.plataforma;
    if (datos.usuarioCuenta !== undefined) actualizacion.usuarioCuenta = datos.usuarioCuenta;
    if (datos.password !== undefined) actualizacion.passwordCifrada = `[CIFRADO]_${datos.password}`;
    if (datos.notas !== undefined) actualizacion.notas = datos.notas;
    if (datos.categoria !== undefined) actualizacion.categoria = datos.categoria;
    
    boveda.actualizarActivo(activoId, actualizacion);
    await this.bovedaRepository.guardar(boveda);
  }
}
