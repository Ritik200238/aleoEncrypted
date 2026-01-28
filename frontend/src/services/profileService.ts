/**
 * Profile Service (Wave 4)
 * Manages user profiles, aliases, and selective disclosure
 *
 * Features:
 * - Pseudonymous profiles with encrypted data
 * - Per-group aliases
 * - Avatar management (IPFS or base64)
 * - Selective disclosure of identity
 * - Profile commitments for privacy
 */

import type { UserProfile, GroupAlias, ProfileStorage, EncryptedProfile } from '../types/profile';
import { encryptionService } from './encryptionService';

class ProfileService {
  private storage: ProfileStorage = {
    myProfile: null as any,
    cachedProfiles: new Map(),
    groupAliases: new Map(),
  };

  private readonly STORAGE_KEY = 'user_profiles';
  private readonly DEFAULT_AVATARS = [
    '👤', '🦊', '🐼', '🐨', '🐯', '🦁', '🐸', '🦄', '🦋', '🌸',
    '⚡', '🌙', '⭐', '💎', '🎭', '🎨', '🎪', '🎯', '🎲', '🎮',
  ];

  constructor() {
    this.loadStorage();
  }

  /**
   * Create new user profile
   */
  async createProfile(
    address: string,
    displayName: string,
    avatar?: string,
    bio?: string
  ): Promise<UserProfile> {
    try {
      console.log('Creating profile for:', address);

      // Generate ECDH public key for profile
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256',
        },
        true,
        ['deriveKey', 'deriveBits']
      );

      const publicKey = await this.exportPublicKey(keyPair.publicKey);

      // Create profile commitment (hash of profile data)
      const commitment = await this.createProfileCommitment(address, displayName);

      const profile: UserProfile = {
        address,
        displayName,
        avatar: avatar || this.getRandomAvatar(),
        bio,
        publicKey,
        profileCommitment: commitment,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.storage.myProfile = profile;
      this.saveStorage();

      console.log('✓ Profile created:', displayName);

      return profile;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }

  /**
   * Update existing profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.storage.myProfile) {
      throw new Error('No profile to update');
    }

    const updatedProfile: UserProfile = {
      ...this.storage.myProfile,
      ...updates,
      updatedAt: Date.now(),
    };

    // Recalculate commitment if name changed
    if (updates.displayName) {
      updatedProfile.profileCommitment = await this.createProfileCommitment(
        updatedProfile.address,
        updatedProfile.displayName
      );
    }

    this.storage.myProfile = updatedProfile;
    this.saveStorage();

    console.log('✓ Profile updated');

    return updatedProfile;
  }

  /**
   * Get current user profile
   */
  getMyProfile(): UserProfile | null {
    return this.storage.myProfile;
  }

  /**
   * Encrypt profile for storage/sharing
   */
  async encryptProfile(profile: UserProfile, recipientPublicKey?: string): Promise<EncryptedProfile> {
    try {
      // Serialize profile
      const profileJson = JSON.stringify({
        displayName: profile.displayName,
        avatar: profile.avatar,
        bio: profile.bio,
      });

      // Encrypt profile data
      const { ciphertext, nonce } = await encryptionService.encrypt(
        profileJson,
        recipientPublicKey || 'default'
      );

      const encrypted: EncryptedProfile = {
        address: profile.address,
        encryptedData: ciphertext,
        publicKey: profile.publicKey,
        profileCommitment: profile.profileCommitment,
        nonce,
        timestamp: Date.now(),
      };

      return encrypted;
    } catch (error) {
      console.error('Profile encryption failed:', error);
      throw error;
    }
  }

  /**
   * Decrypt profile
   */
  async decryptProfile(encrypted: EncryptedProfile): Promise<UserProfile> {
    try {
      // Check cache first
      const cached = this.storage.cachedProfiles.get(encrypted.address);
      if (cached && cached.profileCommitment === encrypted.profileCommitment) {
        return cached;
      }

      // Decrypt profile data
      const decrypted = await encryptionService.decrypt(
        encrypted.encryptedData,
        encrypted.nonce
      );

      const profileData = JSON.parse(decrypted);

      const profile: UserProfile = {
        address: encrypted.address,
        displayName: profileData.displayName,
        avatar: profileData.avatar,
        bio: profileData.bio,
        publicKey: encrypted.publicKey,
        profileCommitment: encrypted.profileCommitment,
        createdAt: encrypted.timestamp,
        updatedAt: encrypted.timestamp,
      };

      // Cache the decrypted profile
      this.storage.cachedProfiles.set(encrypted.address, profile);
      this.saveStorage();

      return profile;
    } catch (error) {
      console.error('Profile decryption failed:', error);
      throw error;
    }
  }

