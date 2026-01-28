# 🚀 EncryptedSocial - Full Telegram Clone with Aleo Blockchain

**Vision:** Complete Telegram-style messaging app powered by Aleo's zero-knowledge blockchain for ultimate privacy and security.

---

## 📋 COMPLETE FEATURE SET

### ✅ Already Implemented (Wave 1)
- [x] Leo Wallet Authentication
- [x] Profile Creation (avatar, display name, bio)
- [x] Group Creation
- [x] Real-time Messaging
- [x] Message Encryption (AES-256-GCM)
- [x] Session Persistence (localStorage)
- [x] Profile Settings
- [x] Beautiful UI with animations

### 🚧 Wave 2 - Core Telegram Features (NOW)
- [ ] **Contacts & Search** - Find users by address/name
- [ ] **1-on-1 Direct Messages** - Private chats between two users
- [ ] **Message Status** - Sent ✓ / Delivered ✓✓ / Read ✓✓ (blue)
- [ ] **Online Status** - Show who's online
- [ ] **Typing Indicators** - "User is typing..."
- [ ] **Message Reactions** - Emoji reactions to messages
- [ ] **Reply to Messages** - Quote and reply
- [ ] **Forward Messages** - Forward to other chats
- [ ] **Delete Messages** - Delete for me / Delete for everyone
- [ ] **Edit Messages** - Edit sent messages

### 🔐 Wave 3 - Aleo ZK Features (PRIORITY)
- [ ] **On-chain Message Commitments** - Store message hashes on Aleo
- [ ] **ZK Group Membership Proofs** - Prove membership without revealing identity
- [ ] **Forward Secrecy & Key Rotation** - Automatic key rotation with Aleo records
- [ ] **Private Channel Access Control** - Token-gated channels using Aleo tokens
- [ ] **Encrypted Read Receipts** - ZK proofs of message reading
- [ ] **Private Contact Discovery** - Match contacts using ZK without revealing data
- [ ] **Anonymous Group Voting** - ZK-based polls and votes
- [ ] **Verifiable Message Timestamps** - On-chain timestamp proofs

### 📱 Wave 4 - Advanced Telegram Features
- [ ] **Media Uploads** - Images, videos, files
- [ ] **Voice Messages** - Record and send audio
- [ ] **Video Calls** - P2P encrypted video calls
- [ ] **Stickers & GIFs** - Custom sticker packs
- [ ] **Channels** - Broadcast-only channels
- [ ] **Bots** - Automated bot support
- [ ] **Polls** - Create and vote on polls
- [ ] **Scheduled Messages** - Send messages at specific time
- [ ] **Pinned Messages** - Pin important messages
- [ ] **Archive Chats** - Archive old conversations
- [ ] **Folders** - Organize chats into folders

### 🌐 Wave 5 - Web3 & Aleo Advanced
- [ ] **NFT Integration** - Send/receive Aleo NFTs in chat
- [ ] **Token Transfers** - Send Aleo tokens in messages
- [ ] **Smart Contract Triggers** - Execute contracts from chat
- [ ] **DAO Integration** - Group governance using Aleo
- [ ] **Encrypted File Storage** - IPFS + Aleo access control
- [ ] **Cross-chain Bridge Notifications** - Alert on blockchain events
- [ ] **Proof of Humanity** - ZK identity verification

---

## 🏗️ ALEO-ENHANCED ARCHITECTURE

### Frontend Structure (MCP Pattern)

