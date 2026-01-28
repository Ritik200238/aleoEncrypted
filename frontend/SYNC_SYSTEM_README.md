# Real-Time Synchronization System

## Overview

This document describes the real-time synchronization system for the Encrypted Social Aleo app. The system provides reliable, efficient synchronization of messages and state between the Aleo blockchain and the client application.

## Architecture

### Components

1. **syncService.ts** - Blockchain polling service
2. **websocketService.ts** - Real-time WebSocket delivery
3. **conflictResolution.ts** - Distributed state conflict resolution
4. **syncStore.ts** - Zustand global state management
5. **useSync.ts** - React hooks for components

### Data Flow

```
Aleo Blockchain
    ↓
syncService (Poll every 5s)
    ↓
Decrypt Messages
    ↓
Conflict Resolution
    ↓
IndexedDB/localStorage
    ↓
Zustand Store
    ↓
React Components (auto-update)
```

### Alternative Path (WebSocket)

```
Relay Server
    ↓
websocketService
    ↓
Trigger Immediate Sync
    ↓
... (same as above)
```

## Features

### 1. Polling Service (syncService.ts)

**Configuration:**
- Poll interval: 5 seconds
- Max retries: 3
- Exponential backoff: 1s → 30s
- Circuit breaker: Opens after 5 failures

**Key Features:**
- ✅ Periodic blockchain polling
- ✅ Automatic message decryption
- ✅ IndexedDB updates
- ✅ Event emission for UI updates
- ✅ Circuit breaker pattern
- ✅ Exponential backoff
- ✅ Graceful error handling

**Usage:**
```typescript
import { syncService } from './services/syncService';

// Start syncing
syncService.start();

// Stop syncing
syncService.stop();

// Force immediate sync
await syncService.syncNow();

// Listen for events
syncService.addEventListener((event) => {
  if (event.type === SyncEventType.NEW_MESSAGES) {
    console.log('New messages:', event.data);
  }
});
```

### 2. WebSocket Service (websocketService.ts)

**Configuration:**
- URL: From environment variable `VITE_WS_URL`
- Auto-reconnect: Yes
- Reconnection attempts: 5
- Heartbeat: Every 30 seconds

**Key Features:**
- ✅ Socket.io client integration
- ✅ Automatic reconnection
- ✅ Room-based group messaging
- ✅ Typing indicators
- ✅ Message delivery/read receipts
- ✅ User online/offline status
- ✅ Fallback to polling if unavailable

**Usage:**
```typescript
import { websocketService } from './services/websocketService';

// Connect
await websocketService.connect(userAddress);

// Join group
websocketService.joinGroup(groupId);

// Send typing indicator
websocketService.sendTyping(groupId, true);

// Mark message as read
websocketService.markRead(messageId);

// Listen for events
websocketService.addEventListener((event) => {
  if (event.type === WsEventType.NEW_MESSAGE) {
    console.log('New message:', event.data);
  }
});
```

### 3. Conflict Resolution (conflictResolution.ts)

**Algorithms:**
- Lamport timestamps for message ordering
- Vector clocks for distributed state
- Last-Write-Wins (LWW) for simple conflicts
- CRDT-like merge operations

**Key Features:**
- ✅ Deterministic conflict resolution
- ✅ Causality tracking
- ✅ Duplicate detection
- ✅ State merging
- ✅ Three-way merge support

**Usage:**
```typescript
import { conflictResolutionService } from './services/conflictResolution';

// Initialize with user address
conflictResolutionService.initialize(userAddress);

// Resolve message conflicts
const result = conflictResolutionService.resolveMessages(
  localMessages,
  remoteMessages
);

console.log('Resolved messages:', result.resolved);
console.log('Conflict type:', result.conflictType);
console.log('Strategy used:', result.strategy);

// Create versioned message
const versionedMessage = conflictResolutionService.createVersionedMessage(message);
```

### 4. Zustand Store (syncStore.ts)

