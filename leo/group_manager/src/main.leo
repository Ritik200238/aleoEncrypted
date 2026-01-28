// Encrypted Social Network - Group Manager (Leo 3.4 Compatible)
// Simplified version for deployment

program group_manager.aleo {

    // ========== RECORD TYPES ==========

    // Represents a private group owned by creator/admin
    record GroupRecord {
        owner: address,           // Group creator/admin
        group_id: field,          // Unique group identifier
        name: field,              // Encrypted group name
        member_count: u32,        // Number of members in group
        merkle_root: field,       // Current merkle root of member commitments
    }

    // ========== MAPPINGS (On-chain Public State) ==========

    // Map group_id to current merkle root (public for verification)
    mapping group_merkle_roots: field => field;

    // Map group_id to member count
    mapping group_member_counts: field => u32;

    // ========== TRANSITIONS ==========

    // Create a new private group
    transition create_group(public group_name: field, owner_addr: address) -> GroupRecord {
        // Generate unique group_id using hash of group name
        let group_id: field = BHP256::hash_to_field(group_name);

        // Initialize merkle root (use group_id as initial root for MVP)
        let initial_root: field = group_id;

        // Create group record owned by caller
        let new_group: GroupRecord = GroupRecord {
            owner: owner_addr,
            group_id: group_id,
            name: group_name,
            member_count: 1u32,
            merkle_root: initial_root,
        };

        return new_group;
    }

    // Get group member count (public view)
    transition get_member_count(public group_id: field) -> u32 {
        return 1u32;
    }
}
