# EncryptedSocial

> Anonymous encrypted messaging and private ZK payments on Aleo blockchain.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-encrypted--social--aleo.vercel.app-blue)](https://encrypted-social-aleo.vercel.app)
[![Aleo Testnet](https://img.shields.io/badge/Aleo-Testnet-purple)](https://explorer.aleo.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[Live App](https://encrypted-social-aleo.vercel.app)** · **[Demo (no wallet)](https://encrypted-social-aleo.vercel.app/?demo=true)** · **[Submission](SUBMISSION.md)**

---

## Features

- **Anonymous Group Messaging** — Merkle ZK proofs prove group membership without revealing identity. Your address is never on-chain.
- **AES-256-GCM Encryption** — Messages encrypted client-side before leaving your device. The relay server sees only ciphertext.
- **Private ZK Tips** — Send tips via `private_tips.aleo` using Aleo's `transfer_private`. Sender identity and balance hidden by Groth16 SNARK.
- **Real-time Relay** — Socket.io relay forwards ciphertext only. Server is intentionally blind to message content.
- **WebRTC Voice/Video Calls** — Peer-to-peer encrypted calls. Server never touches audio or video.
- **On-Chain Nullifiers** — Each anonymous message produces a unique nullifier stored on `group_membership.aleo`. Proves a message was sent without revealing who.

---

## How It Works

```
Your Device  →  AES-256-GCM encrypt  →  Relay (sees ciphertext only)  →  Recipient decrypts
      ↓
Aleo Testnet  →  ZK membership proof (Merkle tree)  →  Nullifier stored on-chain
```

| Layer | What happens | Who can read it |
|---|---|---|
| Device | AES-256-GCM encryption | Only sender + recipient |
| Relay | Forwards ciphertext | Nobody — relay is blind |
| Aleo blockchain | Stores BHP256 nullifier / Merkle root | Anyone (proof only, no identity) |
| ZK circuit | Merkle membership proof | Verifier learns "valid member" — nothing else |

---

## Smart Contracts (Aleo Testnet)

All 6 contracts are live and verifiable on-chain.

| Contract | Description | TX |
|---|---|---|
| `group_membership.aleo` | 8-level Merkle proofs + nullifiers | [verify →](https://explorer.aleo.org/transaction/at1ksfdjkpvsrvuqnp6zurgp9feqycjkqkths9pa5gmemxzaryl8s8q3stazt?network=testnet) |
| `private_tips.aleo` | ZK tips — Groth16 SNARK hides sender + balance | [verify →](https://explorer.aleo.org/transaction/at1cr03ja49m6prfjln7zpp9klt00fmcpzv2p704h5700n2sj8jq5zsqtk3uk?network=testnet) |
| `group_manager.aleo` | Group state registry | [verify →](https://explorer.aleo.org/transaction/at12gkmegshtlsjgzfpng4ls8mprlwc0s5l9573wy9khlqcelf97cqs36kwew?network=testnet) |
| `message_handler.aleo` | Message hash anchoring | [verify →](https://explorer.aleo.org/transaction/at1nejj3turtptuu0ddl5f0axv9mmscgzcfum9049tfxpm9wfk8zy9qmsct0q?network=testnet) |
| `tip_receipt.aleo` | BHP256 receipt commitments | [verify →](https://explorer.aleo.org/transaction/at17zg5efd6lqv33jtshcf9gfdqtcapycscak8ej3ydexqtkw57fqqsjqmyfr?network=testnet) |
| `membership_proof.aleo` | Membership stub | [verify →](https://explorer.aleo.org/transaction/at1heup986u7f0hhd26um6mmfvp95uq9yfmv2xa5vzh2yvd7g4d6qpsx5q9f4?network=testnet) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Leo 3.4.0, 6 programs on Aleo testnet |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Wallet | Shield Wallet (`@provablehq/aleo-wallet-adaptor-shield`) |
| Encryption | AES-256-GCM via Web Crypto API |
| Storage | Dexie.js + IndexedDB |
| Backend | Node.js + Socket.io, Railway |
| Calls | WebRTC (DTLS-SRTP) + STUN |

---

## Project Structure

```
aleoEncrypted/
├── frontend/          # React 19 app (Vite + TypeScript)
├── backend/           # Socket.io ciphertext relay
├── leo/               # 6 Leo smart contracts
│   ├── group_membership/
│   ├── private_tips/
│   ├── group_manager/
│   ├── message_handler/
│   ├── tip_receipt/
│   └── membership_proof/
├── scripts/           # Deployment & utility scripts
├── docs/              # Additional documentation
└── assets/            # Screenshots & diagrams
```

---

## Quick Start

```bash
# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev            # http://localhost:5173

# Backend relay (separate terminal)
cd backend
npm install
npm start              # http://localhost:3001
```

Set `VITE_WS_URL=ws://localhost:3001` in `frontend/.env.local` for local backend.

Copy `.env.example` → `.env` and fill in your values.

---

## Verify On-Chain (2 minutes)

**Anonymous message nullifier:**
```
GET https://api.explorer.provable.com/v1/testnet/program/group_membership.aleo/mapping/nullifiers/{nullifier}
```

**ZK tip receipt:**
```
GET https://api.explorer.provable.com/v1/testnet/program/private_tips.aleo/mapping/tip_receipts/{receipt_id}
```

**Group Merkle root:**
```
GET https://api.explorer.provable.com/v1/testnet/program/group_membership.aleo/mapping/group_roots/{group_id}
```

---

## License

MIT
