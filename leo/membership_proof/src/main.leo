// Encrypted Social Network - Membership Proof (Leo 3.4 Compatible)
// Simplified ZK membership verification for buildathon

program membership_proof.aleo {

    // ========== CORE FUNCTIONS ==========

    // Simplified membership verification for MVP
    // Verifies that a commitment matches the merkle root
    function verify_membership(
        member_commitment: field,    // Hash of member's address
        merkle_root: field,          // Group's merkle root
    ) -> bool {
        // Simplified verification: check if commitment equals root (single member case)
        // In production, this would verify full merkle path
        return member_commitment == merkle_root;
    }

    // Public transition wrapper for verification
    transition check_membership(
        public member_commitment: field,
        public merkle_root: field,
    ) -> bool {
        return verify_membership(member_commitment, merkle_root);
    }

    // Health check
    transition get_version() -> u32 {
        return 1u32;
    }
}
