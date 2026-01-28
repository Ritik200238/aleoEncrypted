# EncryptedSocial Backend - Quick Reference Card

## 🚀 Quick Start

```typescript
import { getMessages, storeMessage } from './types/tauri-commands';

// Get messages
const messages = await getMessages('chat-id', 50, 0);

// Store message
await storeMessage({
  id: generateId(),
  chat_id: 'chat-id',
  content: 'Hello!',
  // ... other fields
});
```

## 📚 All 28 Commands at a Glance

### 🔐 Encryption (4)
```typescript
encryptMessage(plaintext, key)              // → {ciphertext, nonce}
decryptMessage(ciphertext, nonce, key)      // → plaintext
generateKeyPair()                           // → {public_key, private_key}
deriveSharedSecret(privateKey, publicKey)   // → sharedSecret
```

### 💬 Messages (4)
```typescript
storeMessage(messageData)                   // → void
getMessages(chatId, limit, offset)          // → Message[]
searchMessages(query)                       // → Message[]
deleteMessage(chatId, messageId)            // → void
```

### 💭 Chats (4)
```typescript
storeChat(chatData)                         // → void
getChats()                                  // → Chat[]
getChat(chatId)                             // → Chat | null
deleteChat(chatId)                          // → void
```

### 👥 Contacts (4)
```typescript
storeContact(contactData)                   // → void
getContacts()                               // → Contact[]
getContactByAddress(address)                // → Contact | null
deleteContact(contactId)                    // → void
```

### ⚙️ System (4)
```typescript
getAppDataDir()                             // → string
getAppConfigDir()                           // → string
getAppCacheDir()                            // → string
showNotification(title, body)               // → void
```

### ⛓️ Blockchain (3)
```typescript
checkNetworkStatus()                        // → NetworkStatus
submitTransaction(txData)                   // → txHash
getTransactionStatus(txHash)                // → status
```

### 🛠️ Utility (5)
```typescript
getDatabaseStats()                          // → DatabaseStats
clearAllData()                              // → void
exportDatabase()                            // → JSON string
hashData(data)                              // → hex string
generateAddressCommitment(address)          // → commitment
```

## 📦 Data Types

### Message
```typescript
{
  id: string
  chat_id: string
  sender_address: string
  recipient_address: string
  content: string              // Decrypted
  encrypted_content: string    // Base64
  nonce: string                // Base64
  timestamp: number
  is_sent: boolean
  is_read: boolean
  tx_hash: string | null
}
```

### Chat
```typescript
{
  id: string
  contact_address: string
  contact_name: string
  last_message: string | null
  last_message_time: number
  unread_count: number
  created_at: number
}
```

### Contact
```typescript
{
  id: string
  address: string              // Aleo address
  name: string
  public_key: string           // Base64
  avatar: string | null
  is_favorite: boolean
  created_at: number
  last_seen: number | null
}
```

## 🎯 Common Patterns

### Send Encrypted Message
```typescript
// 1. Derive shared secret
const secret = await deriveSharedSecret(myPrivateKey, theirPublicKey);

// 2. Encrypt message
const { ciphertext, nonce } = await encryptMessage(text, secret);

// 3. Store message
await storeMessage({
  id: generateId(),
  chat_id: chatId,
  content: text,
  encrypted_content: ciphertext,
  nonce: nonce,
  timestamp: Date.now(),
  // ... other fields
});
```

### Receive and Decrypt
```typescript
// 1. Get messages
const messages = await getMessages(chatId, 50, 0);

// 2. Decrypt each message
for (const msg of messages) {
  const secret = await deriveSharedSecret(myPrivateKey, contactPublicKey);
  const plaintext = await decryptMessage(
    msg.encrypted_content,
    msg.nonce,
    secret
  );
  console.log(plaintext);
}
```

### Search Messages
```typescript
const results = await searchMessages('important meeting');
console.log(`Found ${results.length} messages`);
```

### React Hook Pattern
```typescript
function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getMessages(chatId, 50, 0);
        setMessages(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chatId]);

  return { messages, loading };
}
```

## 🔧 Utilities

