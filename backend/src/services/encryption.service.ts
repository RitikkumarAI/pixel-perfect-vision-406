import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export class EncryptionService {
  private secret: string;

  constructor() {
    this.secret = process.env.ENCRYPTION_SECRET || 'super_secret_enterprise_encryption_key_32b';
    // Ensure key is 32 bytes
    if (this.secret.length < 32) {
      this.secret = this.secret.padEnd(32, '0');
    } else if (this.secret.length > 32) {
      this.secret = this.secret.substring(0, 32);
    }
  }

  public encrypt(text: string): string {
    if (!text) return text;
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const salt = crypto.randomBytes(SALT_LENGTH);

      // Using scrypt to derive key
      const key = crypto.scryptSync(this.secret, salt, KEY_LENGTH);

      const cipher = crypto.createCipheriv(ALGORITHM, iv, key);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Format: iv:salt:authTag:encryptedText
      return `${iv.toString('hex')}:${salt.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (err) {
      throw new Error('Encryption failed');
    }
  }

  public decrypt(encryptedString: string): string {
    if (!encryptedString) return encryptedString;
    // Check if it matches our encrypted format
    if (!encryptedString.includes(':')) return encryptedString;

    try {
      const parts = encryptedString.split(':');
      if (parts.length !== 4) return encryptedString; // likely not encrypted with this service

      const iv = Buffer.from(parts[0]!, 'hex');
      const salt = Buffer.from(parts[1]!, 'hex');
      const authTag = Buffer.from(parts[2]!, 'hex');
      const encryptedText = parts[3]!;

      const key = crypto.scryptSync(this.secret, salt, KEY_LENGTH);

      const decipher = crypto.createDecipheriv(ALGORITHM, iv, key);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedText, 'hex', 'utf8') as unknown as string;
      decrypted += decipher.final('utf8') as unknown as string;

      return decrypted;
    } catch (err) {
      throw new Error('Decryption failed');
    }
  }
}
