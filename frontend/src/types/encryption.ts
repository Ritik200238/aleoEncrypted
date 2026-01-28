// Advanced Encryption Types (Wave 5: Forward Secrecy)

export interface KeyPair {
  publicKey: CryptoKey;               // For ECDH
  privateKey: CryptoKey;              // For ECDH
}

export interface SessionKey {
  groupId: string;                    // Which group this key is for
  keyId: string;                      // Unique key identifier
  key: CryptoKey;                     // Symmetric encryption key (AES-GCM)
  derivedAt: number;                  // When this key was derived
  expiresAt: number;                  // When to rotate
  messageCount: number;               // Messages encrypted with this key
  maxMessages: number;                // Rotate after N messages
  generation: number;                 // Key generation/epoch number
}

export interface KeyRotationPolicy {
  maxMessages: number;                // Rotate after X messages (default: 1000)
  maxDuration: number;                // Rotate after X milliseconds (default: 7 days)
  onMemberJoin: boolean;              // Rotate when new member joins (default: true)
  onMemberLeave: boolean;             // Rotate when member leaves (default: true)
}

export interface DHKeyExchange {
  myKeyPair: KeyPair;                 // My ECDH key pair
  sharedSecrets: Map<string, CryptoKey>;  // Derived shared secrets per user
  lastRotation: number;               // Timestamp of last rotation
}

export interface EncryptedMessage {
  content: string;                    // AES-GCM encrypted message
  keyId: string;                      // Which session key was used
  nonce: string;                      // Encryption nonce/IV
  senderCommitment: string;           // Sender identity commitment
  timestamp: number;
  generation: number;                 // Key generation this message uses
}

export interface KeyBackup {
  address: string;                    // User address
  encryptedKeyBundle: string;         // All keys encrypted with master key
  masterKeyHash: string;              // For verification
  timestamp: number;
  version: number;
}

export interface ForwardSecrecyState {
  currentKeys: Map<string, SessionKey>;        // Active keys per group
  previousKeys: Map<string, SessionKey[]>;     // Old keys (for decryption only)
  keyRotationHistory: KeyRotationEvent[];      // Audit log
  policy: KeyRotationPolicy;
}

export interface KeyRotationEvent {
  groupId: string;
  oldKeyId: string;
  newKeyId: string;
  reason: 'max_messages' | 'max_duration' | 'member_join' | 'member_leave' | 'manual';
  timestamp: number;
  generation: number;
}

export interface RatchetState {
  groupId: string;
  rootKey: CryptoKey;                 // Root key for ratcheting
  chainKey: CryptoKey;                // Current chain key
  messageKey: CryptoKey;              // Current message key
  sendingChainLength: number;         // How many messages sent
  receivingChainLength: number;       // How many messages received
  generation: number;
}
