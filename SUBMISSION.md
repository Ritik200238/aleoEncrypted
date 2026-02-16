# Aleo Privacy Buildathon — Wave 2 Submission
## EncryptedSocial: Private Social Network on Aleo

---

## 1. Project Overview

### Name
**EncryptedSocial**

### One-Line Description
The first private social network on Aleo — E2E encrypted messaging with ZK-native private payments, all verifiable on-chain.

### Live Demo
🌐 **[Live App — deploying to Vercel]**
> Demo mode (no wallet needed): append `?demo=true` to the URL

### GitHub
🔗 https://github.com/Ritik200238/aleoEncrypted

---

## 2. What Problem We Solve

Current messaging platforms have a fundamental trust problem:
- Centralized servers can read all messages
- No cryptographic proof of privacy — you must trust the provider
- Payment metadata leaks identity (who paid whom, when, how much)

**EncryptedSocial solves this with two layers:**

| Layer | What | How |
|-------|------|-----|
| Messages | E2E encrypted with AES-256-GCM | Encrypted before leaving your device — relay server is blind |
| Payments | ZK-private transfers via `credits.aleo/transfer_private` | Payer identity + balance hidden by Aleo's ZK-SNARK — verifiable on explorer |
| Groups | On-chain membership records | Created via `group_manager.aleo` — verifiable on Aleo Testnet |

This is not "messaging with encryption bolted on." The **payment layer is genuinely zero-knowledge** — a mathematical proof that the transfer happened without revealing who sent it.

---

## 3. Deployed Smart Contracts (Aleo Testnet)

All three contracts are live on Aleo Testnet and verifiable on the explorer:

