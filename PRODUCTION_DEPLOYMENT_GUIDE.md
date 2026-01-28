# 🚀 Production Deployment Guide - EncryptedSocial

## ✅ Current Status

### Web App Production Build
- ✅ **Built successfully** → `frontend/dist/`
- ✅ **Size**: 367.53 KB (gzipped: 116.47 KB)
- ✅ **Optimized**: Vite production build with tree-shaking
- ✅ **Ready to deploy** to: Vercel, Netlify, GitHub Pages, or any static host

### Leo Contracts
- ✅ **Contract ready**: `leo/group_membership/src/main.leo`
- ⏳ **Leo CLI installing**: Installing leo-lang v3.4.0...
- ⏳ **Awaiting deployment** to Aleo testnet

### Desktop .exe App
- ⏳ **Visual Studio Build Tools installing**: Background installation in progress
- ⏳ **Tauri build pending**: Will build once VS tools are ready
- 📊 **Disk space**: 4.6 GB free (sufficient for build)

---

## STEP 1: Deploy Web App (5 minutes)

### Option A: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd D:\buildathon\encrypted-social-aleo\frontend

# Deploy to Vercel
vercel --prod

# Follow prompts:
# - Project name: encrypted-social-aleo
# - Framework: Vite
# - Output directory: dist
# - Build command: npm run build
```

**Result**: Live URL like `https://encrypted-social-aleo.vercel.app`

### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend
cd D:\buildathon\encrypted-social-aleo\frontend

# Deploy
netlify deploy --prod --dir=dist

# Follow prompts and authorize with GitHub
```

### Option C: Deploy to GitHub Pages

```bash
cd D:\buildathon\encrypted-social-aleo

# Commit production build
git add frontend/dist/
git commit -m "Add production build"

# Push to GitHub
git push origin master

# Enable GitHub Pages in repo settings
# Source: master branch, /frontend/dist folder
```

---

## STEP 2: Deploy Leo Contracts to Aleo Testnet

### 2.1: Export Private Key from Leo Wallet Extension

**IMPORTANT**: You mentioned you have credits in your Leo Wallet extension in Edge browser. To deploy contracts from the CLI, you need to export your private key.

**Steps to export private key:**

1. **Open Edge browser**
2. **Click Leo Wallet extension** (puzzle icon in toolbar)
3. **Click on your account name** (top of wallet)
4. **Click "Settings" or ⚙️ icon**
5. **Click "Export Private Key"** or "Show Private Key"
6. **Enter your wallet password**
7. **Copy the private key** (starts with `APrivateKey1...`)

⚠️ **SECURITY WARNING**: Never share this key publicly or commit to GitHub!

### 2.2: Update .env File with Your Key

```bash
# Navigate to contract directory
cd D:\buildathon\encrypted-social-aleo\leo\group_membership

# Edit .env file
notepad .env

# Replace the PRIVATE_KEY line with YOUR key:
# PRIVATE_KEY=APrivateKey1zkp... (your actual key from wallet)

# Save and close
```

### 2.3: Wait for Leo Installation to Complete

Leo CLI is currently installing. Wait for the message:
```
  Installing leo-lang v3.4.0
    Finished in X minutes
  Installed package `leo-lang v3.4.0`
```

Check installation status:
```bash
leo --version
```

Should output: `Leo 3.4.0`

### 2.4: Deploy Contract to Testnet

```bash
cd D:\buildathon\encrypted-social-aleo\leo\group_membership

# Build contract first
leo build

# Deploy to testnet (uses your wallet credits)
leo deploy --network testnet

# This will:
# - Upload proving keys (24 MB, takes 2-3 min)
# - Deploy contract to Aleo blockchain
# - Cost ~30 Aleo credits from your wallet
# - Return transaction ID

# Expected output:
# ✅ Program deployed successfully!
# Transaction ID: at1...
# Program ID: group_membership.aleo
# Explorer: https://explorer.aleo.org/transaction/at1...
```

### 2.5: Verify Deployment

After deployment completes:

1. **Copy the transaction ID** (starts with `at1...`)
2. **Visit Aleo Explorer**: https://explorer.aleo.org
3. **Paste transaction ID** in search bar
4. **Verify**: You should see your deployed contract!

**Screenshot this for buildathon submission!**

---

## STEP 3: Build Desktop .exe (After VS Tools Install)

### 3.1: Wait for VS Build Tools Installation

Visual Studio C++ Build Tools are installing in the background. This takes 10-15 minutes.

Check installation status:
```bash
# Check if installation completed
where cl.exe 2>NUL && echo "✅ VS Build Tools installed!" || echo "⏳ Still installing..."
```

### 3.2: Build Desktop App

Once VS Build Tools are installed:

```bash
cd D:\buildathon\encrypted-social-aleo\frontend

