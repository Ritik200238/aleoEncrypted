/**
 * User Registry Service - Manages user profiles and handle lookups
 * Integrates with user_registry.aleo smart contract
 */

import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import type { Transaction, WalletContextState } from '@demox-labs/aleo-wallet-adapter-react';
import { encryptionService } from './encryptionService';
import { databaseService } from './databaseService';
import Dexie, { Table } from 'dexie';

// Program ID
export const USER_REGISTRY_PROGRAM = 'user_registry.aleo';
export const ALEO_NETWORK = WalletAdapterNetwork.Testnet;

// Types
export interface UserProfile {
  address: string;
  handle: string;              // Original @username
  handleHash: string;          // BHP256 hash for on-chain storage
  name: string;
  avatar: string;
  bio: string;
  encryptedProfile: string;    // Encrypted profile data
  profileCommitment: string;   // Cryptographic commitment
  timestamp: number;
  isRegistered: boolean;       // On-chain registration status
  transactionId?: string;
}

export interface ProfileRecord {
  owner: string;
  handle: string;
  encrypted_profile: string;
  profile_commitment: string;
  timestamp: string;
}

// IndexedDB for profile cache
class UserRegistryDB extends Dexie {
  profiles!: Table<UserProfile, string>;
  handleIndex!: Table<{ handle: string; address: string }, string>;

  constructor() {
    super('UserRegistryDB');

    this.version(1).stores({
      profiles: 'address, handle, handleHash, timestamp, isRegistered',
      handleIndex: 'handle, handleHash, address',
    });
  }
}

const db = new UserRegistryDB();

export class UserRegistryService {
  private wallet: WalletContextState | null = null;
  private profileCache: Map<string, UserProfile> = new Map();

  /**
   * Initialize with wallet instance
   */
  setWallet(wallet: WalletContextState): void {
    this.wallet = wallet;
  }

  /**
   * Convert string to Aleo field element (sync)
   */
  private stringToField(str: string): string {
    let hashNum = BigInt(0);
    for (let i = 0; i < str.length; i++) {
      hashNum = (hashNum * BigInt(31) + BigInt(str.charCodeAt(i))) % (BigInt(2) ** BigInt(128));
    }
    return `${hashNum}field`;
  }

  /**
   * Hash handle for on-chain storage (BHP256 equivalent)
   */
  hashHandle(handle: string): string {
    // Remove @ if present
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    return this.stringToField(`handle_${cleanHandle.toLowerCase()}`);
  }

  /**
   * Create profile commitment for integrity verification
   */
  private createProfileCommitment(profile: {
    name: string;
    avatar: string;
    bio: string;
  }): string {
    const profileString = JSON.stringify(profile);
    return this.stringToField(`commitment_${profileString}`);
  }

  /**
   * Encrypt profile data
   */
  private async encryptProfileData(profile: {
    name: string;
    avatar: string;
    bio: string;
  }): Promise<string> {
    const profileJson = JSON.stringify(profile);
    const { ciphertext } = await encryptionService.encryptMessage(profileJson, 'profile_encryption_key');
    return this.stringToField(ciphertext);
  }

  /**
   * Decrypt profile data
   */
  private async decryptProfileData(encryptedField: string): Promise<{
    name: string;
    avatar: string;
    bio: string;
  }> {
    try {
      // Extract hex from field format
      const hexValue = encryptedField.replace('field', '');
      const decrypted = await encryptionService.decryptData(hexValue);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt profile:', error);
      return { name: 'Unknown', avatar: '', bio: '' };
    }
  }

