import mongoose, { Schema, Document } from 'mongoose';

export interface IActivoDigitalDoc {
  _id: string;
  plataforma: string;
  usuarioCuenta: string;
  passwordCifrada: string;
  notas: string;
  categoria: string;
  gestionado: boolean;
  fechaGestionado?: Date;
}

export interface IBovedaDoc extends Document {
  _id: string;
  usuarioId: string;
  activos: IActivoDigitalDoc[];
  fechaUltimoCambio: Date;
}

const BovedaSchema: Schema = new Schema({
  _id: { type: String, required: true },
  usuarioId: { type: String, required: true, unique: true, index: true },
  activos: [
    {
      _id: { type: String, required: true },
      plataforma: { type: String, required: true },
      usuarioCuenta: { type: String, required: true },
      passwordCifrada: { type: String, required: true },
      notas: { type: String, default: '' },
      categoria: { type: String, default: 'OTRO' },
      gestionado: { type: Boolean, default: false },
      fechaGestionado: { type: Date, required: false },
    },
  ],
  fechaUltimoCambio: { type: Date, default: Date.now },
});

export const BovedaModel = mongoose.model<IBovedaDoc>('Boveda', BovedaSchema);