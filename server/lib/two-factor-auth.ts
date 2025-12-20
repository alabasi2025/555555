/**
 * نظام المصادقة الثنائية (Two-Factor Authentication)
 * يوفر طبقة أمان إضافية للحسابات
 */

import crypto from 'crypto';

interface TOTPOptions {
  digits?: number; // عدد الأرقام (6 أو 8)
  period?: number; // فترة الصلاحية بالثواني
  algorithm?: 'sha1' | 'sha256' | 'sha512';
}

interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

/**
 * توليد مفتاح سري للمصادقة الثنائية
 */
export function generateSecret(length: number = 32): string {
  const buffer = crypto.randomBytes(length);
  return buffer.toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
}

/**
 * توليد رمز TOTP
 */
export function generateTOTP(secret: string, options?: TOTPOptions): string {
  const digits = options?.digits || 6;
  const period = options?.period || 30;
  const algorithm = options?.algorithm || 'sha1';
  
  const counter = Math.floor(Date.now() / 1000 / period);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));
  
  const hmac = crypto.createHmac(algorithm, Buffer.from(secret, 'base64'));
  hmac.update(counterBuffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0x0f;
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  
  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * التحقق من رمز TOTP
 */
export function verifyTOTP(
  token: string,
  secret: string,
  options?: TOTPOptions & { window?: number }
): boolean {
  const window = options?.window || 1; // السماح بفارق ±1 فترة
  const period = options?.period || 30;
  
  for (let i = -window; i <= window; i++) {
    const counter = Math.floor(Date.now() / 1000 / period) + i;
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(counter));
    
    const expectedToken = generateTOTPForCounter(secret, counter, options);
    if (token === expectedToken) {
      return true;
    }
  }
  
  return false;
}

function generateTOTPForCounter(
  secret: string,
  counter: number,
  options?: TOTPOptions
): string {
  const digits = options?.digits || 6;
  const algorithm = options?.algorithm || 'sha1';
  
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));
  
  const hmac = crypto.createHmac(algorithm, Buffer.from(secret, 'base64'));
  hmac.update(counterBuffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0x0f;
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  
  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * توليد رابط QR Code للمصادقة الثنائية
 */
export function generateOTPAuthURL(
  secret: string,
  accountName: string,
  issuer: string = 'نظام إدارة محطات الكهرباء'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  const encodedSecret = encodeURIComponent(secret);
  
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${encodedSecret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * توليد أكواد احتياطية
 */
export function generateBackupCodes(count: number = 10): BackupCode[] {
  const codes: BackupCode[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push({
      code: `${code.substring(0, 4)}-${code.substring(4)}`,
      used: false
    });
  }
  
  return codes;
}

/**
 * التحقق من كود احتياطي
 */
export function verifyBackupCode(
  inputCode: string,
  backupCodes: BackupCode[]
): { valid: boolean; updatedCodes: BackupCode[] } {
  const normalizedInput = inputCode.replace(/-/g, '').toUpperCase();
  
  const updatedCodes = backupCodes.map(bc => {
    const normalizedCode = bc.code.replace(/-/g, '').toUpperCase();
    if (normalizedCode === normalizedInput && !bc.used) {
      return {
        ...bc,
        used: true,
        usedAt: new Date()
      };
    }
    return bc;
  });
  
  const wasUsed = updatedCodes.some(
    (bc, i) => bc.used && !backupCodes[i].used
  );
  
  return {
    valid: wasUsed,
    updatedCodes
  };
}

/**
 * تشفير البيانات الحساسة
 */
export function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    crypto.scryptSync(key, 'salt', 32),
    iv
  );
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * فك تشفير البيانات
 */
export function decryptData(encryptedData: string, key: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    crypto.scryptSync(key, 'salt', 32),
    iv
  );
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * تجزئة كلمة المرور بشكل آمن
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * التحقق من كلمة المرور
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [salt, key] = hash.split(':');
  
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === key);
    });
  });
}

export default {
  generateSecret,
  generateTOTP,
  verifyTOTP,
  generateOTPAuthURL,
  generateBackupCodes,
  verifyBackupCode,
  encryptData,
  decryptData,
  hashPassword,
  verifyPassword
};
