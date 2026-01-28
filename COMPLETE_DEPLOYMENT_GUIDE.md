# 🚀 Complete Deployment Guide - EncryptedSocial

**Production-ready deployment instructions for Windows .exe application**

---

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ (LTS recommended)
- **Rust** 1.77.2+ ([rustup.rs](https://rustup.rs))
- **Git** (for cloning)
- **Windows** 10/11 (for .exe build)

### Required Accounts
- **Aleo Testnet Account** with ~10 credits
- Get credits from: https://faucet.aleo.org

---

## 🔧 Step 1: Install Dependencies

```bash
# Navigate to project
cd D:\buildathon\encrypted-social-aleo

# Install root dependencies (Aleo SDK)
npm install

# Install frontend dependencies
cd frontend
npm install --legacy-peer-deps

# Verify Rust is installed
rustc --version
cargo --version
```

---

## 🏗️ Step 2: Build Smart Contracts

The contracts are **already compiled** in `/leo/*/build/main.aleo`.

To rebuild (optional):
```bash
# If you have Leo CLI installed
cd D:\buildathon\encrypted-social-aleo\leo\group_manager
leo build

cd ../membership_proof
leo build

cd ../message_handler
leo build
```

**Note:** Leo CLI is optional for deployment. Contracts can be deployed using the provided Node.js scripts.

---

## ⛓️ Step 3: Deploy to Aleo Blockchain

### Option A: Interactive Setup (Recommended)

```bash
# From project root
cd D:\buildathon\encrypted-social-aleo
node setup-and-deploy.mjs
```

**This will:**
1. Generate a new Aleo account (or use existing from env)
2. Show you where to get testnet credits
3. Deploy all 3 contracts automatically
4. Save deployment results to `deployment-results.json`

### Option B: Manual Deployment

```bash
# If you already have a funded account
ALEO_PRIVATE_KEY=<your_private_key> node deploy-all-contracts.mjs
```

### Option C: Skip Deployment (Demo Mode)

The app works in **demo mode** without blockchain deployment. It falls back to local storage.

---

## 🖥️ Step 4: Build Desktop Application

### 4.1 Build Frontend

```bash
cd D:\buildathon\encrypted-social-aleo\frontend
npm run build
```

This creates optimized production files in `frontend/dist/`.

### 4.2 Build Tauri .exe

```bash
# Still in frontend directory
npm run tauri:build
```

**Build output:**
- **Installer:** `frontend/src-tauri/target/release/bundle/nsis/EncryptedSocial_1.0.0_x64-setup.exe`
- **MSI:** `frontend/src-tauri/target/release/bundle/msi/EncryptedSocial_1.0.0_x64_en-US.msi`
- **Portable:** `frontend/src-tauri/target/release/encrypted-social.exe`

**Build time:** 5-15 minutes (first build compiles Rust dependencies)

---

## ✅ Step 5: Test the Application

### 5.1 Test in Development Mode

```bash
cd D:\buildathon\encrypted-social-aleo\frontend
npm run tauri:dev
```

This opens the app in development mode with hot reload.

### 5.2 Test Production Build

**Install the .exe:**
1. Navigate to `frontend/src-tauri/target/release/bundle/nsis/`
2. Run `EncryptedSocial_1.0.0_x64-setup.exe`
3. Follow installation wizard
4. Launch from Start Menu

**Test these features:**
- [ ] Wallet connection (Leo Wallet)
- [ ] Profile creation
- [ ] Create group
- [ ] Send message
- [ ] Receive message (open 2 instances)
- [ ] Upload image/file
- [ ] Settings panel
- [ ] Dark/light theme toggle

---

## 🔐 Step 6: Configure for Production

### Update Contract Addresses

After deployment, update frontend config:

**File:** `frontend/src/config/aleoConfig.ts`

```typescript
export const ALEO_CONFIG = {
  network: 'testnet',
  programIds: {
    groupManager: 'group_manager.aleo',
    membershipProof: 'membership_proof.aleo',
    messageHandler: 'message_handler.aleo',
    userRegistry: 'user_registry.aleo', // If deployed
  },
  rpcEndpoint: 'https://api.explorer.provable.com/v1',
  explorerUrl: 'https://explorer.aleo.org',
};
```

### Rebuild After Config Update

```bash
cd frontend
npm run build
npm run tauri:build
```

---

## 📦 Step 7: Distribution

### Create Release Package

```bash
# Create distribution folder
mkdir -p releases/v1.0.0
cd releases/v1.0.0

# Copy installers
cp ../../frontend/src-tauri/target/release/bundle/nsis/*.exe .
cp ../../frontend/src-tauri/target/release/bundle/msi/*.msi .

# Copy documentation
cp ../../README.md .
cp ../../COMPLETE_DEPLOYMENT_GUIDE.md .

# Create checksums
certutil -hashfile EncryptedSocial_1.0.0_x64-setup.exe SHA256 > checksums.txt
```

### Optional: Code Signing

For production releases, sign the executable:

```powershell
# Requires a code signing certificate
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com EncryptedSocial_1.0.0_x64-setup.exe
```

---

## 🐛 Troubleshooting

### Build Errors

**Error: "Command not found: tauri"**
```bash
cd frontend
npm install --save-dev @tauri-apps/cli --legacy-peer-deps
```

**Error: "Rust not found"**
- Install Rust from https://rustup.rs
- Restart terminal after installation
- Run `rustc --version` to verify

**Error: "WebView2 not found"**
- Tauri will auto-install on first run
- Or download manually: https://developer.microsoft.com/microsoft-edge/webview2/

### Deployment Errors

**Error: "Insufficient credits"**
- Get more credits from https://faucet.aleo.org
- Each contract needs ~3 Aleo credits
- Total needed: ~10 credits for safety

**Error: "HTTP 500 from RPC"**
- Aleo testnet may be experiencing issues
- Check status: https://explorer.aleo.org
- Try alternative endpoint in config
- Or wait and retry later

**Error: "Transaction timeout"**
- Increase timeout in deployment script
- Check transaction on explorer
- May just be slow confirmation (5-10 min)

### Runtime Errors

**Error: "Failed to connect wallet"**
- Install Leo Wallet extension
- Unlock wallet before connecting
- Check wallet is on correct network (testnet)

**Error: "Database initialization failed"**
- Clear browser cache/app data
- Restart application
- Check disk space (IndexedDB quota)

---

## 🎯 Production Checklist

Before releasing to users:

- [ ] All 3 contracts deployed to testnet
- [ ] Contract addresses updated in frontend config
- [ ] .exe build successful and tested
- [ ] Wallet connection works
- [ ] Messaging works end-to-end
- [ ] Media upload/download works
- [ ] Settings persist correctly
- [ ] App installs cleanly on fresh Windows
- [ ] No console errors in production mode
- [ ] README and documentation complete
- [ ] Demo video recorded
- [ ] Screenshots taken
- [ ] Code signing completed (if applicable)

---

## 📊 Performance Benchmarks

**Expected Performance:**
- First launch: 2-3 seconds
- Message send (local): < 500ms
- Message send (blockchain): 5-30 seconds
- Database queries: < 50ms
- Media upload (10MB): 5-15 seconds
- Sync interval: Every 5 seconds

---

## 🔗 Useful Links

- **Aleo Explorer:** https://explorer.aleo.org
- **Aleo Faucet:** https://faucet.aleo.org
- **Aleo Docs:** https://developer.aleo.org
- **Leo Language:** https://developer.aleo.org/leo
- **Tauri Docs:** https://tauri.app
- **Project Issues:** https://github.com/encryptedsocial/aleo-messenger/issues

---

## 🆘 Support

**If you encounter issues:**
1. Check the troubleshooting section above
2. Review deployment logs in `deployment-results.json`
3. Check browser/app console for errors
4. Verify all prerequisites are installed
5. Try the demo mode (skip blockchain deployment)

---

**Status:** Production deployment guide complete. Follow steps sequentially for best results.
