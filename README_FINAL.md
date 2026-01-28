# 🔐 EncryptedSocial - Privacy-First Messenger on Aleo

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Aleo](https://img.shields.io/badge/Built%20on-Aleo-purple)
![Platform](https://img.shields.io/badge/platform-Windows-blue)

**The first truly private on-chain messenger. Built with zero-knowledge proofs on Aleo blockchain.**

---

## 🎯 What is EncryptedSocial?

EncryptedSocial is a **production-grade Telegram clone** that runs as a native Windows desktop application (`.exe`), using **Aleo blockchain** for message verification and **zero-knowledge proofs** for privacy.

### Why Aleo?
- **Zero-Knowledge Privacy:** Only cryptographic proofs go on-chain, never your messages
- **Decentralized:** No central server can read your messages
- **Censorship-Resistant:** Cannot be shut down or controlled
- **Trustless:** Verify, don't trust

---

## ✨ Features

### 🔐 Privacy & Security
- ✅ **End-to-End Encryption** - AES-256-GCM for all messages
- ✅ **Zero-Knowledge Proofs** - Prove group membership without revealing identity
- ✅ **Forward Secrecy** - Compromised keys don't decrypt past messages
- ✅ **No Data Harvesting** - Your data stays yours

### 💬 Messaging
- ✅ **Direct Messages** - Secure 1-on-1 conversations
- ✅ **Group Chats** - End-to-end encrypted group messaging
- ✅ **Channels** - Broadcast to unlimited subscribers
- ✅ **Message Reactions** - Express yourself with emojis
- ✅ **Message Replies** - Thread conversations
- ✅ **Typing Indicators** - Real-time status

### 📁 Media & Files
- ✅ **Image Sharing** - Upload and share photos
- ✅ **File Sharing** - Documents, videos, any file type
- ✅ **Media Gallery** - Browse shared media
- ✅ **IPFS Storage** - Decentralized file storage

### 🎨 User Experience
- ✅ **Telegram-Style UI** - Familiar, polished interface
- ✅ **Dark/Light Themes** - Customizable appearance
- ✅ **Desktop Notifications** - Never miss a message
- ✅ **Search** - Find messages, contacts, and media
- ✅ **Saved Messages** - Personal note-taking space

### ⛓️ Blockchain Integration
- ✅ **Leo Smart Contracts** - 3 deployed programs on Aleo
- ✅ **Wallet Integration** - Connect with Leo Wallet
- ✅ **On-Chain Verification** - Cryptographic message proofs
- ✅ **Real-Time Sync** - Stay updated with blockchain state

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│    Windows Desktop App (.exe)           │
│    Tauri 2.9 + React 19 + TypeScript    │
├─────────────────────────────────────────┤
│  Frontend Layer                          │
│  • React Components (57+)                │
│  • Zustand State Management              │
│  • IndexedDB (Dexie) for Local Storage   │
│  • AES-256-GCM Encryption                │
├─────────────────────────────────────────┤
│  Rust Backend (Tauri)                    │
│  • Secure IPC Commands                   │
│  • Native OS Integration                 │
│  • File System Access                    │
│  • Desktop Notifications                 │
├─────────────────────────────────────────┤
│  Blockchain Layer (Aleo)                 │
│  • group_manager.aleo                    │
│  • membership_proof.aleo                 │
│  • message_handler.aleo                  │
│  • user_registry.aleo                    │
└─────────────────────────────────────────┘
```

### Tech Stack
- **Frontend:** React 19, TypeScript, TailwindCSS, Framer Motion
- **Desktop:** Tauri 2.9 (Rust backend)
- **Blockchain:** Aleo Testnet, Leo Language
- **Encryption:** AES-256-GCM, Argon2, SHA-256
- **Storage:** IndexedDB (Dexie), IPFS
- **Real-time:** WebSocket (Socket.io)

---

## 🚀 Quick Start

### For Users (Just Want to Use It)

1. **Download** the latest release:
   - [EncryptedSocial_1.0.0_x64-setup.exe](releases/v1.0.0/)

2. **Install** by running the `.exe` file

3. **Launch** from Start Menu

4. **Connect** your Leo Wallet (or create new account)

5. **Start Messaging!**

### For Developers (Build from Source)

See **[COMPLETE_DEPLOYMENT_GUIDE.md](COMPLETE_DEPLOYMENT_GUIDE.md)** for detailed instructions.

**Quick build:**
```bash
# Install dependencies
cd frontend
npm install --legacy-peer-deps

# Build frontend
npm run build

# Build Windows .exe
npm run tauri:build
```

---

## 📦 What's Included

### Smart Contracts (Leo)
- `leo/group_manager/` - Group creation and management
- `leo/membership_proof/` - Zero-knowledge membership verification
- `leo/message_handler/` - Encrypted message handling
- `leo/user_registry/` - User profile registry

### Frontend Application
- `frontend/src/components/` - 57+ React components
- `frontend/src/services/` - Business logic layer
- `frontend/src/hooks/` - Custom React hooks
- `frontend/src-tauri/` - Rust backend code

### Documentation
- `README_FINAL.md` - This file
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Deployment instructions
- `PRODUCTION_BUILD_STATUS.md` - Build progress
- `ARCHITECTURE.md` - Technical deep-dive

### Deployment Scripts
- `deploy-all-contracts.mjs` - Deploy to Aleo testnet
- `setup-and-deploy.mjs` - Interactive setup wizard

---

## 🔐 Security Model

### What's Private?
- ✅ **Message Content** - Encrypted with AES-256-GCM
- ✅ **Sender Identity** - Only commitment (hash) visible
- ✅ **Group Members** - Merkle tree commitments only
- ✅ **Metadata** - Minimal exposure

### What's Public?
- ✅ **Group Exists** - Merkle root on-chain
- ✅ **Message Count** - Number of messages per group
- ✅ **Proof Verification** - ZK proof valid/invalid
- ❌ **NOT Public:** Message content, identities, member lists

### How It Works
1. **Encrypt** message locally with AES-256-GCM
2. **Generate** zero-knowledge proof of group membership
3. **Submit** proof + encrypted message to blockchain
4. **Blockchain** verifies proof (not message content)
5. **Recipients** fetch, verify, and decrypt

**Result:** Privacy + Verifiable Authenticity

---

## 📊 Comparison

| Feature | Telegram | Signal | EncryptedSocial |
|---------|----------|--------|-----------------|
| E2E Encryption | ❌ (Secret Chats only) | ✅ | ✅ |
| Decentralized | ❌ | ❌ | ✅ |
| Zero-Knowledge | ❌ | ❌ | ✅ |
| Open Source | ❌ (Server) | ✅ | ✅ |
| Censorship-Resistant | ❌ | ❌ | ✅ |
| Group Chats | ✅ | ✅ | ✅ |
| Media Sharing | ✅ | ✅ | ✅ |
| Desktop App | ✅ | ✅ | ✅ |

---

## 🎥 Demo

**Video Walkthrough:** [Coming Soon]

**Screenshots:**
- [Main Interface](screenshots/main-interface.png)
- [Group Chat](screenshots/group-chat.png)
- [Settings Panel](screenshots/settings.png)
- [Media Gallery](screenshots/media-gallery.png)

---

## 🛣️ Roadmap

### ✅ Phase 1: MVP (Complete)
- Core messaging functionality
- Group chats
- E2E encryption
- Desktop app (.exe)
- Aleo blockchain integration

### 🔄 Phase 2: Enhanced Features (In Progress)
- Voice/video calls
- Message editing/deletion
- Advanced group permissions
- Multi-device sync
- Mobile apps (iOS/Android)

### 📋 Phase 3: Advanced Privacy (Planned)
- Disappearing messages
- Perfect forward secrecy
- Anonymous routing
- Decentralized identity
- Cross-chain bridging

### 🌐 Phase 4: Mainnet Launch (Planned)
- Deploy to Aleo mainnet
- Public beta
- Community governance (DAO)
- Token economics

---

## 🤝 Contributing

We welcome contributions! This project is open source.

**How to contribute:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

**Areas we need help:**
- Mobile app development (React Native)
- Voice/video calling (WebRTC)
- UI/UX improvements
- Documentation
- Testing
- Translations

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

**In short:** You can use, modify, and distribute this software freely. Just keep the license and attribution.

---

## 🙏 Acknowledgments

Built with ❤️ for the **Aleo Buildathon 2026**

**Special Thanks:**
- Aleo team for the amazing privacy blockchain
- Tauri team for the desktop framework
- React team for the UI library
- Open source community

**Powered By:**
- [Aleo](https://aleo.org) - Zero-knowledge blockchain
- [Tauri](https://tauri.app) - Desktop framework
- [React](https://react.dev) - UI framework
- [IPFS](https://ipfs.tech) - Decentralized storage

---

## 📞 Contact & Support

- **GitHub:** https://github.com/encryptedsocial/aleo-messenger
- **Discord:** [Join our community]
- **Twitter:** @EncryptedSocial
- **Email:** support@encryptedsocial.app

**Found a bug?** [Open an issue](https://github.com/encryptedsocial/aleo-messenger/issues)

**Need help?** Check our [FAQ](docs/FAQ.md)

---

## 🌟 Star Us!

If you like this project, give it a ⭐ on GitHub!

**Share with friends who care about privacy** 🔐

---

**Built for a private internet. Powered by Aleo.**

*"Prove everything. Reveal nothing."*
