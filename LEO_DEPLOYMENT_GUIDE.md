# Leo Smart Contract Deployment Guide

## 📋 Overview

This guide walks you through deploying the three EncryptedSocial Leo smart contracts to Aleo Testnet.

**Contracts to Deploy:**
1. `group_manager.aleo` - Group creation and member management
2. `membership_proof.aleo` - Zero-knowledge membership verification
3. `message_handler.aleo` - Encrypted message handling

---

## ✅ Prerequisites

### 1. Install Leo CLI

**On Linux/macOS:**
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Clone Leo repository
git clone https://github.com/AleoHQ/leo.git
cd leo

# Install Leo
cargo install --path .

# Verify installation
leo --version
```

**On Windows:**
```powershell
# Install Rust from: https://rustup.rs/

# Clone Leo repository
git clone https://github.com/AleoHQ/leo.git
cd leo

# Install Leo
cargo install --path .

# Verify installation
leo --version
```

### 2. Create Aleo Account

```bash
# Generate new account (creates .env with private key)
leo account new

# Or import existing account
leo account import
```

**Important**: Save your private key and address securely!

### 3. Get Testnet Credits

1. Visit **Aleo Faucet**: https://faucet.aleo.org
2. Enter your Aleo address
3. Click "Request Credits"
4. Wait 1-2 minutes for credits to arrive
5. Verify balance:
   ```bash
   leo account balance --network testnet
   ```

**You need at least 10 credits** to deploy all three contracts.

---

## 🚀 Deployment Steps

### Step 1: Deploy group_manager.aleo

```bash
# Navigate to contract directory
cd /d/buildathon/encrypted-social-aleo/leo/group_manager

# Build contract (verify compilation)
leo build

# Deploy to testnet
leo deploy --network testnet
```

**Expected Output:**
```
✅ Built 'group_manager.aleo'
📤 Deploying 'group_manager.aleo' to testnet...
⏳ Broadcasting transaction...
✅ Deployed! Program ID: group_manager_abc123.aleo
💰 Fee: 1.234 credits
🔗 Transaction: at1...
```

**Save the Program ID!** You'll need it later.

---

### Step 2: Deploy membership_proof.aleo

```bash
# Navigate to contract directory
cd ../membership_proof

# Build contract
leo build

# Deploy to testnet
leo deploy --network testnet
```

**Expected Output:**
```
✅ Built 'membership_proof.aleo'
📤 Deploying 'membership_proof.aleo' to testnet...
✅ Deployed! Program ID: membership_proof_xyz789.aleo
💰 Fee: 1.145 credits
```

**Save the Program ID!**

---

### Step 3: Deploy message_handler.aleo

```bash
# Navigate to contract directory
cd ../message_handler

# Build contract
leo build

# Deploy to testnet
leo deploy --network testnet
```

**Expected Output:**
```
✅ Built 'message_handler.aleo'
📤 Deploying 'message_handler.aleo' to testnet...
✅ Deployed! Program ID: message_handler_def456.aleo
💰 Fee: 1.567 credits
```

**Save the Program ID!**

---

## 🔧 Update Frontend Configuration

After deploying, update the program IDs in your frontend code.

### Update aleoWalletService.ts

Open: `frontend/src/services/aleoWalletService.ts`

Find this section:
```typescript
// Program addresses on Aleo Testnet (to be updated after deployment)
private readonly PROGRAM_IDS = {
  GROUP_MANAGER: 'group_manager_v1.aleo',
  MEMBERSHIP_PROOF: 'membership_proof_v1.aleo',
  MESSAGE_HANDLER: 'message_handler_v1.aleo',
};
```

**Replace with your deployed program IDs:**
```typescript
private readonly PROGRAM_IDS = {
  GROUP_MANAGER: 'group_manager_abc123.aleo',        // ← Your Program ID
  MEMBERSHIP_PROOF: 'membership_proof_xyz789.aleo',  // ← Your Program ID
  MESSAGE_HANDLER: 'message_handler_def456.aleo',    // ← Your Program ID
};
```

**Save the file** and restart your development server.

---

## ✅ Verify Deployment

### Method 1: Aleo Explorer

1. Visit: https://explorer.aleo.org
2. Search for your program ID (e.g., `group_manager_abc123.aleo`)
3. Verify:
   - ✅ Program exists
   - ✅ All transitions visible
   - ✅ Mappings listed

### Method 2: Leo CLI

```bash
# Check program info
leo program info group_manager_abc123.aleo --network testnet

# Query a mapping
leo mapping get group_merkle_roots <group_id> \
  --program group_manager_abc123.aleo \
  --network testnet
```

### Method 3: Test Transaction

```bash
# Create a test group
leo run create_group 12345field \
  --program group_manager_abc123.aleo \
  --network testnet
```

---

## 🧪 Testing Deployed Contracts

### Test 1: Create Group

```bash
cd leo/group_manager

# Execute create_group transition
leo execute create_group 12345field \
  --network testnet \
  --broadcast
```

**Expected**: Group created on-chain, merkle root stored in mapping

### Test 2: Verify Membership

```bash
cd ../membership_proof

# Test membership verification (dry run)
leo run verify_membership \
  <member_commitment> \
  <merkle_root> \
  <path_0> ... <path_7> \
  <index_0> ... <index_7>
