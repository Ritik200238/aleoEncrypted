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

// Support comma-separated list of origins for multi-env (local + Vercel)
const rawOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const CORS_ORIGIN = rawOrigin.includes(',')
  ? rawOrigin.split(',').map(o => o.trim())
  : rawOrigin;

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

// Rate limiting: max 30 events per second per socket
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 1000;

function isRateLimited(socketId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(socketId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(socketId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return true;
  }
  return false;
}

// Validate Aleo address: starts with "aleo1", total 63 chars, alphanumeric
const ALEO_ADDRESS_RE = /^aleo1[a-z0-9]{58}$/;
function isValidAleoAddress(addr: unknown): addr is string {
  return typeof addr === 'string' && ALEO_ADDRESS_RE.test(addr);
}

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

  if (userAddress && isValidAleoAddress(userAddress)) {
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
  socket.on('authenticate', (data: { userAddress: unknown }) => {
    if (isRateLimited(socket.id)) {
      socket.disconnect(true);
      return;
    }
    if (!isValidAleoAddress(data?.userAddress)) {
      socket.emit('error', { code: 'INVALID_ADDRESS', message: 'Invalid Aleo address format' });
      return;
    }
    connectedUsers.set(socket.id, data.userAddress as string);
    userSockets.set(data.userAddress as string, socket.id);
    socket.emit('authenticated', { address: data.userAddress });
  });

  // Join group room
  socket.on('join_group', (data: { groupId: unknown }) => {
    if (isRateLimited(socket.id)) {
      socket.disconnect(true);
      return;
    }
    if (typeof data?.groupId !== 'string' || data.groupId.trim() === '') {
      socket.emit('error', { code: 'INVALID_GROUP', message: 'Invalid groupId' });
      return;
    }
    socket.join(data.groupId);
    console.log(`${connectedUsers.get(socket.id)?.substring(0, 12)}... joined ${data.groupId}`);
  });

  // Leave group room
  socket.on('leave_group', (data: { groupId: unknown }) => {
    if (isRateLimited(socket.id)) {
      socket.disconnect(true);
      return;
    }
    if (typeof data?.groupId === 'string') {
      socket.leave(data.groupId);
    }
  });

  // Relay encrypted group/broadcast message (server NEVER decrypts)
  socket.on('send_message', (data: {
    chatId: unknown;
    messageId: unknown;
    encryptedContent: unknown;
    nonce?: unknown;
    timestamp: unknown;
    senderAddress?: unknown;
    isAnonymous?: unknown;
  }) => {
    if (isRateLimited(socket.id)) {
      socket.disconnect(true);
      return;
    }

    // Validate required fields
    if (
      typeof data?.chatId !== 'string' || data.chatId.trim() === '' ||
      typeof data?.messageId !== 'string' || data.messageId.trim() === '' ||
      typeof data?.encryptedContent !== 'string' || data.encryptedContent.trim() === '' ||
      typeof data?.timestamp !== 'number'
    ) {
      socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Missing or invalid message fields' });
      return;
    }

    const payload = {
      ...data,
      senderId: data.isAnonymous ? undefined : connectedUsers.get(socket.id),
    };

    // Broadcast to chat room (excludes sender)
    socket.to(data.chatId).emit('new_message', payload);
  });

  // Direct message — addressed to a specific Aleo user
  socket.on('direct_message', (data: {
    recipientAddress: unknown;
    messageId: unknown;
    encryptedContent: unknown;
    nonce?: unknown;
    timestamp: unknown;
  }) => {
    if (isRateLimited(socket.id)) {
      socket.disconnect(true);
      return;
    }

    // Validate
    if (
      !isValidAleoAddress(data?.recipientAddress) ||
      typeof data?.messageId !== 'string' || data.messageId.trim() === '' ||
      typeof data?.encryptedContent !== 'string' || data.encryptedContent.trim() === '' ||
      typeof data?.timestamp !== 'number'
    ) {
      socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Missing or invalid DM fields' });
      return;
    }

    const recipientSocketId = userSockets.get(data.recipientAddress as string);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_message', {
        ...data,
        senderId: connectedUsers.get(socket.id),
        isDirect: true,
      });
    } else {
      // Recipient is offline
      socket.emit('delivery_failed', {
        messageId: data.messageId,
        recipientAddress: data.recipientAddress,
        reason: 'recipient_offline',
        timestamp: Date.now(),
      });
    }
  });

  // Relay typing indicator
  socket.on('typing', (data: { groupId: unknown; isTyping: unknown }) => {
    if (isRateLimited(socket.id)) {
      socket.disconnect(true);
      return;
    }
    if (typeof data?.groupId !== 'string') return;
    socket.to(data.groupId).emit('typing', {
      groupId: data.groupId,
      userId: connectedUsers.get(socket.id),
      isTyping: !!data.isTyping,
    });
  });

  // Relay delivery receipt
  socket.on('message_delivered', (data: { messageId: unknown }) => {
    if (isRateLimited(socket.id)) {
      socket.disconnect(true);
      return;
    }
    if (typeof data?.messageId !== 'string') return;
    socket.broadcast.emit('message_delivered', {
      messageId: data.messageId,
      userId: connectedUsers.get(socket.id),
      timestamp: Date.now(),
    });
  });

  // Relay read receipt
  socket.on('message_read', (data: { messageId: unknown }) => {
    if (isRateLimited(socket.id)) {
      socket.disconnect(true);
      return;
    }
    if (typeof data?.messageId !== 'string') return;
    socket.broadcast.emit('message_read', {
      messageId: data.messageId,
      userId: connectedUsers.get(socket.id),
      timestamp: Date.now(),
    });
  });

  // ─── WebRTC Signaling ────────────────────────────────────────────────────────
  // The server only relays SDP offers/answers and ICE candidates.
  // All media is peer-to-peer — server never touches audio/video.

  socket.on('call_invite', (data: { recipientAddress: unknown; callId: unknown; callType: unknown }) => {
    if (isRateLimited(socket.id)) { socket.disconnect(true); return; }
    const recipientSocketId = userSockets.get(data.recipientAddress as string);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('call_invite', {
        callId: data.callId,
        callType: data.callType, // 'audio' | 'video'
        callerAddress: connectedUsers.get(socket.id),
      });
    }
  });

  socket.on('call_accept', (data: { callerAddress: unknown; callId: unknown }) => {
    if (isRateLimited(socket.id)) { socket.disconnect(true); return; }
    const callerSocketId = userSockets.get(data.callerAddress as string);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_accept', {
        callId: data.callId,
        acceptorAddress: connectedUsers.get(socket.id),
      });
    }
  });

  socket.on('call_reject', (data: { callerAddress: unknown; callId: unknown }) => {
    if (isRateLimited(socket.id)) { socket.disconnect(true); return; }
    const callerSocketId = userSockets.get(data.callerAddress as string);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_reject', { callId: data.callId });
    }
  });

  socket.on('call_end', (data: { peerAddress: unknown; callId: unknown }) => {
    if (isRateLimited(socket.id)) { socket.disconnect(true); return; }
    const peerSocketId = userSockets.get(data.peerAddress as string);
    if (peerSocketId) {
      io.to(peerSocketId).emit('call_end', { callId: data.callId });
    }
  });

  socket.on('webrtc_offer', (data: { peerAddress: unknown; callId: unknown; sdp: unknown }) => {
    if (isRateLimited(socket.id)) { socket.disconnect(true); return; }
    const peerSocketId = userSockets.get(data.peerAddress as string);
    if (peerSocketId) {
      io.to(peerSocketId).emit('webrtc_offer', {
        callId: data.callId,
        sdp: data.sdp,
        fromAddress: connectedUsers.get(socket.id),
      });
    }
  });

  socket.on('webrtc_answer', (data: { peerAddress: unknown; callId: unknown; sdp: unknown }) => {
    if (isRateLimited(socket.id)) { socket.disconnect(true); return; }
    const peerSocketId = userSockets.get(data.peerAddress as string);
    if (peerSocketId) {
      io.to(peerSocketId).emit('webrtc_answer', {
        callId: data.callId,
        sdp: data.sdp,
        fromAddress: connectedUsers.get(socket.id),
      });
    }
  });

  socket.on('webrtc_ice', (data: { peerAddress: unknown; callId: unknown; candidate: unknown }) => {
    if (isRateLimited(socket.id)) { socket.disconnect(true); return; }
    const peerSocketId = userSockets.get(data.peerAddress as string);
    if (peerSocketId) {
      io.to(peerSocketId).emit('webrtc_ice', {
        callId: data.callId,
        candidate: data.candidate,
      });
    }
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
    rateLimitMap.delete(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║  EncryptedSocial Relay Server                ║
  ║  Port: ${PORT}                                  ║
  ║  CORS: ${String(CORS_ORIGIN).padEnd(30)}        ║
  ║  Health: http://localhost:${PORT}/health          ║
  ║                                              ║
  ║  This server NEVER sees plaintext messages.  ║
  ║  It only relays encrypted ciphertext.        ║
  ╚══════════════════════════════════════════════╝
  `);
});
