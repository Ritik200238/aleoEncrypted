# Roadmap

## Wave 2 (Current)

- [x] AES-256-GCM client-side encryption
- [x] Socket.io ciphertext relay (server-blind)
- [x] 8-level BHP256 Merkle membership proofs (`group_membership.aleo`)
- [x] Anonymous group messages with on-chain nullifiers
- [x] Private ZK tips via `private_tips.aleo` → `transfer_private`
- [x] BHP256 receipt commitments on `tip_receipt.aleo`
- [x] Real-time WebRTC voice/video calls (DTLS-SRTP encrypted P2P)
- [x] Shield Wallet + Leo Wallet integration
- [x] Privacy Score dashboard

## Wave 3 / Future

- [ ] **Persistent group keys** — Distribute group encryption keys on-chain using Aleo records (no out-of-band key exchange)
- [ ] **Multi-device sync** — Encrypted key export/import via Aleo private records
- [ ] **Disappearing messages** — Time-locked nullifiers for auto-expiry
- [ ] **File sharing** — Encrypted IPFS attachments with Aleo access control
- [ ] **Push notifications** — Encrypted push via Web Push API
- [ ] **Mobile app** — React Native + Shield Wallet mobile browser
- [ ] **DAO treasury tips** — Route tips to group treasury contracts
- [ ] **SDK** — `@encrypted-social/sdk` for developers to build on the protocol
