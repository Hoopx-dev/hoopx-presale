import CryptoJS from 'crypto-js';

/**
 * Decrypts AES encrypted text using the configured key and IV
 * @param cipherText - The encrypted base64 string
 * @returns The decrypted string
 */
export function decryptAes(cipherText: string): string {
  const key = process.env.NEXT_PUBLIC_AES_KEY;
  const iv = process.env.NEXT_PUBLIC_AES_IV;

  if (!key || !iv) {
    throw new Error('AES_KEY and AES_IV must be configured in environment variables');
  }

  // Parse the base64 encoded key and IV
  const parsedKey = CryptoJS.enc.Base64.parse(key);
  const parsedIv = CryptoJS.enc.Base64.parse(iv);

  // Decrypt using AES-CBC with Pkcs7 padding
  const decrypted = CryptoJS.AES.decrypt(cipherText, parsedKey, {
    iv: parsedIv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Convert to UTF8 string
  return decrypted.toString(CryptoJS.enc.Utf8);
}
