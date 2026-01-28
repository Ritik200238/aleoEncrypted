# 🔧 Leo Wallet Connection Fix

## ❌ Error Found:
```
Error: NETWORK_NOT_GRANTED
WalletConnectionError: An unknown error occurred
```

## ✅ How to Fix:

### Step 1: Open Leo Wallet Extension
1. Click on the Leo Wallet extension icon in your browser toolbar
2. If you don't see it, click the puzzle icon (extensions) and find Leo Wallet

### Step 2: Check Network Settings
1. In Leo Wallet, click on **Settings** (gear icon)
2. Look for **Network** settings
3. Make sure **Testnet Beta** is selected
4. If it says "Mainnet", switch to **Testnet**

### Step 3: Grant Permissions
1. In Leo Wallet settings, look for **Permissions** or **Connected Sites**
2. Make sure `localhost:5178` is allowed
3. Grant network access permissions

### Step 4: Alternative - Reset Wallet Connection
1. Open Leo Wallet
2. Go to Settings → Connected Sites
3. Remove `localhost:5178` if it's there
4. Go back to your app
5. Click "Connect Wallet" again
6. Leo Wallet will ask for permissions - **Click "Approve"**

### Step 5: If Still Not Working - Try This:
1. **Reload Leo Wallet Extension:**
   - Go to `edge://extensions/` (or `chrome://extensions/`)
   - Find "Leo Wallet"
   - Click the refresh/reload button
   - Go back to your app and try again

2. **Check Leo Wallet is Unlocked:**
   - Open Leo Wallet
   - Make sure you've entered your password
   - The wallet should show your address

3. **Create/Import Account:**
   - If this is first time using Leo Wallet
   - You need to create a new account or import existing one
   - Follow Leo Wallet setup wizard

## 🎯 Expected Behavior After Fix:

When you click "Connect Wallet" → "Leo Wallet":
1. Leo Wallet popup should open
2. You'll see a permission request
3. Click "Approve" or "Connect"
4. Your app will connect and show profile creation screen

## 🔍 Technical Details:

The error `NETWORK_NOT_GRANTED` means:
- Leo Wallet hasn't granted network access to your app
- This is a security feature
- You need to explicitly approve the connection

## 📱 Quick Test:

After fixing permissions:
1. Refresh the page: `Ctrl + F5`
2. Click "Connect Wallet"
3. Click "Leo Wallet"
4. Approve the connection in the Leo Wallet popup
5. ✅ You should now be connected!

---

**Your app code is 100% correct!** This is just a Leo Wallet permission setup issue.
