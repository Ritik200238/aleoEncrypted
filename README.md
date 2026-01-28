# EncryptedSocial - Private Messaging on Aleo

[![Aleo](https://img.shields.io/badge/Aleo-Testnet-blue)](https://aleo.org)
[![Leo](https://img.shields.io/badge/Leo-v3.4.0-green)](https://leo-lang.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Zero-knowledge proof-based messaging platform built on Aleo blockchain

## Project Overview

### What is EncryptedSocial?

EncryptedSocial is a decentralized messaging platform that leverages Aleo's zero-knowledge technology to provide cryptographically guaranteed privacy. Unlike traditional messaging apps that require trusting a central server, EncryptedSocial uses ZK proofs to ensure privacy while maintaining verifiability on-chain.

### Problem Statement

Current messaging platforms suffer from fundamental trust issues:
- Centralized servers can access all messages
- No cryptographic guarantee of privacy
- Metadata exposes communication patterns
- Censorship risks from central authorities

### Our Solution

We use Aleo's zero-knowledge technology to provide:
- **Cryptographic Privacy**: ZK proofs ensure privacy without trust
- **Decentralized Architecture**: No central point of failure
- **Verifiable Membership**: Prove authorization without revealing identity
- **On-Chain Verification**: All proofs publicly verifiable

## Why Privacy Matters

Private communication is fundamental for:
- **Whistleblower Protection**: Safe reporting of misconduct
- **Journalist Safety**: Protecting sources
- **Corporate Confidentiality**: Secure business communications
- **Personal Privacy**: Keeping conversations private

Zero-knowledge cryptography eliminates the need to trust any provider.

## Product Market Fit

### Target Markets

**1. Enterprise (Primary)**
- Anonymous feedback systems
- Whistleblower channels
- Compliance reporting
- TAM: $2B+ corporate communication tools

**2. Privacy-Conscious Users**
- Activists and journalists
- High-net-worth individuals
- Crypto community
- TAM: 50M+ users globally

**3. Decentralized Organizations**
- DAOs requiring private voting
- Anonymous governance

### Competitive Advantage

| Feature | EncryptedSocial | Signal | Telegram |
|---------|----------------|--------|----------|
| Zero-Knowledge Proofs | ✅ | ❌ | ❌ |
| Decentralized | ✅ | ❌ | ❌ |
| Verifiable Privacy | ✅ | ❌ | ❌ |
| On-Chain Verification | ✅ | ❌ | ❌ |

## Go-To-Market Strategy

### Phase 1: Crypto-Native Launch (Months 1-3)
- Target: Aleo community
- Goal: 1,000 active users

### Phase 2: Enterprise Pilot (Months 4-6)
- Target: 5-10 companies for feedback pilots
- Goal: $50K ARR

### Phase 3: Scale (Months 7-12)
- Target: Mainstream privacy-conscious users
- Goal: 100K+ users, $500K ARR

### Revenue Model
- Freemium: Basic messaging free
- Enterprise: $10/user/month
- Premium: $5/month advanced features
- API Access: $500/month developer tier

## Features

### Core Functionality
- Direct Messaging
- Group Chats with ZK verification
- Contact Management
- Search
- Voice/Video Calls (coming soon)

### Privacy Features
- Zero-Knowledge Proofs
- Merkle Tree Membership
- Nullifier System
- On-Chain Verification

## Tech Stack

**Blockchain**
- Aleo Blockchain (Testnet)
- Leo v3.4.0
- ZK-SNARKs

**Frontend**
- React 19 + TypeScript
- Tailwind CSS
- Vite
- Tauri (Desktop)

**Smart Contracts**
- group_membership.aleo (363 lines)
- 79/79 tests passed

## Architecture

```
Frontend (React) → Aleo Wallet → Aleo Blockchain
                                       ↓
                            group_membership.aleo
                            - Merkle verification
                            - Nullifier tracking
                            - ZK proof validation
```

### Privacy Model

1. Admin creates Merkle tree of members
2. Member generates ZK proof of membership
3. Submit message with proof (identity hidden)
4. Contract verifies proof on-chain
5. Nullifier prevents duplicates
6. Message visible, sender cryptographically hidden

## Quick Start

### Prerequisites
- Node.js 18+
- Leo CLI 3.4.0+
- Aleo Wallet
- Git

### Installation

```bash
git clone https://github.com/Ritik200238/aleoEncrypted.git
cd aleoEncrypted

cd frontend
npm install --legacy-peer-deps

cd ../leo/group_membership
leo build

cd ../../frontend
npm run dev
```

## Smart Contract Deployment

```bash
cd leo/group_membership
leo deploy --network testnet
```

## Team

**Ritik**
- Role: Full Stack Developer & Blockchain Engineer
- GitHub: [@Ritik200238](https://github.com/Ritik200238)
- Discord: ritik200238
- Aleo Wallet: See SUBMISSION.md

## Roadmap

### Current (Wave 2)
- ✅ Core messaging
- ✅ ZK proof integration
- ✅ Testnet deployment
- ⏳ Desktop app
- ⏳ Enhanced UI

### Future (Wave 3+)
- Voice/Video with ZK auth
- Encrypted file sharing
- Mobile apps
- Mainnet deployment

## License

MIT License

## Links

- **Demo**: Coming soon
- **Smart Contract**: [Aleo Explorer](https://explorer.aleo.org)
- **Documentation**: [docs/](./docs/)

---

Built for Aleo Buildathon 2026
