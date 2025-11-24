import mongoose, { Schema, Document } from 'mongoose';
import { EstadoBoveda } from '../../../domain/entities/Boveda'; // <--- IMPORTAR ENUM

export interface IBovedaDoc extends Document {
  _id: string;
  usuarioId: string;
  nombre: string;
  descripcion: string;
  clave: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  estado: EstadoBoveda; // <--- NUEVO CAMPO
}

const BovedaSchema: Schema = new Schema({
  _id: { type: String, required: true },
  usuarioId: { type: String, required: true, index: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  clave: { type: String, required: true },
  fechaCreacion: { type: Date, required: true },
  fechaActualizacion: { type: Date, required: true },
  estado: { type: String, required: true, default: EstadoBoveda.ACTIVA }, // <--- NUEVA DEFINICIÓN
});

export const BovedaModel = mongoose.model<IBovedaDoc>('Boveda', BovedaSchema);
