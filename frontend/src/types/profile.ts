// User Profile Type Definitions (Wave 4)

export interface UserProfile {
  address: string;                    // Aleo address (public identifier)
  displayName: string;                // Encrypted pseudonym
  avatar?: string;                    // IPFS hash or base64 image data
  bio?: string;                       // Optional bio
  publicKey: string;                  // For ECDH key exchange
  profileCommitment: string;          // Hash commitment for privacy
  createdAt: number;                  // Timestamp
  updatedAt: number;                  // Last update timestamp
}

export interface EncryptedProfile {
  address: string;                    // Public (for lookup)
  encryptedData: string;              // AES-encrypted profile JSON
  publicKey: string;                  // For key exchange (public)
  profileCommitment: string;          // Hash commitment (public)
  nonce: string;                      // Encryption nonce
  timestamp: number;
}

export interface GroupAlias {
  groupId: string;                    // Which group this alias is for
  userId: string;                     // User's Aleo address
  displayName: string;                // Alias name in this group
  avatar?: string;                    // Custom avatar for this group
  isRevealed: boolean;                // Whether to show real profile
}

export interface ProfileStorage {
  myProfile: UserProfile;             // Current user's profile
  cachedProfiles: Map<string, UserProfile>;  // Other users' profiles
  groupAliases: Map<string, GroupAlias>;     // Per-group aliases
}
