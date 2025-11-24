import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditDoc extends Document {
  _id: any;
  usuarioId?: string;
  accion: string;
  tipoEntidad?: string;
  entidadId?: string;
  detalles?: any;
  timestamp: Date;
  actor?: string;
}

const AuditSchema: Schema = new Schema({
  _id: { type: String, required: true },
  usuarioId: { type: String, required: false, index: true },
  accion: { type: String, required: true },
  tipoEntidad: { type: String, required: false },
  entidadId: { type: String, required: false },
  detalles: { type: Schema.Types.Mixed, required: false },
  timestamp: { type: Date, required: true, default: () => new Date() },
  actor: { type: String, required: false }
});

export const AuditModel = mongoose.model<IAuditDoc>('Audit', AuditSchema);
