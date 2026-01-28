# Frontend Integration Guide for Tauri Rust Backend

Quick guide to integrate the Rust backend with your React frontend.

## Step 1: Import TypeScript Definitions

```typescript
// In your React components
import {
  encryptMessage,
  decryptMessage,
  storeMessage,
  getMessages,
  getChats,
  getContacts,
  type Message,
  type Chat,
  type Contact,
} from './types/tauri-commands';
```

## Step 2: Create a React Hook for Messages

```typescript
// hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { getMessages, storeMessage, type Message } from '../types/tauri-commands';

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMessages(chatId, 50, 0);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const sendMessage = useCallback(async (message: Message) => {
    try {
      await storeMessage(message);
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [loadMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return { messages, loading, error, sendMessage, refresh: loadMessages };
}
```

## Step 3: Create a Message Component

```typescript
// components/MessageList.tsx
import React from 'react';
import { useMessages } from '../hooks/useMessages';

interface MessageListProps {
  chatId: string;
}

export function MessageList({ chatId }: MessageListProps) {
  const { messages, loading, error } = useMessages(chatId);

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className="message">
          <div className="sender">{message.sender_address}</div>
          <div className="content">{message.content}</div>
          <div className="time">
            {new Date(message.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Step 4: Create a Send Message Form

```typescript
// components/SendMessageForm.tsx
import React, { useState } from 'react';
import {
  encryptMessage,
  storeMessage,
  generateId,
  type Message,
} from '../types/tauri-commands';

interface SendMessageFormProps {
  chatId: string;
  recipientAddress: string;
  sharedSecret: string;
  onMessageSent: () => void;
}

export function SendMessageForm({
  chatId,
  recipientAddress,
  sharedSecret,
  onMessageSent,
}: SendMessageFormProps) {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);

      // Encrypt the message
      const { ciphertext, nonce } = await encryptMessage(
        messageText,
        sharedSecret
      );

      // Create message object
      const message: Message = {
        id: generateId(),
        chat_id: chatId,
        sender_address: 'aleo1...', // Replace with actual user address
        recipient_address: recipientAddress,
        content: messageText,
        encrypted_content: ciphertext,
        nonce: nonce,
        timestamp: Date.now(),
        is_sent: true,
        is_read: false,
        tx_hash: null,
      };

      // Store in database
      await storeMessage(message);

      // Clear input and notify parent
      setMessageText('');
      onMessageSent();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="send-message-form">
      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Type a message..."
        disabled={sending}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend} disabled={sending || !messageText.trim()}>
        {sending ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
```

## Step 5: Create a Chat List Component

```typescript
// components/ChatList.tsx
import React, { useEffect, useState } from 'react';
import { getChats, type Chat } from '../types/tauri-commands';

export function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      try {
        const data = await getChats();
        setChats(data);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  if (loading) return <div>Loading chats...</div>;

  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <div key={chat.id} className="chat-item">
          <h3>{chat.contact_name}</h3>
          <p>{chat.last_message || 'No messages yet'}</p>
          {chat.unread_count > 0 && (
            <span className="unread-badge">{chat.unread_count}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Step 6: Create a Search Component

```typescript
// components/MessageSearch.tsx
import React, { useState } from 'react';
import { searchMessages, type Message } from '../types/tauri-commands';

export function MessageSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setSearching(true);
      const data = await searchMessages(query);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="message-search">
      <div className="search-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="search-results">
        {results.map((message) => (
          <div key={message.id} className="search-result">
            <div className="content">{message.content}</div>
            <div className="meta">
              Chat: {message.chat_id} | {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Step 7: Create an Encryption Service

```typescript
// services/encryptionService.ts
import {
  generateKeyPair,
  deriveSharedSecret,
  encryptMessage,
  decryptMessage,
} from '../types/tauri-commands';

export class EncryptionService {
  private privateKey: string | null = null;
  private publicKey: string | null = null;

  async initialize() {
    const keyPair = await generateKeyPair();
    this.privateKey = keyPair.private_key;
    this.publicKey = keyPair.public_key;
    return keyPair;
  }

  async getSharedSecret(contactPublicKey: string): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Encryption service not initialized');
    }
    return deriveSharedSecret(this.privateKey, contactPublicKey);
  }

  async encrypt(plaintext: string, key: string) {
    return encryptMessage(plaintext, key);
  }

  async decrypt(ciphertext: string, nonce: string, key: string) {
    return decryptMessage(ciphertext, nonce, key);
  }

  getPublicKey(): string {
    if (!this.publicKey) {
      throw new Error('Encryption service not initialized');
    }
    return this.publicKey;
  }
}

// Singleton instance
export const encryptionService = new EncryptionService();
```

## Step 8: Initialize App with Encryption

```typescript
// App.tsx
import React, { useEffect, useState } from 'react';
import { encryptionService } from './services/encryptionService';
import { checkNetworkStatus } from './types/tauri-commands';

function App() {
  const [initialized, setInitialized] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<string>('Checking...');

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize encryption
        console.log('Initializing encryption...');
        await encryptionService.initialize();

        // Check network
        console.log('Checking network...');
        const status = await checkNetworkStatus();
        setNetworkStatus(
          status.is_connected
            ? `Connected to ${status.network_name}`
            : 'Offline'
        );

        setInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    }

    initializeApp();
  }, []);

  if (!initialized) {
    return <div>Initializing EncryptedSocial...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>EncryptedSocial</h1>
        <div className="network-status">{networkStatus}</div>
      </header>
      {/* Your app components here */}
    </div>
  );
}

