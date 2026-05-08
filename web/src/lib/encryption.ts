import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

export class EncryptionService {
  private get key(): Buffer {
    const keyStr = process.env.ENCRYPTION_KEY;
    if (!keyStr || keyStr.length !== 64) {
      throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
    }
    return Buffer.from(keyStr, "hex");
  }

  encrypt(text: string): { iv: string; content: string; authTag: string } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");

    return {
      iv: iv.toString("hex"),
      content: encrypted,
      authTag,
    };
  }

  decrypt(encrypted: string, iv: string, authTag: string): string {
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      this.key, 
      Buffer.from(iv, "hex")
    );
    
    const tagBuffer = Buffer.from(authTag, "hex");
    if (tagBuffer.length !== AUTH_TAG_LENGTH) {
      throw new Error(`Invalid Auth Tag length. Expected ${AUTH_TAG_LENGTH} bytes.`);
    }
    decipher.setAuthTag(tagBuffer);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  }
}

export const encryptionService = new EncryptionService();
