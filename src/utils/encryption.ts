// Standard browser APIs for text-to-binary conversion.
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Derives a secure CryptoKey from a password using the PBKDF2 standard.
 * @param password The user's password.
 * @param salt A random value to ensure unique key derivation.
 * @returns A promise resolving to a CryptoKey for AES-GCM encryption.
 */
async function getKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  // Import the user's password as a non-secure base key for derivation.
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive a secure encryption key from the base key.
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      // The salt prevents rainbow table attacks by ensuring unique hashes for identical passwords.
      // Creating a new Uint8Array copy resolves a common, strict TypeScript type-checking error.
      salt: new Uint8Array(salt),
      // A high iteration count makes brute-force attacks computationally expensive.
      iterations: 120000,
      hash: 'SHA-256'
    },
    baseKey,
    // Specify the key algorithm and length for the derived key.
    { name: 'AES-GCM', length: 256 },
    false, // The key is non-extractable for security.
    ['encrypt', 'decrypt'] // Define the permitted operations for the key.
  );
}

/**
 * Encrypts a string using a password.
 * @param plain The plain text to encrypt.
 * @param password The password for encryption.
 * @returns A promise resolving to a base64 string containing the salt, IV, and encrypted data.
 */
export async function encryptContent(plain: string, password: string): Promise<string> {
  // Generate a cryptographically random salt and initialization vector (IV) for each encryption.
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive the encryption key from the password and salt.
  const key = await getKeyFromPassword(password, salt);

  // Encrypt the plain text.
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plain));

  // Combine salt, IV, and encrypted data into a single array for storage.
  const combined = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.byteLength);
  combined.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

  // Convert the combined binary data to a base64 string for safe storage.
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a base64-encoded string using a password.
 * @param dataBase64 The base64 string to decrypt.
 * @param password The password used for encryption.
 * @returns A promise resolving to the original plain text.
 */
export async function decryptContent(dataBase64: string, password: string): Promise<string> {
  // Convert the base64 string back to a binary array.
  const combined = Uint8Array.from(atob(dataBase64), c => c.charCodeAt(0));

  // Extract the salt, IV, and encrypted data from the combined array.
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);

  // Re-derive the key using the provided password and the extracted salt.
  const key = await getKeyFromPassword(password, salt);

  try {
    // Decrypt the data. This will fail if the password (and thus the key) is incorrect.
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
    return decoder.decode(decrypted);
  } catch (e) {
    console.error("Decryption failed:", e);
    throw new Error('Incorrect password or corrupted data');
  }
}