  /**
   * Create or update group alias
   */
  async setGroupAlias(
    groupId: string,
    displayName: string,
    avatar?: string,
    isRevealed: boolean = false
  ): Promise<GroupAlias> {
    if (!this.storage.myProfile) {
      throw new Error('No profile found');
    }

    const alias: GroupAlias = {
      groupId,
      userId: this.storage.myProfile.address,
      displayName,
      avatar: avatar || this.storage.myProfile.avatar,
      isRevealed,
    };

    const key = `${groupId}_${this.storage.myProfile.address}`;
    this.storage.groupAliases.set(key, alias);
    this.saveStorage();

    console.log('✓ Group alias set:', displayName, 'for group:', groupId);

    return alias;
  }

  /**
   * Get alias for a specific group
   */
  getGroupAlias(groupId: string, userId?: string): GroupAlias | null {
    const targetUserId = userId || this.storage.myProfile?.address;
    if (!targetUserId) return null;

    const key = `${groupId}_${targetUserId}`;
    return this.storage.groupAliases.get(key) || null;
  }

  /**
   * Get display name for user in group (alias or real name)
   */
  getDisplayNameInGroup(groupId: string, userId: string): string {
    const alias = this.getGroupAlias(groupId, userId);

    if (alias) {
      return alias.isRevealed
        ? this.storage.myProfile?.displayName || alias.displayName
        : alias.displayName;
    }

    // Try cached profile
    const profile = this.storage.cachedProfiles.get(userId);
    if (profile) {
      return profile.displayName;
    }

    // Fallback to truncated address
    return this.truncateAddress(userId);
  }

  /**
   * Get avatar for user in group
   */
  getAvatarInGroup(groupId: string, userId: string): string {
    const alias = this.getGroupAlias(groupId, userId);
    if (alias && alias.avatar) {
      return alias.avatar;
    }

    const profile = this.storage.cachedProfiles.get(userId);
    if (profile && profile.avatar) {
      return profile.avatar;
    }

    return this.DEFAULT_AVATARS[0];
  }

  /**
   * Toggle identity revelation in group
   */
  async toggleRevealIdentity(groupId: string): Promise<boolean> {
    if (!this.storage.myProfile) {
      throw new Error('No profile found');
    }

    const alias = this.getGroupAlias(groupId);
    if (!alias) {
      throw new Error('No alias for this group');
    }

    alias.isRevealed = !alias.isRevealed;

    const key = `${groupId}_${this.storage.myProfile.address}`;
    this.storage.groupAliases.set(key, alias);
    this.saveStorage();

    console.log('✓ Identity revelation toggled:', alias.isRevealed);

    return alias.isRevealed;
  }

  /**
   * Cache a profile for quick access
   */
  cacheProfile(profile: UserProfile): void {
    this.storage.cachedProfiles.set(profile.address, profile);
    this.saveStorage();
  }

  /**
   * Clear cached profiles
   */
  clearCache(): void {
    this.storage.cachedProfiles.clear();
    this.saveStorage();
  }

  /**
   * Delete profile
   */
  deleteProfile(): void {
    this.storage.myProfile = null as any;
    this.storage.cachedProfiles.clear();
    this.storage.groupAliases.clear();
    this.saveStorage();
    console.log('✓ Profile deleted');
  }

  // ========== PRIVATE METHODS ==========

  private async createProfileCommitment(address: string, displayName: string): Promise<string> {
    const data = `${address}_${displayName}_${Date.now()}`;
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return this.arrayBufferToHex(hash);
  }

  private async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('spki', publicKey);
    return this.arrayBufferToBase64(exported);
  }

  private getRandomAvatar(): string {
    return this.DEFAULT_AVATARS[
      Math.floor(Math.random() * this.DEFAULT_AVATARS.length)
    ];
  }

  private truncateAddress(address: string): string {
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  private arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private saveStorage(): void {
    try {
      const serializable = {
        myProfile: this.storage.myProfile,
        cachedProfiles: Array.from(this.storage.cachedProfiles.entries()),
        groupAliases: Array.from(this.storage.groupAliases.entries()),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializable));
    } catch (error) {
      console.error('Failed to save profile storage:', error);
    }
  }

  private loadStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.storage.myProfile = data.myProfile;
        this.storage.cachedProfiles = new Map(data.cachedProfiles || []);
        this.storage.groupAliases = new Map(data.groupAliases || []);

        console.log('✓ Profile storage loaded');
      }
    } catch (error) {
      console.error('Failed to load profile storage:', error);
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
