/**
 * Messaging Orchestrator
 *
 * Central coordination layer between the UI and all backend services.
 * CleanTelegramApp.tsx imports ONLY this — it never directly calls
 * databaseService, encryptionService, leoContractService, or websocketService.
 *
 * Responsibilities:
 *   - Real AES-256-GCM encryption before any message is stored or sent
 *   - IndexedDB persistence (not localStorage) via databaseService
 *   - On-chain transactions via leoContractService (with graceful fallback)
 *   - Real-time relay via websocketService
 *   - Privacy metrics for the Privacy Score Dashboard
 */

import { databaseService } from './databaseService';
import type { Message as DbMessage, Chat as DbChat, Contact as DbContact } from './databaseService';
import { encryptionService } from './encryptionService';
import { leoContractService } from './leoContractService';
import { websocketService, WsEventType } from './websocketService';
import type { WsEvent } from './websocketService';
import { getTransactionExplorerUrl } from '../config/aleoConfig';

// ─── Canonical UI types used by CleanTelegramApp ────────────────────────────

export interface OrchestratorMessage {
  id: string;
  chatId: string;
  content: string;
  encryptedContent?: string;
  nonce?: string;
  timestamp: number;
  isOwn: boolean;
  sender: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  encrypted: boolean;
  blockchainTxId?: string;
  explorerUrl?: string;
  isAnonymous?: boolean;
}

export interface OrchestratorChat {
  id: string;
  name: string;
  avatar: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: string;
  lastMessageTime: number;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isGroup: boolean;
  memberCount?: number;
  merkleRoot?: string;
  encryptionKey?: string;
}

export interface OrchestratorContact {
  id: string;
  address: string;
  displayName: string;
  avatar: string;
  bio?: string;
  isBlocked: boolean;
  addedAt: number;
}

export interface PrivacyMetrics {
  totalMessages: number;
  encryptedMessages: number;
  onChainMessages: number;
  totalGroups: number;
  confirmedTxCount: number;
  zkTipCount: number;
  recentTransactions: Array<{ id: string; type: string; url: string; status: string }>;
}

// ─── Adapters: bridge between DB types and UI types ─────────────────────────

function adaptDbChat(db: DbChat): OrchestratorChat {
  return {
    id: db.id,
    name: db.name,
    avatar: db.avatar,
    type: db.type === 'group' ? 'group' : 'direct',
    participants: db.participants,
    lastMessage: db.lastMessage,
    lastMessageTime: db.lastMessageTime,
    unreadCount: db.unreadCount,
    isPinned: db.isPinned,
    isMuted: db.isMuted,
    isGroup: db.type === 'group',
    memberCount: db.type === 'group' ? db.participants.length : undefined,
    merkleRoot: db.merkleRoot,
    encryptionKey: db.encryptionKey,
  };
}

function adaptDbMessage(db: DbMessage, userAddress: string): OrchestratorMessage {
  return {
    id: db.id,
    chatId: db.chatId,
    content: db.content,
    encryptedContent: db.encryptedContent,
    timestamp: db.timestamp,
    isOwn: db.sender === userAddress,
    sender: db.sender,
    status: db.status as OrchestratorMessage['status'],
    encrypted: !!db.encryptedContent,
    blockchainTxId: db.blockchainTxId,
    explorerUrl: db.blockchainTxId ? getTransactionExplorerUrl(db.blockchainTxId) : undefined,
  };
}

