/**
 * WebSocket Service
 *
 * Real-time message delivery using WebSocket connections.
 * Features:
 * - Socket.io client for bidirectional communication
 * - Automatic reconnection with exponential backoff
 * - Event-driven message delivery
 * - Fallback to polling when WebSocket unavailable
 * - Connection state management
 * - Room-based group messaging
 *
 * Production-ready with comprehensive error handling.
 */

import { io, type Socket } from 'socket.io-client';

// WebSocket configuration
// Priority: VITE_WS_URL env var → Railway deployment URL → localhost fallback
const WS_CONFIG = {
  url: import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'wss://encrypted-social-relay.up.railway.app' : 'ws://localhost:3001'),
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
  heartbeatInterval: 30000, // 30 seconds
};

// Connection states
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

// WebSocket event types
export enum WsEventType {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  NEW_MESSAGE = 'NEW_MESSAGE',
  MESSAGE_DELIVERED = 'MESSAGE_DELIVERED',
  MESSAGE_READ = 'MESSAGE_READ',
  TYPING = 'TYPING',
  USER_ONLINE = 'USER_ONLINE',
  USER_OFFLINE = 'USER_OFFLINE',
}

// Event data interfaces
export interface NewMessageEvent {
  groupId: string;
  messageId: string;
  senderId: string;
  timestamp: number;
}

export interface MessageStatusEvent {
  messageId: string;
  userId: string;
  timestamp: number;
}

export interface TypingEvent {
  groupId: string;
  userId: string;
  isTyping: boolean;
}

export interface UserStatusEvent {
  userId: string;
  online: boolean;
  lastSeen?: number;
}

// Generic WebSocket event
export interface WsEvent {
  type: WsEventType;
  timestamp: number;
  data?: any;
  error?: Error;
}

// Event listener type
type WsEventListener = (event: WsEvent) => void;

/**
 * WebSocket Service Class
 */
export class WebSocketService {
  private socket: Socket | null = null;
  private connectionState = ConnectionState.DISCONNECTED;
  private eventListeners: WsEventListener[] = [];
  private userAddress: string | null = null;
  private joinedGroups = new Set<string>();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isAvailable = false;

  /**
   * Initialize WebSocket connection
   */
  async connect(userAddress: string): Promise<void> {
    if (this.connectionState === ConnectionState.CONNECTED) {
      console.warn('WebSocket already connected');
      return;
    }

    this.userAddress = userAddress;
    this.connectionState = ConnectionState.CONNECTING;

    try {
      // Check if WebSocket/Socket.io is available
      await this.checkAvailability();

      if (!this.isAvailable) {
        console.warn('WebSocket not available, falling back to polling');
        this.connectionState = ConnectionState.DISCONNECTED;
        return;
      }

      // Initialize Socket.io client
      this.initializeSocket();

      console.log('🔌 Connecting to WebSocket server...');
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.handleConnectionError(error as Error);
    }
  }

