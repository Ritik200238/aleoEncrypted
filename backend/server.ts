/**
 * EncryptedSocial Relay Server
 *
 * Minimal encrypted message relay. The server is intentionally dumb:
 * - NEVER sees plaintext messages
 * - Only forwards ciphertext between connected users
 * - Manages rooms for group messaging
 * - Handles typing indicators and delivery/read receipts
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Track connected users
const connectedUsers = new Map<string, string>(); // socketId -> userAddress
const userSockets = new Map<string, string>();     // userAddress -> socketId

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    connectedUsers: connectedUsers.size,
    uptime: process.uptime(),
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  const userAddress = socket.handshake.auth?.userAddress;

  if (userAddress) {
    connectedUsers.set(socket.id, userAddress);
    userSockets.set(userAddress, socket.id);
    console.log(`User connected: ${userAddress.substring(0, 12)}...`);

    // Notify others this user is online
    socket.broadcast.emit('user_online', {
      userId: userAddress,
      online: true,
      timestamp: Date.now(),
    });
  }

  // Authenticate (alternative to handshake auth)
  socket.on('authenticate', (data: { userAddress: string }) => {
    if (data.userAddress) {
      connectedUsers.set(socket.id, data.userAddress);
      userSockets.set(data.userAddress, socket.id);
    }
  });

  // Join group room
  socket.on('join_group', (data: { groupId: string }) => {
    if (data.groupId) {
      socket.join(data.groupId);
      console.log(`${connectedUsers.get(socket.id)?.substring(0, 12)}... joined ${data.groupId}`);
    }
  });

  // Leave group room
  socket.on('leave_group', (data: { groupId: string }) => {
    if (data.groupId) {
      socket.leave(data.groupId);
    }
  });

  // Relay encrypted message (server NEVER decrypts)
  socket.on('send_message', (data: {
    chatId: string;
    messageId: string;
    encryptedContent: string;
    nonce?: string;
    timestamp: number;
    senderAddress?: string;
    isAnonymous?: boolean;
  }) => {
    // Forward to room (group) or specific user (direct)
    const payload = {
      ...data,
      senderId: data.isAnonymous ? undefined : connectedUsers.get(socket.id),
    };

    // Broadcast to chat room (excludes sender)
    socket.to(data.chatId).emit('new_message', payload);

    // Also try direct delivery if it's a DM
    if (!data.chatId.startsWith('group_')) {
      // For DMs, find the recipient's socket
      const senderAddr = connectedUsers.get(socket.id);
      // The chatId for DMs typically contains or maps to the recipient
      // Just broadcast to the room which both users should have joined
    }
  });

  // Relay typing indicator
  socket.on('typing', (data: { groupId: string; isTyping: boolean }) => {
    socket.to(data.groupId).emit('typing', {
      groupId: data.groupId,
      userId: connectedUsers.get(socket.id),
      isTyping: data.isTyping,
    });
  });

  // Relay delivery receipt
  socket.on('message_delivered', (data: { messageId: string }) => {
    socket.broadcast.emit('message_delivered', {
      messageId: data.messageId,
      userId: connectedUsers.get(socket.id),
      timestamp: Date.now(),
    });
  });

  // Relay read receipt
  socket.on('message_read', (data: { messageId: string }) => {
    socket.broadcast.emit('message_read', {
      messageId: data.messageId,
      userId: connectedUsers.get(socket.id),
      timestamp: Date.now(),
    });
  });

  // Heartbeat
  socket.on('heartbeat', () => {
    socket.emit('heartbeat_ack', { timestamp: Date.now() });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const addr = connectedUsers.get(socket.id);
    if (addr) {
      userSockets.delete(addr);
      socket.broadcast.emit('user_offline', {
        userId: addr,
        online: false,
        lastSeen: Date.now(),
      });
      console.log(`User disconnected: ${addr.substring(0, 12)}...`);
    }
    connectedUsers.delete(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║  EncryptedSocial Relay Server                ║
  ║  Port: ${PORT}                                  ║
  ║  CORS: ${CORS_ORIGIN.padEnd(30)}        ║
  ║  Health: http://localhost:${PORT}/health          ║
  ║                                              ║
  ║  This server NEVER sees plaintext messages.  ║
  ║  It only relays encrypted ciphertext.        ║
  ╚══════════════════════════════════════════════╝
  `);
});
