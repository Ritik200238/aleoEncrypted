/**
 * Demo Data Service
 * Provides sample contacts and chats for immediate testing
 */

import { contactService } from './contactService';
import { chatService } from './chatService';
import type { Contact } from '../models/Contact';

export class DemoDataService {
  /**
   * Initialize demo contacts (for easy testing)
   */
  static initializeDemoContacts(currentUserAddress: string): void {
    const existingContacts = contactService.getContacts();
    if (existingContacts.length > 0) return; // Already initialized

    const demoContacts: Omit<Contact, 'addedAt'>[] = [
      {
        address: 'aleo1alice8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q',
        displayName: 'Alice',
        avatar: '👩',
        bio: 'Blockchain developer & Aleo enthusiast',
        publicKey: 'pub_alice_key',
        lastSeen: Date.now() - 1000 * 60 * 5,
        status: 'online',
        isTyping: false,
      },
      {
        address: 'aleo1bob9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9',
        displayName: 'Bob',
        avatar: '👨',
        bio: 'Privacy advocate | Zero-knowledge proofs',
        publicKey: 'pub_bob_key',
        lastSeen: Date.now() - 1000 * 60 * 30,
        status: 'away',
        isTyping: false,
      },
      {
        address: 'aleo1charlie3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
        displayName: 'Charlie',
        avatar: '🧑',
        bio: 'Smart contract engineer',
        publicKey: 'pub_charlie_key',
        lastSeen: Date.now() - 1000 * 60 * 60 * 2,
        status: 'offline',
        isTyping: false,
      },
      {
        address: 'aleo1diana4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d',
        displayName: 'Diana',
        avatar: '👩‍💼',
        bio: 'Crypto researcher | DeFi enthusiast',
        publicKey: 'pub_diana_key',
        lastSeen: Date.now() - 1000 * 60 * 15,
        status: 'online',
        isTyping: false,
      },
      {
        address: 'aleo1eve5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e',
        displayName: 'Eve',
        avatar: '👩‍💻',
        bio: 'Full-stack developer | Web3 builder',
        publicKey: 'pub_eve_key',
        lastSeen: Date.now() - 1000 * 60 * 60,
        status: 'offline',
        isTyping: false,
      },
    ];

    // Add demo contacts
    demoContacts.forEach(contact => {
      contactService.addContact({
        ...contact,
        addedAt: Date.now(),
      });
    });

    console.log('✅ Demo contacts initialized');
  }

  /**
   * Create a welcome group chat
   */
  static createWelcomeGroup(currentUserAddress: string): void {
    const existingChats = chatService.getChats();
    if (existingChats.length > 0) return; // Already have chats

    const welcomeGroup = chatService.createGroup(
      currentUserAddress,
      'Welcome to EncryptedSocial',
      '🎉',
      [
        'aleo1alice8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q',
        'aleo1bob9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9',
      ],
      'Welcome to EncryptedSocial! Start chatting with privacy powered by Aleo blockchain.'
    );

    console.log('✅ Welcome group created:', welcomeGroup.id);
  }
}
