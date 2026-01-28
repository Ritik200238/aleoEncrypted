# User Registry & Search - Quick Start Guide

Get started with user registry and search features in 5 minutes.

## Prerequisites

- Aleo wallet installed (Leo Wallet or Puzzle Wallet)
- Node.js 18+ installed
- Leo compiler (optional, for contract deployment)

## Quick Start (3 Steps)

### 1. Run Frontend

```bash
cd /d/buildathon/encrypted-social-aleo/frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open browser to `http://localhost:5173`

### 2. Connect Wallet

Click "Connect Wallet" button and authorize connection.

### 3. Try Features

**Option A: Use Demo Data (Instant)**
```typescript
// In browser console:
await window.userRegistryService.initializeDemoProfiles();
```

Now search for `@alice`, `@bob`, or `@carol`

**Option B: Register Your Profile**
1. Fill out registration form
2. Choose unique @handle
3. Submit to register on-chain
4. Search for other users

## Component Usage

### Use UserSearch Component

```tsx
import { UserSearch } from './components/UserSearch';

function App() {
  return (
    <UserSearch
      onUserSelect={(profile) => {
        console.log('Selected:', profile);
      }}
      onAddContact={(profile) => {
        console.log('Added to contacts:', profile);
      }}
      showAddButton={true}
    />
  );
}
```

### Use ProfileRegistration Component

```tsx
import { ProfileRegistration } from './components/ProfileRegistration';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';

function App() {
  const { publicKey } = useWallet();

  return (
    <ProfileRegistration
      walletAddress={publicKey.toString()}
      onSuccess={(profile) => {
        console.log('Profile registered:', profile);
      }}
    />
  );
}
```

### Use Service Directly

```typescript
import { userRegistryService } from './services/userRegistryService';

// Search by handle
const profile = await userRegistryService.searchByHandle('@alice');

// Register profile
const newProfile = await userRegistryService.registerProfile({
  handle: '@myhandle',
  name: 'My Name',
  avatar: 'https://...',
  bio: 'My bio'
});

// Search cached profiles
const results = await userRegistryService.searchCachedProfiles('query');
```

## Run Example App

```bash
cd frontend

# The example is already in the app
npm run dev

# Or import in your component:
import { UserRegistryExample } from './examples/UserRegistryExample';
```

## Features Available

✅ **Search Users**
- Search by @handle
- Debounced queries (300ms)
- Real-time validation
- Add to contacts

✅ **Register Profile**
- Unique handle checking
- Profile encryption
- On-chain storage
- Avatar support

✅ **Contact Management**
- Add users to contacts
- View contact list
- Search contacts

✅ **Local Caching**
- IndexedDB storage
- Fast lookups
- Offline-capable

## Demo Data

Initialize demo profiles for testing:

```typescript
await userRegistryService.initializeDemoProfiles();
```

This creates:
- **@alice** - Alice Johnson (Blockchain developer)
- **@bob** - Bob Smith (ZK proof researcher)
- **@carol** - Carol Williams (Crypto artist)

## API Examples

### Register New User

```typescript
const profile = await userRegistryService.registerProfile({
  handle: '@john',
  name: 'John Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  bio: 'Web3 enthusiast'
});

console.log('Registered:', profile.handle);
console.log('Transaction:', profile.transactionId);
```

### Search Users

```typescript
// By handle
const user = await userRegistryService.searchByHandle('@alice');
if (user) {
  console.log('Found:', user.name);
}

// Search cached
const results = await userRegistryService.searchCachedProfiles('alice');
console.log('Found', results.length, 'users');
```

### Update Profile

```typescript
const updated = await userRegistryService.updateProfile(currentProfile, {
  name: 'New Name',
  bio: 'Updated bio'
});
```

### Check Handle Availability

```typescript
const handleHash = userRegistryService.hashHandle('newuser');
const available = await userRegistryService.isHandleAvailable(handleHash);

if (available) {
  console.log('Handle is available!');
}
```

## Troubleshooting

### Wallet Not Connecting

1. Install Aleo wallet extension
2. Create/import account
3. Refresh page
4. Click connect button

### Search Not Working

1. Initialize demo profiles first
2. Check browser console for errors
3. Verify network connection

### Registration Failing

1. Ensure wallet has testnet credits
2. Check handle format (3-20 chars, alphanumeric + _)
3. Verify handle is available

## Next Steps

1. ✅ Try demo profiles
2. ✅ Register your profile
3. ✅ Search for users
4. ✅ Add contacts
5. 📖 Read full guide: `USER_REGISTRY_GUIDE.md`
6. 🚀 Deploy contract: `leo/user_registry/build.sh`

## File Locations

```
Key Files:
├── frontend/src/
│   ├── services/userRegistryService.ts       # Service layer
│   ├── components/UserSearch.tsx             # Search component
│   ├── components/ProfileRegistration.tsx    # Registration form
│   └── examples/UserRegistryExample.tsx      # Complete example
├── leo/user_registry/src/main.leo            # Smart contract
└── USER_REGISTRY_GUIDE.md                    # Full documentation
```

## Support

- Full Guide: [USER_REGISTRY_GUIDE.md](./USER_REGISTRY_GUIDE.md)
- Implementation: [USER_REGISTRY_IMPLEMENTATION.md](./USER_REGISTRY_IMPLEMENTATION.md)
- Example App: `frontend/src/examples/UserRegistryExample.tsx`

---

**Ready to start!** Just run `npm run dev` and explore the features.