```
/src
├── /models                    # Data models
│   ├── User.ts               # User profile model
│   ├── Message.ts            # Message model with encryption
│   ├── Group.ts              # Group/Channel model
│   ├── Contact.ts            # Contact model
│   ├── AleoRecord.ts         # Aleo blockchain record model
│   └── ZKProof.ts            # Zero-knowledge proof model
│
├── /controllers              # Business logic
│   ├── AuthController.ts     # Wallet auth + Aleo identity
│   ├── ChatController.ts     # Messaging logic
│   ├── GroupController.ts    # Group management
│   ├── ContactController.ts  # Contact discovery (ZK)
│   ├── AleoController.ts     # Aleo blockchain interactions
│   └── ZKProofController.ts  # Generate/verify ZK proofs
│
├── /presenters              # UI Components (React)
│   ├── /layout
│   │   ├── Sidebar.tsx      # Chat list sidebar
│   │   ├── ChatWindow.tsx   # Main chat interface
│   │   └── ProfilePane.tsx  # Right panel for profile
│   ├── /messages
│   │   ├── MessageBubble.tsx
│   │   ├── MessageStatus.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── MessageReactions.tsx
│   ├── /contacts
│   │   ├── ContactList.tsx
│   │   └── ContactSearch.tsx
│   └── /modals
│       ├── CreateGroupModal.tsx
│       ├── AddMembersModal.tsx
│       └── MediaViewerModal.tsx
│
├── /services                # External services
│   ├── aleoService.ts       # Aleo blockchain API
│   ├── cryptoService.ts     # Encryption/decryption
│   ├── storageService.ts    # LocalStorage + IndexedDB
│   ├── zkProofService.ts    # ZK proof generation
│   └── notificationService.ts
│
├── /hooks                   # React hooks
│   ├── useAleo.ts          # Aleo blockchain hook
│   ├── useChat.ts          # Real-time chat hook
│   ├── useZKProof.ts       # ZK proof hook
│   └── useContacts.ts      # Contact management
│
└── /utils
    ├── merkleTree.ts        # Merkle tree for group membership
    ├── zkUtils.ts           # ZK proof utilities
    └── aleoUtils.ts         # Aleo helper functions
```

### Backend/Aleo Layer

```
/aleo-contracts
├── /programs
│   ├── messaging.leo        # Message commitment contract
│   ├── groups.leo           # Group membership contract
│   ├── identity.leo         # User identity registry
│   └── tokens.leo           # Token-gated access
│
└── /scripts
    ├── deploy.sh
    └── test.sh
```

---

## 🔐 ALEO INTEGRATION DETAILS

### 1. **Message Commitments on Aleo**
```typescript
// Store hash of encrypted message on Aleo blockchain
interface MessageCommitment {
  messageHash: string;      // SHA-256 hash
  timestamp: number;        // Block timestamp
  sender: string;           // Aleo address
  groupId: string;          // Group identifier
  zkProof: string;          // Proof of valid encryption
}
```

### 2. **ZK Group Membership**
```leo
// Aleo program for group membership verification
program group_membership.aleo {
    record MembershipToken {
        owner: address,
        group_id: field,
        permissions: u8,
    }

    transition verify_member(
        token: MembershipToken,
        group_id: field
    ) -> bool {
        return token.group_id == group_id;
    }
}
```

### 3. **Forward Secrecy with Key Rotation**
- Rotate encryption keys every N messages
- Store old keys on Aleo (encrypted with new key)
- Use Aleo records to track key history
- Automatic ratcheting protocol

### 4. **Private Contact Discovery**
- Hash phone numbers/addresses with salt
- Store hashes on Aleo
- Use ZK proofs to match contacts without revealing data
- No centralized contact server

### 5. **Token-Gated Groups**
```typescript
interface TokenGatedGroup {
  groupId: string;
  tokenAddress: string;     // Aleo token contract
  minBalance: number;       // Minimum tokens required
  zkProofRequired: boolean; // Require ZK proof of balance
}
```

---

## 📊 DATA MODELS

### User Model
```typescript
interface User {
  address: string;           // Aleo wallet address (primary key)
  displayName: string;
  avatar: string;            // Emoji or IPFS hash
  bio: string;
  publicKey: string;         // Encryption public key
  lastSeen: number;          // Timestamp
  status: 'online' | 'offline' | 'away';
  zkIdentityProof?: string;  // Optional: Proof of humanity
}
```

