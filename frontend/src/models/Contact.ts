/**
 * Contact Model
 * Represents a user contact with Aleo blockchain integration
 */

export interface Contact {
  address: string;           // Aleo wallet address (primary key)
  displayName: string;
  avatar: string;            // Emoji or image URL
  bio: string;
  publicKey: string;         // Encryption public key
  lastSeen: number;          // Timestamp
  status: 'online' | 'offline' | 'away';
  isTyping: boolean;
  zkIdentityProof?: string;  // Optional: Proof of humanity
  addedAt: number;           // When contact was added
}

export interface ContactSearchResult extends Contact {
  matchScore: number;        // Relevance score for search
}

export class ContactModel {
  static create(data: Partial<Contact>): Contact {
    return {
      address: data.address || '',
      displayName: data.displayName || 'Unknown User',
      avatar: data.avatar || '👤',
      bio: data.bio || '',
      publicKey: data.publicKey || '',
      lastSeen: data.lastSeen || Date.now(),
      status: data.status || 'offline',
      isTyping: false,
      addedAt: data.addedAt || Date.now(),
    };
  }

  static isOnline(contact: Contact): boolean {
    const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    return Date.now() - contact.lastSeen < ONLINE_THRESHOLD;
  }

  static getStatusColor(status: Contact['status']): string {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  }
}
