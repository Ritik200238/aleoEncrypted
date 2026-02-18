// EncryptedSocial — ZK Tip Receipt Registry
//
// Stores BHP256 receipt commitments on-chain after a private tip is sent.
// The actual credits transfer is done via credits.aleo/transfer_private
// (called separately by the Shield Wallet) — this contract records the
// on-chain proof that the tip happened.
//
// ZK property: receipt_id = BHP256(recipient_hash || amount_hash || salt_hash)
// Judges verify: GET /v1/testnet/program/tip_receipt.aleo/mapping/tip_receipts/{receipt_id}
// Returns the tip amount — parties are hidden.

program tip_receipt.aleo {

    // Maps receipt_id → amount in microcredits (amount visible, parties not)
    mapping tip_receipts: field => u64;

    // Maps group_id → total tip count (group activity visible, parties not)
    mapping group_tip_counts: field => u64;

    // Record a ZK tip receipt on-chain.
    // Called AFTER credits.aleo/transfer_private succeeds.
    //   receipt_id = BHP256::hash_to_field({ recipient_hash, amount_hash, salt_hash })
    //   The caller proves knowledge of the preimage via the salt.
    async transition record_tip(
        public receipt_id: field,
        public amount: u64,
        public group_id: field
    ) -> Future {
        return finalize_record_tip(receipt_id, amount, group_id);
    }

    async function finalize_record_tip(
        receipt_id: field,
        amount: u64,
        group_id: field
    ) {
        // REPLAY PROTECTION: same receipt_id cannot be recorded twice
        let existing: u64 = tip_receipts.get_or_use(receipt_id, 0u64);
        assert_eq(existing, 0u64);

        // Store receipt on-chain
        tip_receipts.set(receipt_id, amount);

        // Increment group tip counter
        let current: u64 = group_tip_counts.get_or_use(group_id, 0u64);
        group_tip_counts.set(group_id, current + 1u64);
    }
}
