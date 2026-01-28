# EncryptedSocial Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Leo Smart Contracts](#leo-smart-contracts)
4. [Frontend Architecture](#frontend-architecture)
5. [Privacy Model](#privacy-model)
6. [Data Flow](#data-flow)
7. [Security Considerations](#security-considerations)

---

## Overview

EncryptedSocial is a privacy-first social network built on Aleo blockchain. It leverages zero-knowledge proofs to enable private group messaging where:
- Message content is encrypted client-side
- Only ZK proofs are published on-chain
- Member identities are hidden via cryptographic commitments
- Group membership is verified without revealing which member

### Key Technologies
- **Blockchain**: Aleo (Layer-1 with ZK-SNARKs)
- **Smart Contracts**: Leo language
- **Frontend**: React + TypeScript + TailwindCSS
- **Encryption**: AES-256-GCM (symmetric)
- **ZK Proofs**: Merkle trees + Pedersen commitments

---

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                       │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │           React Application                         │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │  Components Layer                             │  │ │
│  │  │  - WalletConnect  - ChatInterface            │  │ │
│  │  │  - GroupList      - MessageBubble            │  │ │
│  │  │  - GroupCreation  - MemberInvite             │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  │                                                      │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │  Services Layer                               │  │ │
│  │  │  - encryptionService  (AES-256-GCM)          │  │ │
│  │  │  - merkleService     (ZK proofs)             │  │ │
│  │  │  - aleoService       (blockchain calls)      │  │ │
│  │  │  - storageService    (local cache)           │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓ (encrypted messages + ZK proofs)
┌──────────────────────────────────────────────────────────┐
│                  ALEO BLOCKCHAIN                          │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Leo Smart Contracts                               │ │
│  │                                                     │ │
│  │  1. group_manager.aleo                            │ │
│  │     - create_group()                               │ │
│  │     - add_member()                                 │ │
│  │     - Mappings: group_merkle_roots                │ │
│  │                                                     │ │
│  │  2. membership_proof.aleo                         │ │
│  │     - verify_membership()                          │ │
│  │     - generate_nullifier()                         │ │
│  │                                                     │ │
│  │  3. message_handler.aleo                          │ │
│  │     - send_message_simple()                        │ │
│  │     - share_message()                              │ │
│  │     - Mappings: used_nullifiers, message_counts   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  On-Chain State (Public)                          │ │
│  │  - Group merkle roots                              │ │
│  │  - Member counts                                   │ │
│  │  - Message counts                                  │ │
│  │  - Nullifiers (prevent replays)                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Private Records (Encrypted)                       │ │
│  │  - GroupRecord (group metadata)                    │ │
│  │  - MembershipRecord (credentials)                  │ │
│  │  - MessageRecord (encrypted content)               │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Leo Smart Contracts

### 1. group_manager.aleo

**Purpose**: Manage private group creation and member additions

**Records**:
```leo
record GroupRecord {
    owner: address,           // Group admin
    group_id: field,          // Unique identifier
    name: field,              // Encrypted group name
    member_count: u32,        // Number of members
    merkle_root: field,       // Current merkle root
}

record MembershipRecord {
    owner: address,           // Member's address
    group_id: field,          // Group identifier
    member_commitment: field, // Hash of member identity
    merkle_path_0..7: field, // Proof elements (8 levels)
}
```

**Transitions**:
- `create_group(group_name)`: Creates new private group
  - Generates unique group_id
  - Initializes merkle root with creator's commitment
  - Returns GroupRecord to creator

- `add_member(group, new_member)`: Adds member to group
  - Verifies caller is group owner
  - Updates merkle root with new member
  - Returns updated GroupRecord + MembershipRecord

**Mappings (On-Chain)**:
- `group_merkle_roots: field => field`: Group ID → Current merkle root
- `group_member_counts: field => u32`: Group ID → Member count

### 2. membership_proof.aleo

**Purpose**: Zero-knowledge membership verification

**Functions**:
- `verify_membership()`: Verifies merkle proof
  - Takes member commitment + merkle path
  - Traverses tree from leaf to root
  - Returns true if proof is valid

- `generate_nullifier()`: Creates unique proof identifier
  - Hashes member commitment + group ID + nonce
  - Prevents replay attacks
  - Returns nullifier field

- `create_member_commitment()`: Hash address to commitment
  - Uses Pedersen hash
  - Hides actual address

### 3. message_handler.aleo

**Purpose**: Handle encrypted message sending and distribution

**Records**:
```leo
record MessageRecord {
    owner: address,           // Recipient
    group_id: field,          // Group identifier
    encrypted_content: field, // Encrypted message
    sender_commitment: field, // Anonymous sender
    timestamp: u64,           // Block height
    message_id: field,        // Unique ID
    message_nonce: u64,       // Ordering nonce
}
```

**Transitions**:
- `send_message_simple()`: Send encrypted message
  - Takes group_id, encrypted_content, commitment, nonce
  - Generates message_id
  - Creates MessageRecord for sender
  - Updates message count on-chain

- `share_message()`: Distribute message to member
  - Transfers MessageRecord ownership
  - Enables N-to-N distribution model

**Mappings**:
- `group_message_counts: field => u64`: Track messages per group
- `used_nullifiers: field => bool`: Prevent replay attacks

---

## Frontend Architecture

### Component Hierarchy

```
App.tsx (Main container)
├── WalletConnect (Authentication)
├── GroupList (Sidebar)
│   └── GroupListItem (per group)
├── ChatInterface (Main area)
│   ├── ChatHeader
│   ├── MessageList
│   │   └── MessageBubble (per message)
│   └── MessageInput
├── GroupCreation (Modal)
└── MemberInvite (Modal)
```

### Service Layer

**encryptionService.ts**:
- Client-side AES-256-GCM encryption
- Key derivation from group ID + user key
- Field encoding/decoding for Aleo

**merkleService.ts**:
- Build merkle trees from member lists
- Generate membership proofs (path + indices)
- Verify proofs locally before submission

**aleoService.ts**:
- Mock blockchain interactions (MVP)
- Transaction signing simulation
- Will be replaced with real Leo Wallet SDK

**storageService.ts**:
- LocalStorage management
- Cache groups, messages, keys, members
- Persist state between sessions

### State Management

**Current**: React useState + useEffect
**Future**: Consider Zustand or Redux for complex state

---

## Privacy Model

### What's Private?

1. **Message Content**
   - Encrypted with AES-256-GCM client-side
   - Only ciphertext stored on-chain as field element
   - Group key never leaves client

2. **Member Identities**
   - Addresses hashed to commitments (Pedersen)
   - Only commitments in merkle tree
   - Cannot reverse commitment to address

3. **Sender Identity**
   - Messages show sender_commitment, not address
   - Multiple members = plausible deniability
   - "Which member" is hidden, only "valid member" proven

4. **Group Member List**
   - Members stored as commitments in merkle tree
   - Only merkle root visible on-chain
   - Cannot extract members from root alone

### What's Public?

1. **Group Existence**
   - Group ID + merkle root on-chain
   - Anyone can see a group exists

2. **Member Count**
   - Public counter of members
   - Does not reveal who they are

3. **Message Count**
   - Public counter per group
   - Does not reveal content or senders

4. **ZK Proof Validity**
   - Validators see "valid member sent message"
   - Do not see which member or content

### Zero-Knowledge Guarantees

**Prove**: "I am a member of this group"
**Without revealing**: Which member I am

**How**:
1. Generate merkle proof (path from my leaf to root)
2. Submit proof + encrypted message
3. Validators verify: proof matches merkle root
4. Message accepted if proof valid
5. Sender identity remains anonymous within group

---

## Data Flow

### Group Creation Flow

```
1. User clicks "Create Group"
   ↓
2. Frontend: Encrypt group name
   ↓
3. aleoService.createGroup(name)
   ↓
4. Leo: create_group transition
   - Generate group_id = hash(caller, block.height)
   - Create GroupRecord (owner = caller)
   - Set merkle_root = hash(caller)
   ↓
5. On-chain: Store merkle_root in mapping
   ↓
6. Frontend: Derive group encryption key
   - groupKey = HKDF(userPrivateKey, group_id)
   ↓
7. Storage: Save group + key locally
   ↓
8. UI: Show new group in sidebar
```

### Message Send Flow

```
1. User types message, clicks send
   ↓
2. Frontend: Encrypt content
   - ciphertext = AES-GCM(message, groupKey)
   ↓
3. Frontend: Encode for Aleo
   - fieldValue = stringToField(ciphertext + nonce)
   ↓
4. Frontend: Generate ZK proof (future)
   - proof = merkleService.generateProof(user, members)
   ↓
5. aleoService.sendMessage(groupId, encrypted, commitment, nonce)
   ↓
6. Leo: send_message_simple transition
   - Generate message_id
   - Generate nullifier (prevent replay)
   - Create MessageRecord
   ↓
7. On-chain: Update message count, mark nullifier used
   ↓
8. Storage: Save message locally
   ↓
9. UI: Display in chat
```

### Message Receive Flow (Polling - MVP)

```
1. ChatInterface polls every 5s
   ↓
2. Storage: Load messages from local cache
   ↓
3. For each new message:
   - Decode field to ciphertext
   - Decrypt with groupKey
   - Parse plaintext
   ↓
4. UI: Render MessageBubbles
```

**Future (Production)**:
- Query blockchain for MessageRecords
- WebSocket for real-time updates
- Decrypt messages as they arrive

---

## Security Considerations

### Current Security Features

1. **End-to-End Encryption**
   - AES-256-GCM (industry standard)
   - Keys never leave client
   - Per-group encryption keys

2. **Zero-Knowledge Proofs**
   - Membership verified without revealing identity
   - Aleo's zk-SNARKs are cryptographically secure

3. **Replay Protection**
   - Nullifiers prevent double-message sending
   - Unique per (member, group, nonce)

4. **Access Control**
   - Only group owner can add members
   - Records ownership enforced by Leo

### Security Limitations (MVP)

1. **Mock Wallet**
   - No real cryptographic keys
   - Production needs Leo Wallet integration

2. **LocalStorage Keys**
   - Group keys stored in browser storage
   - Production needs secure key management (HSM, Keychain)

3. **No Forward Secrecy**
   - Compromised key = all past messages decrypted
   - Future: Implement key rotation (Double Ratchet)

4. **No Message Authentication**
   - Cannot verify message wasn't tampered
   - Future: Add HMAC or signatures

5. **Simplified Merkle Trees**
   - Basic implementation
   - Production: Use battle-tested libraries

### Future Security Enhancements

1. **Forward Secrecy**
   - Rotate group keys periodically
   - Signal Protocol / Double Ratchet

2. **Post-Quantum Cryptography**
   - Replace vulnerable primitives
   - Lattice-based schemes

3. **Secure Multi-Party Computation**
   - Distributed key generation
   - No single point of failure

4. **Hardware Security Module**
   - Store keys in secure hardware
   - iOS Keychain, Android Keystore

---

## Performance Considerations

### Bottlenecks (MVP)

1. **Message Polling (5s interval)**
   - Not real-time
   - High latency
   - Solution: WebSocket in Wave 2

2. **No Message Pagination**
   - Loads all messages at once
   - Solution: Implement pagination + lazy loading

3. **No Caching Strategy**
   - Fetches all data every time
   - Solution: Implement cache invalidation

### Optimization Strategies

1. **Batch Operations**
   - Send multiple messages in one transaction
   - Add multiple members at once

2. **Proof Aggregation**
   - Combine multiple ZK proofs
   - Reduce on-chain data

3. **Off-Chain Indexing**
   - Use indexer for message querying
   - Cache frequently accessed data

---

## Deployment Architecture

### MVP (Current)

```
Frontend (Vite Dev Server)
  ↓
Mock Aleo Service (in-browser)
  ↓
LocalStorage (cache)
```

### Production (Future)

```
Frontend (Vercel/Netlify)
  ↓
Leo Wallet SDK
  ↓
Aleo Testnet/Mainnet
  ↓
Indexer (GraphQL)
  ↓
Frontend (query messages)
```

---

## Testing Strategy

### Current Testing

- Manual testing via UI
- Build validation (TypeScript)
- Component smoke tests

### Future Testing

1. **Unit Tests**
   - Services (encryption, merkle, storage)
   - Leo contracts (leo test)

2. **Integration Tests**
   - End-to-end flows
   - Wallet connection → Send message

3. **Security Audits**
   - Cryptography review
   - Smart contract audit
   - Penetration testing

---

## Scalability

### Current Limitations

- Single device (no sync)
- LocalStorage (limited capacity)
- Polling (not scalable)

### Scalability Roadmap

1. **Wave 2**: Real-time updates (WebSocket)
2. **Wave 3**: Multi-device sync
3. **Wave 5**: Message history pruning
4. **Wave 8**: Distributed infrastructure
5. **Wave 10**: CDN + edge caching

---

## Conclusion

EncryptedSocial demonstrates a novel approach to private social networking using Aleo's zero-knowledge architecture. The MVP successfully implements core privacy features while maintaining usability. Future waves will enhance performance, security, and scalability to create a production-ready private social network.

**Key Innovations**:
- First on-chain encrypted social network
- Zero-knowledge membership proofs
- Telegram-like UX with privacy
- Verifiable yet anonymous messaging

**Next Steps**:
- Wave 2: Real-time features
- Wave 3-5: Enhanced functionality
- Wave 6-8: Security hardening
- Wave 9-10: Production deployment

---

*Built for Aleo Privacy Buildathon - Wave 1*
*"Prove everything. Reveal nothing."*
