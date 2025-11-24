import dotenv from 'dotenv';
import { connectToMongoDB } from '../infrastructure/database/mongoose.connection';
import { BovedaModel } from '../infrastructure/database/schemas/BovedaSchema';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function main() {
  await connectToMongoDB();

  const bovedas = await BovedaModel.find({}).lean();
  if (!bovedas) {
    console.log('No bovedas found');
    process.exit(0);
  }

  const outDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const file = path.join(outDir, `bovedas-backup-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(bovedas, null, 2), { encoding: 'utf8' });
  console.log('Backup written to', file);
  process.exit(0);
}

main().catch(err => { console.error('Backup failed', err); process.exit(1); });