### Message Model (Enhanced)
```typescript
interface Message {
  id: string;
  groupId: string;
  sender: string;            // Aleo address
  content: string;           // Encrypted content
  iv: string;                // Encryption IV
  timestamp: number;

  // Message status
  status: 'sending' | 'sent' | 'delivered' | 'read';
  deliveredTo: string[];     // Addresses who received
  readBy: string[];          // Addresses who read

  // Features
  replyTo?: string;          // Message ID
  reactions: Reaction[];
  edited: boolean;
  editedAt?: number;

  // Aleo integration
  aleoCommitment?: string;   // On-chain commitment hash
  zkProof?: string;          // ZK proof of authenticity

  // Media
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;         // IPFS or encrypted storage
  mediaSize?: number;
}
```

### Group Model (Enhanced)
```typescript
interface Group {
  id: string;
  name: string;
  avatar: string;
  description: string;
  creator: string;           // Aleo address
  createdAt: number;

  // Members
  members: GroupMember[];
  memberCount: number;

  // Settings
  type: 'group' | 'channel' | 'supergroup';
  isPublic: boolean;
  permissions: GroupPermissions;

  // Aleo integration
  merkleRoot: string;        // Merkle root of members
  tokenGated?: TokenGate;    // Optional token requirement
  aleoGroupId?: string;      // On-chain group ID

  // Features
  pinnedMessages: string[];
  mutedMembers: string[];
}

interface GroupMember {
  address: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: number;
  permissions: string[];
  zkMembershipProof: string; // ZK proof of membership
}
```

---

## 🔄 REAL-TIME FEATURES

### WebSocket Events
```typescript
enum SocketEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Messaging
  MESSAGE_SEND = 'message:send',
  MESSAGE_RECEIVE = 'message:receive',
  MESSAGE_DELIVERED = 'message:delivered',
  MESSAGE_READ = 'message:read',
  MESSAGE_EDIT = 'message:edit',
  MESSAGE_DELETE = 'message:delete',

  // Presence
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  USER_TYPING = 'user:typing',

  // Groups
  GROUP_UPDATE = 'group:update',
  MEMBER_JOIN = 'member:join',
  MEMBER_LEAVE = 'member:leave',

  // Aleo events
  ALEO_COMMITMENT = 'aleo:commitment',
  ZK_PROOF_VERIFY = 'zkproof:verify',
}
```

---

## 🎨 UI/UX ENHANCEMENTS

### Telegram-Style Features
1. **Sidebar** - Chat list with search, filters, folders
2. **Chat Window** - Message bubbles, smooth scrolling
3. **Profile Pane** - User/group info on right
4. **Bottom Composer** - Rich text input with media
5. **Context Menus** - Right-click actions
6. **Keyboard Shortcuts** - Ctrl+K for search, etc.
7. **Dark/Light Mode** - Theme switching
8. **Smooth Animations** - Framer Motion everywhere

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1 (NOW - Next 2 Hours)
1. ✅ Add Contact List & Search
2. ✅ Add 1-on-1 Direct Messages
3. ✅ Message Status (Sent/Delivered/Read)
4. ✅ Typing Indicators
5. ✅ Message Reactions

### Phase 2 (Next 4 Hours)
1. Forward Secrecy Implementation
2. Aleo Message Commitments
3. ZK Group Membership Proofs
4. Reply to Messages
5. Edit/Delete Messages

### Phase 3 (Next Session)
1. Media Upload (IPFS)
2. Voice Messages
3. Channels Support
4. Token-Gated Groups
5. Advanced ZK Features

---

## 🔧 TECHNICAL STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| State | Zustand + Context API |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Blockchain | Aleo (Leo Language) |
| Wallet | Leo Wallet SDK |
| Encryption | Web Crypto API + AES-256-GCM |
| Storage | localStorage + IndexedDB |
| Real-time | WebSocket (future) |
| ZK Proofs | Aleo zkSNARK |

---

## 📦 DELIVERABLES

1. ✅ Full Telegram UI Clone
2. ✅ All core messaging features
3. ✅ Aleo blockchain integration
4. ✅ ZK privacy features
5. ✅ Production-ready code
6. ✅ Documentation

---

**Starting Implementation NOW!** 🚀
