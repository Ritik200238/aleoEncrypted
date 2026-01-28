// Anonymous Group Membership Verifier
// Proves group membership without revealing identity using zero-knowledge proofs
// Uses real Merkle trees and nullifiers for replay prevention

program group_membership.aleo {

    // ========== RECORD TYPES ==========

    // Membership credential - private proof of group membership
    record MembershipCredential {
        owner: address,              // Member's address
        group_id: field,             // Organization identifier
        member_index: u8,            // Position in Merkle tree (0-255)
        merkle_path: [field; 8],     // Real Merkle path for ZK proof
        nullifier_seed: field,       // Seed for generating nullifiers
    }

    // Organization admin credential
    record AdminCredential {
        owner: address,              // Admin's address
        group_id: field,             // Organization identifier
        merkle_root: field,          // Current Merkle root
        member_count: u8,            // Number of members (max 256)
    }

    // Feedback submission record (for tracking)
    record FeedbackReceipt {
        owner: address,              // Submitter's address
        group_id: field,             // Organization identifier
        content_hash: field,         // Hash of feedback content
        timestamp: u64,              // Submission time
    }

    // ========== MAPPINGS ==========

    // Maps group_id to Merkle root (public verification)
    mapping group_roots: field => field;

    // Maps group_id to member count
    mapping group_sizes: field => u8;

    // Maps nullifiers to boolean (prevent double-spending)
    mapping nullifiers: field => bool;

    // Maps group_id to feedback count
    mapping feedback_counts: field => u64;

    // Maps (group_id, index) to content hash for retrieval
    // We use a composite key by hashing group_id with index
    mapping feedback_storage: field => field;

    // ========== STRUCTS FOR HASHING ==========

    struct HashPair {
        left: field,
        right: field,
    }

    struct NullifierData {
        seed: field,
        group_id: field,
        action: field,
    }

    // ========== HELPER FUNCTIONS ==========

    // Hash two fields together
    inline hash_pair(left: field, right: field) -> field {
        let pair: HashPair = HashPair {
            left: left,
            right: right,
        };
        return BHP256::hash_to_field(pair);
    }

    // Compute Merkle root from path (REAL ZK constraint)
    function compute_merkle_root(
        leaf: field,
        path: [field; 8],
        index: u8
    ) -> field {
        let current: field = leaf;
        let idx: u8 = index;

        let is_right_0: bool = (idx % 2u8) == 1u8;
        let next_0: field = is_right_0 ?
            hash_pair(path[0u8], current) :
            hash_pair(current, path[0u8]);
        let idx_0: u8 = idx / 2u8;

        let is_right_1: bool = (idx_0 % 2u8) == 1u8;
        let next_1: field = is_right_1 ?
            hash_pair(path[1u8], next_0) :
            hash_pair(next_0, path[1u8]);
        let idx_1: u8 = idx_0 / 2u8;

        let is_right_2: bool = (idx_1 % 2u8) == 1u8;
        let next_2: field = is_right_2 ?
            hash_pair(path[2u8], next_1) :
            hash_pair(next_1, path[2u8]);
        let idx_2: u8 = idx_1 / 2u8;

        let is_right_3: bool = (idx_2 % 2u8) == 1u8;
        let next_3: field = is_right_3 ?
            hash_pair(path[3u8], next_2) :
            hash_pair(next_2, path[3u8]);
        let idx_3: u8 = idx_2 / 2u8;

        let is_right_4: bool = (idx_3 % 2u8) == 1u8;
        let next_4: field = is_right_4 ?
            hash_pair(path[4u8], next_3) :
            hash_pair(next_3, path[4u8]);
        let idx_4: u8 = idx_3 / 2u8;

        let is_right_5: bool = (idx_4 % 2u8) == 1u8;
        let next_5: field = is_right_5 ?
            hash_pair(path[5u8], next_4) :
            hash_pair(next_4, path[5u8]);
        let idx_5: u8 = idx_4 / 2u8;

        let is_right_6: bool = (idx_5 % 2u8) == 1u8;
        let next_6: field = is_right_6 ?
            hash_pair(path[6u8], next_5) :
            hash_pair(next_5, path[6u8]);
        let idx_6: u8 = idx_5 / 2u8;

        let is_right_7: bool = (idx_6 % 2u8) == 1u8;
        let next_7: field = is_right_7 ?
            hash_pair(path[7u8], next_6) :
            hash_pair(next_6, path[7u8]);

        return next_7;
    }

    // Generate nullifier from credential and action
    // Ensures same member can't submit twice for same action
    function generate_nullifier(
        nullifier_seed: field,
        group_id: field,
        action_id: field
    ) -> field {
        let nullifier_input: NullifierData = NullifierData {
            seed: nullifier_seed,
            group_id: group_id,
            action: action_id,
        };
        return BHP256::hash_to_field(nullifier_input);
    }

    // ========== TRANSITIONS ==========

    // Create a new organization/group
    // Admin generates Merkle tree off-chain and stores only the root
    async transition create_group(
        public group_id: field,
        public merkle_root: field,
        public member_count: u8
    ) -> (AdminCredential, Future) {

        // Create admin credential
        let admin: AdminCredential = AdminCredential {
            owner: self.caller,
            group_id: group_id,
            merkle_root: merkle_root,
            member_count: member_count,
        };

        return (admin, finalize_create_group(group_id, merkle_root, member_count));
    }

    async function finalize_create_group(
        group_id: field,
        merkle_root: field,
        member_count: u8
    ) {
        // Store Merkle root publicly (for verification)
        group_roots.set(group_id, merkle_root);

        // Store member count
        group_sizes.set(group_id, member_count);

        // Initialize feedback counter
        feedback_counts.set(group_id, 0u64);
    }

    // Issue membership credential to a member
    // Only admin can do this (verified by owning AdminCredential)
    transition issue_credential(
        admin: AdminCredential,
        member_address: address,
        member_index: u8,
        merkle_path: [field; 8],
        nullifier_seed: field
    ) -> (AdminCredential, MembershipCredential) {

        // Verify caller is admin
        assert_eq(admin.owner, self.caller);

        // Create membership credential for the member
        let credential: MembershipCredential = MembershipCredential {
            owner: member_address,
            group_id: admin.group_id,
            member_index: member_index,
            merkle_path: merkle_path,
            nullifier_seed: nullifier_seed,
        };

        // Return admin credential unchanged (single-use records)
        return (admin, credential);
    }

    // Verify membership (can be called to test proof without submitting feedback)
    async transition verify_membership(
        credential: MembershipCredential,
        public group_id: field
    ) -> Future {

        // Verify credential is for this group
        assert_eq(credential.group_id, group_id);

        // Compute member's leaf (commitment to their address)
        // Use commit instead of hash_to_address to get field output
        let member_leaf: field = BHP256::commit_to_field(credential.owner, 0scalar);

        // Compute Merkle root from path - THIS IS THE ZK PROOF!
        let computed_root: field = compute_merkle_root(
            member_leaf,
            credential.merkle_path,
            credential.member_index
        );

        return finalize_verify_membership(group_id, computed_root);
    }

    async function finalize_verify_membership(
        group_id: field,
        computed_root: field
    ) {
        // Get stored Merkle root
        let stored_root: field = group_roots.get(group_id);

        // ZK CONSTRAINT: Computed root must match stored root
        // This forces the prover to have a valid Merkle path!
        assert_eq(computed_root, stored_root);
    }

    // Submit anonymous feedback with ZK membership proof
    // This is the core use case - prove you're a member without revealing who
    async transition submit_feedback(
        credential: MembershipCredential,
        public group_id: field,
        public content_hash: field,
        public action_id: field  // Unique ID for this feedback action
    ) -> (FeedbackReceipt, Future) {

        // Verify credential is for this group
        assert_eq(credential.group_id, group_id);

        // Compute member's leaf
        // Use commit instead of hash_to_address to get field output
        let member_leaf: field = BHP256::commit_to_field(credential.owner, 0scalar);

        // Compute Merkle root (ZK proof of membership)
        let computed_root: field = compute_merkle_root(
            member_leaf,
            credential.merkle_path,
            credential.member_index
        );

        // Generate nullifier to prevent double-submission
        let nullifier: field = generate_nullifier(
            credential.nullifier_seed,
            group_id,
            action_id
        );

        // Create receipt for submitter
        let receipt: FeedbackReceipt = FeedbackReceipt {
            owner: credential.owner,  // Only submitter knows they submitted
            group_id: group_id,
            content_hash: content_hash,
            timestamp: 0u64,  // Set in finalize
        };

        return (receipt, finalize_submit_feedback(
            group_id,
            computed_root,
            nullifier,
            content_hash
        ));
    }

    async function finalize_submit_feedback(
        group_id: field,
        computed_root: field,
        nullifier: field,
        content_hash: field
    ) {
        // Verify Merkle root (ZK membership proof)
        let stored_root: field = group_roots.get(group_id);
        assert_eq(computed_root, stored_root);

        // Prevent double-submission using nullifier
        let nullifier_used: bool = nullifiers.get_or_use(nullifier, false);
        assert_eq(nullifier_used, false);

        // Mark nullifier as used
        nullifiers.set(nullifier, true);

        // Increment feedback count
        let current_count: u64 = feedback_counts.get(group_id);
        let new_count: u64 = current_count + 1u64;
        feedback_counts.set(group_id, new_count);

        // Store feedback content (composite key: hash of group_id and count)
        let storage_key: field = hash_pair(group_id, new_count as field);
        feedback_storage.set(storage_key, content_hash);
    }

    // Update organization Merkle root (when members are added/removed)
    async transition update_group(
        admin: AdminCredential,
        public new_merkle_root: field,
        public new_member_count: u8
    ) -> (AdminCredential, Future) {

        // Verify caller is admin
        assert_eq(admin.owner, self.caller);

        // Create updated admin credential
        let updated_admin: AdminCredential = AdminCredential {
            owner: admin.owner,
            group_id: admin.group_id,
            merkle_root: new_merkle_root,
            member_count: new_member_count,
        };

        return (updated_admin, finalize_update_group(
            admin.group_id,
            new_merkle_root,
            new_member_count
        ));
    }

    async function finalize_update_group(
        group_id: field,
        new_merkle_root: field,
        new_member_count: u8
    ) {
        // Update Merkle root
        group_roots.set(group_id, new_merkle_root);

        // Update member count
        group_sizes.set(group_id, new_member_count);
    }

    // Query feedback count for a group (read-only, no finalize needed)
    // Note: For reading data, query the mappings directly off-chain

    // Retrieve feedback content hash by index (read-only, no finalize needed)
    // Note: For reading data, query the feedback_storage mapping directly off-chain
    // using the composite key: hash_pair(group_id, feedback_index as field)
}
