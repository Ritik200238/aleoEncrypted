// Application constants

export const APP_NAME = 'EncryptedSocial';
export const APP_TAGLINE = 'Privacy by Default. Powered by Aleo.';

export const NETWORK = {
  TESTNET: 'https://api.explorer.aleo.org/v1/testnet3',
  MAINNET: 'https://api.explorer.aleo.org/v1/mainnet',
};

export const PROGRAMS = {
  GROUP_MANAGER: 'group_manager.aleo',
  MEMBERSHIP_PROOF: 'membership_proof.aleo',
  MESSAGE_HANDLER: 'message_handler.aleo',
};

export const POLL_INTERVAL = 5000; // Poll for new messages every 5 seconds

export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_GROUP_NAME_LENGTH = 100;
export const MAX_MEMBERS_PER_GROUP = 256; // 2^8 (merkle tree depth)

export const ERRORS = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  GROUP_NOT_FOUND: 'Group not found',
  INVALID_ADDRESS: 'Invalid Aleo address',
  MESSAGE_TOO_LONG: 'Message exceeds maximum length',
  TRANSACTION_FAILED: 'Transaction failed',
};

export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  GROUP_CREATED: 'Group created successfully',
  MEMBER_ADDED: 'Member added successfully',
  MESSAGE_SENT: 'Message sent successfully',
};
