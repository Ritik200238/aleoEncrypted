// Encrypted Social Network - User Registry (Leo 3.4 Compatible)
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

    // Maps handle hash to owner address (for uniqueness and lookups)
    mapping handles: field => address;

    // Maps user address to their profile commitment (for verification)
    mapping profile_commitments: address => field;

    // Maps user address to registration timestamp (for tracking)
    mapping registration_times: address => u64;

    // ========== TRANSITIONS ==========

    // Register a new user profile
    // Note: Handle must be unique, encrypted_profile contains user data
    transition register_profile(
        public handle: field,              // Hash of unique @username
        public encrypted_profile: field,   // Encrypted profile data
        public profile_commitment: field,  // Commitment for data integrity
    ) -> ProfileRecord {
        // Create the profile record
        let profile: ProfileRecord = ProfileRecord {
            owner: self.caller,
            handle: handle,
            encrypted_profile: encrypted_profile,
            profile_commitment: profile_commitment,
            timestamp: 0u64,  // Will be set on-chain
        };

        return profile then finalize(handle, self.caller, profile_commitment);
    }

    // Finalize registration - store handle and commitment mappings
    finalize register_profile(
        handle: field,
        owner: address,
        commitment: field,
    ) {
        // Ensure handle is not already taken
        let existing_owner: address = Mapping::get_or_use(handles, handle, 0addr);
        assert_eq(existing_owner, 0addr);

        // Store handle -> owner mapping
        Mapping::set(handles, handle, owner);

        // Store owner -> commitment mapping
        Mapping::set(profile_commitments, owner, commitment);

        // Store registration timestamp
        Mapping::set(registration_times, owner, block.height);
    }

    // Update user profile (preserves handle, updates encrypted data)
    transition update_profile(
        profile_record: ProfileRecord,      // Existing profile
        public new_encrypted_data: field,   // New encrypted profile data
        public new_commitment: field,       // New commitment
    ) -> ProfileRecord {
        // Verify ownership
        assert_eq(profile_record.owner, self.caller);

        // Create updated profile record (handle stays the same)
        let updated_profile: ProfileRecord = ProfileRecord {
            owner: self.caller,
            handle: profile_record.handle,
            encrypted_profile: new_encrypted_data,
            profile_commitment: new_commitment,
            timestamp: 0u64,  // Will be updated on-chain
        };

        return updated_profile then finalize(self.caller, new_commitment);
    }

    // Finalize profile update
    finalize update_profile(
        owner: address,
        new_commitment: field,
    ) {
        // Update commitment mapping
        Mapping::set(profile_commitments, owner, new_commitment);
    }

    // Lookup user address by handle hash
    transition lookup_handle(
        public handle: field,
    ) -> address {
        return 0addr then finalize(handle);
    }

    // Finalize handle lookup
    finalize lookup_handle(
        handle: field,
    ) -> address {
        let owner: address = Mapping::get_or_use(handles, handle, 0addr);
        return owner;
    }

    // Verify profile commitment for a user
    transition verify_profile(
        public user_address: address,
        public expected_commitment: field,
    ) -> bool {
        return false then finalize(user_address, expected_commitment);
    }

    // Finalize profile verification
    finalize verify_profile(
        user_address: address,
        expected_commitment: field,
    ) -> bool {
        let stored_commitment: field = Mapping::get(profile_commitments, user_address);
        return stored_commitment == expected_commitment;
    }

    // Get profile metadata (for existence check)
    transition profile_exists(
        public user_address: address,
    ) -> bool {
        return false then finalize(user_address);
    }

    // Finalize profile existence check
    finalize profile_exists(
        user_address: address,
    ) -> bool {
        let commitment: field = Mapping::get_or_use(profile_commitments, user_address, 0field);
        return commitment != 0field;
    }

    // Check if handle is available
    transition handle_available(
        public handle: field,
    ) -> bool {
        return true then finalize(handle);
    }

    // Finalize handle availability check
    finalize handle_available(
        handle: field,
    ) -> bool {
        let owner: address = Mapping::get_or_use(handles, handle, 0addr);
        return owner == 0addr;
    }

    // Health check / version info
    transition get_version() -> u32 {
        return 1u32;
    }
}