**State:**
```typescript
{
  isSyncing: boolean;
  lastSync: number | null;
  wsConnected: boolean;
  error: Error | null;
  errorCount: number;
  totalMessagesSynced: number;
}
```

**Actions:**
```typescript
{
  startSync: () => void;
  stopSync: () => void;
  syncNow: () => Promise<void>;
  connectWebSocket: (address: string) => Promise<void>;
  disconnectWebSocket: () => void;
  clearError: () => void;
  reset: () => void;
}
```

**Usage:**
```typescript
import { useSyncStore } from './store/syncStore';

function MyComponent() {
  const { isSyncing, error, startSync } = useSyncStore();

  return (
    <div>
      {isSyncing ? 'Syncing...' : 'Not syncing'}
      {error && <div>Error: {error.message}</div>}
      <button onClick={startSync}>Start Sync</button>
    </div>
  );
}
```

### 5. React Hooks (useSync.ts)

**Available Hooks:**

#### useSync()
Main hook for sync functionality.

```typescript
const {
  isSyncing,
  lastSync,
  lastSyncFormatted,
  wsConnected,
  error,
  totalMessagesSynced,
  syncHealth,
  startSync,
  stopSync,
  syncNow,
} = useSync();
```

#### useAutoSync()
Auto-start sync on mount.

```typescript
useAutoSync(userAddress, enabled);
```

#### useSyncStatus()
Get simple status for UI indicator.

```typescript
const status = useSyncStatus();
// { label: 'Synced', color: 'green', icon: 'synced' }
```

#### useGroupSync()
Sync specific group.

```typescript
useGroupSync(groupId);
```

#### useNewMessages()
Listen for new messages.

```typescript
useNewMessages(({ groupId, messageId }) => {
  console.log('New message in group:', groupId);
});
```

#### useTypingIndicator()
Send typing indicators.

```typescript
const { sendTyping } = useTypingIndicator(groupId);

// User started typing
sendTyping(true);

// User stopped typing
sendTyping(false);
```

#### useSyncRefresh()
Auto-refresh component on new data.

```typescript
useSyncRefresh(() => {
  // Reload data
  fetchMessages();
}, [dependencies]);
```

## Integration Guide

### Step 1: Set Up Environment

Add to `.env`:
```bash
VITE_WS_URL=ws://localhost:3001
```

### Step 2: Initialize in App

```typescript
// App.tsx
import { useAutoSync } from './hooks/useSync';
import { conflictResolutionService } from './services/conflictResolution';

function App() {
  const { address } = useAleo();

  // Auto-start sync when wallet connected
  useAutoSync(address);

  // Initialize conflict resolution
  useEffect(() => {
    if (address) {
      conflictResolutionService.initialize(address);
    }
  }, [address]);

  return <YourApp />;
}
```

### Step 3: Add Sync Indicator

```typescript
// Header.tsx
import { SyncStatusBadge } from './components/SyncIndicator';

function Header() {
  return (
    <header>
      <h1>Encrypted Social</h1>
      <SyncStatusBadge />
    </header>
  );
}
```

### Step 4: Use in Chat Component

```typescript
// ChatInterface.tsx
import { useGroupSync, useNewMessages } from './hooks/useSync';

function ChatInterface({ groupId }) {
  const [messages, setMessages] = useState([]);

  // Auto-sync this group
  useGroupSync(groupId);

  // Listen for new messages
  useNewMessages(({ groupId: gId, messageId }) => {
    if (gId === groupId) {
      // Reload messages
      loadMessages();
    }
  });

  return <MessageList messages={messages} />;
}
```

## Error Handling

### Circuit Breaker

The sync service uses a circuit breaker pattern to prevent overwhelming the system:

1. **CLOSED** (Normal): All syncs execute normally
2. **OPEN** (Failed): Too many failures, stop trying temporarily
3. **HALF_OPEN** (Testing): After timeout, try one sync to test recovery

