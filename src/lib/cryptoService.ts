import * as crypto from 'crypto';
import 'dotenv/config'; 

const ALGORITHM = 'aes-256-cbc'; 
// Asume que esta variable est en tu .env y tiene 32 caracteres.
const ENV_ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'PLCHLDR_DEFAULT_NEVER_USE_IN_PROD'; 
const IV_LENGTH = 16; 
const ENCODING = 'hex';

export class CryptoService {
  private readonly keyBuffer: Buffer;

  // Accept an explicit passphrase (for rotation scripts) or use env fallback
  constructor(passphrase?: string) {
    const keySource = passphrase || ENV_ENCRYPTION_KEY;
    const hash = crypto.createHash('sha256').update(keySource).digest();
    this.keyBuffer = Buffer.from(hash);
  }

  public encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.keyBuffer, iv);

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    return iv.toString(ENCODING) + ':' + encrypted.toString(ENCODING);
  }

  public decrypt(text: string): string {
    const parts = text.split(':');
    if (parts.length !== 2) {
      if (text.startsWith('[CIFRADO]_')) return text.replace('[CIFRADO]_', '');
      throw new Error('Formato de texto cifrado invalido.');
    }

    const iv = Buffer.from(parts[0], ENCODING);
    const encryptedText = Buffer.from(parts[1], ENCODING);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.keyBuffer, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

    return decrypted.toString('utf8');
  }
}