  /**
   * Check if WebSocket service is available
   */
  private async checkAvailability(): Promise<void> {
    try {
      const healthUrl = WS_CONFIG.url.replace('ws://', 'http://').replace('wss://', 'https://');
      const response = await fetch(`${healthUrl}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      this.isAvailable = response.ok;
    } catch {
      this.isAvailable = false;
    }
  }

  /**
   * Initialize Socket.io client
   */
  private initializeSocket(): void {
    const wsUrl = WS_CONFIG.url.replace('ws://', 'http://').replace('wss://', 'https://');

    this.socket = io(wsUrl, {
      reconnection: true,
      reconnectionAttempts: WS_CONFIG.reconnectionAttempts,
      reconnectionDelay: WS_CONFIG.reconnectionDelay,
      reconnectionDelayMax: WS_CONFIG.reconnectionDelayMax,
      timeout: WS_CONFIG.timeout,
      transports: ['websocket', 'polling'],
      auth: { userAddress: this.userAddress },
    });

    // Set up event handlers
    this.setupSocketHandlers();
  }

  /**
   * Set up socket event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.handleConnected();
    });

    this.socket.on('disconnect', (reason: string) => {
      this.handleDisconnected(reason);
    });

    this.socket.on('error', (error: Error) => {
      this.handleConnectionError(error);
    });

    this.socket.on('reconnect_attempt', () => {
      this.connectionState = ConnectionState.RECONNECTING;
      console.log('🔄 Attempting to reconnect...');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      this.connectionState = ConnectionState.ERROR;
    });

    // Message events
    this.socket.on('new_message', (data: NewMessageEvent) => {
      this.handleNewMessage(data);
    });

    this.socket.on('message_delivered', (data: MessageStatusEvent) => {
      this.handleMessageDelivered(data);
    });

    this.socket.on('message_read', (data: MessageStatusEvent) => {
      this.handleMessageRead(data);
    });

    // Typing events
    this.socket.on('typing', (data: TypingEvent) => {
      this.handleTyping(data);
    });

    // User status events
    this.socket.on('user_online', (data: UserStatusEvent) => {
      this.handleUserOnline(data);
    });

    this.socket.on('user_offline', (data: UserStatusEvent) => {
      this.handleUserOffline(data);
    });
  }

  /**
   * Handle successful connection
   */
  private handleConnected(): void {
    this.connectionState = ConnectionState.CONNECTED;
    console.log('✅ WebSocket connected');

    this.emitEvent({
      type: WsEventType.CONNECTED,
      timestamp: Date.now(),
    });

    // Authenticate with server
    if (this.userAddress) {
      this.authenticate(this.userAddress);
    }

    // Rejoin previously joined groups
    this.joinedGroups.forEach(groupId => {
      this.joinGroup(groupId);
    });

    // Start heartbeat
    this.startHeartbeat();
  }

  /**
   * Handle disconnection
   */
  private handleDisconnected(reason: string): void {
    this.connectionState = ConnectionState.DISCONNECTED;
    console.log('🔌 WebSocket disconnected:', reason);

    this.emitEvent({
      type: WsEventType.DISCONNECTED,
      timestamp: Date.now(),
      data: { reason },
    });

    // Stop heartbeat
    this.stopHeartbeat();
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(error: Error): void {
    this.connectionState = ConnectionState.ERROR;
    console.error('WebSocket error:', error);

    this.emitEvent({
      type: WsEventType.ERROR,
      timestamp: Date.now(),
      error,
    });
  }

  /**
   * Authenticate with server
   */
  private authenticate(userAddress: string): void {
    if (!this.socket) return;

    this.socket.emit('authenticate', {
      userAddress,
      timestamp: Date.now(),
    });
  }

  /**
   * Join a group room
   */
  joinGroup(groupId: string): void {
    if (!this.socket || !this.socket.connected) {
      // Store for later when connected
      this.joinedGroups.add(groupId);
      return;
    }

    this.socket.emit('join_group', {
      groupId,
      userAddress: this.userAddress,
    });

    this.joinedGroups.add(groupId);
    console.log(`📝 Joined group: ${groupId}`);
  }

  /**
   * Leave a group room
   */
  leaveGroup(groupId: string): void {
    if (!this.socket || !this.socket.connected) {
      this.joinedGroups.delete(groupId);
      return;
    }

    this.socket.emit('leave_group', {
      groupId,
      userAddress: this.userAddress,
    });

    this.joinedGroups.delete(groupId);
    console.log(`📝 Left group: ${groupId}`);
  }

  /**
   * Send typing indicator
   */
  sendTyping(groupId: string, isTyping: boolean): void {
    if (!this.socket || !this.socket.connected) return;

    this.socket.emit('typing', {
      groupId,
      userAddress: this.userAddress,
      isTyping,
    });
  }

  /**
   * Mark message as delivered
   */
  markDelivered(messageId: string): void {
    if (!this.socket || !this.socket.connected) return;

    this.socket.emit('message_delivered', {
      messageId,
      userAddress: this.userAddress,
      timestamp: Date.now(),
    });
  }

  /**
   * Mark message as read
   */
  markRead(messageId: string): void {
    if (!this.socket || !this.socket.connected) return;

    this.socket.emit('message_read', {
      messageId,
      userAddress: this.userAddress,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle new message event
   */
  private handleNewMessage(data: NewMessageEvent): void {
    console.log('📨 New message received:', data);

    this.emitEvent({
      type: WsEventType.NEW_MESSAGE,
      timestamp: Date.now(),
      data,
    });
  }

  /**
   * Handle message delivered event
   */
  private handleMessageDelivered(data: MessageStatusEvent): void {
    this.emitEvent({
      type: WsEventType.MESSAGE_DELIVERED,
      timestamp: Date.now(),
      data,
    });
  }

  /**
   * Handle message read event
   */
  private handleMessageRead(data: MessageStatusEvent): void {
    this.emitEvent({
      type: WsEventType.MESSAGE_READ,
      timestamp: Date.now(),
      data,
    });
  }

  /**
   * Handle typing event
   */
  private handleTyping(data: TypingEvent): void {
    this.emitEvent({
      type: WsEventType.TYPING,
      timestamp: Date.now(),
      data,
    });
  }

  /**
   * Handle user online event
   */
  private handleUserOnline(data: UserStatusEvent): void {
    this.emitEvent({
      type: WsEventType.USER_ONLINE,
      timestamp: Date.now(),
      data,
    });
  }

  /**
   * Handle user offline event
   */
  private handleUserOffline(data: UserStatusEvent): void {
    this.emitEvent({
      type: WsEventType.USER_OFFLINE,
      timestamp: Date.now(),
      data,
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat', {
          timestamp: Date.now(),
        });
      }
    }, WS_CONFIG.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.stopHeartbeat();
    this.connectionState = ConnectionState.DISCONNECTED;
    this.joinedGroups.clear();
    console.log('🔌 WebSocket disconnected');
  }

  /**
   * Add event listener
   */
  addEventListener(listener: WsEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: WsEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: WsEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in WebSocket event listener:', error);
      }
    });
  }

  /**
   * Get connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  /**
   * Check if WebSocket is available
   */
  isWebSocketAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get status information
   */
  getStatus() {
    return {
      connectionState: this.connectionState,
      isConnected: this.isConnected(),
      isAvailable: this.isAvailable,
      joinedGroupsCount: this.joinedGroups.size,
      userAddress: this.userAddress,
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
