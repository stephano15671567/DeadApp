import mongoose, { Schema, Document } from 'mongoose';

export interface IContactoDoc extends Document {
  _id: any;
  usuarioId: string;
  nombre: string;
  email: string;
  telefono: string;
}

const ContactoSchema: Schema = new Schema({
  _id: { type: String, required: true },
  usuarioId: { type: String, required: true, index: true },
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true }
});

export const ContactoModel = mongoose.model<IContactoDoc>('Contacto', ContactoSchema);
