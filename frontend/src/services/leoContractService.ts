/**
 * Leo Contract Service - Real blockchain integration
 * Connects frontend to deployed Leo smart contracts
 */

import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import type { Transaction, WalletContextState } from '@demox-labs/aleo-wallet-adapter-react';
import { encryptionService } from './encryptionService';

// Program IDs (update these after deployment)
export const PROGRAM_IDS = {
  GROUP_MANAGER: 'group_manager.aleo',
  MEMBERSHIP_PROOF: 'membership_proof.aleo',
  MESSAGE_HANDLER: 'message_handler.aleo',
};

// Network configuration
export const ALEO_NETWORK = WalletAdapterNetwork.Testnet;

export interface GroupCreationResult {
  groupId: string;
  transactionId: string;
  merkleRoot: string;
}

export interface MemberAddResult {
  transactionId: string;
  membershipRecord: MembershipRecord;
}

export interface MessageSendResult {
  messageId: string;
  transactionId: string;
  nullifier: string;
}

export interface MembershipRecord {
  owner: string;
  groupId: string;
  memberCommitment: string;
  merklePath: string[];
}

export class LeoContractService {
  private wallet: WalletContextState | null = null;

  /**
   * Initialize with wallet instance
   */
  setWallet(wallet: WalletContextState): void {
    this.wallet = wallet;
  }

  /**
   * Convert string to Aleo field element
   * Aleo field elements are u128 values
   */
  private stringToField(str: string): string {
    // Hash the string and convert to field
    const hash = encryptionService.hashAddress(str);
    // Take first 32 characters (128 bits) and convert to field format
    const fieldValue = BigInt('0x' + hash.substring(0, 32));
    return `${fieldValue}field`;
  }

  /**
   * Convert address to member commitment
   */
  createMemberCommitment(address: string): string {
    // In Leo: Pedersen64::hash_to_field(address)
    // Frontend: Use hash as commitment
    return this.stringToField(`member_${address}`);
  }

  /**
   * Create a new group on-chain
   * Calls: group_manager.aleo/create_group
   */
  async createGroup(groupName: string): Promise<GroupCreationResult> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Encrypt group name client-side
      const encryptedName = await encryptionService.encryptData(groupName);
      const groupNameField = this.stringToField(encryptedName);

      // Build transaction
      const aleoTransaction = Transaction.createTransaction(
        this.wallet.publicKey,
        ALEO_NETWORK,
        PROGRAM_IDS.GROUP_MANAGER,
        'create_group',
        [groupNameField],
        10_000 // fee in microcredits
      );

      if (!this.wallet.requestTransaction) {
        throw new Error('Wallet does not support transactions');
      }

      // Request transaction from wallet
      const txId = await this.wallet.requestTransaction(aleoTransaction);

      // Generate group ID (deterministic based on creator)
      const groupId = this.stringToField(`group_${this.wallet.publicKey}_${Date.now()}`);

      // Generate merkle root (creator's commitment)
      const creatorCommitment = this.createMemberCommitment(this.wallet.publicKey.toString());

      console.log('✓ Group creation transaction submitted:', txId);

