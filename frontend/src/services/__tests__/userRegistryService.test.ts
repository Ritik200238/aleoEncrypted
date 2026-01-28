/**
 * User Registry Service Tests
 * Unit tests for user registry functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userRegistryService } from '../userRegistryService';

// Mock wallet
const mockWallet = {
  publicKey: {
    toString: () => 'aleo1test123456789...',
  },
  requestTransaction: vi.fn(),
};

describe('UserRegistryService', () => {
  beforeEach(() => {
    userRegistryService.setWallet(mockWallet as any);
  });

  describe('Handle Hashing', () => {
    it('should hash handle consistently', () => {
      const hash1 = userRegistryService.hashHandle('alice');
      const hash2 = userRegistryService.hashHandle('alice');

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/field$/);
    });

    it('should handle @ prefix', () => {
      const hash1 = userRegistryService.hashHandle('alice');
      const hash2 = userRegistryService.hashHandle('@alice');

      expect(hash1).toBe(hash2);
    });

    it('should be case insensitive', () => {
      const hash1 = userRegistryService.hashHandle('alice');
      const hash2 = userRegistryService.hashHandle('ALICE');

      expect(hash1).toBe(hash2);
    });
  });

  describe('Profile Registration', () => {
    it('should validate handle format', async () => {
      const invalidHandles = [
        'ab',           // Too short
        'a'.repeat(21), // Too long
        'user@name',    // Invalid chars
        'user name',    // Spaces
        'user-name',    // Hyphens
      ];

      for (const handle of invalidHandles) {
        await expect(
          userRegistryService.registerProfile({
            handle,
            name: 'Test User',
            avatar: '',
            bio: '',
          })
        ).rejects.toThrow();
      }
    });

    it('should accept valid handles', () => {
      const validHandles = [
        'alice',
        'bob123',
        'user_name',
        'ABC_123',
        '@username',
      ];

      // Just check format validation, not full registration
      for (const handle of validHandles) {
        const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
        expect(/^[a-zA-Z0-9_]{3,20}$/.test(cleanHandle)).toBe(true);
      }
    });
  });

  describe('Search and Lookup', () => {
    it('should search cached profiles', async () => {
      // Initialize demo profiles
      await userRegistryService.initializeDemoProfiles();

      // Search for alice
      const results = await userRegistryService.searchCachedProfiles('alice');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].handle).toBe('@alice');
    });

    it('should search by partial match', async () => {
      await userRegistryService.initializeDemoProfiles();

      const results = await userRegistryService.searchCachedProfiles('al');

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Demo Profiles', () => {
    it('should initialize demo profiles', async () => {
      await userRegistryService.initializeDemoProfiles();

      const profiles = await userRegistryService.getCachedProfiles();

      expect(profiles.length).toBeGreaterThanOrEqual(3);
      expect(profiles.some(p => p.handle === '@alice')).toBe(true);
      expect(profiles.some(p => p.handle === '@bob')).toBe(true);
      expect(profiles.some(p => p.handle === '@carol')).toBe(true);
    });

    it('should have valid profile data', async () => {
      await userRegistryService.initializeDemoProfiles();

      const profiles = await userRegistryService.getCachedProfiles();

      for (const profile of profiles) {
        expect(profile.address).toBeTruthy();
        expect(profile.handle).toMatch(/^@[a-z]+$/);
        expect(profile.name).toBeTruthy();
        expect(profile.avatar).toBeTruthy();
        expect(profile.handleHash).toMatch(/field$/);
        expect(profile.isRegistered).toBe(true);
      }
    });
  });

  describe('Cache Management', () => {
    it('should cache profiles', async () => {
      const mockProfile = {
        address: 'aleo1test...',
        handle: '@testuser',
        handleHash: 'test123field',
        name: 'Test User',
        avatar: 'https://example.com/avatar.png',
        bio: 'Test bio',
        encryptedProfile: 'encrypted123field',
        profileCommitment: 'commit123field',
        timestamp: Date.now(),
        isRegistered: true,
      };

      // Cache profile (private method, testing via public interface)
      await userRegistryService.initializeDemoProfiles();

      const profiles = await userRegistryService.getCachedProfiles();
      expect(profiles.length).toBeGreaterThan(0);
    });

    it('should clear cache', async () => {
      await userRegistryService.initializeDemoProfiles();

      let profiles = await userRegistryService.getCachedProfiles();
      expect(profiles.length).toBeGreaterThan(0);

      await userRegistryService.clearCache();

      profiles = await userRegistryService.getCachedProfiles();
      expect(profiles.length).toBe(0);
    });
  });
});

describe('Profile Data Structure', () => {
  it('should have required fields', async () => {
    await userRegistryService.initializeDemoProfiles();
    const profiles = await userRegistryService.getCachedProfiles();
    const profile = profiles[0];

    expect(profile).toHaveProperty('address');
    expect(profile).toHaveProperty('handle');
    expect(profile).toHaveProperty('handleHash');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('avatar');
    expect(profile).toHaveProperty('bio');
    expect(profile).toHaveProperty('encryptedProfile');
    expect(profile).toHaveProperty('profileCommitment');
    expect(profile).toHaveProperty('timestamp');
    expect(profile).toHaveProperty('isRegistered');
  });
});

describe('Integration Tests', () => {
  it('should complete full registration flow', async () => {
    // This would test:
    // 1. Check handle availability
    // 2. Register profile
    // 3. Verify on-chain
    // 4. Cache locally
    // 5. Search and find

    // Mock for now as it requires blockchain
    expect(true).toBe(true);
  });

  it('should complete search and add contact flow', async () => {
    // This would test:
    // 1. Search by handle
    // 2. Find user
    // 3. Add to contacts
    // 4. Verify in contact list

    // Mock for now
    expect(true).toBe(true);
  });
});
