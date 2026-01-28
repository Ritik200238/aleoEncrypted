# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

- [ ] Aleo wallet with testnet credits (get from [faucet.aleo.org](https://faucet.aleo.org))
- [ ] Leo CLI installed (for contract compilation)
- [ ] Node.js 18+ (for frontend)
- [ ] Git (for version control)

## Quick Deploy (5 Minutes)

### Step 1: Fund Wallet (2 minutes)

1. Go to https://faucet.aleo.org
2. Enter your Aleo address
3. Complete captcha
4. Wait for credits (usually 30-60 seconds)
5. Verify balance: Should have ~10 credits

### Step 2: Deploy Contract (2 minutes)

```bash
cd leo/group_membership

# Build contract
leo build

# Deploy to testnet
leo deploy --network testnet

# Save the program ID shown in output
```

**Expected Output**:
```
✅ Compiled 'group_membership.aleo'
📡 Deploying to testnet...
✅ Deployed! Program ID: group_membership.aleo
🔗 https://explorer.aleo.org/transaction/at1xxxxx
```

### Step 3: Test Contract (1 minute)

```bash
# Test create_group transition
leo run create_group \
    "12345field" \
    "67890field" \
    4u8

# Should output success and transaction ID
```

### Step 4: Run Frontend

```bash
cd ../../frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## Detailed Deployment

### Contract Deployment

#### Option 1: Leo CLI (Recommended)

```bash
cd leo/group_membership

# Clean previous builds
rm -rf build/

# Build contract
leo build

# Check build output
ls -la build/

# Deploy to testnet
export ALEO_PRIVATE_KEY="your_private_key_here"
leo deploy --network testnet --fee 2000000

# Wait for confirmation (30-60 seconds)
```

#### Option 2: Provable SDK

```javascript
import { Account, ProgramManager } from '@provablehq/sdk';

// Load account
const account = new Account(privateKey);

// Read contract
const programCode = fs.readFileSync('leo/group_membership/build/main.aleo', 'utf8');

// Deploy
const programManager = new ProgramManager();
const txId = await programManager.deploy(programCode, 2000000);

console.log('Deployed:', txId);
```

### Frontend Deployment

#### Local Development

```bash
cd frontend
npm install
npm run dev
```

#### Production Build

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to hosting (Vercel/Netlify/etc)
vercel deploy
# or
netlify deploy
```

#### Environment Configuration

Create `.env` file:

```env
VITE_PROGRAM_ID=group_membership.aleo
VITE_NETWORK=testnet
VITE_RPC_URL=https://api.explorer.provable.com/v1
```

## Verification

### Contract Verification

1. **Check Explorer**:
   - Go to https://explorer.aleo.org
   - Search for your transaction ID
   - Verify status is "Confirmed"

2. **Test Transitions**:
```bash
# Test each transition
leo run create_group "group1" "root123" 5u8
leo run verify_membership ...
leo run submit_feedback ...
```

3. **Query Mappings**:
```bash
# Check if group exists
leo run get_feedback_count "group1"
```

### Frontend Verification

1. **Wallet Connection**:
   - Click "Connect Wallet"
   - Should see Aleo wallet popup
   - Address should appear after connection

2. **Create Organization**:
   - Add test addresses
   - Click "Create Organization"
   - Should see transaction on explorer

3. **Submit Feedback**:
   - Select organization
   - Verify membership (should show ✅)
   - Submit feedback
   - Check transaction on explorer

4. **View Feedback**:
   - Should see submitted feedback
   - Verification badge should show
   - Technical details should be accurate

## Troubleshooting

### Leo Compilation Errors

**Error**: `leo: command not found`

**Solution**:
```bash
# Install Leo
curl -L https://install.leo-lang.org | bash
source ~/.bashrc
leo --version
```

**Error**: `Compilation failed`

**Solution**:
- Check Leo syntax in main.leo
- Ensure Leo version is 3.4+
- Clean build directory: `rm -rf build/`

### Deployment Errors

**Error**: `Insufficient credits`

**Solution**:
- Check balance: `leo account balance`
- Get more credits from faucet
- Reduce deployment fee

**Error**: `Network timeout`

**Solution**:
- Check internet connection
- Try different RPC endpoint
- Wait and retry (network congestion)

**Error**: `Program already exists`

**Solution**:
- Program IDs are globally unique
- Change program name in program.json
- Or use existing deployment

### Wallet Connection Issues

**Error**: Wallet not detected

**Solution**:
- Install Leo Wallet extension
- Refresh page
- Check browser compatibility (Chrome/Firefox)

**Error**: Transaction fails

**Solution**:
- Check wallet has credits
- Verify network is testnet
- Check console for error details

### Frontend Build Errors

**Error**: `Module not found`

**Solution**:
```bash
rm -rf node_modules
npm install
```

**Error**: TypeScript errors

**Solution**:
- Check import paths
- Update type definitions
- Run `npm run type-check`

## Performance Optimization

### Contract Optimization

1. **Reduce Constraint Count**:
   - Minimize loops in transitions
   - Use efficient hash functions
   - Batch operations when possible

2. **Gas Optimization**:
   - Profile transitions: `leo build --profile`
   - Optimize mapping usage
   - Cache computed values

### Frontend Optimization

1. **Merkle Tree Caching**:
```typescript
// Cache tree for reuse
const treeCache = new Map<string, MerkleTree>();

function getOrCreateTree(members: string[]) {
    const key = members.join(',');
    if (!treeCache.has(key)) {
        treeCache.set(key, new MerkleTree(members));
    }
    return treeCache.get(key);
}
```

2. **Proof Generation Optimization**:
```typescript
// Generate proofs in parallel
const proofs = await Promise.all(
    members.map(m => tree.generateProof(m))
);
```

## Security Checklist

Before production deployment:

- [ ] Private keys stored securely (environment variables, key vault)
- [ ] Frontend uses HTTPS
- [ ] Wallet adapter properly configured
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all user inputs
- [ ] Nullifier seeds generated with crypto-secure RNG
- [ ] Admin credentials protected
- [ ] Member list stored securely (encrypted at rest)

## Monitoring

### Contract Monitoring

```bash
# Check transaction status
curl https://api.explorer.provable.com/v1/transaction/{txId}

# Monitor program state
leo run get_feedback_count "group1"
```

### Frontend Monitoring

Use analytics to track:
- Wallet connection success rate
- Transaction submission rate
- Error rates
- Page load times
- User flow completion

### Logging

```typescript
// Structured logging
console.log({
    event: 'feedback_submitted',
    groupId: groupId,
    txId: txId,
    timestamp: Date.now(),
});
```

## Backup and Recovery

### Contract State

- On-chain state is immutable and permanent
- No backup needed (blockchain is the backup)
- Save transaction IDs for verification

### Off-Chain Data

```bash
# Backup member lists
tar -czf members-backup.tar.gz organizations/

# Backup credentials (encrypted)
gpg -c credentials.json

# Store securely (NOT in git repo!)
```

### Recovery Plan

1. Contract cannot be recovered if lost (blockchain is source of truth)
2. Member lists can be restored from backup
3. Credentials must be reissued if lost
4. Frontend can be redeployed from git

## Maintenance

### Updating Contracts

```bash
# Deploy new version with different name
leo deploy --network testnet --program group_membership_v2.aleo

# Migrate data if needed (manual process)
# Update frontend to use new program ID
```

### Updating Frontend

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Rebuild and deploy
npm run build
vercel deploy --prod
```

### Monitoring Contract Usage

```bash
# Check feedback count
leo run get_feedback_count "group1"

# View transaction history
curl https://api.explorer.provable.com/v1/program/group_membership.aleo/transactions
```

## Cost Estimation

### Deployment Costs

| Operation | Credits | USD Equivalent* |
|-----------|---------|-----------------|
| Deploy Contract | 2-3 | ~$2-3 |
| Create Group | 0.001 | ~$0.001 |
| Submit Feedback | 0.003 | ~$0.003 |
| Verify Membership | 0.002 | ~$0.002 |

\* Testnet credits are free; mainnet pricing may vary

### Hosting Costs

- Frontend: Free (Vercel/Netlify free tier)
- Domain: ~$10/year (optional)
- Analytics: Free (Plausible/Umami)

**Total Monthly Cost**: < $1 (excluding mainnet credits)

## Production Checklist

Before going live:

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Documentation reviewed
- [ ] Error handling tested
- [ ] Performance benchmarks met
- [ ] User acceptance testing done
- [ ] Privacy policy published
- [ ] Terms of service reviewed
- [ ] Support channels established
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Disaster recovery plan documented

---

## Quick Reference

### Useful Commands

```bash
# Build contract
leo build

# Deploy contract
leo deploy --network testnet

# Run transition
leo run <transition_name> <args>

# Check wallet balance
leo account balance

# Frontend dev server
npm run dev

# Frontend production build
npm run build
```

### Useful Links

- **Aleo Explorer**: https://explorer.aleo.org
- **Testnet Faucet**: https://faucet.aleo.org
- **Leo Documentation**: https://developer.aleo.org/leo
- **Provable SDK**: https://provable.tools

### Support

- GitHub Issues: Create an issue in the repo
- Discord: Join Aleo Discord for community support
- Documentation: Read the full docs in ARCHITECTURE.md and PRIVACY_MODEL.md

---

**Ready to deploy? Follow the Quick Deploy section above!**