export default App;
```

## Step 9: Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload App</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Step 10: Testing

```typescript
// tests/tauri-commands.test.ts
import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  encryptMessage,
  decryptMessage,
  deriveSharedSecret,
} from '../types/tauri-commands';

describe('Tauri Commands', () => {
  it('should generate unique key pairs', async () => {
    const keyPair1 = await generateKeyPair();
    const keyPair2 = await generateKeyPair();

    expect(keyPair1.public_key).not.toBe(keyPair2.public_key);
    expect(keyPair1.private_key).not.toBe(keyPair2.private_key);
  });

  it('should encrypt and decrypt messages', async () => {
    const keyPair = await generateKeyPair();
    const message = 'Hello, World!';

    const encrypted = await encryptMessage(message, keyPair.private_key);
    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.nonce).toBeTruthy();

    const decrypted = await decryptMessage(
      encrypted.ciphertext,
      encrypted.nonce,
      keyPair.private_key
    );

    expect(decrypted).toBe(message);
  });

  it('should derive shared secrets', async () => {
    const keyPair1 = await generateKeyPair();
    const keyPair2 = await generateKeyPair();

    const secret1 = await deriveSharedSecret(
      keyPair1.private_key,
      keyPair2.public_key
    );

    expect(secret1).toBeTruthy();
    expect(secret1.length).toBeGreaterThan(0);
  });
});
```

## Common Patterns

### 1. Loading State Pattern
```typescript
const [data, setData] = useState<T[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function load() {
    try {
      setLoading(true);
      const result = await someCommand();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  load();
}, [dependencies]);
```

### 2. Retry Pattern
```typescript
import { executeWithRetry } from '../types/tauri-commands';

const result = await executeWithRetry(
  () => submitTransaction(txData),
  3,  // max retries
  1000 // delay in ms
);
```

### 3. Notification Pattern
```typescript
import { showNotification } from '../types/tauri-commands';

async function handleAction() {
  try {
    await someAction();
    await showNotification('Success', 'Action completed');
  } catch (error) {
    await showNotification('Error', error.message);
  }
}
```

## Environment Setup

1. Make sure Tauri is configured in `package.json`:
```json
{
  "scripts": {
    "tauri": "tauri",
    "dev": "tauri dev",
    "build": "tauri build"
  }
}
```

2. Run the app:
```bash
npm run dev
```

## Troubleshooting

### Issue: "Command not found"
**Solution:** Make sure the command is registered in `lib.rs`

### Issue: "Failed to deserialize"
**Solution:** Check that TypeScript types match Rust structs exactly

### Issue: "Database locked"
**Solution:** Ensure you're not accessing the database from multiple threads without proper synchronization

## Best Practices

1. **Always handle errors**: Use try-catch blocks
2. **Show loading states**: Improve UX with loading indicators
3. **Validate inputs**: Check data before sending to Rust
4. **Use TypeScript**: Leverage type safety
5. **Cache data**: Reduce database calls when possible
6. **Test thoroughly**: Write tests for all critical paths

## Next Steps

1. Implement the UI components
2. Add authentication
3. Connect to Aleo blockchain
4. Add WebRTC for P2P messaging
5. Implement file attachments
6. Add voice/video calls

---

Happy coding! 🚀
