# 🔐 Deploy Using Your Leo Wallet Extension

## How Leo Deployment Works

- **Leo CLI** = Uses private key from `.env` file
- **Browser Wallet** = For frontend user interactions (connect wallet, sign transactions)

To deploy with your wallet that has credits, we need to **export your private key** and use it with Leo CLI.

---

## ⚡ OPTION 1: Export Private Key from Wallet (RECOMMENDED)

### Step 1: Export Your Private Key

1. **Open Leo Wallet Extension** in Edge browser
2. Click on **Settings** or **Account Settings**
3. Find **"Export Private Key"** or **"Show Private Key"**
4. Copy your private key (starts with `APrivateKey1...`)

### Step 2: Update Leo Config

Run this command (replace with YOUR private key):

```bash
cd /d/buildathon/encrypted-social-aleo/leo/group_membership

# Update .env file with your wallet's private key
echo "NETWORK=testnet" > .env
echo "ENDPOINT=https://api.explorer.provable.com/v1" >> .env
echo "PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE" >> .env
```

**OR** manually edit the file:
- Open: `D:\buildathon\encrypted-social-aleo\leo\group_membership\.env`
- Change line 3 to your private key:
  ```
  NETWORK=testnet
  ENDPOINT=https://api.explorer.provable.com/v1
  PRIVATE_KEY=APrivateKey1YOUR_ACTUAL_KEY_HERE
  ```

### Step 3: Deploy!

```bash
cd /d/buildathon/encrypted-social-aleo/leo/group_membership && /d/buildathon/leo.exe deploy
```

---

## ⚡ OPTION 2: Transfer Credits to Deployment Address

If you don't want to export your private key, transfer credits to our deployment address:

### Your Current Deployment Address:
```
aleo100rqua0l6cwjnp35vgdfd85t4h9h07dj7zu0f4c0ecwl48re6vyqnhwcv2
```

### Steps:

1. **Open Leo Wallet Extension**
2. Click **"Send"** or **"Transfer"**
3. Enter recipient address:
   ```
   aleo100rqua0l6cwjnp35vgdfd85t4h9h07dj7zu0f4c0ecwl48re6vyqnhwcv2
   ```
4. Enter amount: **35 credits** (to cover 29.58 deployment + buffer)
5. Confirm transaction
6. Wait 1-2 minutes for confirmation

Then run:
```bash
cd /d/buildathon/encrypted-social-aleo/leo/group_membership && /d/buildathon/leo.exe deploy
```

---

## ❓ Which Option Should You Choose?

**OPTION 1 (Export Private Key)**: ✅ FASTER
- Takes 2 minutes
- No transfer fees
- Deploy immediately
- **Recommended for buildathon**

**OPTION 2 (Transfer Credits)**: ⏱️ SLOWER
- Takes 5-10 minutes (wait for transaction)
- Small transfer fee
- Use if you want to keep wallet key private

---

## 🔒 Security Note

**Your private key is sensitive!**

- Don't share it publicly
- Don't commit `.env` file to git (already in `.gitignore`)
- Only use on testnet (not mainnet)
- For buildathon purposes, exporting is safe

---

## 📋 Quick Commands

After updating private key, just run:

```bash
cd /d/buildathon/encrypted-social-aleo/leo/group_membership && /d/buildathon/leo.exe deploy
```

That's it! ✅

