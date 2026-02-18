# EncryptedSocial — Zero-Knowledge Private Messenger on Aleo

[![Aleo Testnet](https://img.shields.io/badge/Aleo-Testnet-blue)](https://explorer.aleo.org)
[![Shield Wallet](https://img.shields.io/badge/Wallet-Shield-purple)](https://provable.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> *"The only messenger where even the relay server cannot read your messages —
> cryptographically guaranteed by zero-knowledge proofs."*

Built for the **Aleo Privacy Buildathon**. EncryptedSocial is a Telegram-style chat app where privacy is not a setting — it is the architecture. Messages are encrypted on your device before they leave. The relay server relays ciphertext only. The Aleo blockchain stores only a BHP256 hash — never content.

---

## How Privacy Works (The ZK Story)

| Layer | What happens | Who can read? |
|---|---|---|
| Your device | AES-256-GCM encryption | Only you + recipient |
| WebSocket relay | Forwards ciphertext blob | Nobody — server is blind |
| Aleo blockchain | Stores BHP256 content hash | Anyone (hash only, no content) |
| ZK proof | Proves group membership | Verifier learns "you're a member" — nothing else |

**Key privacy guarantees:**

- Messages are encrypted **client-side** with AES-256-GCM before leaving your device
- Only a **content hash** (BHP256) is anchored on Aleo — never the message itself
- **ZK proofs** verify group membership without revealing your identity or who else is in the group
- The relay server sees only ciphertext and Aleo addresses — never plaintext
- **Nullifiers** prevent replay attacks without tracking users across sessions
- Forward secrecy: ephemeral keys rotated per session via X25519

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Your Browser (React + Vite)                                    │
│                                                                 │
│  ┌──────────┐   encrypt    ┌──────────────┐   BHP256 hash      │
│  │ Plaintext│ ──AES-GCM──> │  Ciphertext  │ ──────────────────>│
│  │ message  │              │  + nonce     │                    │
│  └──────────┘              └──────────────┘                    │
│       │                          │                             │
│       │                          │ WebSocket (ciphertext only) │
│       │                          ▼                             │
│       │               ┌─────────────────────┐                 │
│       │               │  Relay Server        │                 │
│       │               │  (Node.js/Socket.io) │                 │
│       │               │  Sees: ciphertext    │                 │
│       │               │  Never: plaintext    │                 │
│       │               └─────────────────────┘                 │
│       │                                                        │
│       │  Leo Wallet / Shield Wallet / Puzzle Wallet            │
│       ▼                                                        │
│  ┌──────────────────────────────────────────┐                  │
│  │  Aleo Blockchain (Testnet)               │                  │
│  │                                          │                  │
│  │  group_manager.aleo   — create groups    │                  │
│  │  membership_proof.aleo — ZK membership   │                  │
│  │  message_handler.aleo — anchor hashes    │                  │
│  └──────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Contracts on Aleo Testnet

| Contract | Program ID | Purpose |
|---|---|---|
| Group Manager | `group_manager.aleo` | Create / manage encrypted group chats |
| Membership Proof | `membership_proof.aleo` | ZK-prove membership without revealing identity |
| Message Handler | `message_handler.aleo` | Anchor message hashes on-chain |

> Contract addresses will be updated here after deployment. Check `deployment-results.json` for the latest transaction IDs and explorer links.

---

## Quick Start

### Prerequisites

- Node.js 18+
- An Aleo-compatible wallet: [Leo Wallet](https://leo.app), [Puzzle Wallet](https://puzzle.online), or Shield Wallet
- Aleo Testnet account with credits ([faucet](https://faucet.aleo.org))

### 1. Clone

```bash
git clone https://github.com/Ritik200238/aleoEncrypted
cd aleoEncrypted
```

### 2. Backend

```bash
cd backend
npm install
cp ../.env.example ../.env   # edit .env with your values
npm run dev                  # starts on http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                  # starts on http://localhost:5173
```

### 4. Open two browser tabs

- Tab A: connect Wallet A, register a username
- Tab B: connect Wallet B, register a username
- From Tab A: search for Tab B's username, open a chat, send a message
- Tab B receives it in real-time — the relay server never saw the plaintext

---

## Deploy Contracts to Testnet

```bash
# 1. Copy and fill in your private key
cp .env.example .env
# Edit .env: set ALEO_PRIVATE_KEY=APrivateKey1...

# 2. Install dependencies (root)
npm install

# 3. Deploy all three contracts
node deploy-all-contracts.mjs
```

Results saved to `deployment-results.json`. Update contract IDs in:
- `frontend/src/services/aleoWalletService.ts` → `PROGRAM_IDS`
- `frontend/src/services/leoContractService.ts` → program references

---

## Security Model

### What EncryptedSocial protects against

| Threat | Protection |
|---|---|
| Server reading messages | AES-256-GCM client-side encryption |
| Replay attacks | Unique nonce per message + on-chain nullifiers |
| Group membership leaks | ZK membership proofs (membership_proof.aleo) |
| Long-term key compromise | Ephemeral X25519 session keys |
| Metadata analysis | Anonymous group joins via ZK proofs |

### What it does NOT protect against (out of scope)

- Endpoint compromise (malware on your device)
- Traffic analysis by a network adversary watching both endpoints simultaneously
- Wallet private key loss

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| Crypto | AES-256-GCM, X25519 ECDH, BHP256 (via Aleo SDK) |
| Realtime relay | Node.js, Socket.io, Express |
| Blockchain | Aleo Testnet, Leo language (3 contracts) |
| Desktop (optional) | Tauri |
| Wallet support | Leo Wallet, Puzzle Wallet, Shield Wallet, window.aleo |

---

## Project Structure

```
aleoEncrypted/
├── backend/
│   └── server.ts                    # Socket.io relay (ciphertext only)
├── frontend/
│   └── src/
│       ├── services/
│       │   ├── encryptionService.ts      # AES-GCM + X25519
│       │   ├── aleoWalletService.ts      # Wallet connection (Leo/Puzzle/Shield)
│       │   ├── leoContractService.ts     # Contract calls
│       │   └── groupMembershipService.ts # ZK group proofs
│       └── ...
├── leo/
│   ├── group_manager/               # Leo contract
│   ├── membership_proof/            # Leo contract (ZK)
│   └── message_handler/             # Leo contract
├── deploy-all-contracts.mjs
├── .env.example
└── README.md
```

---

## Buildathon Submission

- **Privacy usage:** All messages encrypted client-side; ZK proofs for group membership; relay server is cryptographically blind — it only forwards ciphertext
- **Aleo integration:** 3 Leo contracts on Testnet; BHP256 content hashing; nullifier-based replay protection
- **UX:** Telegram-style UI; real-time message delivery; multi-wallet support including Shield Wallet

---

## License

MIT