Configuration:
- Threshold: 5 failures
- Timeout: 60 seconds

### Exponential Backoff

On sync failures, the service uses exponential backoff:
- 1st failure: Wait 1s
- 2nd failure: Wait 2s
- 3rd failure: Wait 4s
- Max: 30s

### Error Recovery

```typescript
const { error, clearError, syncNow } = useSync();

if (error) {
  // Show error to user
  toast.error(error.message);

  // User can retry
  <button onClick={syncNow}>Retry</button>

  // Or clear error
  <button onClick={clearError}>Dismiss</button>
}
```

## Performance Optimization

### Deduplication

Messages are deduplicated using:
- Message ID tracking
- Set data structure for O(1) lookup
- Prevents duplicate processing

### Batching

Multiple new messages are batched:
- Single event emitted per sync
- Single UI update
- Reduces re-renders

### Selective Syncing

Only sync groups user has joined:
```typescript
syncService.registerGroup(groupId);
syncService.unregisterGroup(groupId);
```

## Testing

### Manual Testing

```typescript
// Force sync
await syncService.syncNow();

// Check status
const status = syncService.getStatus();
console.log(status);

// Test circuit breaker
// (Disconnect network and wait for 5 failures)

// Test conflict resolution
const result = conflictResolutionService.resolveMessages(
  [message1],
  [message2]
);
```

### Mock Data

The services include mock implementations for development:
- `syncService` uses mock blockchain queries
- `websocketService` has mock socket
- Replace with real implementations when ready

## Production Deployment

### WebSocket Server Setup

The WebSocket service expects a Socket.io server at `VITE_WS_URL`.

Example server (Node.js):

```javascript
const io = require('socket.io')(3001, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('authenticate', ({ userAddress }) => {
    socket.userId = userAddress;
  });

  socket.on('join_group', ({ groupId }) => {
    socket.join(groupId);
  });

  socket.on('typing', ({ groupId, isTyping }) => {
    socket.to(groupId).emit('typing', {
      userId: socket.userId,
      groupId,
      isTyping
    });
  });

  // Emit new messages
  function notifyNewMessage(groupId, messageData) {
    io.to(groupId).emit('new_message', messageData);
  }
});
```

### Aleo Integration

Replace mock implementations in `syncService.ts`:

```typescript
// Replace this:
const messageCount = await aleoService.getMessageCount(groupId);

// With actual blockchain query:
const messageCount = await aleoClient.getMappingValue(
  'message_handler.aleo',
  'message_counts',
  groupId
);
```

### IndexedDB Migration

For production, migrate from localStorage to IndexedDB:

```typescript
// Use Dexie (already installed)
import Dexie from 'dexie';

const db = new Dexie('EncryptedSocialDB');
db.version(1).stores({
  messages: 'id, groupId, timestamp',
  groups: 'id, lastMessageTime'
});
```

## Troubleshooting

### Sync Not Starting
- Check if `startSync()` was called
- Verify wallet is connected
- Check console for errors

### WebSocket Not Connecting
- Verify `VITE_WS_URL` is set
- Check if WebSocket server is running
- Service will fallback to polling automatically

### Messages Not Appearing
- Check if group is registered: `syncService.registerGroup(groupId)`
- Verify encryption key is available
- Check for decryption errors in console

### High Error Count
- Check network connection
- Verify Aleo blockchain is accessible
- Circuit breaker may be open (will auto-recover)

## Future Enhancements

- [ ] Optimistic UI updates
- [ ] Offline queue for sent messages
- [ ] Delta sync (only fetch changes)
- [ ] Compression for large message batches
- [ ] Service Worker for background sync
- [ ] IndexedDB with Dexie
- [ ] WebRTC for P2P messaging
- [ ] Message pagination
- [ ] Selective sync by date range

## API Reference

See inline documentation in source files for complete API reference.

## Support

For issues or questions, check the inline code comments or create an issue.
