import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Minimal CryptoService for test (same algorithm as production service)
import crypto from 'crypto';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const ENCODING = 'hex';

class TestCryptoService {
  private keyBuffer: Buffer;
  constructor(passphrase: string) {
    this.keyBuffer = crypto.createHash('sha256').update(passphrase).digest();
  }
  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.keyBuffer, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return iv.toString(ENCODING) + ':' + encrypted.toString(ENCODING);
  }
  decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], ENCODING);
    const encryptedText = Buffer.from(parts[1], ENCODING);
    const decipher = crypto.createDecipheriv(ALGORITHM, this.keyBuffer, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  }
}

describe('Encryption rotation (integration, in-memory Mongo)', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    // On Windows some internal child processes may refuse to be killed (EPERM).
    // To avoid noisy warnings and test failures we skip stopping the in-memory
    // server on Windows. The child process will be cleaned up when the main
    // process exits. On non-Windows platforms we attempt a normal stop.
    if (process.platform === 'win32') {
      // eslint-disable-next-line no-console
      console.warn('Running on Windows: skipping mongodb-memory-server.stop() to avoid EPERM issues.');
    } else {
      try {
        await mongod.stop();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Advertencia: no se pudo detener mongodb-memory-server:', err);
      }
    }
  });

  test('encrypt with old key and rotate to new key', async () => {
    const OLD = 'old-secret-for-test';
    const NEW = 'new-secret-for-test';

    const oldCrypto = new TestCryptoService(OLD);
    const newCrypto = new TestCryptoService(NEW);

    // define a minimal Boveda schema for testing
    const ActivoSchema = new mongoose.Schema({ _id: String, plataforma: String, usuarioCuenta: String, passwordCifrada: String, notas: String, categoria: String, gestionado: Boolean, fechaGestionado: Date }, { _id: false });
    const BovedaSchema = new mongoose.Schema({ _id: String, usuarioId: String, nombre: String, descripcion: String, clave: String, fechaCreacion: Date, fechaActualizacion: Date, estado: String, activos: [ActivoSchema] });
    const TestBoveda = mongoose.model('BovedaTest', BovedaSchema);

    const plainPassword = 'PlainPass123!';
    const enc = oldCrypto.encrypt(plainPassword);

    await TestBoveda.create({ _id: 'test-boveda-1', usuarioId: 'test-user', nombre: 'Test', descripcion: 'desc', clave: 'CLAVE', fechaCreacion: new Date(), fechaActualizacion: new Date(), estado: 'ACTIVA', activos: [{ _id: 'a1', plataforma: 'X', usuarioCuenta: 'u1', passwordCifrada: enc, notas: '', categoria: 'OTRO' }, { _id: 'a2', plataforma: 'Y', usuarioCuenta: 'u2', passwordCifrada: enc, notas: '', categoria: 'OTRO' }] });

    const fetched = await TestBoveda.findById('test-boveda-1').lean();
    expect(fetched).toBeTruthy();
    expect(fetched!.activos!.length).toBe(2);
    const d1 = oldCrypto.decrypt(fetched!.activos![0].passwordCifrada as string);
    expect(d1).toBe(plainPassword);

    // perform rotation
    const docs = await TestBoveda.find().exec();
    for (const b of docs) {
      for (const activo of b.activos as any[]) {
        const plain = oldCrypto.decrypt(activo.passwordCifrada);
        activo.passwordCifrada = newCrypto.encrypt(plain);
      }
      await b.save();
    }

    const after = await TestBoveda.findById('test-boveda-1').lean();
    const p = newCrypto.decrypt(after!.activos![0].passwordCifrada as string);
    expect(p).toBe(plainPassword);
  }, 20000);
});
