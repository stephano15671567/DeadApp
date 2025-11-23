import { ChequeoVida } from '../../entities/ChequeoVida';

export interface ChequeoVidaRepository {
  guardar(chequeo: ChequeoVida): Promise<void>;
  buscarPorUsuarioId(usuarioId: string): Promise<ChequeoVida | null>;
  buscarTodos(): Promise<ChequeoVida[]>;
}
