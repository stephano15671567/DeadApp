import { Boveda } from '../../entities/Boveda';

export interface BovedaRepository {
  guardar(boveda: Boveda): Promise<void>;
  buscarPorUsuarioId(usuarioId: string): Promise<Boveda | null>;
  // ?? FIX: Método que el Cron Job y Use Case están buscando
  listarPorUsuarioId(usuarioId: string): Promise<Boveda[]>; 
}
