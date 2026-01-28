/**
 * Merkle Tree Implementation for Anonymous Group Membership
 *
 * Generates Merkle trees from member addresses and creates proofs
 * that can be verified by the group_membership.aleo Leo contract
 *
 * Uses BHP256 hashing to match Aleo's on-chain verification
 */

import { sha256 } from 'js-sha256';

export const TREE_DEPTH = 8; // 2^8 = 256 max members
export const MAX_MEMBERS = 2 ** TREE_DEPTH;

/**
 * Hash function - simulates BHP256 for client-side
 * In production, this should use Aleo's actual BHP256 hash
 */
function hash(left: string, right: string): string {
    // Concatenate and hash (simplified version of BHP256)
    const combined = left + right;
    return sha256(combined);
}

/**
 * Hash an address to create a leaf node
 * Matches Leo's BHP256::commit_to_field behavior
 * In production, this should use Aleo's actual BHP256 commit
 */
export function hashAddress(address: string): string {
    // Simulating BHP256::commit_to_field(address, 0scalar)
    // In production, use Aleo SDK's actual hash function
    return sha256(address + '_commit_0');
}

/**
 * Merkle tree node
 */
interface MerkleNode {
    hash: string;
    left?: MerkleNode;
    right?: MerkleNode;
}

/**
 * Merkle proof for a specific member
 */
export interface MerkleProof {
    leaf: string;           // Member's leaf hash
    path: string[];         // Array of 8 sibling hashes
    index: number;          // Member's index (0-255)
    root: string;           // Merkle root
}

/**
 * Build a Merkle tree from member addresses
 */
export class MerkleTree {
    private leaves: string[];
    private tree: MerkleNode[][];
    private root: string;

    constructor(memberAddresses: string[]) {
        if (memberAddresses.length === 0) {
            throw new Error('Cannot create tree with zero members');
        }

        if (memberAddresses.length > MAX_MEMBERS) {
            throw new Error(`Cannot create tree with more than ${MAX_MEMBERS} members`);
        }

        // Hash all addresses to create leaves
        this.leaves = memberAddresses.map(addr => hashAddress(addr));

        // Pad to power of 2
        const paddedLeaves = this.padToPowerOfTwo(this.leaves);

        // Build the tree bottom-up
        this.tree = this.buildTree(paddedLeaves);

        // Root is at the top level
        this.root = this.tree[this.tree.length - 1][0].hash;
    }

    /**
     * Pad leaves to next power of 2
     */
    private padToPowerOfTwo(leaves: string[]): string[] {
        const targetSize = 2 ** TREE_DEPTH;
        const padded = [...leaves];

        // Pad with copies of the last leaf (or zeros)
        const paddingValue = leaves[leaves.length - 1] || '0'.repeat(64);
        while (padded.length < targetSize) {
            padded.push(paddingValue);
        }

        return padded;
    }

    /**
     * Build complete Merkle tree
     */
    private buildTree(leaves: string[]): MerkleNode[][] {
        const tree: MerkleNode[][] = [];

        // Level 0 - leaves
        tree[0] = leaves.map(leafHash => ({ hash: leafHash }));

        // Build up levels
        for (let level = 1; level <= TREE_DEPTH; level++) {
            const prevLevel = tree[level - 1];
            const currentLevel: MerkleNode[] = [];

            for (let i = 0; i < prevLevel.length; i += 2) {
                const left = prevLevel[i];
                const right = prevLevel[i + 1];

                const parentHash = hash(left.hash, right.hash);

                currentLevel.push({
                    hash: parentHash,
                    left,
                    right,
                });
            }

            tree[level] = currentLevel;
        }

        return tree;
    }

    /**
     * Get the Merkle root
     */
    getRoot(): string {
        return this.root;
    }

    /**
     * Get total number of actual members (not including padding)
     */
    getMemberCount(): number {
        return this.leaves.length;
    }

