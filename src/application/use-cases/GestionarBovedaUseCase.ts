import { BovedaRepository } from '../../domain/ports/out/BovedaRepository';
import { AgregarActivoDto } from '../dtos/AgregarActivoDto';
import { Boveda } from '../../domain/entities/Boveda';
import { ActivoDigital, CategoriaActivo } from '../../domain/entities/ActivoDigital';
import { Uuid } from '../../domain/value-objects/Uuid';
import { CryptoService } from '../../lib/cryptoService'; 
import { AuditModel } from '../../infrastructure/database/schemas/AuditSchema';

const cryptoService = new CryptoService(); 

export class GestionarBovedaUseCase {
  constructor(private readonly bovedaRepository: BovedaRepository) {}

  // 1. AGREGAR ACTIVO (Cifrado)
  async agregarActivo(usuarioId: string, datos: AgregarActivoDto): Promise<void> {
    let boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);

    if (!boveda) {
      boveda = Boveda.createNew(usuarioId); 
    }

    // ?? CR�TICO: Cifrado AES-256
    const passwordCifrada = cryptoService.encrypt(datos.password); 

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

    // Registrar auditoría
    try {
      await AuditModel.create({
        _id: new Uuid().value,
        usuarioId,
        accion: 'AGREGAR_ACTIVO',
        tipoEntidad: 'ACTIVO',
        entidadId: nuevoActivo.id.value,
        detalles: { plataforma: datos.plataforma, usuarioCuenta: datos.usuarioCuenta },
        timestamp: new Date()
      });
    } catch (err) {
      console.warn('No se pudo registrar la auditoría de agregar activo:', err);
    }
  }

  // 2. OBTENER ACTIVOS (Descifrado temporal para verificaci�n)
  async obtenerActivos(usuarioId: string): Promise<ActivoDigital[]> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) return [];
    // Do NOT decrypt passwords when returning the list of activos.
    // Returning plaintext secrets in API responses is a security risk.
    // The frontend should request a decrypted secret via a dedicated endpoint
    // that enforces proper authorization and auditing.
    return boveda.activos as ActivoDigital[];
  }

  // Obtener el secreto (password) descifrado de un activo concreto.
  async obtenerSecretoActivo(usuarioId: string, activoId: string): Promise<string> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) throw new Error('BOVEDA_NOT_FOUND');

    const activo = boveda.activos.find(a => a.id.value === activoId);
    if (!activo) throw new Error('ACTIVO_NOT_FOUND');

    try {
      return cryptoService.decrypt(activo.passwordCifrada);
    } catch (err) {
      throw new Error('DECRYPT_ERROR');
    }
  }

  // 3. ELIMINAR ACTIVO (Mantenido)
  async eliminarActivo(usuarioId: string, activoId: string): Promise<void> {
    const boveda = await this.bovedaRepository.buscarPorUsuarioId(usuarioId);
    if (!boveda) throw new Error('BOVEDA_NOT_FOUND');
    boveda.eliminarActivo(activoId);
    await this.bovedaRepository.guardar(boveda);
    try {
      await AuditModel.create({
        _id: new Uuid().value,
        usuarioId,
        accion: 'ELIMINAR_ACTIVO',
        tipoEntidad: 'ACTIVO',
        entidadId: activoId,
        detalles: {},
        timestamp: new Date()
      });
    } catch (err) {
      console.warn('No se pudo registrar la auditoría de eliminar activo:', err);
    }
  }
}
