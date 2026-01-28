/**
 * Chat Model - Unified model for Direct Messages and Groups
 * Represents any chat conversation (1-on-1 or group)
 */

export type ChatType = 'direct' | 'group' | 'channel';

export interface Chat {
  id: string;                    // Unique chat ID
  type: ChatType;                // DM, group, or channel
  name: string;                  // Display name
  avatar: string;                // Emoji or image

  // Participants
  participants: string[];        // Aleo addresses
  creator?: string;              // Group creator address

  // Last message info (for chat list preview)
  lastMessage?: string;
  lastMessageTime?: number;
  lastMessageSender?: string;

  // Status
  unreadCount: number;
  isOnline?: boolean;            // For DMs
  lastSeen?: number;             // For DMs
  isTyping?: boolean;            // For DMs

  // Group-specific
  memberCount?: number;
  description?: string;

  // Timestamps
  createdAt: number;
  updatedAt: number;

  // Pinned/Archived
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;

  // Aleo integration
  groupKey?: string;             // Encryption key
  aleoGroupId?: string;          // On-chain group ID

  // Blockchain metadata
  blockchainData?: {
    groupId: string;
    transactionId: string;
    merkleRoot: string;
    programId: string;
    zkProofs?: Array<{
      merklePath: string[];
      pathIndices: boolean[];
    }>;
  };
}

export class ChatModel {
  /**
   * Create a new direct message chat
   */
  static createDirectMessage(
    currentUserAddress: string,
    contactAddress: string,
    contactName: string,
    contactAvatar: string
  ): Chat {
    return {
      id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'direct',
      name: contactName,
      avatar: contactAvatar,
      participants: [currentUserAddress, contactAddress],
      unreadCount: 0,
      isPinned: false,
      isArchived: false,
      isMuted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Create a new group chat
   */
  static createGroup(
    creator: string,
    name: string,
    avatar: string,
    participants: string[],
    description?: string
  ): Chat {
    return {
      id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'group',
      name,
      avatar,
      participants: [creator, ...participants],
      creator,
      memberCount: participants.length + 1,
      description: description || '',
      unreadCount: 0,
      isPinned: false,
      isArchived: false,
      isMuted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Check if chat is a direct message
   */
  static isDirectMessage(chat: Chat): boolean {
    return chat.type === 'direct';
  }

  /**
   * Get other participant in DM (not current user)
   */
  static getOtherParticipant(chat: Chat, currentUserAddress: string): string | null {
    if (!ChatModel.isDirectMessage(chat)) return null;
    return chat.participants.find(addr => addr !== currentUserAddress) || null;
  }

  /**
   * Get chat display name
   */
  static getDisplayName(chat: Chat, currentUserAddress: string): string {
    if (chat.type === 'direct') {
      // For DMs, return the other person's name
      return chat.name;
    }
    return chat.name;
  }

  /**
   * Update last message info
   */
  static updateLastMessage(
    chat: Chat,
    message: string,
    sender: string,
    time: number
  ): Chat {
    return {
      ...chat,
      lastMessage: message,
      lastMessageTime: time,
      lastMessageSender: sender,
      updatedAt: time,
    };
  }

  /**
   * Increment unread count
   */
  static incrementUnread(chat: Chat): Chat {
    return {
      ...chat,
      unreadCount: chat.unreadCount + 1,
    };
  }

  /**
   * Mark as read (clear unread)
   */
  static markAsRead(chat: Chat): Chat {
    return {
      ...chat,
      unreadCount: 0,
    };
  }

  /**
   * Sort chats by priority (pinned first, then by last message time)
   */
  static sortChats(chats: Chat[]): Chat[] {
    return [...chats].sort((a, b) => {
      // Pinned chats first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then by last message time
      const aTime = a.lastMessageTime || a.updatedAt;
      const bTime = b.lastMessageTime || b.updatedAt;
      return bTime - aTime;
    });
  }

  /**
   * Filter chats by search query
   */
  static searchChats(chats: Chat[], query: string): Chat[] {
    if (!query.trim()) return chats;

    const lowerQuery = query.toLowerCase();
    return chats.filter(chat =>
      chat.name.toLowerCase().includes(lowerQuery) ||
      chat.lastMessage?.toLowerCase().includes(lowerQuery) ||
      chat.description?.toLowerCase().includes(lowerQuery)
    );
  }
}
