# User Registry Contract

Privacy-preserving user registry for Encrypted Social Network built on Aleo.

## Features

- **Unique Handle Registration**: Register unique @username handles as field hashes
- **Encrypted Profiles**: Store encrypted profile data (name, avatar, bio) on-chain
- **Profile Commitments**: Integrity verification through cryptographic commitments
- **Handle Lookups**: Search users by their handle hash
- **Profile Updates**: Update encrypted profile data while preserving handle

## Build

```bash
cd leo/user_registry
leo build
```

## Deploy

```bash
leo deploy --network testnet
```

## Transitions

### register_profile
Register a new user profile with a unique handle.

**Inputs:**
- `handle: field` - BHP256 hash of @username
- `encrypted_profile: field` - Encrypted profile data
- `profile_commitment: field` - Commitment for integrity

**Returns:** `ProfileRecord`

### update_profile
Update an existing profile's encrypted data.

**Inputs:**
- `profile_record: ProfileRecord` - Existing profile
- `new_encrypted_data: field` - New encrypted data
- `new_commitment: field` - New commitment

**Returns:** `ProfileRecord`

### lookup_handle
Find user address by handle hash.

**Inputs:**
- `handle: field` - Handle hash to lookup

**Returns:** `address`

### verify_profile
Verify a profile commitment matches the stored value.

**Inputs:**
- `user_address: address` - User to verify
- `expected_commitment: field` - Expected commitment

**Returns:** `bool`

### handle_available
Check if a handle is available for registration.

**Inputs:**
- `handle: field` - Handle hash to check

**Returns:** `bool`

### profile_exists
Check if a user has registered a profile.

**Inputs:**
- `user_address: address` - User to check

**Returns:** `bool`

## Privacy Model

- Handles are stored as BHP256 hashes, not plaintext
- Profile data is encrypted before storage
- Only the user can decrypt their full profile
- Other users see only what's shared through encrypted channels
- Commitments ensure data integrity without revealing content

## Integration

See `frontend/src/services/userRegistryService.ts` for TypeScript integration.