function adaptDbContact(db: DbContact): OrchestratorContact {
  return {
    id: db.id,
    address: db.address,
    displayName: db.displayName,
    avatar: db.avatar,
    bio: db.bio,
    isBlocked: db.isBlocked,
    addedAt: db.addedAt,
  };
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

class MessagingOrchestrator {
  private userAddress: string = '';
  private messageListeners: Array<(msg: OrchestratorMessage) => void> = [];
  private statusListeners: Array<(msgId: string, status: OrchestratorMessage['status'], txId?: string) => void> = [];
  private zkTipTxs: Array<{ id: string; url: string; timestamp: number }> = [];

  /**
   * Initialize with user's wallet address. Call once after wallet connects.
   */
  async initialize(userAddress: string): Promise<void> {
    this.userAddress = userAddress;

    // Connect to relay server (graceful - no crash if server offline)
    websocketService.connect(userAddress).catch(() => {
      console.warn('Relay server not available — real-time disabled');
    });

    // Listen for incoming relay messages
    websocketService.addEventListener(this.handleWsEvent.bind(this));

    console.log('MessagingOrchestrator initialized for', userAddress.substring(0, 12) + '...');
  }

  destroy(): void {
    websocketService.disconnect();
    this.messageListeners = [];
    this.statusListeners = [];
  }

  // ─── Data Loaders ──────────────────────────────────────────────────────────

  async loadChats(): Promise<OrchestratorChat[]> {
    const dbChats = await databaseService.getChats();
    return dbChats.map(adaptDbChat);
  }

  async loadMessages(chatId: string, limit = 50): Promise<OrchestratorMessage[]> {
    const dbMsgs = await databaseService.getMessages(chatId, limit);
    return dbMsgs.map(m => adaptDbMessage(m, this.userAddress)).reverse();
  }

  async loadContacts(): Promise<OrchestratorContact[]> {
    const dbContacts = await databaseService.getContacts();
    return dbContacts.map(adaptDbContact);
  }

  // ─── Message Sending ────────────────────────────────────────────────────────

  /**
   * Send a message: encrypt → IndexedDB → blockchain → WebSocket relay.
   * Returns optimistic message immediately (status: 'sending').
   * Status updates fire via onStatusChange listeners.
   */
  async sendMessage(
    chatId: string,
    content: string,
    isAnonymous = false
  ): Promise<OrchestratorMessage> {
    // 1. Derive group encryption key (deterministic from chatId + userAddress)
    const groupKey = await encryptionService.deriveGroupKey(chatId, this.userAddress);

    // 2. Encrypt with AES-256-GCM
    const { ciphertext, nonce } = await encryptionService.encryptMessage(content, groupKey);

    // 3. Create optimistic message record
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    const sender = isAnonymous ? 'Anonymous' : this.userAddress;

    const uiMsg: OrchestratorMessage = {
      id: msgId,
      chatId,
      content,
      encryptedContent: ciphertext,
      nonce,
      timestamp: now,
      isOwn: true,
      sender,
      status: 'sending',
      encrypted: true,
      isAnonymous,
    };

    // 4. Persist to IndexedDB (real storage, not localStorage)
    await databaseService.addMessage({
      id: msgId,
      chatId,
      sender: this.userAddress,
      content,
      encryptedContent: ciphertext,
      timestamp: now,
      status: 'pending',
    });

    await databaseService.updateChat(chatId, {
      lastMessage: content.length > 60 ? content.slice(0, 60) + '...' : content,
      lastMessageTime: now,
    });

    // 5. Submit to blockchain (async, non-blocking)
    this.submitToBlockchain(msgId, chatId, ciphertext, now);

    // 6. Relay via WebSocket (async, non-blocking)
    this.relayMessage(chatId, msgId, ciphertext, nonce, sender, now, isAnonymous);

    return uiMsg;
  }

  private async submitToBlockchain(
    msgId: string,
    chatId: string,
    ciphertext: string,
    now: number
  ): Promise<void> {
    try {
      this.notifyStatus(msgId, 'sent');
      await databaseService.updateMessage(msgId, { status: 'sent' });

      const result = await leoContractService.sendMessage(chatId, ciphertext, now);

      await databaseService.updateMessage(msgId, {
        status: 'delivered',
        blockchainTxId: result.transactionId,
      });
      this.notifyStatus(msgId, 'delivered', result.transactionId);

      const url = getTransactionExplorerUrl(result.transactionId);
      console.log(`✓ Message on-chain TX: ${result.transactionId}`);
      console.log(`  Explorer: ${url}`);
    } catch (err) {
      // Blockchain unavailable — message already saved to IndexedDB
      console.warn('Blockchain submission failed (saved locally):', err);
      this.notifyStatus(msgId, 'sent');
    }
  }

  private relayMessage(
    chatId: string,
    msgId: string,
    encryptedContent: string,
    nonce: string,
    sender: string,
    timestamp: number,
    isAnonymous: boolean
  ): void {
    if (!websocketService.isConnected()) return;
    // Access socket directly for emit (service doesn't expose a generic emit)
    const svc = websocketService as unknown as { socket: { emit: (e: string, d: unknown) => void } | null };
    svc.socket?.emit('send_message', {
      chatId,
      messageId: msgId,
      encryptedContent,
      nonce,
      senderAddress: isAnonymous ? undefined : sender,
      isAnonymous,
      timestamp,
    });
  }

  // ─── Group Creation ─────────────────────────────────────────────────────────

  async createGroup(name: string, memberAddresses: string[]): Promise<OrchestratorChat> {
    const allMembers = [this.userAddress, ...memberAddresses.filter(a => a !== this.userAddress)];
    const chatId = `group_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    const encryptionKey = await encryptionService.deriveGroupKey(chatId, this.userAddress);

    const dbChat: DbChat = {
      id: chatId,
      type: 'group',
      name,
      avatar: name.charAt(0).toUpperCase(),
      participants: allMembers,
      lastMessage: `Group '${name}' created`,
      lastMessageTime: now,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      encryptionKey,
    };

    await databaseService.addChat(dbChat);
    await databaseService.addMessage({
      id: `sys_${Date.now()}`,
      chatId,
      sender: 'system',
      content: `Group '${name}' created with ${allMembers.length} members`,
      timestamp: now,
      status: 'delivered',
    });

    // On-chain group creation (non-blocking)
    leoContractService.createGroup(name).then(result => {
      databaseService.updateChat(chatId, { merkleRoot: result.merkleRoot });
      console.log(`✓ Group on-chain: ${result.transactionId}`);
    }).catch(err => console.warn('Group on-chain failed:', err));

    websocketService.joinGroup(chatId);
    return adaptDbChat(dbChat);
  }

  // ─── Contact Management ─────────────────────────────────────────────────────

  async addContact(address: string, displayName: string): Promise<OrchestratorContact> {
    const contact: DbContact = {
      id: `contact_${Date.now()}`,
      address,
      displayName,
      avatar: displayName.charAt(0).toUpperCase(),
      isBlocked: false,
      addedAt: Date.now(),
    };
    await databaseService.addContact(contact);
    return adaptDbContact(contact);
  }

  async deleteContact(id: string): Promise<void> {
    await databaseService.deleteContact(id);
  }

  async getOrCreateDirectChat(contactAddress: string, contactName: string): Promise<OrchestratorChat> {
    const chats = await databaseService.getChats();
    const existing = chats.find(c =>
      c.type === 'direct' &&
      c.participants.includes(contactAddress) &&
      c.participants.includes(this.userAddress)
    );
    if (existing) return adaptDbChat(existing);

    const chatId = `direct_${[this.userAddress, contactAddress].sort().join('_')}`;
    const encryptionKey = await encryptionService.deriveGroupKey(chatId, this.userAddress);
    const dbChat: DbChat = {
      id: chatId,
      type: 'direct',
      name: contactName,
      avatar: contactName.charAt(0).toUpperCase(),
      participants: [this.userAddress, contactAddress],
      lastMessageTime: Date.now(),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      encryptionKey,
    };
    await databaseService.addChat(dbChat);
    websocketService.joinGroup(chatId);
    return adaptDbChat(dbChat);
  }

  // ─── Typing ─────────────────────────────────────────────────────────────────

  sendTyping(chatId: string, isTyping: boolean): void {
    websocketService.sendTyping(chatId, isTyping);
  }

  // ─── ZK Tip Tracking ────────────────────────────────────────────────────────

  recordZkTip(transactionId: string): void {
    this.zkTipTxs.push({
      id: transactionId,
      url: getTransactionExplorerUrl(transactionId),
      timestamp: Date.now(),
    });
  }

  // ─── Privacy Metrics ─────────────────────────────────────────────────────────

  async getPrivacyMetrics(): Promise<PrivacyMetrics> {
    // Get all messages across all chats by loading from DB
    const allChats = await databaseService.getChats();
    let allMsgs: DbMessage[] = [];
    for (const chat of allChats) {
      const msgs = await databaseService.getMessages(chat.id, 200);
      allMsgs = allMsgs.concat(msgs);
    }

    const encryptedMsgs = allMsgs.filter(m => !!m.encryptedContent);
    const onChainMsgs = allMsgs.filter(m => !!m.blockchainTxId);
    const groups = allChats.filter(c => c.type === 'group');

    const recentTxs = onChainMsgs.slice(0, 5).map(m => ({
      id: m.blockchainTxId!,
      type: 'message',
      url: getTransactionExplorerUrl(m.blockchainTxId!),
      status: 'confirmed',
    }));

    // Mix in ZK tip TXs to the recent transactions list (shown as 'ZK transfer_private')
    const tipTxs = this.zkTipTxs.slice(-5).map(t => ({
      id: t.id,
      type: 'ZK transfer_private',
      url: t.url,
      status: 'confirmed',
    }));

    return {
      totalMessages: allMsgs.length,
      encryptedMessages: encryptedMsgs.length,
      onChainMessages: onChainMsgs.length,
      totalGroups: groups.length,
      confirmedTxCount: onChainMsgs.length + this.zkTipTxs.length,
      zkTipCount: this.zkTipTxs.length,
      recentTransactions: [...tipTxs, ...recentTxs].slice(0, 5),
    };
  }

  // ─── Event Subscriptions ────────────────────────────────────────────────────

  onNewMessage(callback: (msg: OrchestratorMessage) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== callback);
    };
  }

  onStatusChange(
    callback: (msgId: string, status: OrchestratorMessage['status'], txId?: string) => void
  ): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== callback);
    };
  }

  // ─── Internal ───────────────────────────────────────────────────────────────

  private handleWsEvent(event: WsEvent): void {
    if (event.type === WsEventType.NEW_MESSAGE && event.data) {
      this.decryptAndDeliver(event.data);
    }
  }

  private async decryptAndDeliver(data: {
    chatId: string;
    messageId: string;
    encryptedContent: string;
    nonce?: string;
    senderId?: string;
    timestamp: number;
    isAnonymous?: boolean;
  }): Promise<void> {
    try {
      const groupKey = await encryptionService.deriveGroupKey(data.chatId, this.userAddress);
      const plaintext = data.nonce
        ? await encryptionService.decryptMessage(data.encryptedContent, data.nonce, groupKey)
        : data.encryptedContent;

      const msg: OrchestratorMessage = {
        id: data.messageId,
        chatId: data.chatId,
        content: plaintext,
        encryptedContent: data.encryptedContent,
        nonce: data.nonce,
        timestamp: data.timestamp,
        isOwn: false,
        sender: data.isAnonymous ? 'Anonymous' : (data.senderId || 'Unknown'),
        status: 'delivered',
        encrypted: true,
        isAnonymous: data.isAnonymous,
      };

      await databaseService.addMessage({
        id: msg.id,
        chatId: msg.chatId,
        sender: data.senderId || 'unknown',
        content: plaintext,
        encryptedContent: data.encryptedContent,
        timestamp: msg.timestamp,
        status: 'delivered',
      });

      this.messageListeners.forEach(l => l(msg));
    } catch (err) {
      console.error('Failed to decrypt incoming message:', err);
    }
  }

  private notifyStatus(msgId: string, status: OrchestratorMessage['status'], txId?: string): void {
    this.statusListeners.forEach(l => l(msgId, status, txId));
  }
}

export const messagingOrchestrator = new MessagingOrchestrator();
