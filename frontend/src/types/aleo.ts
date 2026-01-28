// Aleo-related type definitions

export interface AleoWallet {
  address: string | null;
  connected: boolean;
  publicKey?: string;
  viewKey?: string;
}

export interface AleoTransaction {
  id: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'create_group' | 'add_member' | 'send_message';
  timestamp: number;
}

export interface AleoProgram {
  name: string;
  address: string;
  deployed: boolean;
}

export const AleoNetwork = {
  TESTNET: 'testnet',
  MAINNET: 'mainnet',
  LOCAL: 'local',
} as const;

export type AleoNetwork = typeof AleoNetwork[keyof typeof AleoNetwork];

export interface TransactionOptions {
  fee?: number;
  priority?: 'low' | 'medium' | 'high';
}