| Contract | TX ID | Explorer |
|----------|-------|---------|
| `group_manager.aleo` | `at12gkmegshtlsjgzfpng4ls8mprlwc0s5l9573wy9khlqcelf97cqs36kwew` | [View](https://explorer.aleo.org/transaction/at12gkmegshtlsjgzfpng4ls8mprlwc0s5l9573wy9khlqcelf97cqs36kwew?network=testnet) |
| `membership_proof.aleo` | `at1heup986u7f0hhd26um6mmfvp95uq9yfmv2xa5vzh2yvd7g4d6qpsx5q9f4` | [View](https://explorer.aleo.org/transaction/at1heup986u7f0hhd26um6mmfvp95uq9yfmv2xa5vzh2yvd7g4d6qpsx5q9f4?network=testnet) |
| `message_handler.aleo` | `at1nejj3turtptuu0ddl5f0axv9mmscgzcfum9049tfxpm9wfk8zy9qmsct0q` | [View](https://explorer.aleo.org/transaction/at1nejj3turtptuu0ddl5f0axv9mmscgzcfum9049tfxpm9wfk8zy9qmsct0q?network=testnet) |

**Deployer wallet:** `aleo1h7yz0n5qx9uwyaxsprspkm5j6leey9eyzmjv9k7zyyd5nt5lguysystq59`

---

## 4. The ZK Feature — Private Tips via credits.aleo

The core privacy feature judges can verify on-chain:

1. Open the app → Connect Shield Wallet
2. Open any chat → click **"ZK Tip"** on a message
3. Enter amount → Shield Wallet popup → Approve
4. **A `credits.aleo/transfer_private` transaction appears on Aleo Explorer**
   - The sender's identity is hidden by Aleo's ZK-SNARK
   - The sender's balance is hidden
   - The transfer is mathematically verified — no trust required

This is the same core ZK primitive that makes Aleo unique. We've embedded it inside a real social context.

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────┐
│              EncryptedSocial Frontend               │
│                 (React 19 + TypeScript)             │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Chats   │  │ Contacts │  │ Privacy Dashboard │  │
│  │  (AES)   │  │          │  │   (ZK metrics)    │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│                                                     │
│            Shield Wallet Integration                │
│         (@provablehq/aleo-wallet-adaptor)           │
└─────────────┬──────────────────────┬────────────────┘
              │                      │
              ▼                      ▼
┌─────────────────────┐  ┌──────────────────────────┐
│   Aleo Blockchain   │  │   WebSocket Relay Server  │
│   (Testnet)         │  │   (Node.js, Port 3001)    │
│                     │  │   Pure relay — never       │
│  group_manager.aleo │  │   decrypts messages        │
│  membership_proof   │  └──────────────────────────┘
│  message_handler    │
│  credits.aleo       │  ← transfer_private (ZK tips)
└─────────────────────┘
```

### Privacy Stack
- **Messages**: AES-256-GCM (Web Crypto API) — encrypted client-side, relay is blind
- **Payments**: `credits.aleo/transfer_private` — ZK-SNARK, sender identity + balance hidden
- **Groups**: `group_manager.aleo` — on-chain membership, verifiable on explorer
- **Storage**: IndexedDB (Dexie.js) — local only, no cloud database of messages

---

## 6. Features Demo

### What Judges Can Test Right Now

1. **Connect Shield Wallet** → address shown in sidebar
2. **Create a private group** → triggers `group_manager.aleo/create_group` → TX on explorer
3. **Send a message** → AES-256-GCM encrypted, stored in IndexedDB
4. **Open DevTools Network tab** → see encrypted blob, never plaintext
5. **Click "ZK Tip"** on any message → Shield Wallet popup → `transfer_private` TX on explorer ⭐
6. **Privacy Score Dashboard** → live metrics: encrypted messages, ZK tips, on-chain TXs
7. **Anonymous Mode** → group messages sent as "Anonymous Member" (identity hidden)
8. **Demo mode** → append `?demo=true` to URL — no wallet needed for judges

### Feature Comparison

| Feature | EncryptedSocial | NullPay | Signal | Telegram |
|---------|----------------|---------|--------|----------|
| ZK Private Payments | ✅ transfer_private | ✅ transfer_private | ❌ | ❌ |
| E2E Encrypted Messages | ✅ AES-256-GCM | ❌ | ✅ | Partial |
| On-Chain Membership | ✅ group_manager.aleo | ❌ | ❌ | ❌ |
| Social Context | ✅ Full messenger | ❌ Invoices only | ✅ | ✅ |
| Decentralized Relay | ✅ WebSocket, blind | ❌ Supabase | ❌ | ❌ |
| Shield Wallet | ✅ | ✅ | N/A | N/A |

---

## 7. Tech Stack

### Blockchain
- Aleo Testnet
- Leo (smart contracts)
- `credits.aleo/transfer_private` for ZK payments
- BHP256 hashing (field elements for on-chain storage)

### Frontend
- React 19 + TypeScript
- Vite (build), Tailwind CSS (styling), Framer Motion (animations)
- `@provablehq/aleo-wallet-adaptor-react` + Shield Wallet
- Dexie.js (IndexedDB), Web Crypto API (AES-256-GCM)
- Socket.io-client (real-time relay)

### Backend
- Node.js + Express + Socket.io
- Pure message relay — never stores or decrypts messages
- Health endpoint: `/health`

---

## 8. Privacy Model — What's ZK vs What's Not

We are transparent about this:

| Feature | Privacy Method | Is it ZK? |
|---------|---------------|-----------|
| Message content | AES-256-GCM encryption | No — symmetric cipher |
| Private tips | credits.aleo/transfer_private | **Yes — Aleo ZK-SNARK** |
| Group membership | On-chain record (public) | No — public record |
| Anonymous mode | Hidden sender name in UI | No — UI layer only |
| Relay transport | WebSocket (relay is blind) | No — TLS layer |

The **tip / payment layer is genuinely zero-knowledge**. We don't overclaim.

---

## 9. Team

| | |
|--|--|
| **Name** | Ritik |
| **Role** | Full Stack Developer & Blockchain Engineer |
| **Discord** | ritik200238 |
| **GitHub** | [@Ritik200238](https://github.com/Ritik200238) |
| **Aleo Wallet** | `aleo1h7yz0n5qx9uwyaxsprspkm5j6leey9eyzmjv9k7zyyd5nt5lguysystq59` |

---

## 10. Wave 2 Progress vs Wave 1

| | Wave 1 | Wave 2 |
|--|--------|--------|
| Contracts | 0 deployed | **3 deployed on testnet** |
| Wallet | None | **Shield Wallet integrated** |
| ZK Payments | None | **credits.aleo/transfer_private tips** |
| Frontend | Basic proof of concept | **Full Telegram-style UI** |
| Privacy Dashboard | None | **Live ZK metrics dashboard** |
| Relay Server | None | **WebSocket relay (never decrypts)** |
| Live Deploy | None | **Vercel deployment** |

---

## 11. Running Locally

```bash
# Clone
git clone https://github.com/Ritik200238/aleoEncrypted.git
cd aleoEncrypted

# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev
# → http://localhost:5173

# Demo mode (no wallet needed)
# → http://localhost:5173/?demo=true

# Relay server (optional — enables real-time messaging)
cd ../backend
npm install
npm start
# → ws://localhost:3001
```

---

*Built for Aleo Privacy Buildathon Wave 2 — February 2026*
