// Message-related type definitions

// Blockchain transaction status
export type TransactionStatus = 'sending' | 'pending' | 'confirmed' | 'failed';

// Telegram-style delivery status
export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

// Message reaction
export interface Reaction {
  emoji: string;
  userAddress: string;
  timestamp: number;
}

export interface Message {
  id: string;
  groupId: string;
  content: string;
  senderCommitment: string;
  timestamp: number;
  nonce: number;
  isOwn: boolean;

  // Blockchain status
  status?: TransactionStatus; // Transaction status (for sent messages)
  txId?: string; // Blockchain transaction ID
  error?: string; // Error message if failed

  // Telegram-style features
  deliveryStatus?: DeliveryStatus; // Telegram-style delivery tracking
  deliveredTo?: string[]; // Addresses who received (for group chats)
  readBy?: string[]; // Addresses who read (for group chats)

  // Message features
  replyTo?: string; // Message ID this is replying to
  reactions?: Reaction[]; // Emoji reactions
  edited?: boolean; // Whether message was edited
  editedAt?: number; // Edit timestamp

  // Future features
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  mediaSize?: number;
}

export interface MessageRecord {
  owner: string;
  group_id: string;
  encrypted_content: string;
  sender_commitment: string;
  timestamp: number;
  message_id: string;
  message_nonce: number;
}

export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
  groupId: string;
}