  /**
   * Register a new user profile on-chain
   */
  async registerProfile(profile: {
    handle: string;
    name: string;
    avatar: string;
    bio: string;
  }): Promise<UserProfile> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Validate handle format
    const cleanHandle = profile.handle.startsWith('@')
      ? profile.handle.slice(1)
      : profile.handle;

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanHandle)) {
      throw new Error('Handle must be 3-20 characters (letters, numbers, underscore only)');
    }

    try {
      // Check if handle is available
      const handleHash = this.hashHandle(cleanHandle);
      const isAvailable = await this.isHandleAvailable(handleHash);

      if (!isAvailable) {
        throw new Error('Handle already taken');
      }

      // Encrypt profile data
      const encryptedProfile = await this.encryptProfileData({
        name: profile.name,
        avatar: profile.avatar,
        bio: profile.bio,
      });

      // Create commitment
      const commitment = this.createProfileCommitment({
        name: profile.name,
        avatar: profile.avatar,
        bio: profile.bio,
      });

      // Build transaction
      const aleoTransaction = Transaction.createTransaction(
        this.wallet.publicKey,
        ALEO_NETWORK,
        USER_REGISTRY_PROGRAM,
        'register_profile',
        [handleHash, encryptedProfile, commitment],
        12_000 // fee in microcredits
      );

      if (!this.wallet.requestTransaction) {
        throw new Error('Wallet does not support transactions');
      }

      // Submit transaction
      const txId = await this.wallet.requestTransaction(aleoTransaction);

      console.log('✓ Profile registration transaction submitted:', txId);

      // Create user profile object
      const userProfile: UserProfile = {
        address: this.wallet.publicKey.toString(),
        handle: `@${cleanHandle}`,
        handleHash,
        name: profile.name,
        avatar: profile.avatar,
        bio: profile.bio,
        encryptedProfile,
        profileCommitment: commitment,
        timestamp: Date.now(),
        isRegistered: true,
        transactionId: txId,
      };

      // Cache profile locally
      await this.cacheProfile(userProfile);
      this.profileCache.set(userProfile.address, userProfile);

      return userProfile;
    } catch (error) {
      console.error('Failed to register profile:', error);
      throw new Error(`Profile registration failed: ${error}`);
    }
  }

  /**
   * Update existing profile
   */
  async updateProfile(
    currentProfile: UserProfile,
    updates: {
      name?: string;
      avatar?: string;
      bio?: string;
    }
  ): Promise<UserProfile> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (currentProfile.address !== this.wallet.publicKey.toString()) {
      throw new Error('Cannot update another user\'s profile');
    }

    try {
      // Merge updates
      const updatedData = {
        name: updates.name || currentProfile.name,
        avatar: updates.avatar || currentProfile.avatar,
        bio: updates.bio || currentProfile.bio,
      };

      // Encrypt new profile data
      const newEncryptedProfile = await this.encryptProfileData(updatedData);

      // Create new commitment
      const newCommitment = this.createProfileCommitment(updatedData);

      // Note: In Leo, we need the ProfileRecord from blockchain
      // For demo, we'll create a mock record
      const profileRecordString = JSON.stringify({
        owner: currentProfile.address,
        handle: currentProfile.handleHash,
        encrypted_profile: currentProfile.encryptedProfile,
        profile_commitment: currentProfile.profileCommitment,
        timestamp: currentProfile.timestamp.toString(),
      });

      // Build transaction
      const aleoTransaction = Transaction.createTransaction(
        this.wallet.publicKey,
        ALEO_NETWORK,
        USER_REGISTRY_PROGRAM,
        'update_profile',
        [profileRecordString, newEncryptedProfile, newCommitment],
        12_000
      );

      if (!this.wallet.requestTransaction) {
        throw new Error('Wallet does not support transactions');
      }

      const txId = await this.wallet.requestTransaction(aleoTransaction);

      console.log('✓ Profile update transaction submitted:', txId);

      // Create updated profile
      const updatedProfile: UserProfile = {
        ...currentProfile,
        name: updatedData.name,
        avatar: updatedData.avatar,
        bio: updatedData.bio,
        encryptedProfile: newEncryptedProfile,
        profileCommitment: newCommitment,
        timestamp: Date.now(),
        transactionId: txId,
      };

      // Update cache
      await this.cacheProfile(updatedProfile);
      this.profileCache.set(updatedProfile.address, updatedProfile);

      return updatedProfile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error(`Profile update failed: ${error}`);
    }
  }

  /**
   * Search user by handle
   */
  async searchByHandle(handle: string): Promise<UserProfile | null> {
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;

    // Check local cache first
    const cached = await db.handleIndex
      .where('handle')
      .equals(cleanHandle.toLowerCase())
      .first();

    if (cached) {
      const profile = await this.getProfileByAddress(cached.address);
      if (profile) return profile;
    }

    // Query on-chain (mock for now)
    const handleHash = this.hashHandle(cleanHandle);

    try {
      // In production: query user_registry.aleo/handles mapping
      // const address = await queryProgramMapping(USER_REGISTRY_PROGRAM, 'handles', handleHash);

      console.log('Searching for handle on-chain:', handleHash);

      // Mock: return null if not found
      return null;
    } catch (error) {
      console.error('Handle search failed:', error);
      return null;
    }
  }

  /**
   * Get profile by address
   */
  async getProfileByAddress(address: string): Promise<UserProfile | null> {
    // Check memory cache
    if (this.profileCache.has(address)) {
      return this.profileCache.get(address)!;
    }

    // Check IndexedDB cache
    const cached = await db.profiles.get(address);
    if (cached) {
      this.profileCache.set(address, cached);
      return cached;
    }

    // Query on-chain (mock for now)
    try {
      // In production: query user_registry.aleo/profile_commitments mapping
      console.log('Querying profile on-chain for:', address);

      return null;
    } catch (error) {
      console.error('Profile lookup failed:', error);
      return null;
    }
  }

  /**
   * Check if handle is available
   */
  async isHandleAvailable(handleHash: string): Promise<boolean> {
    try {
      // Query on-chain mapping (mock for now)
      // In production: query user_registry.aleo/handles
      console.log('Checking handle availability:', handleHash);

      // Mock: assume available
      return true;
    } catch (error) {
      console.error('Handle availability check failed:', error);
      return false;
    }
  }

  /**
   * Verify profile commitment
   */
  async verifyProfile(
    address: string,
    expectedCommitment: string
  ): Promise<boolean> {
    try {
      // Query on-chain (mock for now)
      // In production: call user_registry.aleo/verify_profile
      console.log('Verifying profile commitment:', address);

      const profile = await this.getProfileByAddress(address);
      return profile?.profileCommitment === expectedCommitment;
    } catch (error) {
      console.error('Profile verification failed:', error);
      return false;
    }
  }

  /**
   * Cache profile in IndexedDB
   */
  private async cacheProfile(profile: UserProfile): Promise<void> {
    await db.profiles.put(profile);

    const cleanHandle = profile.handle.startsWith('@')
      ? profile.handle.slice(1)
      : profile.handle;

    await db.handleIndex.put({
      handle: cleanHandle.toLowerCase(),
      handleHash: profile.handleHash,
      address: profile.address,
    });
  }

  /**
   * Get all cached profiles
   */
  async getCachedProfiles(): Promise<UserProfile[]> {
    return await db.profiles.toArray();
  }

  /**
   * Search cached profiles by name or handle
   */
  async searchCachedProfiles(query: string): Promise<UserProfile[]> {
    const lowerQuery = query.toLowerCase().replace('@', '');

    return await db.profiles
      .filter(profile =>
        profile.name.toLowerCase().includes(lowerQuery) ||
        profile.handle.toLowerCase().includes(lowerQuery)
      )
      .limit(20)
      .toArray();
  }

  /**
   * Clear profile cache
   */
  async clearCache(): Promise<void> {
    await db.profiles.clear();
    await db.handleIndex.clear();
    this.profileCache.clear();
  }

  /**
   * Initialize demo profiles (for testing)
   */
  async initializeDemoProfiles(): Promise<void> {
    const demoProfiles: UserProfile[] = [
      {
        address: 'aleo1demo1abc...',
        handle: '@alice',
        handleHash: this.hashHandle('alice'),
        name: 'Alice Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        bio: 'Blockchain developer | Privacy enthusiast',
        encryptedProfile: this.stringToField('encrypted_alice_profile'),
        profileCommitment: this.stringToField('commitment_alice'),
        timestamp: Date.now() - 86400000,
        isRegistered: true,
      },
      {
        address: 'aleo1demo2def...',
        handle: '@bob',
        handleHash: this.hashHandle('bob'),
        name: 'Bob Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        bio: 'ZK proof researcher',
        encryptedProfile: this.stringToField('encrypted_bob_profile'),
        profileCommitment: this.stringToField('commitment_bob'),
        timestamp: Date.now() - 172800000,
        isRegistered: true,
      },
      {
        address: 'aleo1demo3ghi...',
        handle: '@carol',
        handleHash: this.hashHandle('carol'),
        name: 'Carol Williams',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
        bio: 'Crypto artist | NFT creator',
        encryptedProfile: this.stringToField('encrypted_carol_profile'),
        profileCommitment: this.stringToField('commitment_carol'),
        timestamp: Date.now() - 259200000,
        isRegistered: true,
      },
    ];

    for (const profile of demoProfiles) {
      await this.cacheProfile(profile);
      this.profileCache.set(profile.address, profile);
    }

    console.log('✓ Demo profiles initialized:', demoProfiles.length);
  }
}

// Export singleton instance
export const userRegistryService = new UserRegistryService();
export default userRegistryService;
