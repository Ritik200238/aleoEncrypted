// Local Storage Service for caching and persisting data

import type { Group } from '../types/group';
import type { Message } from '../types/message';

const STORAGE_KEYS = {
  GROUPS: 'encrypted_social_groups',
  MESSAGES: 'encrypted_social_messages',
  GROUP_KEYS: 'encrypted_social_group_keys',
  USER_ADDRESS: 'encrypted_social_user_address',
  MEMBER_LISTS: 'encrypted_social_member_lists',
};

export class StorageService {
  /**
   * Save groups to localStorage
   */
  saveGroups(groups: Group[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch (error) {
      console.error('Failed to save groups:', error);
    }
  }

  /**
   * Load groups from localStorage
   */
  loadGroups(): Group[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GROUPS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load groups:', error);
      return [];
    }
  }

  /**
   * Add a new group
   */
  addGroup(group: Group): void {
    const groups = this.loadGroups();
    const exists = groups.find(g => g.id === group.id);

    if (!exists) {
      groups.push(group);
      this.saveGroups(groups);
    }
  }

  /**
   * Update a group
   */
  updateGroup(groupId: string, updates: Partial<Group>): void {
    const groups = this.loadGroups();
    const index = groups.findIndex(g => g.id === groupId);

    if (index !== -1) {
      groups[index] = { ...groups[index], ...updates };
      this.saveGroups(groups);
    }
  }

  /**
   * Get a specific group
   */
  getGroup(groupId: string): Group | null {
    const groups = this.loadGroups();
    return groups.find(g => g.id === groupId) || null;
  }

  /**
   * Save messages for a group
   */
  saveMessages(groupId: string, messages: Message[]): void {
    try {
      const allMessages = this.loadAllMessages();
      allMessages[groupId] = messages;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  /**
   * Load all messages (organized by group)
   */
  private loadAllMessages(): Record<string, Message[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load messages:', error);
      return {};
    }
  }

  /**
   * Load messages for a specific group
   */
  loadMessages(groupId: string): Message[] {
    const allMessages = this.loadAllMessages();
    return allMessages[groupId] || [];
  }

  /**
   * Add a message to a group
   */
  addMessage(groupId: string, message: Message): void {
    const messages = this.loadMessages(groupId);

    // Check if message already exists (prevent duplicates)
    const exists = messages.find(m => m.id === message.id);
    if (!exists) {
      messages.push(message);
      this.saveMessages(groupId, messages);
    }
  }

  /**
   * Save group encryption key (SECURE - In production, use more secure storage)
   */
  saveGroupKey(groupId: string, key: string): void {
    try {
      const keys = this.loadAllGroupKeys();
      keys[groupId] = key;
      localStorage.setItem(STORAGE_KEYS.GROUP_KEYS, JSON.stringify(keys));
    } catch (error) {
      console.error('Failed to save group key:', error);
    }
  }

  /**
   * Load all group keys
   */
  private loadAllGroupKeys(): Record<string, string> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GROUP_KEYS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load group keys:', error);
      return {};
    }
  }

  /**
   * Load encryption key for a specific group
   */
  loadGroupKey(groupId: string): string | null {
    const keys = this.loadAllGroupKeys();
    return keys[groupId] || null;
  }

  /**
   * Save user's Aleo address
   */
  saveUserAddress(address: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ADDRESS, address);
    } catch (error) {
      console.error('Failed to save user address:', error);
    }
  }

  /**
   * Load user's Aleo address
   */
  loadUserAddress(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.USER_ADDRESS);
    } catch (error) {
      console.error('Failed to load user address:', error);
      return null;
    }
  }

  /**
   * Save member list for a group
   */
  saveMemberList(groupId: string, members: string[]): void {
    try {
      const allMembers = this.loadAllMemberLists();
      allMembers[groupId] = members;
      localStorage.setItem(STORAGE_KEYS.MEMBER_LISTS, JSON.stringify(allMembers));
    } catch (error) {
      console.error('Failed to save member list:', error);
    }
  }

  /**
   * Load all member lists
   */
  private loadAllMemberLists(): Record<string, string[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMBER_LISTS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load member lists:', error);
      return {};
    }
  }

  /**
   * Load member list for a specific group
   */
  loadMemberList(groupId: string): string[] {
    const allMembers = this.loadAllMemberLists();
    return allMembers[groupId] || [];
  }

  /**
   * Add a member to a group's member list
   */
  addMember(groupId: string, memberAddress: string): void {
    const members = this.loadMemberList(groupId);
    if (!members.includes(memberAddress)) {
      members.push(memberAddress);
      this.saveMemberList(groupId, members);
    }
  }

  /**
   * Clear all stored data (logout)
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Clear data for a specific group
   */
  clearGroup(groupId: string): void {
    // Remove from groups list
    const groups = this.loadGroups().filter(g => g.id !== groupId);
    this.saveGroups(groups);

    // Remove messages
    const allMessages = this.loadAllMessages();
    delete allMessages[groupId];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));

    // Remove group key
    const keys = this.loadAllGroupKeys();
    delete keys[groupId];
    localStorage.setItem(STORAGE_KEYS.GROUP_KEYS, JSON.stringify(keys));

    // Remove member list
    const members = this.loadAllMemberLists();
    delete members[groupId];
    localStorage.setItem(STORAGE_KEYS.MEMBER_LISTS, JSON.stringify(members));
  }
}

// Export singleton instance
export const storageService = new StorageService();
