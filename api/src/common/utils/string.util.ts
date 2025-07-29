import { createCipheriv, randomBytes } from 'crypto';

export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (error_) {
    return false;
  }
}

export function urlJoin(...segments: string[]): string {
  return segments.join('/').replace(/([^:])\/{2,}/g, '$1/');
}

export function encryptData(
  key: string,
  text: string
): { ciphertext: string; iv: string } {
  const paddedKey = (key + '0000').slice(0, 32);

  const iv = randomBytes(16);

  const cipher = createCipheriv('aes-256-cbc', Buffer.from(paddedKey), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
  };
}
