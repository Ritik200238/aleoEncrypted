# EncryptedSocial — Private Social Network on Aleo

[![Aleo Testnet](https://img.shields.io/badge/Aleo-Testnet-blue)](https://explorer.aleo.org)
[![Shield Wallet](https://img.shields.io/badge/Wallet-Shield-purple)](https://provable.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Wave 2](https://img.shields.io/badge/Buildathon-Wave%202-orange)](https://akindo.io)

> The first private social network on Aleo — E2E encrypted messaging + ZK-native private payments in one app.

## Live Demo

🌐 **[EncryptedSocial — Live on Vercel]** ← updating after Vercel deploy
📱 Demo mode (no wallet): add `?demo=true` to URL

## What It Does

EncryptedSocial is a Telegram-style private messenger where:
- **Messages** are end-to-end encrypted (AES-256-GCM) — the relay never sees plaintext
- **Groups** are created on-chain via `group_manager.aleo` — verifiable on Aleo Explorer
- **Payments** use `credits.aleo/transfer_private` — your identity and balance are hidden by Aleo's ZK-SNARK

This is not "Signal on blockchain." The **payment layer is genuinely zero-knowledge** — a cryptographic proof visible on Aleo Explorer that you can verify without knowing who sent it.

## Deployed Contracts (Aleo Testnet)

| Contract | Purpose | TX ID |
|----------|---------|-------|
| `group_manager.aleo` | Create/manage private groups | [`at12gkmeg...`](https://explorer.aleo.org/transaction/at12gkmegshtlsjgzfpng4ls8mprlwc0s5l9573wy9khlqcelf97cqs36kwew?network=testnet) |
| `membership_proof.aleo` | Group membership verification | [`at1heup98...`](https://explorer.aleo.org/transaction/at1heup986u7f0hhd26um6mmfvp95uq9yfmv2xa5vzh2yvd7g4d6qpsx5q9f4?network=testnet) |
| `message_handler.aleo` | On-chain message records | [`at1nejj3t...`](https://explorer.aleo.org/transaction/at1nejj3turtptuu0ddl5f0axv9mmscgzcfum9049tfxpm9wfk8zy9qmsct0q?network=testnet) |

## Architecture

```
┌──────────────────────────────────────────────────┐
│           EncryptedSocial Frontend               │
│            React 19 + TypeScript                 │
│                                                  │
│  ┌─────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Chats  │ │ Contacts │ │ Privacy Dashboard│   │
│  │ AES-256 │ │          │ │  ZK tip metrics  │   │
│  └─────────┘ └──────────┘ └──────────────────┘   │
│                                                  │
│       Shield Wallet (@provablehq/aleo-*)         │
└──────────────┬──────────────────┬───────────────┘
               │                  │
               ▼                  ▼
┌──────────────────────┐  ┌───────────────────────┐
│   Aleo Blockchain    │  │  WebSocket Relay       │
│                      │  │  (Node.js + Socket.io) │
│  group_manager.aleo  │  │  Pure relay — never    │
│  membership_proof    │  │  stores or decrypts    │
│  message_handler     │  └───────────────────────┘
│  credits.aleo ──────►│  transfer_private (ZK tips)
└──────────────────────┘
```

## Privacy Model — Honest Breakdown

| Feature | Method | ZK? |
|---------|--------|-----|
| Message content | AES-256-GCM (Web Crypto API) | No — symmetric cipher |
| **Private tips** | **`credits.aleo/transfer_private`** | **Yes — Aleo ZK-SNARK** ✅ |
| Group membership | `group_manager.aleo` on-chain | No — public record |
| Anonymous mode | UI-level identity hiding | No — UX layer |
| Relay transport | Blind WebSocket relay | No — TLS |

We are transparent about what's ZK and what's not. The **payment layer is the real ZK primitive**.

## Key Features

- 💬 **Full Telegram-style UI** — chats, contacts, groups, search, dark/light themes
- 🔒 **E2E Encrypted Messages** — AES-256-GCM, encrypted before leaving your device
- ⚡ **ZK Private Tips** — click "ZK Tip" on any message to send `transfer_private`
- 🏛️ **On-Chain Groups** — group creation verified on Aleo Testnet
- 📊 **Privacy Score Dashboard** — live metrics showing your ZK activity
- 🌐 **Shield Wallet Integration** — official `@provablehq/aleo-wallet-adaptor-shield`
- 🔄 **Real-time Relay** — WebSocket relay that never decrypts your messages
- 👤 **Anonymous Mode** — send group messages as "Anonymous Member"

## Quick Start

```bash
git clone https://github.com/Ritik200238/aleoEncrypted.git
cd aleoEncrypted/frontend
npm install --legacy-peer-deps
npm run dev
# Open http://localhost:5173/?demo=true
```

**Relay server (optional):**
```bash
cd backend && npm install && npm start
# WebSocket on ws://localhost:3001
```

## Demo Walkthrough

1. Open `?demo=true` — no wallet needed
2. See the Telegram-style UI with sample contacts/chats
3. Send a message — it's AES-256-GCM encrypted in IndexedDB
4. Open DevTools → Network — see only encrypted blobs
5. Create a group — triggers `group_manager.aleo` on testnet
6. Click **"ZK Tip"** on a message — Shield Wallet → `transfer_private` TX on Aleo Explorer
7. Open **Privacy Dashboard** — see live ZK metrics

## Tech Stack

**Blockchain:** Aleo Testnet · Leo · `credits.aleo/transfer_private` · BHP256
**Frontend:** React 19 · TypeScript · Tailwind CSS · Framer Motion · Vite
**Wallet:** `@provablehq/aleo-wallet-adaptor-shield` (Shield Wallet)
**Storage:** Dexie.js (IndexedDB) · Web Crypto API
**Backend:** Node.js · Express · Socket.io

## Team

**Ritik** — Full Stack Developer & Blockchain Engineer
Discord: `ritik200238` | GitHub: [@Ritik200238](https://github.com/Ritik200238)
Aleo Wallet: `aleo1h7yz0n5qx9uwyaxsprspkm5j6leey9eyzmjv9k7zyyd5nt5lguysystq59`

## Wave 2 vs Wave 1

| | Wave 1 | Wave 2 (now) |
|--|--------|--------------|
| Smart Contracts | 0 | **3 on testnet** |
| ZK Payments | ❌ | **✅ transfer_private** |
| Wallet | Leo Wallet | **Shield Wallet** |
| UI | Basic PoC | **Full Telegram-style** |
| Privacy Dashboard | ❌ | **✅ Live metrics** |
| Live Deploy | ❌ | **✅ Vercel** |

---

*Built for Aleo Privacy Buildathon 2026*