```

### Test 3: Send Message

```bash
cd ../message_handler

# Send a test message
leo execute send_message_simple \
  <group_id> \
  <encrypted_content> \
  <member_commitment> \
  1u64 \
  --network testnet \
  --broadcast
```

---

## 🐛 Troubleshooting

### Error: "Insufficient funds"

**Problem**: Not enough credits to deploy
**Solution**:
```bash
# Check balance
leo account balance --network testnet

# Get more credits from faucet
# Visit: https://faucet.aleo.org
```

### Error: "Program already exists"

**Problem**: Program name collision
**Solution**:
```leo
// In main.leo, change program name:
program group_manager_v2.aleo {  // Add version suffix
    // ...
}
```

### Error: "Transaction timed out"

**Problem**: Network congestion
**Solution**:
- Wait a few minutes and try again
- Increase fee: `leo deploy --network testnet --fee 2.0`

### Error: "Invalid private key"

**Problem**: Wrong account credentials
**Solution**:
```bash
# Check .env file has correct private key
cat .env

# Or re-import account
leo account import
```

### Error: "Build failed"

**Problem**: Syntax error in Leo code
**Solution**:
```bash
# Check error message
leo build

# Fix syntax errors
# Common issues:
# - Missing semicolons
# - Type mismatches
# - Invalid field operations
```

---

## 💰 Deployment Costs

**Estimated Fees (Testnet):**
- `group_manager.aleo`: ~1.2 credits
- `membership_proof.aleo`: ~1.1 credits
- `message_handler.aleo`: ~1.5 credits
- **Total**: ~3.8 credits

**Mainnet Estimate** (when available):
- Costs will be higher
- Budget 10-15 credits per contract
- Depends on contract complexity

---

## 📊 Post-Deployment Checklist

- [ ] All three contracts deployed successfully
- [ ] Program IDs saved in secure location
- [ ] Frontend updated with new program IDs
- [ ] Test transactions executed successfully
- [ ] Explorer shows contracts correctly
- [ ] Mappings accessible via queries
- [ ] Remaining testnet credits noted

---

## 🔄 Updating Contracts

If you need to update contracts after deployment:

### Option 1: Deploy New Version

```bash
# Change program name in main.leo
program group_manager_v2.aleo {
    // Your updated code
}

# Deploy new version
leo deploy --network testnet

# Update frontend to use v2
```

### Option 2: Re-deploy to Mainnet

When mainnet launches:
```bash
# Same process, different network
leo deploy --network mainnet
```

**Note**: Once deployed, contracts are immutable on Aleo. You cannot modify deployed code.

---

## 🔐 Security Considerations

### Before Deploying to Mainnet:

1. **Audit Smart Contracts**
   - Review all Leo code
   - Test edge cases
   - Check for vulnerabilities

2. **Test Thoroughly on Testnet**
   - Run all transitions
   - Try to break things
   - Verify privacy guarantees

3. **Backup Private Keys**
   - Store securely offline
   - Use hardware wallet if available
   - Never commit to git

4. **Document Program IDs**
   - Keep record of all deployments
   - Share with frontend team
   - Publish for transparency

5. **Monitor Contracts**
   - Watch for unexpected behavior
   - Track transaction volume
   - Check mapping values

---

## 📚 Additional Resources

**Leo Documentation:**
- Deployment Guide: https://developer.aleo.org/leo/deployment
- CLI Reference: https://developer.aleo.org/leo/cli

**Aleo Testnet:**
- Faucet: https://faucet.aleo.org
- Explorer: https://explorer.aleo.org
- Network Status: https://status.aleo.org

**Community:**
- Discord: https://discord.gg/aleo
- Forum: https://community.aleo.org
- GitHub: https://github.com/AleoHQ/leo

---

## 🎯 Next Steps After Deployment

1. **Test End-to-End**
   - Connect frontend to deployed contracts
   - Create groups via UI
   - Send real messages on testnet

2. **Monitor Performance**
   - Track transaction times
   - Measure proof generation
   - Optimize if needed

3. **Prepare for Demo**
   - Record deployment process
   - Show live transactions on explorer
   - Demonstrate privacy features

4. **Document Deployment**
   - Update README with program IDs
   - Add deployment date/version
   - Note any issues encountered

---

## 🎉 Congratulations!

You've successfully deployed EncryptedSocial's Leo smart contracts to Aleo Testnet!

Your contracts are now:
- ✅ **Live on blockchain** - Anyone can interact
- ✅ **Verifiable** - All code is public
- ✅ **Immutable** - Cannot be changed
- ✅ **Privacy-preserving** - ZK proofs protect users

**Your dApp is now truly decentralized!** 🚀

---

**Quick Reference:**

```bash
# Deploy all contracts
cd leo/group_manager && leo deploy --network testnet
cd ../membership_proof && leo deploy --network testnet
cd ../message_handler && leo deploy --network testnet

# Update frontend
# Edit: frontend/src/services/aleoWalletService.ts
# Replace PROGRAM_IDS with deployed addresses

# Test
npm run dev
# Connect wallet, create group, send message!
```

---

**Need Help?**
- Check **ALEO_RESOURCES.md** for learning materials
- Join **Aleo Discord** #developers channel
- Review **docs/ARCHITECTURE.md** for technical details

*"Prove everything. Reveal nothing."* 🔐