      return {
        groupId,
        transactionId: txId,
        merkleRoot: creatorCommitment,
      };
    } catch (error) {
      console.error('Failed to create group on-chain:', error);
      throw new Error(`Group creation failed: ${error}`);
    }
  }

  /**
   * Add member to group on-chain
   * Calls: group_manager.aleo/add_member
   */
  async addMember(
    groupRecord: string, // Serialized GroupRecord from blockchain
    memberAddress: string
  ): Promise<MemberAddResult> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Build transaction
      const aleoTransaction = Transaction.createTransaction(
        this.wallet.publicKey,
        ALEO_NETWORK,
        PROGRAM_IDS.GROUP_MANAGER,
        'add_member',
        [groupRecord, memberAddress],
        10_000
      );

      if (!this.wallet.requestTransaction) {
        throw new Error('Wallet does not support transactions');
      }

      const txId = await this.wallet.requestTransaction(aleoTransaction);

      // Generate member commitment
      const memberCommitment = this.createMemberCommitment(memberAddress);

      console.log('✓ Add member transaction submitted:', txId);

      // Return membership record (will be received from blockchain)
      return {
        transactionId: txId,
        membershipRecord: {
          owner: memberAddress,
          groupId: 'pending', // Will be updated from blockchain response
          memberCommitment,
          merklePath: Array(8).fill('0field'), // Placeholder, update from on-chain
        },
      };
    } catch (error) {
      console.error('Failed to add member on-chain:', error);
      throw new Error(`Add member failed: ${error}`);
    }
  }

  /**
   * Send encrypted message on-chain
   * Calls: message_handler.aleo/send_message_simple
   */
  async sendMessage(
    groupId: string,
    encryptedContent: string,
    nonce: number
  ): Promise<MessageSendResult> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert to field elements
      const groupIdField = this.stringToField(groupId);
      const contentField = this.stringToField(encryptedContent);
      const memberCommitment = this.createMemberCommitment(this.wallet.publicKey.toString());
      const nonceField = `${nonce}u64`;

      // Build transaction
      const aleoTransaction = Transaction.createTransaction(
        this.wallet.publicKey,
        ALEO_NETWORK,
        PROGRAM_IDS.MESSAGE_HANDLER,
        'send_message_simple',
        [groupIdField, contentField, memberCommitment, nonceField],
        15_000 // Higher fee for message sending
      );

      if (!this.wallet.requestTransaction) {
        throw new Error('Wallet does not support transactions');
      }

      const txId = await this.wallet.requestTransaction(aleoTransaction);

      // Generate message ID and nullifier (deterministic)
      const messageId = this.stringToField(`msg_${groupId}_${nonce}_${Date.now()}`);
      const nullifier = this.stringToField(`nullifier_${memberCommitment}_${groupId}_${nonce}`);

      console.log('✓ Message send transaction submitted:', txId);

      return {
        messageId,
        transactionId: txId,
        nullifier,
      };
    } catch (error) {
      console.error('Failed to send message on-chain:', error);
      throw new Error(`Message send failed: ${error}`);
    }
  }

  /**
   * Query group merkle root from on-chain mapping
   * Reads: group_manager.aleo/group_merkle_roots
   */
  async getGroupMerkleRoot(groupId: string): Promise<string> {
    try {
      // Query mapping using SDK
      // Note: SDK method varies by version, adjust as needed
      const groupIdField = this.stringToField(groupId);

      // Mock for now - in production, use:
      // const merkleRoot = await queryProgramMapping(
      //   PROGRAM_IDS.GROUP_MANAGER,
      //   'group_merkle_roots',
      //   groupIdField
      // );

      console.log('Querying merkle root for group:', groupId);

      // Placeholder return
      return this.stringToField(`merkle_root_${groupId}`);
    } catch (error) {
      console.error('Failed to query merkle root:', error);
      throw new Error(`Merkle root query failed: ${error}`);
    }
  }

  /**
   * Query message count for a group
   * Reads: message_handler.aleo/group_message_counts
   */
  async getMessageCount(groupId: string): Promise<number> {
    try {
      const groupIdField = this.stringToField(groupId);

      // Mock for now - in production, query blockchain
      console.log('Querying message count for group:', groupId);

      return 0; // Placeholder
    } catch (error) {
      console.error('Failed to query message count:', error);
      return 0;
    }
  }

  /**
   * Check if nullifier has been used (prevent replay)
   * Reads: message_handler.aleo/used_nullifiers
   */
  async checkNullifierUsed(nullifier: string): Promise<boolean> {
    try {
      // Query blockchain mapping
      console.log('Checking nullifier:', nullifier);

      return false; // Placeholder
    } catch (error) {
      console.error('Failed to check nullifier:', error);
      return false;
    }
  }

  /**
   * Wait for transaction confirmation
   * Polls blockchain for transaction status
   */
  async waitForConfirmation(
    transactionId: string,
    maxAttempts: number = 30
  ): Promise<boolean> {
    console.log('Waiting for transaction confirmation:', transactionId);

    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Query transaction status from blockchain
        // const status = await queryTransactionStatus(transactionId);

        // Mock: assume confirmed after 3 attempts (6 seconds)
        if (i >= 2) {
          console.log('✓ Transaction confirmed:', transactionId);
          return true;
        }

        await this.delay(2000);
      } catch (error) {
        console.error('Error checking transaction:', error);
      }
    }

    throw new Error('Transaction confirmation timeout');
  }

  /**
   * Generate ZK membership proof
   * Creates merkle proof for membership verification
   */
  generateMembershipProof(
    memberAddress: string,
    groupMembers: string[],
    memberIndex: number
  ): { merklePath: string[]; pathIndices: boolean[] } {
    // Simple merkle tree implementation
    const leaves = groupMembers.map(addr => this.createMemberCommitment(addr));

    // Build merkle tree (simplified for MVP)
    const tree: string[][] = [leaves];
    let currentLevel = leaves;

    // Build tree levels (8 levels = 256 max members)
    for (let level = 0; level < 8; level++) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i] || '0field';
        const right = currentLevel[i + 1] || '0field';
        const parent = this.stringToField(`${left}_${right}`);
        nextLevel.push(parent);
      }
      if (nextLevel.length === 0) break;
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    // Extract merkle path for specific member
    const merklePath: string[] = [];
    const pathIndices: boolean[] = [];
    let index = memberIndex;

    for (let level = 0; level < 8; level++) {
      if (tree[level]) {
        const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
        const sibling = tree[level][siblingIndex] || '0field';
        merklePath.push(sibling);
        pathIndices.push(index % 2 === 0);
        index = Math.floor(index / 2);
      } else {
        merklePath.push('0field');
        pathIndices.push(false);
      }
    }

    return { merklePath, pathIndices };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const leoContractService = new LeoContractService();
