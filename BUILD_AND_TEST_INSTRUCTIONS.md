# Build and Test Instructions - User Registry

Step-by-step instructions to build and test the user registry features.

## Prerequisites Check

Before starting, ensure you have:

- [ ] Aleo wallet installed (Leo Wallet or Puzzle Wallet)
- [ ] Node.js 18+ (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Leo compiler (optional for contract deployment)

## Build Instructions

### 1. Build Leo Contract (Optional - For Deployment)

**Note**: Leo compiler is only required if you plan to deploy the contract to testnet. For frontend-only testing, skip to step 2.

```bash
# Navigate to contract directory
cd /d/buildathon/encrypted-social-aleo/leo/user_registry

# Check Leo installation
leo --version

# Build contract
leo build

# Expected output:
# ✓ Compiled 'user_registry.aleo'
# Build artifacts in build/
```

**If Leo is not installed**:
```bash
# Install Leo (Unix/Mac)
curl -L https://install.leo-lang.org | bash
source ~/.bashrc

# For Windows, see: https://developer.aleo.org/leo/installation
```

### 2. Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd /d/buildathon/encrypted-social-aleo/frontend

# Install all dependencies
npm install

# Expected output:
# added XXX packages
```

### 3. Build Frontend (Optional - For Production)

```bash
# While in frontend directory

# Development build (recommended for testing)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Test Instructions

### Quick Test (Recommended)

**Fastest way to test all features:**

```bash
cd /d/buildathon/encrypted-social-aleo/frontend

# Start development server
npm run dev

# Server starts at http://localhost:5173
```

Then in browser:

1. **Open**: http://localhost:5173
2. **Open Console**: Press F12 → Console tab
3. **Initialize Demo Data**:
   ```javascript
   await window.userRegistryService.initializeDemoProfiles()
   ```
4. **Test Search**: Search for `@alice`, `@bob`, or `@carol`
5. **Test Add Contact**: Click "Add" button next to a user

### Detailed Testing Steps

#### Test 1: Demo Profile Initialization

```javascript
// In browser console
const service = window.userRegistryService;

// Initialize demo profiles
await service.initializeDemoProfiles();

// Verify profiles were created
const profiles = await service.getCachedProfiles();
console.log('Demo profiles:', profiles.length); // Should be 3
```

#### Test 2: Handle Hashing

```javascript
// Test handle hashing
const hash1 = window.userRegistryService.hashHandle('alice');
console.log('Handle hash:', hash1);

// Should be consistent
const hash2 = window.userRegistryService.hashHandle('@alice');
console.log('Same hash:', hash1 === hash2); // Should be true
```

#### Test 3: Search Functionality

```javascript
// Search by handle
const result = await window.userRegistryService.searchByHandle('@alice');
console.log('Found user:', result);

// Search cached profiles
const results = await window.userRegistryService.searchCachedProfiles('alice');
console.log('Search results:', results);
```

#### Test 4: Profile Registration (Requires Wallet)

```javascript
// Connect wallet first through UI, then:
const profile = await window.userRegistryService.registerProfile({
  handle: '@testuser',
  name: 'Test User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
  bio: 'Testing profile registration'
});

console.log('Registered profile:', profile);
```

### Unit Tests

```bash
cd /d/buildathon/encrypted-social-aleo/frontend

# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Leo Contract Tests

**Only if Leo is installed:**

```bash
cd /d/buildathon/encrypted-social-aleo/leo/user_registry

# Test register_profile transition
leo run register_profile \
  "12345field" \
  "67890field" \
  "11111field"

# Test lookup_handle transition
leo run lookup_handle "12345field"

# Test handle_available transition
leo run handle_available "99999field"
```

## Component Testing

### Test UserSearch Component

1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:5173
3. Look for UserSearch component
4. Test cases:
   - [ ] Search input appears
   - [ ] Type `@alice` → Results appear
   - [ ] Click "Add" button → Contact added
   - [ ] Search `@nonexistent` → "No users found" message
   - [ ] Clear search → Empty state appears

### Test ProfileRegistration Component

1. Disconnect wallet if connected
2. Look for registration form
3. Test cases:
   - [ ] Enter handle `@test` → Availability check runs
   - [ ] Enter invalid handle `ab` → Error message
   - [ ] Enter name → No errors
   - [ ] Avatar URL → Preview appears
   - [ ] Submit form → Transaction initiated (requires wallet)

### Test UserRegistryExample

```bash
# Navigate to example in browser
# http://localhost:5173/examples/user-registry

# Or import in your App.tsx:
import { UserRegistryExample } from './examples/UserRegistryExample';

function App() {
  return <UserRegistryExample />;
}
```

## Integration Testing

### Test Complete Flow

```bash
# 1. Start server
cd /d/buildathon/encrypted-social-aleo/frontend
npm run dev

# 2. Open browser
# http://localhost:5173

# 3. In Console:
await window.userRegistryService.initializeDemoProfiles();

# 4. Test Search UI
# - Type "@alice" in search box
# - Wait 300ms (debounce)
# - Results should appear
# - Click "Add" button
# - Check contact was added

# 5. Test Registration (with wallet)
# - Connect wallet
# - Fill registration form
# - Submit
# - Check transaction submitted
```

## Troubleshooting

### Issue: npm install fails

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Dev server won't start

```bash
# Check if port is in use
lsof -i :5173  # Unix/Mac
netstat -ano | findstr :5173  # Windows

# Use different port
npm run dev -- --port 3000
```

### Issue: Demo profiles not initializing

```javascript
// Check IndexedDB
// In browser console:
await window.userRegistryService.clearCache();
await window.userRegistryService.initializeDemoProfiles();
const profiles = await window.userRegistryService.getCachedProfiles();
console.log('Profiles:', profiles);
```

### Issue: Search not working

```javascript
// Check service is initialized
console.log('Service:', window.userRegistryService);

// Check cache
const cached = await window.userRegistryService.searchCachedProfiles('alice');
console.log('Cached results:', cached);
```

### Issue: Wallet connection fails

1. Ensure wallet extension is installed
2. Refresh page
3. Click connect button again
4. Check browser console for errors

## Performance Testing

### Test Debouncing

```javascript
// In browser console
console.time('search');

// Type quickly (should only trigger once after 300ms)
// In UI: type "@alice" fast

// After results appear:
console.timeEnd('search'); // Should be ~300ms minimum
```

### Test Cache Performance

```javascript
// Initialize profiles
await window.userRegistryService.initializeDemoProfiles();

// First search (cache miss)
console.time('first-search');
await window.userRegistryService.searchCachedProfiles('alice');
console.timeEnd('first-search');

// Second search (cache hit)
console.time('second-search');
await window.userRegistryService.searchCachedProfiles('alice');
console.timeEnd('second-search');

// Second should be faster
```

## Build Verification

### Verify Leo Build

```bash
cd /d/buildathon/encrypted-social-aleo/leo/user_registry

# Check build output exists
ls -la build/

# Should contain:
# - main.aleo (compiled program)
# - program.json (metadata)
```

### Verify Frontend Build

```bash
cd /d/buildathon/encrypted-social-aleo/frontend

# Build for production
npm run build

# Check output
ls -la dist/

# Should contain:
# - index.html
# - assets/ (JS, CSS)

# Test production build
npm run preview
```

## Deployment Testing

### Test Contract Deployment (Requires Leo + Credits)

```bash
cd /d/buildathon/encrypted-social-aleo/leo/user_registry

# Deploy to testnet
leo deploy --network testnet

# Expected output:
# ✓ Deployed 'user_registry.aleo'
# Program ID: user_registry_XXXXX.aleo

# Update frontend with program ID
# Edit: frontend/src/services/userRegistryService.ts
# export const USER_REGISTRY_PROGRAM = 'user_registry_XXXXX.aleo';
```

### Test Frontend Deployment

```bash
cd /d/buildathon/encrypted-social-aleo/frontend

# Build production
npm run build

# Test production build locally
npm run preview

# Deploy to hosting (example with Vercel)
npx vercel --prod

# Or Netlify
npx netlify deploy --prod --dir=dist
```

## Success Criteria

After testing, you should see:

- [x] Demo profiles initialize successfully
- [x] Search finds users by handle
- [x] Add to contacts works
- [x] Registration form validates input
- [x] Handle availability checking works
- [x] Debouncing prevents excessive queries
- [x] Loading states appear during searches
- [x] Error messages display correctly
- [x] Empty states show helpful messages
- [x] UI is responsive and smooth

## Next Steps After Testing

1. **Deploy Contract**:
   ```bash
   cd leo/user_registry
   leo deploy --network testnet
   ```

2. **Update Program ID** in `userRegistryService.ts`

3. **Test on Testnet** with real transactions

4. **Deploy Frontend** to hosting service

5. **Integration Testing** on live deployment

## Support

If you encounter issues:

1. Check browser console for errors
2. Review `USER_REGISTRY_GUIDE.md` for detailed info
3. See `QUICKSTART_USER_REGISTRY.md` for quick reference
4. Check Aleo Discord for help

## Files to Review

- **Service**: `frontend/src/services/userRegistryService.ts`
- **Components**: `frontend/src/components/UserSearch.tsx`
- **Example**: `frontend/src/examples/UserRegistryExample.tsx`
- **Contract**: `leo/user_registry/src/main.leo`

---

**Happy Testing!** 🚀
