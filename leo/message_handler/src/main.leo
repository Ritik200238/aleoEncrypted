// Encrypted Social Network - Message Handler (Leo 3.4 Compatible)
// Simplified encrypted message handling for buildathon

program message_handler.aleo {

    // ========== RECORD TYPES ==========

    // Represents an encrypted message in a group
    record MessageRecord {
        owner: address,              // Message recipient
        group_id: field,             // Which group this belongs to
        encrypted_content: field,    // Encrypted message content
        sender_commitment: field,    // Hash of sender (preserves anonymity)
        timestamp: u64,              // When message was sent
        message_id: field,           // Unique message identifier
    }

    // ========== MAPPINGS ==========

    // Track message count per group
    mapping group_message_counts: field => u64;

    // ========== TRANSITIONS ==========

    // Send an encrypted message to a group
    transition send_message(
        public group_id: field,
        public encrypted_content: field,
        sender_addr: address,
        message_nonce: u64,
    ) -> MessageRecord {
        // Generate unique message ID
        let message_id: field = BHP256::hash_to_field(encrypted_content);

        // Create message record
        let message: MessageRecord = MessageRecord {
            owner: sender_addr,
            group_id: group_id,
            encrypted_content: encrypted_content,
            sender_commitment: BHP256::hash_to_field(sender_addr),  // hash of sender — never the group_id
            timestamp: 0u64,
            message_id: message_id,
        };

        return message;
    }

    // Health check
    transition get_version() -> u32 {
        return 1u32;
    }

}
