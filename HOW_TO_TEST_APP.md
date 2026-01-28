# 🧪 How to Test Your Anonymous Group Verifier App

## What You Built

You have a **WEB APPLICATION**, not a desktop .exe app.

Your app has 2 parts:
1. **Smart Contract** (blockchain backend) - Ready to deploy
2. **React Frontend** (web UI) - Ready to test in browser

---

## 🌐 Test the Frontend (Web UI)

### Step 1: Start Development Server

Open terminal and run:

```bash
cd /d/buildathon/encrypted-social-aleo/frontend
npm run dev
```

### Step 2: Open in Browser

The terminal will show:
```
  ➜  Local:   http://localhost:5173/
```

**Open that URL in your browser** (Edge, Chrome, etc.)

### Step 3: Test the UI

You'll see 3 pages:

1. **Create Organization** (Admin creates group)
   - Add employee addresses
   - Generate Merkle tree
   - See the Merkle root

2. **Submit Feedback** (Employee submits anonymously)
   - Connect wallet (requires deployment first)
   - Generate ZK proof
   - Submit feedback

3. **View Feedback** (Public view)
   - See all submitted feedback
   - Verify ZK proofs

---

## 📁 Frontend Files Location

```
D:\buildathon\encrypted-social-aleo\frontend\
├── src/
│   ├── pages/
│   │   ├── CreateOrganization.tsx    <- Create org page
│   │   ├── SubmitFeedback.tsx        <- Submit feedback page
│   │   └── ViewFeedback.tsx          <- View feedback page
│   ├── services/
│   │   └── groupMembershipService.ts <- Blockchain integration
│   ├── lib/
│   │   └── merkle.ts                 <- Merkle tree logic
│   └── App.tsx                       <- Main app
└── package.json
```

---

## 🔗 Smart Contract Files

```
D:\buildathon\encrypted-social-aleo\leo\group_membership\
├── src/
│   └── main.leo                      <- Smart contract code (363 lines)
├── build/
│   └── main.aleo                     <- Compiled contract
└── .env                              <- Deployment config
```

---

## ⚙️ Full Testing Flow

### A. Test Frontend Locally (Without Blockchain)

```bash
# Start frontend
cd /d/buildathon/encrypted-social-aleo/frontend
npm run dev

# Open http://localhost:5173
```

**What works**:
- ✅ UI components render
- ✅ Merkle tree generation
- ✅ Form inputs
- ✅ Navigation

**What doesn't work yet**:
- ❌ Wallet connection (needs deployed contract)
- ❌ Blockchain transactions (needs deployed contract)

### B. Test After Deployment (Full Functionality)

**First deploy the contract**, then:

1. **Update frontend config** with deployed contract address
2. **Connect Leo Wallet** in browser
3. **Test full flow**:
   - Create organization (sends blockchain tx)
   - Issue credentials
   - Submit feedback with ZK proof
   - View verified feedback

---

## 🎥 What to Test Now (Pre-Deployment)

### Test 1: UI Components
```bash
cd /d/buildathon/encrypted-social-aleo/frontend
npm run dev
```
- Open http://localhost:5173
- Check all 3 pages load
- Fill out forms
- See if UI looks good

### Test 2: Merkle Tree Generation
- Go to "Create Organization" page
- Add some test addresses like:
  ```
  aleo1test1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  aleo1test2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  aleo1test3xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- Click "Generate Merkle Tree"
- See the Merkle root displayed

### Test 3: Code Review
- Open files in VS Code
- Review the Leo contract: `leo/group_membership/src/main.leo`
- Review frontend: `frontend/src/pages/CreateOrganization.tsx`

---

## 🚀 After Deployment

Once you deploy the contract:

1. Contract will be live on Aleo testnet
2. You can connect your Leo Wallet to the frontend
3. You can submit real transactions
4. You can generate real ZK proofs
5. Everything will work end-to-end

---

## 📊 What You're Testing

Your app demonstrates:

✅ **Anonymous feedback system** like Glassdoor
✅ **Zero-knowledge proofs** for group membership
✅ **Merkle trees** for privacy (8 levels, 256 members)
✅ **Nullifiers** to prevent double-voting
✅ **Real cryptography** (not fake ZK)

**Use case**: Employees can submit anonymous company feedback with cryptographic proof they work there, without revealing who they are.

---

## 🔧 Troubleshooting

**Issue**: `npm run dev` doesn't work
- **Solution**: Make sure you ran `npm install --legacy-peer-deps` first

**Issue**: Port 5173 already in use
- **Solution**: Kill the process or use different port: `npm run dev -- --port 3000`

**Issue**: Can't connect wallet
- **Solution**: Normal! Wallet connection only works after contract deployment

**Issue**: "Module not found" errors
- **Solution**: Run `npm install --legacy-peer-deps` again

---

## 💡 Summary

- ❌ **No .exe file** - You built a web app, not desktop app
- ✅ **Test frontend**: Run `npm run dev` and open browser
- ✅ **Test contract**: Deploy it first (need your private key)
- ✅ **Full test**: After deployment, connect wallet and test live

**Start here**: `cd /d/buildathon/encrypted-social-aleo/frontend && npm run dev`

