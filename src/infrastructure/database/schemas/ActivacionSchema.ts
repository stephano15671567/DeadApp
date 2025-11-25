import mongoose, { Schema, Document } from 'mongoose';

export interface IActivacionDoc extends Document {
  _id: string;
  usuarioId: string;
  contactoId: string;
  estado: string;
  nota?: string;
  evidenciaUrl?: string;
  fechaSolicitud: Date;
}

const ActivacionSchema: Schema = new Schema({
  _id: { type: String, required: true },
  usuarioId: { type: String, required: true, index: true },
  contactoId: { type: String, required: true },
  estado: { type: String, required: true, default: 'INICIADA' },
  nota: { type: String },
  evidenciaUrl: { type: String },
  fechaSolicitud: { type: Date, default: () => new Date() }
});

export const ActivacionModel = mongoose.model<IActivacionDoc>('Activacion', ActivacionSchema);
