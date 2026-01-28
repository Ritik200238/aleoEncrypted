/**
 * Chat Service
 * Manages all chats (Direct Messages and Groups)
 */

import type { Chat } from '../models/Chat';
import { ChatModel } from '../models/Chat';
import { storageService } from './storageService';

const CHATS_STORAGE_KEY = 'encrypted_social_chats';

class ChatService {
  /**
   * Get all chats
   */
  getChats(): Chat[] {
    try {
      const stored = localStorage.getItem(CHATS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading chats:', error);
      return [];
    }
  }

  /**
   * Get sorted chats (pinned first, then by last message)
   */
  getSortedChats(): Chat[] {
    const chats = this.getChats();
    return ChatModel.sortChats(chats);
  }

  /**
   * Get active chats (not archived)
   */
  getActiveChats(): Chat[] {
    return this.getChats().filter(chat => !chat.isArchived);
  }

  /**
   * Get archived chats
   */
  getArchivedChats(): Chat[] {
    return this.getChats().filter(chat => chat.isArchived);
  }

  /**
   * Get a specific chat by ID
   */
  getChat(chatId: string): Chat | null {
    const chats = this.getChats();
    return chats.find(c => c.id === chatId) || null;
  }

  /**
   * Find existing DM with a contact
   */
  findDirectMessage(currentUserAddress: string, contactAddress: string): Chat | null {
    const chats = this.getChats();
    return chats.find(chat =>
      chat.type === 'direct' &&
      chat.participants.includes(currentUserAddress) &&
      chat.participants.includes(contactAddress)
    ) || null;
  }

  /**
   * Create or get existing direct message
   */
  getOrCreateDirectMessage(
    currentUserAddress: string,
    contactAddress: string,
    contactName: string,
    contactAvatar: string
  ): Chat {
    // Check if DM already exists
    const existing = this.findDirectMessage(currentUserAddress, contactAddress);
    if (existing) {
      return existing;
    }

    // Create new DM
    const dm = ChatModel.createDirectMessage(
      currentUserAddress,
      contactAddress,
      contactName,
      contactAvatar
    );

    // Generate encryption key for DM
    const groupKey = this.generateEncryptionKey();
    dm.groupKey = groupKey;

    // Save
    this.saveChat(dm);
    storageService.saveGroupKey(dm.id, groupKey);

    return dm;
  }

  /**
   * Create a new group
   */
  createGroup(
    creator: string,
    name: string,
    avatar: string,
    participants: string[],
    description?: string
  ): Chat {
    const group = ChatModel.createGroup(creator, name, avatar, participants, description);

    // Generate encryption key for group
    const groupKey = this.generateEncryptionKey();
    group.groupKey = groupKey;

    // Save
    this.saveChat(group);
    storageService.saveGroupKey(group.id, groupKey);

    return group;
  }

  /**
   * Save a chat
   */
  saveChat(chat: Chat): void {
    const chats = this.getChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);

    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.push(chat);
    }

    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  }

  /**
   * Update chat's last message
   */
  updateLastMessage(chatId: string, message: string, sender: string, time: number): void {
    const chat = this.getChat(chatId);
    if (!chat) return;

    const updated = ChatModel.updateLastMessage(chat, message, sender, time);
    this.saveChat(updated);
  }

  /**
   * Mark chat as read
   */
  markAsRead(chatId: string): void {
    const chat = this.getChat(chatId);
    if (!chat) return;

    const updated = ChatModel.markAsRead(chat);
    this.saveChat(updated);
  }

  /**
   * Increment unread count
   */
  incrementUnread(chatId: string): void {
    const chat = this.getChat(chatId);
    if (!chat) return;

    const updated = ChatModel.incrementUnread(chat);
    this.saveChat(updated);
  }

  /**
   * Toggle pin
   */
  togglePin(chatId: string): void {
    const chat = this.getChat(chatId);
    if (!chat) return;

    chat.isPinned = !chat.isPinned;
    this.saveChat(chat);
  }

  /**
   * Toggle archive
   */
  toggleArchive(chatId: string): void {
    const chat = this.getChat(chatId);
    if (!chat) return;

    chat.isArchived = !chat.isArchived;
    this.saveChat(chat);
  }

  /**
   * Toggle mute
   */
  toggleMute(chatId: string): void {
    const chat = this.getChat(chatId);
    if (!chat) return;

    chat.isMuted = !chat.isMuted;
    this.saveChat(chat);
  }

  /**
   * Delete a chat
   */
  deleteChat(chatId: string): void {
    const chats = this.getChats().filter(c => c.id !== chatId);
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));

    // Also delete messages
    storageService.clearMessages(chatId);
  }

  /**
   * Search chats
   */
  searchChats(query: string): Chat[] {
    const chats = this.getSortedChats();
    return ChatModel.searchChats(chats, query);
  }

  /**
   * Get unread count for all chats
   */
  getTotalUnreadCount(): number {
    return this.getChats().reduce((sum, chat) => sum + chat.unreadCount, 0);
  }

  /**
   * Update typing status for DM
   */
  updateTypingStatus(chatId: string, isTyping: boolean): void {
    const chat = this.getChat(chatId);
    if (!chat || chat.type !== 'direct') return;

    chat.isTyping = isTyping;
    this.saveChat(chat);
  }

  /**
   * Update online status for DM
   */
  updateOnlineStatus(chatId: string, isOnline: boolean, lastSeen?: number): void {
    const chat = this.getChat(chatId);
    if (!chat || chat.type !== 'direct') return;

    chat.isOnline = isOnline;
    if (lastSeen) chat.lastSeen = lastSeen;
    this.saveChat(chat);
  }

  /**
   * Generate encryption key (placeholder - will use Aleo in production)
   */
  private generateEncryptionKey(): string {
    // For now, generate a random key
    // In production, this would use Aleo's key generation
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export const chatService = new ChatService();
