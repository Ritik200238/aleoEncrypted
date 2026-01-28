# 🚀 DEPLOY TO ALEO TESTNET - EXECUTE NOW

## ⚡ FAST DEPLOYMENT (5 Minutes)

### Step 1: Generate Account (30 seconds)
```bash
cd D:\buildathon\encrypted-social-aleo
node -e "const {Account} = require('@provablehq/sdk'); const acc = new Account(); console.log('PRIVATE_KEY=' + acc.privateKey()); console.log('ADDRESS=' + acc.address());"
```

**Save the output!** You'll need it.

---

### Step 2: Fund Account (2 minutes)
1. Go to: **https://faucet.aleo.org**
2. Enter your ADDRESS (from above)
3. Complete verification
4. Wait for credits (~30 seconds)

**You need ~10 Aleo credits** (each contract ~3 credits)

---

### Step 3: Deploy All Contracts (3 minutes)
```bash
# Set your private key
set ALEO_PRIVATE_KEY=<your_private_key_from_step1>

# Deploy all 4 contracts
node deploy-all-contracts.mjs
```

This deploys:
- ✅ group_manager.aleo
- ✅ membership_proof.aleo
- ✅ message_handler.aleo
- ✅ user_registry.aleo

**Output:** `deployment-results.json` with all transaction IDs

---

### Step 4: Verify on Explorer (1 minute)
Check transactions at: **https://explorer.aleo.org**

Search for your transaction IDs from `deployment-results.json`

---

## 🎯 ALTERNATIVE: Use Existing Funded Account

If you already have a funded Aleo account:

```bash
set ALEO_PRIVATE_KEY=APrivateKey1zkp...
node deploy-all-contracts.mjs
```

---

## ⚠️ IMPORTANT NOTES

**If testnet is down:**
- Check status: https://explorer.aleo.org
- Try alternative RPC endpoints (script has fallbacks)
- Document the attempt for judges (they understand testnet issues)

**Fallback strategy:**
- App works in **demo mode** without deployment
- Judges can test functionality locally
- Show compiled contracts as proof of work

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] Account generated and saved
- [ ] Account funded with 10+ credits
- [ ] Private key set in environment
- [ ] deploy-all-contracts.mjs executed
- [ ] All 4 contracts deployed successfully
- [ ] Transaction IDs saved in deployment-results.json
- [ ] Verified on explorer.aleo.org
- [ ] Frontend config updated with program IDs

---

## 🔥 EXECUTE RIGHT NOW

**This is the CRITICAL step for winning the buildathon!**

Deployed contracts = **10-15 extra points** from judges.

Run the commands above **NOW** while agents complete other work.
