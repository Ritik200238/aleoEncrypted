/**
 * Database Service - Production IndexedDB with Dexie.js
 * Handles all local data persistence for EncryptedSocial
 */

import Dexie, { Table } from 'dexie';

// Type definitions
export interface Message {
  id: string;
  chatId: string;
  sender: string;
  content: string;
  encryptedContent?: string;
  timestamp: number;
  status: 'pending' | 'sent' | 'delivered' | 'read';
  blockchainTxId?: string;
  replyToId?: string;
  reactions?: Record<string, string[]>; // emoji -> [addresses]
  mediaUrls?: string[];
  isEdited?: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  avatar: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime: number;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  groupId?: string;
  merkleRoot?: string;
  encryptionKey?: string;
}

export interface Contact {
  id: string;
  address: string;
  displayName: string;
  avatar: string;
  bio?: string;
  handle?: string;
  publicKey?: string;
  isBlocked: boolean;
  addedAt: number;
}

export interface MediaFile {
  id: string;
  messageId: string;
  chatId: string;
  type: 'image' | 'video' | 'file';
  url: string;
  ipfsHash?: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: number;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoDownloadMedia: boolean;
  lastSyncTime: number;
  walletAddress?: string;
}

// Dexie Database
class EncryptedSocialDB extends Dexie {
  messages!: Table<Message, string>;
  chats!: Table<Chat, string>;
  contacts!: Table<Contact, string>;
  media!: Table<MediaFile, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('EncryptedSocialDB');

    // Define schema with indexes for performance
    this.version(1).stores({
      messages: 'id, chatId, timestamp, sender, [chatId+timestamp]',
      chats: 'id, type, lastMessageTime, isPinned, isArchived',
      contacts: 'id, address, displayName, addedAt',
      media: 'id, messageId, chatId, type, uploadedAt',
      settings: 'id',
    });
  }
}

// Singleton instance
const db = new EncryptedSocialDB();

/**
 * Database Service - Production-ready IndexedDB operations
 */
export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // ============ MESSAGES ============

  async addMessage(message: Message): Promise<void> {
    await db.messages.add(message);
  }

  async getMessages(
    chatId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    return await db.messages
      .where('chatId')
      .equals(chatId)
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    return await db.messages.get(id);
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<void> {
    await db.messages.update(id, updates);
  }

  async deleteMessage(id: string): Promise<void> {
    await db.messages.delete(id);
  }

  async searchMessages(query: string): Promise<Message[]> {
    const lowerQuery = query.toLowerCase();
    return await db.messages
      .filter((message) => message.content.toLowerCase().includes(lowerQuery))
      .toArray();
  }

  async getMessageCount(chatId: string): Promise<number> {
    return await db.messages.where('chatId').equals(chatId).count();
  }

  // ============ CHATS ============

  async addChat(chat: Chat): Promise<void> {
    await db.chats.add(chat);
  }

  async getChats(): Promise<Chat[]> {
    return await db.chats
      .orderBy('lastMessageTime')
      .reverse()
      .toArray();
  }

  async getChatById(id: string): Promise<Chat | undefined> {
    return await db.chats.get(id);
  }

  async updateChat(id: string, updates: Partial<Chat>): Promise<void> {
    await db.chats.update(id, updates);
  }

  async deleteChat(id: string): Promise<void> {
    await db.chats.delete(id);
    // Also delete all messages in this chat
    await db.messages.where('chatId').equals(id).delete();
  }

  async getPinnedChats(): Promise<Chat[]> {
    return await db.chats.where('isPinned').equals(1).toArray();
  }

  // ============ CONTACTS ============

  async addContact(contact: Contact): Promise<void> {
    await db.contacts.add(contact);
  }

  async getContacts(): Promise<Contact[]> {
    return await db.contacts.orderBy('displayName').toArray();
  }

  async getContactById(id: string): Promise<Contact | undefined> {
    return await db.contacts.get(id);
  }

  async getContactByAddress(address: string): Promise<Contact | undefined> {
    return await db.contacts.where('address').equals(address).first();
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    await db.contacts.update(id, updates);
  }

  async deleteContact(id: string): Promise<void> {
    await db.contacts.delete(id);
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const lowerQuery = query.toLowerCase();
    return await db.contacts
      .filter((contact) =>
        contact.displayName.toLowerCase().includes(lowerQuery) ||
        contact.address.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }

  // ============ MEDIA ============

  async addMedia(media: MediaFile): Promise<void> {
    await db.media.add(media);
  }

  async getMediaByChat(chatId: string): Promise<MediaFile[]> {
    return await db.media
      .where('chatId')
      .equals(chatId)
      .reverse()
      .toArray();
  }

  async getMediaByType(chatId: string, type: 'image' | 'video' | 'file'): Promise<MediaFile[]> {
    return await db.media
      .where(['chatId', 'type'])
      .equals([chatId, type])
      .reverse()
      .toArray();
  }

  async deleteMedia(id: string): Promise<void> {
    await db.media.delete(id);
  }

  async getMediaSize(chatId?: string): Promise<number> {
    let media: MediaFile[];
    if (chatId) {
      media = await db.media.where('chatId').equals(chatId).toArray();
    } else {
      media = await db.media.toArray();
    }
    return media.reduce((total, m) => total + m.fileSize, 0);
  }

  // ============ SETTINGS ============

  async getSettings(): Promise<UserSettings> {
    const settings = await db.settings.get('user');
    if (!settings) {
      // Return default settings
      const defaultSettings: UserSettings = {
        theme: 'dark',
        notificationsEnabled: true,
        soundEnabled: true,
        autoDownloadMedia: true,
        lastSyncTime: 0,
      };
      await this.saveSettings(defaultSettings);
      return defaultSettings;
    }
    return settings;
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    await db.settings.put({ ...settings, id: 'user' } as any);
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<void> {
    const current = await this.getSettings();
    await this.saveSettings({ ...current, ...updates });
  }

  // ============ UTILITY ============

  async clearAllData(): Promise<void> {
    await db.messages.clear();
    await db.chats.clear();
    await db.contacts.clear();
    await db.media.clear();
    // Keep settings
  }

  async clearChat(chatId: string): Promise<void> {
    await db.messages.where('chatId').equals(chatId).delete();
    await db.media.where('chatId').equals(chatId).delete();
  }

  async exportData(): Promise<string> {
    const data = {
      messages: await db.messages.toArray(),
      chats: await db.chats.toArray(),
      contacts: await db.contacts.toArray(),
      media: await db.media.toArray(),
      settings: await db.settings.toArray(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    await db.transaction('rw', [db.messages, db.chats, db.contacts, db.media, db.settings], async () => {
      if (data.messages) await db.messages.bulkAdd(data.messages);
      if (data.chats) await db.chats.bulkAdd(data.chats);
      if (data.contacts) await db.contacts.bulkAdd(data.contacts);
      if (data.media) await db.media.bulkAdd(data.media);
      if (data.settings) await db.settings.bulkAdd(data.settings);
    });
  }

  async getDatabaseSize(): Promise<number> {
    const estimate = await navigator.storage?.estimate();
    return estimate?.usage || 0;
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
export default databaseService;
