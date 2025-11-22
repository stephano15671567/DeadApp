import { CategoriaActivo } from '../../domain/entities/ActivoDigital';

export interface AgregarActivoDto {
  plataforma: string;
  usuarioCuenta: string;
  password: string;
  notas?: string;
  categoria?: CategoriaActivo;
}