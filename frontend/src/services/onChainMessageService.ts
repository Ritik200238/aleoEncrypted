/**
 * On-Chain Message Service (Wave 3)
 * Handles message storage and retrieval on Aleo blockchain
 *
 * Features:
 * - Write encrypted messages to chain
 * - Fetch messages with pagination
 * - Message status tracking (pending/confirmed/failed)
 * - Caching for performance
 * - Retry logic for failed transactions
 * - Real-time message updates
 */

import { aleoWalletService } from './aleoWalletService';
import { forwardSecrecyService } from './forwardSecrecyService';
import { EncryptedMessage } from '../types/encryption';

export interface OnChainMessage {
  id: string;
  groupId: string;
  encryptedContent: string;
  senderCommitment: string;
  keyId: string;
  generation: number;
  timestamp: number;
  transactionId: string;
  status: 'pending' | 'confirmed' | 'failed';
  retryCount: number;
}

export interface MessagePage {
  messages: OnChainMessage[];
  hasMore: boolean;
  cursor: string | null;
}

class OnChainMessageService {
  private messageCache: Map<string, OnChainMessage[]> = new Map(); // groupId -> messages
  private pendingMessages: Map<string, OnChainMessage> = new Map(); // txId -> message
  private readonly CACHE_KEY = 'onchain_messages';
  private readonly PAGE_SIZE = 50;
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.loadCache();
    this.startStatusPolling();
  }

  /**
   * Send message to blockchain
   */
  async sendMessage(
    groupId: string,
    plaintext: string,
    memberCommitment: string
  ): Promise<OnChainMessage> {
    try {
      console.log('Sending message to chain:', { groupId });

      // Encrypt message with forward secrecy
      const encrypted = await forwardSecrecyService.encryptMessage(groupId, plaintext);

      // Get program IDs
      const programs = aleoWalletService.getProgramIds();

      // Prepare transaction inputs
      const inputs = [
        groupId,                        // group_id (field)
        encrypted.content,              // encrypted_content (string)
        encrypted.senderCommitment,     // sender_commitment (field)
        encrypted.nonce,                // nonce (field)
        encrypted.generation.toString(), // key_generation (u32)
      ];

      // Execute transaction
      const txResponse = await aleoWalletService.executeTransaction({
        program: programs.MESSAGE_HANDLER,
        functionName: 'send_message',
        inputs,
        fee: 0.01,
        privateFee: false,
      });

      // Create message record
      const message: OnChainMessage = {
        id: this.generateMessageId(groupId),
        groupId,
        encryptedContent: encrypted.content,
        senderCommitment: encrypted.senderCommitment,
        keyId: encrypted.keyId,
        generation: encrypted.generation,
        timestamp: Date.now(),
        transactionId: txResponse.transactionId,
        status: 'pending',
        retryCount: 0,
      };

      // Add to pending messages
      this.pendingMessages.set(txResponse.transactionId, message);

      // Add to cache optimistically
      this.addToCache(groupId, message);

      console.log('✓ Message sent to chain:', message.id);

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Fetch messages for a group with pagination
   */
  async fetchMessages(
    groupId: string,
    cursor: string | null = null
  ): Promise<MessagePage> {
    try {
      console.log('Fetching messages for group:', groupId);

      // Check cache first
      const cached = this.messageCache.get(groupId) || [];

      // In production, query Aleo blockchain API or indexer
      // For now, return cached messages with pagination
      const startIndex = cursor ? parseInt(cursor) : 0;
      const endIndex = startIndex + this.PAGE_SIZE;

      const pageMessages = cached.slice(startIndex, endIndex);
      const hasMore = endIndex < cached.length;

      const page: MessagePage = {
        messages: pageMessages,
        hasMore,
        cursor: hasMore ? endIndex.toString() : null,
      };

      console.log(`✓ Fetched ${pageMessages.length} messages`);

      return page;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  }

  /**
   * Get message by transaction ID
   */
  async getMessageByTx(transactionId: string): Promise<OnChainMessage | null> {
    // Check pending messages
    const pending = this.pendingMessages.get(transactionId);
    if (pending) {
      return pending;
    }

    // Search cache
    for (const messages of this.messageCache.values()) {
      const found = messages.find(m => m.transactionId === transactionId);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Check status of message transaction
   */
  async checkMessageStatus(transactionId: string): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      const status = await aleoWalletService.getTransactionStatus(transactionId);

      // Update pending message if found
      const message = this.pendingMessages.get(transactionId);
      if (message && status !== 'pending') {
        message.status = status;

        if (status === 'confirmed') {
          this.pendingMessages.delete(transactionId);
          console.log('✓ Message confirmed:', message.id);
        } else if (status === 'failed') {
          // Retry if under max retries
          if (message.retryCount < this.MAX_RETRIES) {
            await this.retryMessage(message);
          } else {
            this.pendingMessages.delete(transactionId);
            console.error('✗ Message failed after retries:', message.id);
          }
        }

        this.saveCache();
      }

      return status;
    } catch (error) {
      console.error('Failed to check message status:', error);
      return 'pending';
    }
  }

  /**
   * Get all messages for a group (from cache)
   */
  getMessagesFromCache(groupId: string): OnChainMessage[] {
    return this.messageCache.get(groupId) || [];
  }

  /**
   * Get pending message count
   */
  getPendingCount(): number {
    return this.pendingMessages.size;
  }

  /**
   * Clear cache for a group
   */
  clearGroupCache(groupId: string): void {
    this.messageCache.delete(groupId);
    this.saveCache();
  }

  /**
   * Clear all caches
   */
  clearAllCache(): void {
    this.messageCache.clear();
    this.pendingMessages.clear();
    this.saveCache();
  }

  // ========== PRIVATE METHODS ==========

  private addToCache(groupId: string, message: OnChainMessage): void {
    const messages = this.messageCache.get(groupId) || [];
    messages.push(message);

    // Sort by timestamp (newest first)
    messages.sort((a, b) => b.timestamp - a.timestamp);

    this.messageCache.set(groupId, messages);
    this.saveCache();
  }

  private async retryMessage(message: OnChainMessage): Promise<void> {
    console.log('Retrying message:', message.id, 'Attempt:', message.retryCount + 1);

    try {
      message.retryCount++;

      const programs = aleoWalletService.getProgramIds();

      const inputs = [
        message.groupId,
        message.encryptedContent,
        message.senderCommitment,
        '', // nonce placeholder
        message.generation.toString(),
      ];

      const txResponse = await aleoWalletService.executeTransaction({
        program: programs.MESSAGE_HANDLER,
        functionName: 'send_message',
        inputs,
        fee: 0.01,
        privateFee: false,
      });

      // Update transaction ID
      this.pendingMessages.delete(message.transactionId);
      message.transactionId = txResponse.transactionId;
      message.status = 'pending';
      this.pendingMessages.set(txResponse.transactionId, message);

      console.log('✓ Message retry submitted:', message.id);
    } catch (error) {
      console.error('Message retry failed:', error);
      message.status = 'failed';
    }

    this.saveCache();
  }

  private startStatusPolling(): void {
    // Poll pending messages every 10 seconds
    setInterval(() => {
      this.pollPendingMessages();
    }, 10000);
  }

  private async pollPendingMessages(): Promise<void> {
    if (this.pendingMessages.size === 0) return;

    console.log('Polling pending messages:', this.pendingMessages.size);

    const promises = Array.from(this.pendingMessages.keys()).map(txId =>
      this.checkMessageStatus(txId)
    );

    await Promise.allSettled(promises);
  }

  private generateMessageId(groupId: string): string {
    return `msg_${groupId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private saveCache(): void {
    try {
      const serializable = {
        messageCache: Array.from(this.messageCache.entries()),
        pendingMessages: Array.from(this.pendingMessages.entries()),
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(serializable));
    } catch (error) {
      console.error('Failed to save message cache:', error);
    }
  }

  private loadCache(): void {
    try {
      const saved = localStorage.getItem(this.CACHE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.messageCache = new Map(data.messageCache || []);
        this.pendingMessages = new Map(data.pendingMessages || []);

        console.log('✓ Message cache loaded:', {
          groups: this.messageCache.size,
          pending: this.pendingMessages.size,
        });
      }
    } catch (error) {
      console.error('Failed to load message cache:', error);
    }
  }
}

// Export singleton instance
export const onChainMessageService = new OnChainMessageService();