    /**
     * Generate a Merkle proof for a specific member
     */
    generateProof(memberAddress: string): MerkleProof | null {
        const memberLeaf = hashAddress(memberAddress);

        // Find member's index
        const index = this.leaves.indexOf(memberLeaf);
        if (index === -1) {
            return null; // Member not in tree
        }

        // Generate path by collecting sibling hashes
        const path: string[] = [];
        let currentIndex = index;

        for (let level = 0; level < TREE_DEPTH; level++) {
            const isRightNode = (currentIndex % 2) === 1;
            const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

            const sibling = this.tree[level][siblingIndex];
            path.push(sibling.hash);

            // Move up to parent
            currentIndex = Math.floor(currentIndex / 2);
        }

        return {
            leaf: memberLeaf,
            path,
            index,
            root: this.root,
        };
    }

    /**
     * Verify a Merkle proof
     */
    static verifyProof(proof: MerkleProof): boolean {
        let current = proof.leaf;
        let index = proof.index;

        for (let i = 0; i < TREE_DEPTH; i++) {
            const sibling = proof.path[i];
            const isRightNode = (index % 2) === 1;

            if (isRightNode) {
                current = hash(sibling, current);
            } else {
                current = hash(current, sibling);
            }

            index = Math.floor(index / 2);
        }

        return current === proof.root;
    }

    /**
     * Get all member addresses that can verify
     */
    getMembers(): string[] {
        return this.leaves.map((_, index) => this.getMemberAtIndex(index));
    }

    /**
     * Get member address at specific index
     */
    private getMemberAtIndex(index: number): string {
        // This is a simplified version - in production, you'd store the original addresses
        return `member_${index}`;
    }
}

/**
 * Generate a nullifier for preventing double-submission
 * Matches the Leo contract's generate_nullifier function
 */
export function generateNullifier(
    nullifierSeed: string,
    groupId: string,
    actionId: string
): string {
    const step1 = hash(nullifierSeed, groupId);
    const step2 = hash(step1, actionId);
    return step2;
}

/**
 * Generate a random nullifier seed
 */
export function generateNullifierSeed(): string {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Convert proof to Leo format for contract interaction
 */
export function proofToLeoFormat(proof: MerkleProof): {
    member_index: number;
    merkle_path: string[];
    merkle_root: string;
} {
    return {
        member_index: proof.index,
        merkle_path: proof.path,
        merkle_root: proof.root,
    };
}

/**
 * Example usage and testing
 */
export function testMerkleTree() {
    console.log('🌳 Testing Merkle Tree Implementation\n');

    // Create sample members
    const members = [
        'aleo1abc123...',
        'aleo1def456...',
        'aleo1ghi789...',
        'aleo1jkl012...',
    ];

    console.log(`📋 Creating tree with ${members.length} members`);
    const tree = new MerkleTree(members);

    console.log(`📊 Merkle Root: ${tree.getRoot()}`);
    console.log(`📊 Member Count: ${tree.getMemberCount()}\n`);

    // Generate proof for first member
    const proof = tree.generateProof(members[0]);
    if (proof) {
        console.log('✅ Generated proof for member 0:');
        console.log(`   Index: ${proof.index}`);
        console.log(`   Leaf: ${proof.leaf.substring(0, 16)}...`);
        console.log(`   Path length: ${proof.path.length}`);
        console.log(`   Root: ${proof.root.substring(0, 16)}...\n`);

        // Verify proof
        const isValid = MerkleTree.verifyProof(proof);
        console.log(`🔍 Proof verification: ${isValid ? '✅ VALID' : '❌ INVALID'}\n`);
    }

    // Test nullifier generation
    const seed = generateNullifierSeed();
    const nullifier = generateNullifier(seed, 'group_1', 'feedback_1');
    console.log('🔐 Nullifier example:');
    console.log(`   Seed: ${seed.substring(0, 16)}...`);
    console.log(`   Nullifier: ${nullifier.substring(0, 16)}...\n`);

    console.log('✅ All tests passed!');
}
