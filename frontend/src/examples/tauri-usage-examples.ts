/**
 * EncryptedSocial - Tauri Backend Usage Examples
 * Comprehensive examples of using the Rust backend from React/TypeScript
 */

import {
  encryptMessage,
  decryptMessage,
  generateKeyPair,
  deriveSharedSecret,
  storeMessage,
  getMessages,
  searchMessages,
  storeChat,
  getChats,
  storeContact,
  getContacts,
  checkNetworkStatus,
  showNotification,
  getDatabaseStats,
  generateId,
  type Message,
  type Chat,
  type Contact,
} from '../types/tauri-commands';

// ============================================================================
// Example 1: Complete Message Send Flow
// ============================================================================

export async function sendEncryptedMessage(
  recipientAddress: string,
  recipientPublicKey: string,
  myPrivateKey: string,
  chatId: string,
  messageText: string
): Promise<Message> {
  try {
    console.log('Step 1: Deriving shared secret...');
    const sharedSecret = await deriveSharedSecret(myPrivateKey, recipientPublicKey);

    console.log('Step 2: Encrypting message...');
    const { ciphertext, nonce } = await encryptMessage(messageText, sharedSecret);

    console.log('Step 3: Creating message object...');
    const message: Message = {
      id: generateId(),
      chat_id: chatId,
      sender_address: 'aleo1sender...', // Replace with actual sender address
      recipient_address: recipientAddress,
      content: messageText,
      encrypted_content: ciphertext,
      nonce: nonce,
      timestamp: Date.now(),
      is_sent: true,
      is_read: false,
      tx_hash: null,
    };

    console.log('Step 4: Storing message in database...');
    await storeMessage(message);

    console.log('Step 5: Showing notification...');
    await showNotification('Message Sent', `Sent to ${recipientAddress.slice(0, 10)}...`);

    console.log('Message sent successfully!');
    return message;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

// ============================================================================
// Example 2: Receive and Decrypt Messages
// ============================================================================

export async function receiveAndDecryptMessages(
  chatId: string,
  myPrivateKey: string,
  contactPublicKey: string
): Promise<Array<Message & { decrypted: string }>> {
  try {
    console.log('Step 1: Deriving shared secret...');
    const sharedSecret = await deriveSharedSecret(myPrivateKey, contactPublicKey);

    console.log('Step 2: Fetching messages from database...');
    const messages = await getMessages(chatId, 50, 0);

    console.log(`Step 3: Decrypting ${messages.length} messages...`);
    const decryptedMessages = await Promise.all(
      messages.map(async (message) => {
        try {
          const decrypted = await decryptMessage(
            message.encrypted_content,
            message.nonce,
            sharedSecret
          );

          return {
            ...message,
            decrypted,
          };
        } catch (error) {
          console.error(`Failed to decrypt message ${message.id}:`, error);
          return {
            ...message,
            decrypted: '[Decryption Failed]',
          };
        }
      })
    );

    console.log('All messages decrypted successfully!');
    return decryptedMessages;
  } catch (error) {
    console.error('Failed to receive messages:', error);
    throw error;
  }
}

// ============================================================================
// Example 3: Initialize New Chat with Contact
// ============================================================================

export async function initializeNewChat(
  contactAddress: string,
  contactName: string
): Promise<{ chat: Chat; contact: Contact }> {
  try {
    console.log('Step 1: Generating key pair for contact...');
    const { public_key } = await generateKeyPair();

    console.log('Step 2: Creating contact...');
    const contact: Contact = {
      id: generateId(),
      address: contactAddress,
      name: contactName,
      public_key: public_key,
      avatar: null,
      is_favorite: false,
      created_at: Date.now(),
      last_seen: null,
    };

    await storeContact(contact);

    console.log('Step 3: Creating chat...');
    const chat: Chat = {
      id: generateId(),
      contact_address: contactAddress,
      contact_name: contactName,
      last_message: null,
      last_message_time: Date.now(),
      unread_count: 0,
      created_at: Date.now(),
    };

    await storeChat(chat);

    console.log('Step 4: Showing notification...');
    await showNotification('New Chat', `Started chat with ${contactName}`);

    console.log('Chat initialized successfully!');
    return { chat, contact };
  } catch (error) {
    console.error('Failed to initialize chat:', error);
    throw error;
  }
}

// ============================================================================
// Example 4: Search Messages Across All Chats
// ============================================================================

export async function searchAllMessages(
  query: string
): Promise<Array<Message & { chatName: string }>> {
  try {
    console.log(`Searching for: "${query}"`);

    // Get all chats to map chat IDs to names
    const chats = await getChats();
    const chatMap = new Map(chats.map((chat) => [chat.id, chat.contact_name]));

    // Search messages
    const results = await searchMessages(query);

    // Enrich results with chat names
    const enrichedResults = results.map((message) => ({
      ...message,
      chatName: chatMap.get(message.chat_id) || 'Unknown Chat',
    }));

    console.log(`Found ${enrichedResults.length} matching messages`);
    return enrichedResults;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// ============================================================================
// Example 5: Check Network Status and Sync
// ============================================================================

export async function checkAndSyncNetwork(): Promise<void> {
  try {
    console.log('Checking network status...');
    const status = await checkNetworkStatus();

    if (status.is_connected) {
      console.log(`✓ Connected to ${status.network_name}`);
      console.log(`  Block height: ${status.block_height || 'Unknown'}`);

      await showNotification(
        'Network Online',
        `Connected to ${status.network_name}`
      );

      // TODO: Sync messages from blockchain
    } else {
      console.log('✗ Network offline');

      await showNotification(
        'Network Offline',
        'Cannot connect to Aleo network'
      );
    }
  } catch (error) {
    console.error('Network check failed:', error);
  }
}

// ============================================================================
// Example 6: Load All Chats with Last Messages
// ============================================================================

export async function loadAllChatsWithMessages(): Promise<
  Array<Chat & { lastMessageDecrypted: string | null }>
> {
  try {
    console.log('Loading all chats...');
    const chats = await getChats();

    console.log(`Found ${chats.length} chats, loading last messages...`);

    const chatsWithMessages = await Promise.all(
      chats.map(async (chat) => {
        try {
          const messages = await getMessages(chat.id, 1, 0);

          if (messages.length > 0) {
            // In a real app, you'd decrypt this with the shared secret
            return {
              ...chat,
              lastMessageDecrypted: messages[0].content,
            };
          }

          return {
            ...chat,
            lastMessageDecrypted: null,
          };
        } catch (error) {
          console.error(`Failed to load messages for chat ${chat.id}:`, error);
          return {
            ...chat,
            lastMessageDecrypted: null,
          };
        }
      })
    );

    console.log('All chats loaded successfully!');
    return chatsWithMessages;
  } catch (error) {
    console.error('Failed to load chats:', error);
    throw error;
  }
}

// ============================================================================
// Example 7: Export Data for Backup
// ============================================================================

export async function exportUserData(): Promise<void> {
  try {
    console.log('Step 1: Getting database stats...');
    const stats = await getDatabaseStats();

    console.log(`Database contains:`);
    console.log(`  - ${stats.message_count} messages`);
    console.log(`  - ${stats.chat_count} chats`);
    console.log(`  - ${stats.contact_count} contacts`);
    console.log(`  - ${(stats.db_size_bytes / 1024 / 1024).toFixed(2)} MB`);

    console.log('Step 2: Getting all chats...');
    const chats = await getChats();

    console.log('Step 3: Getting all contacts...');
    const contacts = await getContacts();

    console.log('Step 4: Getting messages for each chat...');
    const allMessages = await Promise.all(
      chats.map(async (chat) => {
        const messages = await getMessages(chat.id, 1000, 0);
        return {
          chatId: chat.id,
          chatName: chat.contact_name,
          messages,
        };
      })
    );

    const exportData = {
      exportDate: new Date().toISOString(),
      stats,
      chats,
      contacts,
      messages: allMessages,
    };

    console.log('Step 5: Creating export file...');
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    // Download the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encrypted-social-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    await showNotification('Export Complete', 'Your data has been exported');

    console.log('Export completed successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

// ============================================================================
// Example 8: Setup New User Account
// ============================================================================

export async function setupNewUserAccount(
  userName: string,
  aleoAddress: string
): Promise<{ publicKey: string; privateKey: string }> {
  try {
    console.log('Step 1: Generating encryption keys...');
    const keyPair = await generateKeyPair();

    console.log('Step 2: Creating user profile contact...');
    const userContact: Contact = {
      id: 'user-profile',
      address: aleoAddress,
      name: userName,
      public_key: keyPair.public_key,
      avatar: null,
      is_favorite: false,
      created_at: Date.now(),
      last_seen: Date.now(),
    };

    await storeContact(userContact);

    console.log('Step 3: Checking network status...');
    await checkAndSyncNetwork();

    console.log('Step 4: Showing welcome notification...');
    await showNotification(
      'Welcome to EncryptedSocial!',
      `Account setup complete for ${userName}`
    );

    console.log('User account setup complete!');
    console.log('IMPORTANT: Save these keys securely!');
    console.log(`Public Key: ${keyPair.public_key.slice(0, 20)}...`);
    console.log(`Private Key: ${keyPair.private_key.slice(0, 20)}... [KEEP SECRET]`);

    return keyPair;
  } catch (error) {
    console.error('Account setup failed:', error);
    throw error;
  }
}

// ============================================================================
// Example 9: Real-time Message Polling
// ============================================================================

export class MessagePoller {
  private intervalId: NodeJS.Timeout | null = null;
  private lastMessageTimestamp: number = 0;

  constructor(
    private chatId: string,
    private onNewMessage: (message: Message) => void,
    private pollInterval: number = 5000
  ) {}

  start(): void {
    console.log(`Starting message poller for chat ${this.chatId}`);

    this.intervalId = setInterval(async () => {
      try {
        // Get latest messages
        const messages = await getMessages(this.chatId, 10, 0);

        // Filter new messages
        const newMessages = messages.filter(
          (msg) => msg.timestamp > this.lastMessageTimestamp
        );

        if (newMessages.length > 0) {
          console.log(`Found ${newMessages.length} new messages`);

          // Update timestamp
          this.lastMessageTimestamp = Math.max(
            ...newMessages.map((msg) => msg.timestamp)
          );

          // Notify for each new message
          newMessages.forEach((msg) => {
            this.onNewMessage(msg);
          });
        }
      } catch (error) {
        console.error('Message polling error:', error);
      }
    }, this.pollInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Message poller stopped');
    }
  }
}

// ============================================================================
// Example 10: Batch Message Operations
// ============================================================================

export async function markMultipleMessagesAsRead(
  messages: Message[]
): Promise<void> {
  try {
    console.log(`Marking ${messages.length} messages as read...`);

    await Promise.all(
      messages.map(async (message) => {
        const updatedMessage = {
          ...message,
          is_read: true,
        };

        await storeMessage(updatedMessage);
      })
    );

    console.log('All messages marked as read!');
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    throw error;
  }
}

// ============================================================================
// Usage in React Components
// ============================================================================

export const ReactExamples = `
// Example: Use in React component with hooks

import React, { useEffect, useState } from 'react';
import { getChats, type Chat } from './types/tauri-commands';

function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChats() {
      try {
        setLoading(true);
        const data = await getChats();
        setChats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  if (loading) return <div>Loading chats...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {chats.map((chat) => (
        <div key={chat.id}>
          <h3>{chat.contact_name}</h3>
          <p>{chat.last_message}</p>
        </div>
      ))}
    </div>
  );
}

// Example: Custom hook for messages

import { useEffect, useState, useCallback } from 'react';
import { getMessages, storeMessage, type Message } from './types/tauri-commands';

function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMessages(chatId, 50, 0);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const sendMessage = useCallback(async (message: Message) => {
    await storeMessage(message);
    await loadMessages(); // Reload messages
  }, [loadMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return { messages, loading, sendMessage, refreshMessages: loadMessages };
}
`;
