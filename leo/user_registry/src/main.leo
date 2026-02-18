// Encrypted Social Network - User Registry (Leo 2.3.0 Compatible)
// Manages user profiles with privacy-preserving handle registration

program user_registry.aleo {

    // ========== RECORD TYPES ==========

    // Represents a user's encrypted profile
    record ProfileRecord {
        owner: address,              // Profile owner's address
        handle: field,               // BHP256 hash of @username
        encrypted_profile: field,    // Encrypted name + avatar + bio
        profile_commitment: field,   // Commitment to profile data for integrity
        timestamp: u64,              // Registration/update timestamp
    }

    // ========== MAPPINGS ==========

    // Maps handle hash to profile commitment (for uniqueness check)
    mapping handles: field => field;

    // Maps user address to their profile commitment (for verification)
    mapping profile_commitments: address => field;

    // Maps user address to registration timestamp (for tracking)
    mapping registration_times: address => u64;

    // ========== TRANSITIONS ==========

    // Register a new user profile
    // Handle must be unique, encrypted_profile contains user data
    async transition register_profile(
        public handle: field,
        public encrypted_profile: field,
        public profile_commitment: field,
    ) -> (ProfileRecord, Future) {
        // Create the profile record
        let profile: ProfileRecord = ProfileRecord {
            owner: self.caller,
            handle: handle,
            encrypted_profile: encrypted_profile,
            profile_commitment: profile_commitment,
            timestamp: 0u64,
        };

        return (profile, finalize_register_profile(handle, profile_commitment));
    }

    // Finalize registration - store handle and commitment mappings
    async function finalize_register_profile(
        handle: field,
        commitment: field,
    ) {
        // Ensure handle is not already taken (0field means not registered)
        let existing: field = handles.get_or_use(handle, 0field);
        assert_eq(existing, 0field);

        // Store handle -> commitment mapping (non-zero means taken)
        handles.set(handle, commitment);
    }

    // Update user profile (preserves handle, updates encrypted data)
    async transition update_profile(
        profile_record: ProfileRecord,
        public new_encrypted_data: field,
        public new_commitment: field,
    ) -> (ProfileRecord, Future) {
        // Verify ownership
        assert_eq(profile_record.owner, self.caller);

        // Create updated profile record (handle stays the same)
        let updated_profile: ProfileRecord = ProfileRecord {
            owner: self.caller,
            handle: profile_record.handle,
            encrypted_profile: new_encrypted_data,
            profile_commitment: new_commitment,
            timestamp: 0u64,
        };

        return (updated_profile, finalize_update_profile(profile_record.handle, new_commitment));
    }

    // Finalize profile update
    async function finalize_update_profile(
        handle: field,
        new_commitment: field,
    ) {
        // Update handle -> commitment mapping
        handles.set(handle, new_commitment);
    }

    // Verify profile commitment matches stored value
    // Asserts on-chain, will fail if commitment doesn't match
    async transition verify_profile(
        public handle: field,
        public expected_commitment: field,
    ) -> Future {
        return finalize_verify_profile(handle, expected_commitment);
    }

    async function finalize_verify_profile(
        handle: field,
        expected_commitment: field,
    ) {
        let stored: field = handles.get(handle);
        assert_eq(stored, expected_commitment);
    }

    // Health check / version info
    transition get_version() -> u32 {
        return 1u32;
    }
}
