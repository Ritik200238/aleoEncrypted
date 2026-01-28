# EncryptedSocial - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

This guide will help you start the application and test all Wave 2-5 features.

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **npm** installed (`npm --version`)
- [ ] **Leo Wallet** or **Puzzle Wallet** browser extension installed
- [ ] **Modern browser** (Chrome, Firefox, or Edge)
- [ ] **Aleo wallet** created and set to **Testnet**

---

## 🎯 Step 1: Start the Development Server

```bash
# Navigate to the project
cd /d/buildathon/encrypted-social-aleo/frontend

# Start the development server
npm run dev
```

**Expected Output:**
```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Open your browser**: Navigate to `http://localhost:5173`

---

## 🔐 Step 2: Connect Your Wallet (Wave 2)

1. You should see a beautiful wallet connection screen
2. Click **"Connect Wallet"** button
3. Your Leo/Puzzle Wallet extension will pop up
4. **Approve the connection**
5. You'll see your wallet address in the sidebar

**✅ What to Check:**
- Green connection indicator
- Your address shown (truncated: `aleo1abc...xyz`)
- Network badge shows "Testnet Beta"
- Session persists on page reload

---

## 👤 Step 3: Create Your Profile (Wave 4)

Since this is your first time:

1. The app will prompt you to create a profile
2. **Enter a display name** (pseudonym, e.g., "CryptoKing")
3. **Choose an avatar** (emoji or upload image)
4. (Optional) Add a bio
5. Click **"Create Profile"**

**✅ What to Check:**
- Profile appears in settings
- Avatar shows correctly
- Display name stored encrypted

---

## 💬 Step 4: Create a Group and Send Messages (Wave 3)

### Create a Group

1. Click the **"+"** button in the top-right corner
2. Enter group name (e.g., "Secret Chat")
3. Click **"Create"**
4. **Approve the transaction** in your wallet
5. Wait 10-30 seconds for blockchain confirmation
6. Group appears in sidebar with ✅ confirmed status

**✅ What to Check:**
- Transaction ID appears
- Status changes: ⏳ Pending → ✅ Confirmed
- Group visible in sidebar

### Send a Message

1. Select your group from the sidebar
2. Type a message in the input box
3. Press **Enter** or click **Send**
4. Watch the delivery status:
   - ⏳ **Pending** (orange) - Transaction submitted
   - ✅ **Confirmed** (green) - On-chain confirmed
   - ❌ **Failed** (red) - Will auto-retry

**✅ What to Check:**
- Message appears immediately (optimistic UI)
- Status badge shows current state
- Message is encrypted (inspect network tab)
- Retry happens automatically on failure

---

## 🎭 Step 5: Test Group Aliases (Wave 4)

### Set an Alias

1. Open group settings (click group name)
2. Click **"Set Alias"**
3. Enter a different name (e.g., "Anonymous")
4. Choose different avatar
5. Save

**✅ What to Check:**
- Your name in this group changes
- Other groups still show original name
- Alias stored locally

### Toggle Identity Disclosure

1. Open group settings
2. Toggle **"Reveal Identity"**
3. Watch your name change between alias and real name

**✅ What to Check:**
- Toggle works smoothly
- Name updates in real-time
- Privacy preference saved

---

## 🔐 Step 6: Test Forward Secrecy (Wave 5)

### Automatic Key Rotation

Forward secrecy keys rotate automatically after:
- **1000 messages** sent
- **7 days** elapsed
- **New member** joins group
- **Member** leaves group

**To test quickly:**

1. Open browser console (F12)
2. Check for key rotation logs:
   ```
   ✓ Forward secrecy initialized for group: grp123
   ✓ Key rotated successfully. New generation: 1
   ```

### Manual Key Backup

1. Open **Settings** → **Security**
2. Click **"Backup Keys"**
3. Enter a strong master password
4. Download encrypted key bundle
5. Store securely (offline recommended)

