# User Registry & Search Features - Complete Guide

Complete implementation of user registry and search features for Encrypted Social on Aleo.

## Table of Contents

1. [Overview](#overview)
2. [Leo Contract](#leo-contract)
3. [Frontend Integration](#frontend-integration)
4. [Components](#components)
5. [Build & Deploy](#build--deploy)
6. [Testing](#testing)
7. [Usage Examples](#usage-examples)

---

## Overview

The User Registry system provides:

- **On-chain Profile Registration**: Register unique @handles with encrypted profile data
- **Privacy-Preserving Storage**: Profiles stored as encrypted fields with commitments
- **Handle Lookup**: Search users by their @handle hash
- **Profile Updates**: Update encrypted profile data while preserving handle
- **Local Caching**: IndexedDB cache for fast lookups
- **Contact Management**: Add discovered users to contacts

### Privacy Model

- Handles stored as BHP256 hashes (not plaintext)
- Profile data encrypted before on-chain storage
- Only the user can decrypt their full profile
- Commitments ensure data integrity without revealing content

---

## Leo Contract

### Location

```
/d/buildathon/encrypted-social-aleo/leo/user_registry/
```

### Structure

```
user_registry/
├── src/
│   └── main.leo          # Main contract logic
├── program.json          # Program metadata
├── build.sh              # Build script
└── README.md             # Contract documentation
```

### Records

```leo
record ProfileRecord {
    owner: address,              // Profile owner
    handle: field,               // BHP256 hash of @username
    encrypted_profile: field,    // Encrypted name + avatar + bio
    profile_commitment: field,   // Cryptographic commitment
    timestamp: u64,              // Registration/update time
}
```

### Mappings

```leo
mapping handles: field => address;                  // Handle hash -> owner
mapping profile_commitments: address => field;      // Owner -> commitment
mapping registration_times: address => u64;         // Owner -> timestamp
```

### Transitions

#### register_profile
Register a new user profile with unique handle.

```leo
transition register_profile(
    public handle: field,              // Hash of @username
    public encrypted_profile: field,   // Encrypted profile data
    public profile_commitment: field   // Commitment for integrity
) -> ProfileRecord
```

#### update_profile
Update existing profile's encrypted data.

```leo
transition update_profile(
    profile_record: ProfileRecord,      // Existing profile
    public new_encrypted_data: field,   // New encrypted data
    public new_commitment: field        // New commitment
) -> ProfileRecord
```

#### lookup_handle
Find user address by handle hash.

```leo
transition lookup_handle(
    public handle: field
) -> address
```

#### verify_profile
Verify profile commitment matches stored value.

```leo
transition verify_profile(
    public user_address: address,
    public expected_commitment: field
) -> bool
```

#### handle_available
Check if handle is available for registration.

```leo
transition handle_available(
    public handle: field
) -> bool
```

---

## Frontend Integration

### Service: userRegistryService.ts

**Location**: `/d/buildathon/encrypted-social-aleo/frontend/src/services/userRegistryService.ts`

#### Key Features

- **Profile Registration**: Register profiles on-chain
- **Profile Updates**: Update encrypted profile data
- **Handle Search**: Search by @handle
- **Local Caching**: IndexedDB for performance
- **Handle Validation**: Check availability and format

#### API

```typescript
// Initialize with wallet
userRegistryService.setWallet(wallet);

// Register new profile
const profile = await userRegistryService.registerProfile({
  handle: '@alice',
  name: 'Alice Johnson',
  avatar: 'https://...',
  bio: 'Blockchain developer'
});

// Update profile
const updated = await userRegistryService.updateProfile(profile, {
  name: 'Alice Smith',
  bio: 'Updated bio'
});

// Search by handle
const user = await userRegistryService.searchByHandle('@alice');

// Get profile by address
const profile = await userRegistryService.getProfileByAddress(address);

// Check handle availability
const available = await userRegistryService.isHandleAvailable(handleHash);

// Search cached profiles
const results = await userRegistryService.searchCachedProfiles('alice');
```

### Types

```typescript
interface UserProfile {
  address: string;
  handle: string;              // Original @username
  handleHash: string;          // BHP256 hash
  name: string;
  avatar: string;
  bio: string;
  encryptedProfile: string;    // Encrypted data
  profileCommitment: string;   // Commitment
  timestamp: number;
  isRegistered: boolean;
  transactionId?: string;
}
```

---

## Components

### 1. UserSearch Component

**Location**: `/d/buildathon/encrypted-social-aleo/frontend/src/components/UserSearch.tsx`

Full-featured user search with debouncing and contact management.

#### Features

- **Debounced Search**: 300ms debounce for optimal performance
- **Real-time Validation**: Instant handle format validation
- **Local Cache First**: Check IndexedDB before on-chain query
- **Add to Contacts**: One-click contact addition
- **Loading States**: Clear feedback during search
- **Error Handling**: User-friendly error messages

#### Usage

```tsx
import { UserSearch } from './components/UserSearch';

<UserSearch
  onUserSelect={(profile) => console.log('Selected:', profile)}
  onAddContact={(profile) => console.log('Added:', profile)}
  showAddButton={true}
  placeholder="Search by @handle..."
/>
```

#### Props

```typescript
interface UserSearchProps {
  onUserSelect?: (profile: UserProfile) => void;
  onAddContact?: (profile: UserProfile) => void;
  onClose?: () => void;
  showAddButton?: boolean;
  placeholder?: string;
}
```

### 2. UserSearchModal Component

Modal version of UserSearch for overlays.

```tsx
import { UserSearchModal } from './components/UserSearch';

<UserSearchModal
  isOpen={showSearch}
  onClose={() => setShowSearch(false)}
  onUserSelect={handleSelect}
  onAddContact={handleAdd}
/>
```

### 3. ProfileRegistration Component

**Location**: `/d/buildathon/encrypted-social-aleo/frontend/src/components/ProfileRegistration.tsx`

Complete profile registration form with validation.

#### Features

- **Real-time Validation**: Handle availability checking
- **Visual Feedback**: Green/red indicators
- **Auto-generated Avatars**: DiceBear integration
- **Character Limits**: Bio limited to 160 chars
- **Error Handling**: Clear error messages

#### Usage

```tsx
import { ProfileRegistration } from './components/ProfileRegistration';

<ProfileRegistration
  walletAddress={publicKey.toString()}
  onSuccess={(profile) => console.log('Registered:', profile)}
  onCancel={() => setShowRegistration(false)}
/>
```

---

## Build & Deploy

### Prerequisites

- Leo compiler installed: https://developer.aleo.org/leo/installation
- Aleo wallet with testnet credits
- Node.js 18+ for frontend

### Build Leo Contract

```bash
cd /d/buildathon/encrypted-social-aleo/leo/user_registry

# Using build script
./build.sh

# Or manually
leo build
```

### Deploy to Testnet

```bash
leo deploy --network testnet
```

After deployment, update the program ID:

```typescript
// frontend/src/services/userRegistryService.ts
export const USER_REGISTRY_PROGRAM = 'user_registry.aleo'; // Update with deployed ID
```

### Build Frontend

```bash
cd /d/buildathon/encrypted-social-aleo/frontend

# Install dependencies
npm install

# Build
npm run build

# Development
npm run dev
```

---

## Testing

### Test Leo Contract

```bash
cd leo/user_registry

# Test registration
leo run register_profile \
  "12345field" \
  "67890field" \
  "11111field"

# Test handle lookup
leo run lookup_handle "12345field"

# Test handle availability
leo run handle_available "12345field"

# Test profile update
leo run update_profile \
  "{owner: aleo1..., handle: 12345field, ...}" \
  "99999field" \
  "22222field"
```

### Test Frontend Components

```tsx
// Example test file
import { render, screen, fireEvent } from '@testing-library/react';
import { UserSearch } from './components/UserSearch';

test('searches users by handle', async () => {
  render(<UserSearch />);

  const input = screen.getByPlaceholderText(/search/i);
  fireEvent.change(input, { target: { value: '@alice' } });

  // Wait for debounced search
  await waitFor(() => {
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });
});
```

### Initialize Demo Data

```typescript
// Initialize demo profiles for testing
await userRegistryService.initializeDemoProfiles();

// Creates 3 demo users:
// - @alice (Alice Johnson)
// - @bob (Bob Smith)
// - @carol (Carol Williams)
```

---

## Usage Examples

### Complete Integration Example

See: `/d/buildathon/encrypted-social-aleo/frontend/src/examples/UserRegistryExample.tsx`

```tsx
import { UserRegistryExample } from './examples/UserRegistryExample';

function App() {
  return <UserRegistryExample />;
}
```

### Basic Usage Flow

```tsx
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { userRegistryService } from './services/userRegistryService';
import { UserSearch, ProfileRegistration } from './components';

function MyApp() {
  const { wallet, publicKey } = useWallet();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (wallet) {
      userRegistryService.setWallet(wallet);
    }
  }, [wallet]);

  useEffect(() => {
    if (publicKey) {
      loadProfile();
    }
  }, [publicKey]);

  const loadProfile = async () => {
    const userProfile = await userRegistryService.getProfileByAddress(
      publicKey.toString()
    );
    setProfile(userProfile);
  };

  if (!profile) {
    return (
      <ProfileRegistration
        walletAddress={publicKey.toString()}
        onSuccess={setProfile}
      />
    );
  }

  return <UserSearch onAddContact={handleAdd} />;
}
```

### Custom Search Integration

```tsx
function CustomSearch() {
  const [results, setResults] = useState<UserProfile[]>([]);

  const search = async (query: string) => {
    const profile = await userRegistryService.searchByHandle(query);
    if (profile) {
      setResults([profile]);
    }
  };

  return (
    <div>
      <input onChange={(e) => search(e.target.value)} />
      {results.map(profile => (
        <div key={profile.address}>{profile.name}</div>
      ))}
    </div>
  );
}
```

---

## API Reference

### UserRegistryService Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `registerProfile(data)` | Register new profile on-chain | `Promise<UserProfile>` |
| `updateProfile(profile, updates)` | Update existing profile | `Promise<UserProfile>` |
| `searchByHandle(handle)` | Search user by @handle | `Promise<UserProfile \| null>` |
| `getProfileByAddress(address)` | Get profile by address | `Promise<UserProfile \| null>` |
| `isHandleAvailable(hash)` | Check handle availability | `Promise<boolean>` |
| `verifyProfile(address, commitment)` | Verify profile commitment | `Promise<boolean>` |
| `searchCachedProfiles(query)` | Search local cache | `Promise<UserProfile[]>` |
| `initializeDemoProfiles()` | Load demo data | `Promise<void>` |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ UserSearch   │  │  Profile     │  │  Contact     │  │
│  │ Component    │  │ Registration │  │  List        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────┐
│            UserRegistryService                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  • Handle Hashing (BHP256)                        │  │
│  │  • Profile Encryption                             │  │
│  │  • Commitment Generation                          │  │
│  │  • Transaction Building                           │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   IndexedDB    │  │  Aleo Wallet    │  │ Leo Contract   │
│   (Cache)      │  │   Adapter       │  │ user_registry  │
└────────────────┘  └─────────────────┘  └────────────────┘
```

---

## Security Considerations

1. **Handle Privacy**: Handles stored as BHP256 hashes
2. **Profile Encryption**: All profile data encrypted client-side
3. **Commitment Integrity**: Cryptographic commitments prevent tampering
4. **Input Validation**: Strict handle format validation
5. **Rate Limiting**: Debounced searches prevent abuse
6. **Cache Security**: Local cache for performance, on-chain for truth

---

## Troubleshooting

### Handle Already Taken

```typescript
// Check availability before registration
const handleHash = userRegistryService.hashHandle('alice');
const available = await userRegistryService.isHandleAvailable(handleHash);

if (!available) {
  // Suggest alternatives
}
```

### Transaction Failed

```typescript
try {
  await userRegistryService.registerProfile(data);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    // Request testnet credits
  }
}
```

### Profile Not Found

```typescript
// Fallback to demo data or registration flow
const profile = await userRegistryService.getProfileByAddress(address);

if (!profile) {
  // Show registration form
  setShowRegistration(true);
}
```

---

## Next Steps

1. **Deploy Contract**: Deploy `user_registry.aleo` to testnet
2. **Update Program ID**: Update ID in `userRegistryService.ts`
3. **Test Integration**: Run example app to test features
4. **Add Features**: Extend with profile pictures, social links, etc.
5. **Production Deploy**: Deploy frontend to hosting service

---

## Support

For questions or issues:
- GitHub Issues: [encrypted-social-aleo/issues](https://github.com/your-repo/issues)
- Discord: [Aleo Discord](https://discord.gg/aleo)
- Docs: [Aleo Developer Docs](https://developer.aleo.org)

---

**Built with Aleo** | **Privacy-First Social Networking**
