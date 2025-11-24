import mongoose, { Schema, Document } from 'mongoose';
import { EstadoBoveda } from '../../../domain/entities/Boveda'; // <--- IMPORTAR ENUM

export interface IBovedaDoc extends Document {
  _id: any;
  usuarioId: string;
  nombre: string;
  descripcion: string;
  clave: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estado: EstadoBoveda; // <--- NUEVO CAMPO
  activos?: {
    _id: string;
    plataforma: string;
    usuarioCuenta: string;
    passwordCifrada: string;
    notas?: string;
    categoria?: string;
    gestionado?: boolean;
    fechaGestionado?: Date;
  }[];
}

const BovedaSchema: Schema = new Schema({
  _id: { type: String, required: true },
  usuarioId: { type: String, required: true, index: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  clave: { type: String, required: true },
  fechaCreacion: { type: Date, required: true },
  fechaActualizacion: { type: Date, required: true },
  estado: { type: String, required: true, default: EstadoBoveda.ACTIVA }, // <--- NUEVA DEFINICI�N
  activos: [
    {
      _id: { type: String, required: true },
      plataforma: { type: String, required: true },
      usuarioCuenta: { type: String, required: true },
      passwordCifrada: { type: String, required: true },
      notas: { type: String, required: false },
      categoria: { type: String, required: false },
      gestionado: { type: Boolean, required: false, default: false },
      fechaGestionado: { type: Date, required: false }
    }
  ],
});

export const BovedaModel = mongoose.model<IBovedaDoc>('Boveda', BovedaSchema);
