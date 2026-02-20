/**
 * Secure Encryption Service
 * Uses Web Crypto API with AES-256-GCM (authenticated encryption)
 *
 * Security upgrades from MVP:
 * - AES-CBC → AES-GCM (authenticated encryption, prevents tampering)
 * - crypto-js → Web Crypto API (native, faster, more secure)
 * - Simple SHA256 → PBKDF2/HKDF (proper key derivation)
 *
 * Compatible with existing interface for easy migration
 */

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12, // 96 bits for GCM
  tagLength: 128, // 128-bit authentication tag
  pbkdf2Iterations: 100000,
  saltLength: 16,
};

export class EncryptionService {
  /**
   * Encrypt a message with AES-256-GCM
   * Returns base64-encoded ciphertext and nonce
   */
  async encryptMessage(
    content: string,
    groupKey: string
  ): Promise<{ ciphertext: string; nonce: string }> {
    try {
      // Generate random IV (nonce) for GCM
      const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));

      // Derive encryption key from group key
      const key = await this.deriveKey(groupKey);

      // Encode message to bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(content);

      // Encrypt with AES-GCM
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: ENCRYPTION_CONFIG.algorithm,
          iv: iv,
          tagLength: ENCRYPTION_CONFIG.tagLength,
        },
        key,
        data
      );

      // Convert to base64 for storage/transmission
      const ciphertextBase64 = this.arrayBufferToBase64(ciphertext);
      const nonceBase64 = this.arrayBufferToBase64(iv);

      return {
        ciphertext: ciphertextBase64,
        nonce: nonceBase64,
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt a message with AES-256-GCM
   * Verifies authentication tag automatically
   */
  async decryptMessage(
    ciphertext: string,
    nonce: string,
    groupKey: string
  ): Promise<string> {
    try {
      // Derive decryption key
      const key = await this.deriveKey(groupKey);

      // Convert from base64
      const ciphertextBytes = this.base64ToArrayBuffer(ciphertext);
      const iv = this.base64ToArrayBuffer(nonce);

      // Decrypt with AES-GCM (automatically verifies authentication tag)
      const decrypted = await crypto.subtle.decrypt(
        {
          name: ENCRYPTION_CONFIG.algorithm,
          iv: iv,
          tagLength: ENCRYPTION_CONFIG.tagLength,
        },
        key,
        ciphertextBytes
      );

      // Decode bytes to string
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '[Failed to decrypt message]';
    }
  }

  /**
   * Derive a group encryption key from group ID and creator address
   * Uses PBKDF2 for proper key derivation
   */
  async deriveGroupKey(groupId: string, _creatorAddress?: string): Promise<string> {
    try {
      // Key derived from groupId ONLY — both sender and recipient must get the same key.
      // For direct chats: chatId = "direct_{sorted(addrA, addrB)}" — shared by both parties.
      // For group chats: chatId = "group_{timestamp}_{random}" — shared via WebSocket join.
      // Including userAddress in key derivation would make Alice and Bob derive different
      // keys, so Bob could never decrypt Alice's messages. Fixed here.
      const salt = await this.hashToBytes(groupId);
      const keyBytes = await this.pbkdf2(groupId, salt);
      return this.arrayBufferToBase64(keyBytes);
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw new Error('Failed to derive group key');
    }
  }

  /**
   * Hash an address to create a commitment (Pedersen-like)
   * Uses SHA-256 for now, but can be upgraded to Pedersen for ZK compatibility
   */
  async hashAddress(address: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(address);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return this.arrayBufferToHex(hash);
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash address');
    }
  }

  /**
   * Encode encrypted content for Aleo field element
   * Converts to hex string suitable for Leo smart contracts
   */
  encodeForAleo(ciphertext: string, nonce: string): string {
    try {
      // Combine ciphertext and nonce
      const combined = `${ciphertext}:${nonce}`;

      // Convert to hex (Aleo field format)
      const encoder = new TextEncoder();
      const bytes = encoder.encode(combined);
      return this.bytesToHex(bytes);
    } catch (error) {
      console.error('Aleo encoding failed:', error);
      throw new Error('Failed to encode for Aleo');
    }
  }

  /**
   * Decode from Aleo format back to ciphertext and nonce
   */
  decodeFromAleo(encoded: string): { ciphertext: string; nonce: string } {
    try {
      // Convert from hex
      const bytes = this.hexToBytes(encoded);
      const decoder = new TextDecoder();
      const combined = decoder.decode(bytes);

      // Split ciphertext and nonce
      const [ciphertext, nonce] = combined.split(':');

      if (!ciphertext || !nonce) {
        throw new Error('Invalid encoded format');
      }

      return { ciphertext, nonce };
    } catch (error) {
      console.error('Aleo decoding failed:', error);
      throw new Error('Failed to decode from Aleo');
    }
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Derive CryptoKey from password using PBKDF2
   */
  private async deriveKey(password: string): Promise<CryptoKey> {
    // Import password as key material
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Generate salt from password (deterministic)
    const salt = await this.hashToBytes(password);

    // Derive AES-GCM key
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ENCRYPTION_CONFIG.pbkdf2Iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * PBKDF2 key derivation (returns raw bytes)
   */
  private async pbkdf2(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    return crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ENCRYPTION_CONFIG.pbkdf2Iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      ENCRYPTION_CONFIG.keyLength
    );
  }

  /**
   * Hash string to bytes (for salts)
   */
  private async hashToBytes(input: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hash).slice(0, ENCRYPTION_CONFIG.saltLength);
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Convert ArrayBuffer to hex string
   */
  private arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert bytes to hex
   */
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert hex to bytes
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  /**
   * Generate random bytes (for testing/utilities)
   */
  generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Generate random nonce (for message IDs)
   */
  generateNonce(): string {
    const nonce = this.generateRandomBytes(16);
    return this.bytesToHex(nonce);
  }

  /**
   * Alias for encryptMessage (for compatibility with profileService)
   */
  async encrypt(content: string, key: string): Promise<{ ciphertext: string; nonce: string }> {
    return this.encryptMessage(content, key);
  }

  /**
   * Alias for decryptMessage (for compatibility with profileService)
   */
  async decrypt(ciphertext: string, nonce: string, key?: string): Promise<string> {
    return this.decryptMessage(ciphertext, nonce, key || 'default');
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
