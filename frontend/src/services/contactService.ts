/**
 * Contact Service
 * Manages user contacts and search functionality
 */

import type { Contact, ContactSearchResult } from '../models/Contact';

const CONTACTS_STORAGE_KEY = 'encrypted_social_contacts';

class ContactService {
  /**
   * Get all contacts from localStorage
   */
  getContacts(): Contact[] {
    try {
      const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading contacts:', error);
      return [];
    }
  }

  /**
   * Add a new contact
   */
  addContact(contact: Contact): void {
    const contacts = this.getContacts();

    // Check if contact already exists
    const existingIndex = contacts.findIndex(c => c.address === contact.address);

    if (existingIndex >= 0) {
      // Update existing contact
      contacts[existingIndex] = { ...contacts[existingIndex], ...contact };
    } else {
      // Add new contact
      contacts.push(contact);
    }

    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  }

  /**
   * Remove a contact
   */
  removeContact(address: string): void {
    const contacts = this.getContacts().filter(c => c.address !== address);
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  }

  /**
   * Get a specific contact by address
   */
  getContact(address: string): Contact | null {
    const contacts = this.getContacts();
    return contacts.find(c => c.address === address) || null;
  }

  /**
   * Search contacts by name or address
   */
  searchContacts(query: string): ContactSearchResult[] {
    if (!query.trim()) {
      return this.getContacts().map(c => ({ ...c, matchScore: 1 }));
    }

    const lowerQuery = query.toLowerCase();
    const contacts = this.getContacts();

    return contacts
      .map(contact => {
        let matchScore = 0;

        // Check display name
        if (contact.displayName.toLowerCase().includes(lowerQuery)) {
          matchScore += 2;
        }

        // Check address
        if (contact.address.toLowerCase().includes(lowerQuery)) {
          matchScore += 1;
        }

        // Check bio
        if (contact.bio.toLowerCase().includes(lowerQuery)) {
          matchScore += 0.5;
        }

        return { ...contact, matchScore };
      })
      .filter(result => result.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Update contact status (online/offline/away)
   */
  updateContactStatus(address: string, status: Contact['status']): void {
    const contacts = this.getContacts();
    const contactIndex = contacts.findIndex(c => c.address === address);

    if (contactIndex >= 0) {
      contacts[contactIndex].status = status;
      contacts[contactIndex].lastSeen = Date.now();
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    }
  }

  /**
   * Update typing indicator
   */
  updateTypingStatus(address: string, isTyping: boolean): void {
    const contacts = this.getContacts();
    const contactIndex = contacts.findIndex(c => c.address === address);

    if (contactIndex >= 0) {
      contacts[contactIndex].isTyping = isTyping;
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    }
  }

  /**
   * Get online contacts
   */
  getOnlineContacts(): Contact[] {
    return this.getContacts().filter(c => c.status === 'online');
  }

  /**
   * Import contacts from Aleo blockchain (placeholder)
   */
  async importFromAleo(userAddress: string): Promise<Contact[]> {
    // TODO: Implement Aleo blockchain contact discovery
    // This would use ZK proofs to match contacts without revealing data
    console.log('Importing contacts from Aleo for', userAddress);
    return [];
  }
}

export const contactService = new ContactService();
