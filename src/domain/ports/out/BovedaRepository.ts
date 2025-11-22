import { Boveda } from '../../entities/Boveda';

export interface BovedaRepository {
  guardar(boveda: Boveda): Promise<void>;
  buscarPorUsuarioId(usuarioId: string): Promise<Boveda | null>;
  // buscarPorId(id: string): Promise<Boveda | null>; // Opcional por ahora
}