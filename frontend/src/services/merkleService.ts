// Merkle Tree Service for Zero-Knowledge Membership Proofs

import { MerkleTree } from 'merkletreejs';
import CryptoJS from 'crypto-js';
import type { MembershipProof } from '../types/group';

export class MerkleService {
  /**
   * Hash function matching Aleo's Pedersen hash (simplified for MVP)
   * In production, this should use the actual Pedersen hash
   */
  private hashFunction(data: string): Buffer {
    const hash = CryptoJS.SHA256(data).toString();
    return Buffer.from(hash, 'hex');
  }

  /**
   * Create member commitment from address
   * This should match the hash function used in Leo contracts
   */
  createMemberCommitment(address: string): string {
    return CryptoJS.SHA256(address).toString();
  }

  /**
   * Build merkle tree from list of member addresses
   */
  buildMerkleTree(memberAddresses: string[]): MerkleTree {
    // Create commitments for each member
    const leaves = memberAddresses.map(address =>
      this.hashFunction(this.createMemberCommitment(address))
    );

    // Build merkle tree
    const tree = new MerkleTree(leaves, (data: Buffer) => {
      const hash = CryptoJS.SHA256(data.toString('hex')).toString();
      return Buffer.from(hash, 'hex');
    }, {
      sortPairs: false, // Maintain insertion order
      hashLeaves: false, // Already hashed
    });

    return tree;
  }

  /**
   * Generate membership proof for a specific member
   */
  generateMembershipProof(
    memberAddress: string,
    memberAddresses: string[]
  ): MembershipProof {
    // Create member commitment
    const memberCommitment = this.createMemberCommitment(memberAddress);

    // Build merkle tree
    const tree = this.buildMerkleTree(memberAddresses);

    // Get leaf for this member
    const leaf = this.hashFunction(memberCommitment);

    // Get merkle proof
    const proof = tree.getProof(leaf);
    const root = tree.getRoot().toString('hex');

    // Extract path and indices
    const merklePath: string[] = [];
    const pathIndices: boolean[] = [];

    proof.forEach(element => {
      merklePath.push(element.data.toString('hex'));
      // Position: 'left' or 'right'
      pathIndices.push(element.position === 'right');
    });

    // Pad to 8 levels (max 256 members)
    while (merklePath.length < 8) {
      merklePath.push('0'.repeat(64)); // Zero hash
      pathIndices.push(false);
    }

    return {
      memberCommitment,
      merklePath: merklePath.slice(0, 8),
      pathIndices: pathIndices.slice(0, 8),
      merkleRoot: root
    };
  }

  /**
   * Verify membership proof locally (before submitting to chain)
   */
  verifyMembershipProof(proof: MembershipProof): boolean {
    let currentHash = Buffer.from(proof.memberCommitment, 'hex');

    // Traverse merkle path from leaf to root
    for (let i = 0; i < proof.merklePath.length; i++) {
      const sibling = Buffer.from(proof.merklePath[i], 'hex');
      const isRight = proof.pathIndices[i];

      // Hash current node with sibling
      const combined = isRight
        ? Buffer.concat([currentHash, sibling])
        : Buffer.concat([sibling, currentHash]);

      const hash = CryptoJS.SHA256(combined.toString('hex')).toString();
      currentHash = Buffer.from(hash, 'hex');
    }

    // Check if we arrived at the merkle root
    return currentHash.toString('hex') === proof.merkleRoot;
  }

  /**
   * Get merkle root for a list of members
   */
  getMerkleRoot(memberAddresses: string[]): string {
    const tree = this.buildMerkleTree(memberAddresses);
    return tree.getRoot().toString('hex');
  }

  /**
   * Check if a member is in the tree
   */
  isMember(memberAddress: string, merkleRoot: string, memberAddresses: string[]): boolean {
    const tree = this.buildMerkleTree(memberAddresses);
    const computedRoot = tree.getRoot().toString('hex');

    if (computedRoot !== merkleRoot) {
      return false;
    }

    const memberCommitment = this.createMemberCommitment(memberAddress);
    const leaf = this.hashFunction(memberCommitment);

    return tree.getLeaves().some(treeLeaf =>
      treeLeaf.toString('hex') === leaf.toString('hex')
    );
  }

  /**
   * Update merkle root when adding a new member (simplified)
   * In production, this should be more efficient with incremental updates
   */
  updateMerkleRootWithNewMember(
    currentMemberAddresses: string[],
    newMemberAddress: string
  ): string {
    const updatedMembers = [...currentMemberAddresses, newMemberAddress];
    return this.getMerkleRoot(updatedMembers);
  }

  /**
   * Convert merkle path to format expected by Leo contracts
   */
  formatMerklePathForLeo(proof: MembershipProof): {
    merkle_path_0: string;
    merkle_path_1: string;
    merkle_path_2: string;
    merkle_path_3: string;
    merkle_path_4: string;
    merkle_path_5: string;
    merkle_path_6: string;
    merkle_path_7: string;
    path_index_0: boolean;
    path_index_1: boolean;
    path_index_2: boolean;
    path_index_3: boolean;
    path_index_4: boolean;
    path_index_5: boolean;
    path_index_6: boolean;
    path_index_7: boolean;
  } {
    return {
      merkle_path_0: proof.merklePath[0] || '0'.repeat(64),
      merkle_path_1: proof.merklePath[1] || '0'.repeat(64),
      merkle_path_2: proof.merklePath[2] || '0'.repeat(64),
      merkle_path_3: proof.merklePath[3] || '0'.repeat(64),
      merkle_path_4: proof.merklePath[4] || '0'.repeat(64),
      merkle_path_5: proof.merklePath[5] || '0'.repeat(64),
      merkle_path_6: proof.merklePath[6] || '0'.repeat(64),
      merkle_path_7: proof.merklePath[7] || '0'.repeat(64),
      path_index_0: proof.pathIndices[0] || false,
      path_index_1: proof.pathIndices[1] || false,
      path_index_2: proof.pathIndices[2] || false,
      path_index_3: proof.pathIndices[3] || false,
      path_index_4: proof.pathIndices[4] || false,
      path_index_5: proof.pathIndices[5] || false,
      path_index_6: proof.pathIndices[6] || false,
      path_index_7: proof.pathIndices[7] || false,
    };
  }
}

// Export singleton instance
export const merkleService = new MerkleService();
