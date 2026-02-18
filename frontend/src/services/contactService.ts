/**
 * Contact Service
 * Manages user contacts using IndexedDB via databaseService
 */

import type { Contact, ContactSearchResult } from '../models/Contact';
import { databaseService, type Contact as DBContact } from './databaseService';

class ContactService {
  /**
   * Get all contacts from IndexedDB
   */
  async getContacts(): Promise<Contact[]> {
    try {
      const dbContacts = await databaseService.getContacts();
      return dbContacts.map(this.dbContactToContact);
    } catch (error) {
      console.error('Error loading contacts:', error);
      return [];
    }
  }

  /**
   * Sync getter for backward compatibility - loads from cache or returns empty
   */
  getContactsSync(): Contact[] {
    // For backward compat during migration; callers should migrate to async
    try {
      const stored = localStorage.getItem('encrypted_social_contacts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add a new contact
   */
  async addContact(contact: Contact): Promise<void> {
    try {
      const existing = await databaseService.getContactByAddress(contact.address);
      if (existing) {
        await databaseService.updateContact(existing.id, this.contactToDBContact(contact));
      } else {
        const dbContact: DBContact = {
          id: contact.address,
          address: contact.address,
          displayName: contact.displayName,
          avatar: contact.avatar || '',
          bio: contact.bio || '',
          publicKey: contact.publicKey || '',
          isBlocked: false,
          addedAt: contact.addedAt || Date.now(),
        };
        await databaseService.addContact(dbContact);
      }
      // Also update localStorage for backward compat
      this.syncToLocalStorage(contact);
    } catch (error) {
      console.error('Error adding contact:', error);
      // Fallback to localStorage
      this.syncToLocalStorage(contact);
    }
  }

  /**
   * Remove a contact
   */
  async removeContact(address: string): Promise<void> {
    try {
      const contact = await databaseService.getContactByAddress(address);
      if (contact) {
        await databaseService.deleteContact(contact.id);
      }
    } catch (error) {
      console.error('Error removing contact:', error);
    }
  }

  /**
   * Get a specific contact by address
   */
  async getContact(address: string): Promise<Contact | null> {
    try {
      const dbContact = await databaseService.getContactByAddress(address);
      return dbContact ? this.dbContactToContact(dbContact) : null;
    } catch (error) {
      console.error('Error getting contact:', error);
      return null;
    }
  }

  /**
   * Search contacts by name or address
   */
  async searchContacts(query: string): Promise<ContactSearchResult[]> {
    if (!query.trim()) {
      const contacts = await this.getContacts();
      return contacts.map(c => ({ ...c, matchScore: 1 }));
    }

    const dbResults = await databaseService.searchContacts(query);
    return dbResults.map(c => ({
      ...this.dbContactToContact(c),
      matchScore: 1,
    }));
  }

  /**
   * Update contact status (online/offline/away)
   */
  updateContactStatus(address: string, status: Contact['status']): void {
    // Status is transient, no need to persist to DB
    console.log(`Contact ${address} status: ${status}`);
  }

  /**
   * Update typing indicator
   */
  updateTypingStatus(address: string, isTyping: boolean): void {
    console.log(`Contact ${address} typing: ${isTyping}`);
  }

  /**
   * Get online contacts
   */
  async getOnlineContacts(): Promise<Contact[]> {
    // Online status is managed in-memory via WebSocket events
    return [];
  }

  private dbContactToContact(db: DBContact): Contact {
    return {
      address: db.address,
      displayName: db.displayName,
      avatar: db.avatar || '',
      bio: db.bio || '',
      publicKey: db.publicKey || '',
      lastSeen: db.addedAt,
      status: 'offline' as const,
      isTyping: false,
      addedAt: db.addedAt,
    };
  }

  private contactToDBContact(contact: Contact): Partial<DBContact> {
    return {
      displayName: contact.displayName,
      avatar: contact.avatar,
      bio: contact.bio || '',
      publicKey: contact.publicKey || '',
    };
  }

  private syncToLocalStorage(contact: Contact): void {
    try {
      const stored = localStorage.getItem('encrypted_social_contacts');
      const contacts: Contact[] = stored ? JSON.parse(stored) : [];
      const idx = contacts.findIndex(c => c.address === contact.address);
      if (idx >= 0) {
        contacts[idx] = { ...contacts[idx], ...contact };
      } else {
        contacts.push(contact);
      }
      localStorage.setItem('encrypted_social_contacts', JSON.stringify(contacts));
    } catch { /* ignore */ }
  }
}

export const contactService = new ContactService();
