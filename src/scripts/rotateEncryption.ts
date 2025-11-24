import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { connectToMongoDB } from '../infrastructure/database/mongoose.connection';
import { BovedaModel } from '../infrastructure/database/schemas/BovedaSchema';
import { AuditModel } from '../infrastructure/database/schemas/AuditSchema';
import { CryptoService } from '../lib/cryptoService';
import mongoose from 'mongoose';
import { Uuid } from '../domain/value-objects/Uuid';

dotenv.config();

async function main() {
  const oldKey = process.env.OLD_ENCRYPTION_KEY || process.argv[2];
  const newKey = process.env.NEW_ENCRYPTION_KEY || process.argv[3];

  if (!oldKey || !newKey) {
    console.error('Debe definir OLD_ENCRYPTION_KEY y NEW_ENCRYPTION_KEY (env o args)');
    console.error('Uso: npm run rotate-encryption -- <OLD_KEY> <NEW_KEY>');
    process.exit(1);
  }

  await connectToMongoDB();

  const oldCrypto = new CryptoService(oldKey);
  const newCrypto = new CryptoService(newKey);

  const bovedas = await BovedaModel.find({}).lean();
  if (!bovedas || bovedas.length === 0) {
    console.log('No se encontraron bovedas. Nada que rotar.');
    process.exit(0);
  }

  // Backup to file before mutating
  const backupPath = path.resolve(process.cwd(), `bovedas-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(bovedas, null, 2), { encoding: 'utf8' });
  console.log('Backup creado en:', backupPath);

  // Dry-run: validate all activos can be decrypted with old key
  for (const b of bovedas) {
    for (const a of (b.activos || [])) {
      try {
        oldCrypto.decrypt(a.passwordCifrada);
      } catch (err) {
        console.error(`Fallo al descifrar activo ${a._id} en boveda ${b._id}:`, (err as any).message || err);
        process.exit(2);
      }
    }
  }

  console.log('Validación con clave antigua completada. Iniciando transacción de rotación...');

  const session = await mongoose.startSession();
  const auditRecords: any[] = [];

  try {
    await session.withTransaction(async () => {
      for (const b of bovedas) {
        const originales = b.activos || [];
        const nuevos = [];
        let changed = false;

        for (const a of originales) {
          const plain = oldCrypto.decrypt(a.passwordCifrada);
          const reenc = newCrypto.encrypt(plain);
          nuevos.push({ ...a, passwordCifrada: reenc });
          if (reenc !== a.passwordCifrada) {
            changed = true;
            auditRecords.push({
              _id: new Uuid().value,
              usuarioId: b.usuarioId,
              accion: 'ROTAR_CIFRADO_ACTIVO',
              tipoEntidad: 'ACTIVO',
              entidadId: a._id,
              detalles: { note: 're-encrypted with new key' },
              timestamp: new Date(),
              actor: 'system:rotate-encryption'
            });
          }
        }

        if (changed) {
          await BovedaModel.updateOne({ _id: b._id }, { $set: { activos: nuevos } }, { session }).exec();
          console.log(`Bóveda ${b._id} actualizada.`);
        }
      }
    });

    if (auditRecords.length > 0) {
      await AuditModel.insertMany(auditRecords);
    }

    console.log(`Rotación completada. Total re-encriptados: ${auditRecords.length}`);
  } catch (err) {
    console.error('Error durante la rotación:', err);
    process.exit(1);
  } finally {
    session.endSession();
    process.exit(0);
  }
}

main().catch(err => { console.error('Fallo en rotación:', err); process.exit(1); });