### Generate ID
```typescript
import { generateId } from './types/tauri-commands';
const id = generateId(); // "1234567890-abc123"
```

### Format Timestamp
```typescript
import { formatTimestamp } from './types/tauri-commands';
const dateStr = formatTimestamp(Date.now());
```

### Validate Address
```typescript
import { isValidAleoAddress } from './types/tauri-commands';
if (isValidAleoAddress(address)) {
  // Valid Aleo address
}
```

### Retry with Backoff
```typescript
import { executeWithRetry } from './types/tauri-commands';

const result = await executeWithRetry(
  () => submitTransaction(txData),
  3,      // max retries
  1000    // delay in ms
);
```

## 🚨 Error Handling

### Always Use Try-Catch
```typescript
try {
  await storeMessage(message);
  await showNotification('Success', 'Message sent!');
} catch (error) {
  console.error('Failed:', error);
  await showNotification('Error', error as string);
}
```

### Check Network Before Sending
```typescript
const status = await checkNetworkStatus();
if (!status.is_connected) {
  alert('Network offline!');
  return;
}
```

## 📊 Database Stats
```typescript
const stats = await getDatabaseStats();
console.log(`
  Messages: ${stats.message_count}
  Chats: ${stats.chat_count}
  Contacts: ${stats.contact_count}
  Size: ${(stats.db_size_bytes / 1024 / 1024).toFixed(2)} MB
`);
```

## 🔑 Key Management

### Generate New Keys
```typescript
const { public_key, private_key } = await generateKeyPair();

// IMPORTANT: Store private_key securely!
localStorage.setItem('privateKey', private_key);
localStorage.setItem('publicKey', public_key);
```

### Derive Shared Secret
```typescript
// Same secret for both parties (ECDH-like)
const mySecret = await deriveSharedSecret(myPrivate, theirPublic);
const theirSecret = await deriveSharedSecret(theirPrivate, myPublic);
// mySecret === theirSecret (in real ECDH)
```

## 🎨 Best Practices

1. **Always encrypt before storing sensitive data**
2. **Use pagination for message lists** (50-100 messages per page)
3. **Show loading states** during async operations
4. **Handle errors gracefully** with user-friendly messages
5. **Validate inputs** before sending to backend
6. **Cache frequently accessed data** (contacts, chats)
7. **Use TypeScript** for type safety
8. **Test edge cases** (empty messages, invalid addresses, etc.)

## 📱 React Components

### Message List
```typescript
function MessageList({ chatId }: { chatId: string }) {
  const { messages, loading } = useMessages(chatId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### Send Form
```typescript
function SendForm({ chatId, onSent }: Props) {
  const [text, setText] = useState('');

  const handleSend = async () => {
    const { ciphertext, nonce } = await encryptMessage(text, key);
    await storeMessage({ /* ... */ });
    setText('');
    onSent();
  };

  return (
    <input value={text} onChange={e => setText(e.target.value)} />
    <button onClick={handleSend}>Send</button>
  );
}
```

## 📖 Documentation

- **Full API Reference:** `/src-tauri/BACKEND_README.md`
- **Integration Guide:** `/INTEGRATION_GUIDE.md`
- **Examples:** `/src/examples/tauri-usage-examples.ts`
- **Implementation Details:** `/src-tauri/IMPLEMENTATION_SUMMARY.md`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Command not found" | Check command is in lib.rs |
| "Failed to deserialize" | Verify TS types match Rust |
| "Database locked" | Use async/await properly |
| "Invalid key length" | Key must be 32 bytes (Base64) |
| "Network offline" | Check network status first |

## 🎯 Next Steps

1. Import types: `import { ... } from './types/tauri-commands'`
2. Create hooks for your data needs
3. Build UI components
4. Handle errors gracefully
5. Test thoroughly
6. Deploy!

---

**Quick Links:**
- 📚 Full Docs: `BACKEND_README.md`
- 🔗 Integration: `INTEGRATION_GUIDE.md`
- 💡 Examples: `tauri-usage-examples.ts`
- ✅ Status: `BACKEND_COMPLETION_REPORT.md`

Happy coding! 🚀
