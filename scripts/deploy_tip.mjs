import { Account, AleoNetworkClient, NetworkRecordProvider, ProgramManager, AleoKeyProvider } from '@provablehq/sdk/testnet.js';

const PRIVATE_KEY = 'APrivateKey1zkp39dzxgoz6d3hMFE9BSB9uJTLyMVbrHk8Ad5vfzZ7XNu5';
const ENDPOINT = 'https://api.explorer.provable.com/v1/testnet';

const programCode = `import credits.aleo;

program private_tips.aleo {

    mapping tip_receipts: field => u64;
    mapping group_tip_counts: field => u64;

    struct ReceiptInput {
        recipient_hash: field,
        amount_hash:    field,
        salt_hash:      field,
    }

    async transition send_private_tip(
        sender_credits: credits.aleo/credits,
        private recipient: address,
        private amount: u64,
        private salt: field,
        public group_id: field
    ) -> (credits.aleo/credits, credits.aleo/credits, Future) {

        let (change, tip): (credits.aleo/credits, credits.aleo/credits) =
            credits.aleo/transfer_private(sender_credits, recipient, amount);

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
        let existing_amount: u64 = tip_receipts.get_or_use(receipt_id, 0u64);
        assert_eq(existing_amount, 0u64);
        tip_receipts.set(receipt_id, amount);
        let current: u64 = group_tip_counts.get_or_use(group_id, 0u64);
        group_tip_counts.set(group_id, current + 1u64);
    }
}`;

try {
  const account = new Account({ privateKey: PRIVATE_KEY });
  console.log('Account:', account.address().to_string());
  
  const networkClient = new AleoNetworkClient(ENDPOINT);
  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);
  
  const recordProvider = new NetworkRecordProvider(account, networkClient);
  const pm = new ProgramManager(ENDPOINT, keyProvider, recordProvider);
  pm.setAccount(account);

  console.log('Deploying private_tips.aleo...');
  const txId = await pm.deploy(programCode, 4.5);
  console.log('TX ID:', txId);
} catch(e) {
  console.error('Error:', e.message || e);
}