**✅ What to Check:**
- Backup file downloads
- File is encrypted (can't read plaintext)
- Backup includes all group keys

---

## 🧪 Step 7: Test Error Handling

### Test Transaction Rejection

1. Try to send a message
2. **Reject** the transaction in your wallet
3. Observe graceful error handling

**✅ What to Check:**
- User-friendly error message
- Option to retry
- No crash or frozen UI

### Test Network Disconnection

1. Disconnect internet
2. Try to send message
3. Reconnect internet

**✅ What to Check:**
- Error shows network issue
- Messages queue locally
- Auto-send when reconnected

### Test Error Boundary

1. Open browser console
2. Force an error (if you know React DevTools)
3. Or wait for any unexpected bug

**✅ What to Check:**
- Error boundary catches it
- Beautiful error screen shows
- Option to reload app
- No white screen of death

---

## 📊 Step 8: Verify Performance

### Check Encryption Speed

1. Open browser console (F12)
2. Send a message
3. Look for timing logs:
   ```
   Encryption: 3ms
   Transaction: 250ms
   ```

**✅ Target Performance:**
- Encryption: < 5ms
- Key rotation: < 50ms
- UI: 60 FPS animations

### Check Bundle Size

```bash
npm run build
```

**✅ Target:**
- Bundle size: ~350KB gzipped
- First load: < 2 seconds

---

## 🔍 Troubleshooting

### Wallet Won't Connect

**Problem**: Wallet connection fails
**Solution**:
1. Ensure Leo/Puzzle Wallet extension installed
2. Check you're on Testnet (not Mainnet)
3. Try refreshing the page
4. Clear browser cache if needed

### Transaction Stuck Pending

**Problem**: Message shows ⏳ for > 60 seconds
**Solution**:
1. This is normal on Aleo Testnet (can take 10-30s)
2. Check Aleo network status
3. If > 2 minutes, it will auto-retry
4. Check wallet for failed transaction

### Messages Not Decrypting

**Problem**: Messages show as encrypted gibberish
**Solution**:
1. Check you're in the correct group
2. Verify encryption key exists
3. Clear cache and reload
4. Re-initialize group if needed

### Keys Not Rotating

**Problem**: No key rotation after 1000 messages
**Solution**:
1. Check rotation policy in settings
2. Rotation happens automatically (may take a moment)
2. Look for rotation events in console
3. Verify policy: `maxMessages: 1000`

---

## 🎓 What to Demo

### For Judges/Reviewers

**Show them:**

1. **Real Wallet Integration** (Wave 2)
   - Connect Leo Wallet
   - Session persistence on reload
   - Network detection

2. **On-Chain Messaging** (Wave 3)
   - Send message with status tracking
   - Show transaction ID on blockchain
   - Demonstrate auto-retry

3. **Profile System** (Wave 4)
   - Create profile with alias
   - Toggle identity disclosure
   - Different identities per group

4. **Forward Secrecy** (Wave 5)
   - Explain automatic key rotation
   - Show key generation incrementing
   - Demonstrate key backup

5. **Privacy Guarantees**
   - Inspect network tab (only encrypted data)
   - Show blockchain explorer (only proofs visible)
   - Explain zero-knowledge membership

---

## 📱 Testing Checklist

Use this checklist for comprehensive testing:

### Wallet (Wave 2)
- [ ] Connect wallet successfully
- [ ] Disconnect wallet
- [ ] Session persists on reload
- [ ] Network detection works
- [ ] Switch accounts (wallet)
- [ ] Handle rejected connections

### Messaging (Wave 3)
- [ ] Create group (blockchain tx)
- [ ] Send message
- [ ] Receive message
- [ ] Status tracking works
- [ ] Failed message retries
- [ ] Pagination (50+ messages)

### Profiles (Wave 4)
- [ ] Create profile
- [ ] Update profile
- [ ] Set group alias
- [ ] Toggle identity disclosure
- [ ] View other profiles
- [ ] Profile caching works

### Forward Secrecy (Wave 5)
- [ ] Keys initialize
- [ ] Messages encrypt/decrypt
- [ ] Key rotation (1000 msgs)
- [ ] Key rotation (member join)
- [ ] Old keys archived
- [ ] Key backup/restore

### UI/UX
- [ ] Animations smooth (60 FPS)
- [ ] Mobile responsive
- [ ] Error boundaries work
- [ ] Loading states show
- [ ] Toast notifications appear

---

## 🚀 Build for Production

When ready to deploy:

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview

# Bundle will be in: frontend/dist/
```

---

## 📞 Need Help?

**Check these files:**
- **README_WAVE5.md** - Complete documentation
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **docs/ARCHITECTURE.md** - Architecture deep dive

**Common Issues:**
- Wallet not connecting → Check extension installed
- Transaction failing → Check Testnet credits
- Keys not rotating → Check console for errors
- UI not loading → Run `npm install` again

---

## 🎉 You're Ready!

**Your EncryptedSocial app is now running with:**
- ✅ Real Aleo wallet integration
- ✅ On-chain encrypted messaging
- ✅ User profiles with aliases
- ✅ Forward secrecy & key rotation
- ✅ Beautiful, production-ready UI

**Go build the private internet!** 🚀

---

**Questions?** Check the documentation or inspect the code - everything is well-commented!

*"Prove everything. Reveal nothing."* 🔐