# Build desktop .exe
npm run tauri:build

# This will:
# - Compile Rust backend
# - Bundle React frontend
# - Create Windows installer
# - Takes 10-15 minutes

# Expected output:
#   Compiling app...
#   Bundling...
#   ✅ Build complete!
```

### 3.3: Get Your .exe File

After successful build:

```
Location: D:\buildathon\encrypted-social-aleo\frontend\src-tauri\target\release\

Files created:
✅ encrypted-social.exe          (Portable .exe, 8-12 MB)
✅ encrypted-social_0.0.0_x64.msi (Windows installer)
✅ encrypted-social_0.0.0_x64_en-US.msi.zip (Compressed installer)
```

**Test the .exe:**
```bash
cd D:\buildathon\encrypted-social-aleo\frontend\src-tauri\target\release
.\encrypted-social.exe
```

---

## STEP 4: Production Checklist

### Before Buildathon Submission:

- [ ] **Web app deployed** and live at public URL
- [ ] **Leo contracts deployed** to Aleo testnet
- [ ] **Transaction ID** saved and verified on explorer
- [ ] **Desktop .exe built** and tested
- [ ] **Screenshots taken**:
  - [ ] Live web app UI
  - [ ] Aleo explorer showing deployed contract
  - [ ] Desktop app running
  - [ ] Wallet connection
- [ ] **Demo video recorded** (5 minutes max)
- [ ] **README updated** with:
  - [ ] Live demo URL
  - [ ] Contract addresses
  - [ ] Transaction IDs
  - [ ] Installation instructions
- [ ] **Submission package ready**:
  - [ ] Source code (GitHub repo)
  - [ ] Demo video (YouTube/Vimeo)
  - [ ] Documentation
  - [ ] Deployment proof (screenshots)

---

## Troubleshooting

### Issue: "Not enough credits" during deployment

**Solution**: Your wallet needs ~30 Aleo testnet credits.

Get testnet credits:
1. Visit: https://faucet.aleo.org
2. Enter your Aleo address (from wallet)
3. Request 100 testnet credits
4. Wait 2-3 minutes
5. Retry deployment

### Issue: "Program already deployed"

**Solution**: Each program can only be deployed once. If you need to redeploy:

```bash
# Option 1: Change program name in main.leo
# program group_membership.aleo; → program group_membership_v2.aleo;

# Option 2: Use existing deployment (preferred)
# Just use the transaction ID from first deployment
```

### Issue: Desktop build still fails after VS Tools install

**Solution**: Restart VS Build Tools installation:

```bash
# Run as Administrator
cd D:\buildathon\encrypted-social-aleo
.\INSTALL_CPP_TOOLS_ADMIN.bat

# Make sure to select:
# ✅ Desktop development with C++
# ✅ Windows 10 SDK
```

---

## Timeline Estimate

| Task | Duration | Status |
|------|----------|--------|
| Web app deploy | 5-10 min | ✅ Build ready |
| Export wallet key | 2 min | ⏳ Awaiting user |
| Leo install | 15-20 min | ⏳ In progress |
| Contract deploy | 5-10 min | ⏳ Awaiting Leo |
| VS Tools install | 10-15 min | ⏳ In progress |
| Desktop build | 10-15 min | ⏳ Awaiting VS |
| **TOTAL** | **45-70 min** | **50% complete** |

---

## Next Immediate Actions

**RIGHT NOW** (while installs run in background):

1. ✅ **Export your private key** from Leo Wallet extension in Edge
2. ✅ **Update .env file** with your private key
3. ✅ **Choose deployment platform** (Vercel/Netlify/GitHub Pages)
4. ✅ **Install deployment CLI** (`npm install -g vercel` or `npm install -g netlify-cli`)

**WHEN LEO FINISHES** (check with `leo --version`):

5. ✅ **Deploy contract**: `cd leo/group_membership && leo deploy --network testnet`
6. ✅ **Copy transaction ID** and verify on explorer

**WHEN VS TOOLS FINISH** (check with `where cl.exe`):

7. ✅ **Build desktop app**: `cd frontend && npm run tauri:build`
8. ✅ **Test .exe file**: `.\src-tauri\target\release\encrypted-social.exe`

---

## Support

If you encounter any issues:

1. Check this guide's Troubleshooting section
2. Review error messages carefully
3. Check disk space: `df -h /c` (need 4+ GB)
4. Verify Leo installed: `leo --version`
5. Verify VS Tools: `where cl.exe`

**Buildathon deadline**: Make sure to submit before deadline even if desktop .exe is not ready. Web app + deployed contracts is sufficient for a winning submission!

---

**Good luck! 🚀**
