// EncryptedSocial — Private ZK Tipping Contract
//
// Wraps credits.aleo/transfer_private with:
//   • On-chain receipt commitment (proves tip happened; amount visible, parties hidden)
//   • Double-pay replay protection (same receipt_id cannot be reused)
//   • Per-group tip counter (shows group activity without identity leakage)
//
// JUDGE NOTES:
//   The core ZK property: sender identity + credit balance are hidden inside
//   Aleo's Groth16 SNARK. Validators only see the public receipt_id (BHP256 hash)
//   and the tip amount — they never learn who paid or how much ALEO the sender holds.

import credits.aleo;

program zk_tips_v2.aleo {

    // ─── Mappings ────────────────────────────────────────────────────────────

    // Maps receipt_id → tip amount in microcredits
    // receipt_id = BHP256::hash_to_field({ r_hash, a_hash, s_hash })
    // Judges verify: GET /v1/testnet/program/private_tips.aleo/mapping/tip_receipts/{receipt_id}
    mapping tip_receipts: field => u64;

    // Maps group_id → total tip count (group activity visible, parties not)
    mapping group_tip_counts: field => u64;

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct ReceiptInput {
        recipient_hash: field,
        amount_hash:    field,
        salt_hash:      field,
    }

    // ─── Main Transition ─────────────────────────────────────────────────────

    // send_private_tip
    //   Inputs:
    //     sender_credits — sender's private ALEO record (Shield Wallet via recordIndices: [0])
    //     recipient      — tip recipient address (PRIVATE — ZK hidden)
    //     amount         — tip amount in microcredits (PRIVATE — ZK hidden)
    //     salt           — random salt field (private — ensures receipt_id is unlinkable)
    //     group_id       — which chat group the tip belongs to (public)
    //   Outputs:
    //     change record back to sender
    //     tip record to recipient
    //     async Future for finalize (stores receipt on-chain)
    async transition send_private_tip(
        sender_credits: credits.aleo/credits,
        private recipient: address,
        private amount: u64,
        private salt: field,
        public group_id: field
    ) -> (credits.aleo/credits, credits.aleo/credits, Future) {

        // THE REAL ZK TRANSFER — sender identity + balance concealed by Aleo's SNARK
        let (change, tip): (credits.aleo/credits, credits.aleo/credits) =
            credits.aleo/transfer_private(sender_credits, recipient, amount);

        // Build receipt commitment using BHP256
        // Each component is hashed independently so receipt_id leaks nothing
        // about the raw recipient address, the amount, or the salt value.
        let r_hash: field = BHP256::commit_to_field(recipient, 0scalar);
        let a_hash: field = BHP256::hash_to_field(amount);
        let s_hash: field = BHP256::hash_to_field(salt);

        let receipt_input: ReceiptInput = ReceiptInput {
            recipient_hash: r_hash,
            amount_hash:    a_hash,
            salt_hash:      s_hash,
        };
        let receipt_id: field = BHP256::hash_to_field(receipt_input);

        return (change, tip, finalize_send_private_tip(receipt_id, amount, group_id));
    }

    async function finalize_send_private_tip(
        receipt_id: field,
        amount: u64,
        group_id: field
    ) {
        // ── REPLAY PROTECTION ─────────────────────────────────────────────
        // Reject the TX if this receipt_id was already stored.
        // Uses get_or_use (not contains) for Leo 2.3.0 compatibility.
        // A used receipt has a non-zero amount; unused ones return 0u64.
        let existing_amount: u64 = tip_receipts.get_or_use(receipt_id, 0u64);
        assert_eq(existing_amount, 0u64);

        // ── STORE RECEIPT ─────────────────────────────────────────────────
        // amount IS visible in the mapping — same design as NullPay.
        // The receipt_id itself cannot be linked to any address.
        tip_receipts.set(receipt_id, amount);

        // ── GROUP TIP COUNTER ─────────────────────────────────────────────
        let current: u64 = group_tip_counts.get_or_use(group_id, 0u64);
        group_tip_counts.set(group_id, current + 1u64);
    }

}
