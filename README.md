# EncryptedSocial — Anonymous Group Protocol on Aleo

[![Aleo Testnet](https://img.shields.io/badge/Aleo-Testnet-blue)](https://explorer.aleo.org)
[![Shield Wallet](https://img.shields.io/badge/Wallet-Shield-purple)](https://provable.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Prove group membership with a Merkle ZK proof. Send anonymous messages and private ZK tips without revealing your identity on-chain. Built on Aleo.

**Live Demo:** https://aleo-encrypted.vercel.app
**Demo (no wallet):** https://aleo-encrypted.vercel.app/?demo=true
**Full submission:** [SUBMISSION.md](SUBMISSION.md)

---

## How Privacy Works

| Layer | What happens | Who can read? |
|---|---|---|
| Your device | AES-256-GCM encryption | Only you + recipient |
| WebSocket relay | Forwards ciphertext only | Nobody — relay is blind |
| Aleo blockchain | Stores BHP256 hash / nullifier | Anyone (proof only, no identity) |
| ZK proof | Merkle membership circuit | Verifier learns "valid member" — nothing else |

**Key guarantees:**

- Messages are encrypted **client-side** with AES-256-GCM before leaving your device
- The relay server **never sees plaintext** — it only forwards ciphertext blobs
- `group_membership.aleo` proves you are in a group using an 8-level BHP256 Merkle tree — your address is never on-chain
- `private_tips.aleo` wraps `credits.aleo/transfer_private` — sender identity and balance hidden by Groth16 SNARK
- **Nullifiers** stored on-chain prove a message was sent without identifying who sent it

---

## Deployed Contracts — Aleo Testnet (All 6 Live)

| Contract | TX | Description |
|---|---|---|
| `group_manager.aleo` | [at12gkme...](https://explorer.aleo.org/transaction/at12gkmegshtlsjgzfpng4ls8mprlwc0s5l9573wy9khlqcelf97cqs36kwew?network=testnet) | Group state registry |
| `membership_proof.aleo` | [at1heup9...](https://explorer.aleo.org/transaction/at1heup986u7f0hhd26um6mmfvp95uq9yfmv2xa5vzh2yvd7g4d6qpsx5q9f4?network=testnet) | Membership stub |
| `message_handler.aleo` | [at1nejj3...](https://explorer.aleo.org/transaction/at1nejj3turtptuu0ddl5f0axv9mmscgzcfum9049tfxpm9wfk8zy9qmsct0q?network=testnet) | Message hash anchoring |
| `tip_receipt.aleo` | [at17zg5e...](https://explorer.aleo.org/transaction/at17zg5efd6lqv33jtshcf9gfdqtcapycscak8ej3ydexqtkw57fqqsjqmyfr?network=testnet) | ZK tip receipt registry |
| `private_tips.aleo` | [at1cr03j...](https://explorer.aleo.org/transaction/at1cr03ja49m6prfjln7zpp9klt00fmcpzv2p704h5700n2sj8jq5zsqtk3uk?network=testnet) | ZK tips — Groth16 SNARK hides sender + balance |
| `group_membership.aleo` | [at1ksfdk...](https://explorer.aleo.org/transaction/at1ksfdjkpvsrvuqnp6zurgp9feqycjkqkths9pa5gmemxzaryl8s8q3stazt?network=testnet) | **8-level Merkle proofs + nullifiers — anonymous group messaging** |

Verify any contract on-chain:
```bash
curl https://api.explorer.provable.com/v1/testnet/program/group_membership.aleo
```

---

## Judge Verification (2 Minutes)

### 1. Verify a ZK Tip (private_tips.aleo)
```
# After sending a tip in the app, copy the TX ID and find the mapping key:
GET https://api.explorer.provable.com/v1/testnet/program/private_tips.aleo/mapping/tip_receipts/{key}
# Returns the amount. Sender identity + balance hidden by Groth16 SNARK.
```

### 2. Verify Anonymous Message Nullifier (group_membership.aleo)
```
GET https://api.explorer.provable.com/v1/testnet/program/group_membership.aleo/mapping/nullifiers/{nullifier}
# Returns true. Sender address never on-chain.
```

### 3. Verify Merkle Root (group_membership.aleo)
```
GET https://api.explorer.provable.com/v1/testnet/program/group_membership.aleo/mapping/group_roots/{group_id}
# Returns BHP256 Merkle root — all membership proofs verify against this.
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Frontend (Vercel)                                   │
│  React 19 + TypeScript + Vite                        │
│  @provablehq/aleo-wallet-adaptor-shield              │
│  AES-256-GCM (Web Crypto API)                        │
│  Dexie.js / IndexedDB (not localStorage)             │
├─────────────────────────────────────────────────────┤
│  Backend Relay (Railway)                             │
│  Node.js + Socket.io                                 │
│  Never decrypts — pure ciphertext relay              │
├─────────────────────────────────────────────────────┤
│  Aleo Testnet (6 contracts)                          │
│  private_tips.aleo   — Groth16 ZK-SNARK tips         │
│  group_membership.aleo — Merkle proofs + nullifiers  │
│  tip_receipt.aleo    — BHP256 receipt commitments    │
│  group_manager.aleo  — group state                   │
│  message_handler.aleo — message hash anchoring       │
│  membership_proof.aleo — membership stub             │
└─────────────────────────────────────────────────────┘
```

---

## Run Locally

```bash
# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev   # http://localhost:5173

# Backend relay (separate terminal)
cd backend
npm install
npm start     # http://localhost:3001
```

Set `VITE_WS_URL=ws://localhost:3001` in `frontend/.env.local` for local backend.

---

## Project Structure

```
aleoEncrypted/
├── backend/
│   └── server.ts                       # Socket.io cipher relay
├── frontend/
│   └── src/
│       ├── components/
│       │   └── CleanTelegramApp.tsx    # Main messenger UI
│       ├── services/
│       │   ├── encryptionService.ts    # AES-256-GCM
│       │   ├── leoContractService.ts   # Contract calls (all 6)
│       │   ├── messagingOrchestrator.ts
│       │   └── websocketService.ts
│       ├── config/
│       │   └── aleoConfig.ts           # Contract addresses
│       └── App.tsx                     # Landing + wallet connect
├── leo/
│   ├── private_tips/                   # ZK tips circuit (deployed ✅)
│   ├── group_membership/               # Merkle proofs circuit (deployed ✅)
│   ├── group_manager/                  # Group state (deployed ✅)
│   ├── message_handler/                # Message anchoring (deployed ✅)
│   ├── tip_receipt/                    # Receipt registry (deployed ✅)
│   └── membership_proof/               # Membership stub (deployed ✅)
├── SUBMISSION.md                       # Full Wave 2 buildathon submission
└── DEPLOY.md                           # Deployment guide
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Leo contracts | Leo 3.4.0, 6 programs on Aleo testnet |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Wallet | `@provablehq/aleo-wallet-adaptor-shield` (buildathon requirement) |
| Encryption | AES-256-GCM via Web Crypto API |
| Storage | Dexie.js + IndexedDB |
| Backend | Node.js + Socket.io, Railway deployment |

---

## Security Model

| Threat | Protection |
|---|---|
| Relay server reading messages | AES-256-GCM client-side encryption |
| Sender identity in group chat | Merkle ZK proof — address never on-chain |
| Tip amount/sender linkability | Groth16 SNARK via credits.aleo/transfer_private |
| Replay attacks | On-chain nullifiers + BHP256 salt-based receipt IDs |

**Not protected (out of scope):** endpoint compromise, traffic analysis correlating both endpoints simultaneously.

---

## Buildathon

Built for the **Aleo Privacy Buildathon 2026** — Wave 2.

See [SUBMISSION.md](SUBMISSION.md) for full submission including:
- Head-to-head comparison vs NullPay (Wave 1 winner)
- Honest breakdown of what's real vs simulated
- Privacy score analysis (estimated 91/100)
- Judge verification guide

---

## License

MIT
