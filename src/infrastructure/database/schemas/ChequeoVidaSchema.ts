import mongoose, { Schema, Document } from 'mongoose';

export interface IChequeoVidaDoc extends Document {
  _id: any;
  usuarioId: string;
  frecuencia: string;
  ultimaSenal: Date;
  siguienteChequeo: Date; // <--- CAMPO CR�TICO A�ADIDO
  estado: string;
}

const ChequeoVidaSchema: Schema = new Schema({
  _id: { type: String, required: true },
  usuarioId: { type: String, required: true, unique: true },
  frecuencia: { type: String, required: true },
  ultimaSenal: { type: Date, default: Date.now },
  siguienteChequeo: { type: Date, required: true }, // <--- AHORA REQUERIDO
  estado: { type: String, default: 'PENDIENTE' }
});

export const ChequeoVidaModel = mongoose.model<IChequeoVidaDoc>('ChequeoVida', ChequeoVidaSchema);
