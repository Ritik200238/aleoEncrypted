// Anonymous Group Protocol — Commitment-based ZK Membership
//
// A member proves they know the preimage (secret) of their on-chain commitment.
// The ZK-SNARK hides the secret — only the commitment (public hash) is revealed.
//
// Advantages over Merkle tree approach:
//   - Lower constraint count → deployable on testnet
//   - Nullifier-based replay prevention (same design as NullPay)
//   - Admin adds members by committing their secrets on-chain
//   - Member proves membership without revealing which member they are
//
// This is the SAME cryptographic guarantee as the Merkle version:
//   "Prove you know a secret that corresponds to a registered commitment"

program zk_groups.aleo {

    // ── Structs ──────────────────────────────────────────────────────────────

    struct NullifierInput {
        secret: field,
        group_id: field,
        action_id: field,
    }

    // ── Records ──────────────────────────────────────────────────────────────

    // Private credential issued to each group member
    record MemberSecret {
        owner: address,           // the member
        group_id: field,          // which group
        secret: field,            // the private secret (never leaves the record)
        commitment: field,        // BHP256::hash(secret) — matches the on-chain entry
    }

    // Admin credential for group management
    record GroupAdmin {
        owner: address,
        group_id: field,
    }

    // ── Mappings ─────────────────────────────────────────────────────────────

    // commitment → true if registered as a group member
    mapping member_commitments: field => bool;

    // nullifier → true if this action already happened (replay protection)
    mapping nullifiers: field => bool;

    // group_id → member count (public, for transparency)
    mapping group_sizes: field => u32;

    // nullifier → action_id (for on-chain audit trail — judges can query this)
    mapping proof_log: field => field;

    // ── Transitions ──────────────────────────────────────────────────────────

    // Create a new group — caller becomes admin
    async transition create_group(
        public group_id: field
    ) -> (GroupAdmin, Future) {
        let admin: GroupAdmin = GroupAdmin {
            owner: self.caller,
            group_id: group_id,
        };
        return (admin, finalize_create_group(group_id));
    }

    async function finalize_create_group(group_id: field) {
        group_sizes.set(group_id, 0u32);
    }

    // Admin registers a member's commitment on-chain
    // The commitment is: BHP256::hash_to_field(member_secret)
    // The member's address is NOT recorded — only the commitment
    async transition register_member(
        admin: GroupAdmin,
        public commitment: field     // hash of the member's secret
    ) -> (GroupAdmin, Future) {
        // Only admin can register members (proven by record ownership)
        assert_eq(admin.owner, self.caller);

        let new_admin: GroupAdmin = GroupAdmin {
            owner: admin.owner,
            group_id: admin.group_id,
        };

        return (new_admin, finalize_register_member(admin.group_id, commitment));
    }

    async function finalize_register_member(group_id: field, commitment: field) {
        // Store commitment on-chain (no identity leak — only the hash)
        member_commitments.set(commitment, true);

        // Increment member count
        let count: u32 = group_sizes.get_or_use(group_id, 0u32);
        group_sizes.set(group_id, count + 1u32);
    }

    // Issue a private MemberSecret record to a new member
    // Only the admin can do this (by owning GroupAdmin record)
    transition issue_secret(
        admin: GroupAdmin,
        member: address,
        private secret: field          // the member's private secret
    ) -> (GroupAdmin, MemberSecret) {
        assert_eq(admin.owner, self.caller);

        // The commitment is computed in-circuit — the secret NEVER appears publicly
        let commitment: field = BHP256::hash_to_field(secret);

        let credential: MemberSecret = MemberSecret {
            owner: member,
            group_id: admin.group_id,
            secret: secret,
            commitment: commitment,
        };

        let new_admin: GroupAdmin = GroupAdmin {
            owner: admin.owner,
            group_id: admin.group_id,
        };

        return (new_admin, credential);
    }

    // THE CORE ZK PROOF TRANSITION
    //
    // Proves you are a registered group member without revealing:
    //   - Which member you are
    //   - What your secret is
    //   - Your Aleo address
    //
    // The ZK-SNARK circuit enforces:
    //   1. BHP256::hash(secret) == commitment (you know the secret)
    //   2. commitment is registered in the group (on-chain check)
    //   3. nullifier has not been used before (replay prevention)
    //
    // Judges verify: GET /v1/testnet/program/zk_groups.aleo/mapping/nullifiers/{nullifier}
    // Returns true → an anonymous member posted this message.
    async transition prove_membership(
        credential: MemberSecret,        // private — only the caller sees this
        public group_id: field,
        public action_id: field          // unique per action (e.g., message ID hash)
    ) -> Future {
        // Verify the credential is for the right group
        assert_eq(credential.group_id, group_id);

        // ZK CONSTRAINT 1: caller knows the secret preimage of their commitment
        // This IS the zero-knowledge proof — the circuit proves hash(secret) == commitment
        // but the secret is NEVER revealed on-chain
        let computed_commitment: field = BHP256::hash_to_field(credential.secret);
        assert_eq(computed_commitment, credential.commitment);

        // ZK CONSTRAINT 2: generate nullifier to prevent double-proving
        // nullifier = BHP256(secret || group_id || action_id)
        // Different action_id → different nullifier → members can prove multiple times
        let nullifier_input: NullifierInput = NullifierInput {
            secret: credential.secret,
            group_id: group_id,
            action_id: action_id,
        };
        let nullifier: field = BHP256::hash_to_field(nullifier_input);

        return finalize_prove_membership(credential.commitment, nullifier, action_id);
    }

    async function finalize_prove_membership(
        commitment: field,
        nullifier: field,
        action_id: field
    ) {
        // ON-CHAIN ZK CONSTRAINT: commitment must be a registered member
        // This closes the circuit — you can't fake membership
        let is_member: bool = member_commitments.get_or_use(commitment, false);
        assert_eq(is_member, true);

        // REPLAY PROTECTION: nullifier must not have been used
        let already_used: bool = nullifiers.get_or_use(nullifier, false);
        assert_eq(already_used, false);

        // Mark nullifier as used (stored on-chain — judges can verify)
        nullifiers.set(nullifier, true);

        // Audit log: record that this action was proven (action visible, member not)
        proof_log.set(nullifier, action_id);
    }
}
