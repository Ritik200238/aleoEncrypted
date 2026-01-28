/**
 * Aleo Network Configuration
 * Update these after deploying contracts
 */

export const ALEO_CONFIG = {
  network: 'testnet' as const,

  // UPDATE THESE AFTER DEPLOYMENT
  programIds: {
    groupManager: 'group_manager.aleo',  // Will be updated after deployment
    membershipProof: 'membership_proof.aleo',  // Will be updated after deployment
    messageHandler: 'message_handler.aleo',  // Will be updated after deployment
  },

  explorerUrl: 'https://explorer.aleo.org',
  faucetUrl: 'https://faucet.aleo.org',

  // Transaction settings
  defaultFee: 10_000, // microcredits
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
