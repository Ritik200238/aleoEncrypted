/**
 * Aleo Network Configuration
 * Update these after deploying contracts
 */

export const ALEO_CONFIG = {
  network: 'testnet' as const,

  // Deployed on Aleo Testnet
  programIds: {
    groupManager: 'group_manager.aleo',           // TX: at12gkmegshtlsjgzfpng4ls8mprlwc0s5l9573wy9khlqcelf97cqs36kwew
    membershipProof: 'membership_proof.aleo',     // TX: at1heup986u7f0hhd26um6mmfvp95uq9yfmv2xa5vzh2yvd7g4d6qpsx5q9f4
    messageHandler: 'message_handler.aleo',       // TX: at1nejj3turtptuu0ddl5f0axv9mmscgzcfum9049tfxpm9wfk8zy9qmsct0q
    tipReceipt: 'tip_receipt.aleo',                // TX: at17zg5efd6lqv33jtshcf9gfdqtcapycscak8ej3ydexqtkw57fqqsjqmyfr ✅ DEPLOYED
    privateTips: 'private_tips.aleo',               // TX: at1cr03ja49m6prfjln7zpp9klt00fmcpzv2p704h5700n2sj8jq5zsqtk3uk
    groupMembership: 'group_membership.aleo',     // TX: at1ksfdjkpvsrvuqnp6zurgp9feqycjkqkths9pa5gmemxzaryl8s8q3stazt ✅ DEPLOYED
  },

  explorerUrl: 'https://explorer.aleo.org',
  faucetUrl: 'https://faucet.aleo.org',

  // Transaction settings
  defaultFee: 50_000, // microcredits (tip_receipt.aleo record_tip requires ≥35k)
  confirmationTimeout: 60_000, // ms

  // Feature flags
  features: {
    useBlockchain: true,  // Set to true after contracts are deployed
    useMockData: false,    // Set to true for demo without blockchain
    enableZKProofs: true,  // Enable zero-knowledge proofs
  },
};

export const getExplorerUrl = (type: 'program' | 'transaction', id: string) => {
  return `${ALEO_CONFIG.explorerUrl}/${type}/${id}?network=${ALEO_CONFIG.network}`;
};

export const getProgramExplorerUrl = (programId: string) => {
  return getExplorerUrl('program', programId);
};

export const getTransactionExplorerUrl = (txId: string) => {
  return getExplorerUrl('transaction', txId);
};
