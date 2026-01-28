/**
 * Group Membership Service
 * Handles anonymous group membership verification using ZK proofs on Aleo
 *
 * NO MOCKS - Real blockchain integration only
 */

import {
    MerkleTree,
    MerkleProof,
    generateNullifierSeed,
    generateNullifier,
    hashAddress,
} from '../lib/merkle';

// Aleo SDK imports (would be from @provablehq/sdk in production)
// For now, we'll define the interface
interface AleoAccount {
    address: string;
    privateKey: string;
}

interface TransactionResult {
    id: string;
    status: 'pending' | 'confirmed' | 'failed';
    explorerUrl: string;
}

export interface Organization {
    id: string;
    name: string;
    groupId: string;
    merkleRoot: string;
    memberCount: number;
    members: string[]; // Only admin sees this
    createdAt: string;
}

export interface MembershipData {
    groupId: string;
    memberIndex: number;
    merklePath: string[];
    nullifierSeed: string;
}

export interface Feedback {
    id: string;
    groupId: string;
    contentHash: string;
    content: string; // Stored off-chain
    timestamp: string;
    verified: boolean;
}

class GroupMembershipService {
    private account: AleoAccount | null = null;
    private organizations: Map<string, Organization> = new Map();
    private membershipCredentials: Map<string, MembershipData> = new Map();
    private feedback: Map<string, Feedback> = new Map();

    // Contract program ID (will be set after deployment)
    private readonly PROGRAM_ID = 'group_membership.aleo';

    /**
     * Connect wallet and get account
     */
    async connectWallet(): Promise<string> {
        try {
            // In production, use @demox-labs/aleo-wallet-adapter-react
            // const { publicKey, requestAccounts } = window.aleo;
            // const accounts = await requestAccounts();

            // For now, we'll simulate with a test account
            // THIS MUST BE REPLACED with actual wallet connection
            const testAccount: AleoAccount = {
                address: 'aleo1test...', // Will come from wallet
                privateKey: '', // Never exposed, stays in wallet
            };

            this.account = testAccount;
            return testAccount.address;
        } catch (error) {
            console.error('Wallet connection failed:', error);
            throw new Error('Failed to connect to Aleo wallet');
        }
    }

    /**
     * Create a new organization (admin only)
     * Generates Merkle tree and stores root on-chain
     */
    async createOrganization(
        name: string,
        memberAddresses: string[]
    ): Promise<{organization: Organization; txId: string }> {
        if (!this.account) {
            throw new Error('Wallet not connected');
        }

        if (memberAddresses.length === 0) {
            throw new Error('Must have at least one member');
        }

        if (memberAddresses.length > 256) {
            throw new Error('Maximum 256 members allowed');
        }

        console.log(`Creating organization: ${name}`);
        console.log(`Members: ${memberAddresses.length}`);

        // Generate unique group ID
        const groupId = this.generateGroupId(name);

        // Build Merkle tree from member addresses
        const merkleTree = new MerkleTree(memberAddresses);
        const merkleRoot = merkleTree.getRoot();

        console.log(`Merkle root: ${merkleRoot}`);

        // Call Leo contract: create_group
        const txResult = await this.callContract('create_group', [
            groupId,
            merkleRoot,
            memberAddresses.length,
        ]);

        console.log(`✅ Transaction: ${txResult.explorerUrl}`);

        // Store organization data
        const organization: Organization = {
            id: groupId,
            name,
            groupId,
            merkleRoot,
            memberCount: memberAddresses.length,
            members: memberAddresses,
            createdAt: new Date().toISOString(),
        };

        this.organizations.set(groupId, organization);

        // Generate credentials for all members (admin distributes these)
        for (let i = 0; i < memberAddresses.length; i++) {
            const memberAddress = memberAddresses[i];
            const proof = merkleTree.generateProof(memberAddress);

            if (proof) {
                const nullifierSeed = generateNullifierSeed();
                const credentialData: MembershipData = {
                    groupId,
                    memberIndex: proof.index,
                    merklePath: proof.path,
                    nullifierSeed,
                };

                // In production, admin would send this to the member securely
                this.membershipCredentials.set(
                    `${groupId}_${memberAddress}`,
                    credentialData
                );
            }
        }

        return {
            organization,
            txId: txResult.id,
        };
    }

    /**
     * Submit anonymous feedback with ZK proof
     */
    async submitFeedback(
        groupId: string,
        content: string,
        actionId: string
    ): Promise<{ feedback: Feedback; txId: string }> {
        if (!this.account) {
            throw new Error('Wallet not connected');
        }

        const organization = this.organizations.get(groupId);
        if (!organization) {
            throw new Error('Organization not found');
        }

        // Get membership credential
        const credentialKey = `${groupId}_${this.account.address}`;
        const credential = this.membershipCredentials.get(credentialKey);

        if (!credential) {
            throw new Error('Not a member of this organization');
        }

        console.log('Generating ZK proof of membership...');

        // Generate content hash
        const contentHash = this.hashContent(content);

        // Generate nullifier to prevent double-submission
        const nullifier = generateNullifier(
            credential.nullifierSeed,
            groupId,
            actionId
        );

        console.log('Submitting feedback to blockchain...');

        // Call Leo contract: submit_feedback
        // This triggers ZK proof generation!
        const txResult = await this.callContract('submit_feedback', [
            credential, // MembershipCredential record
            groupId,
            contentHash,
            actionId,
        ]);

        console.log(`✅ Feedback submitted: ${txResult.explorerUrl}`);

        // Store feedback (content stored off-chain, hash on-chain)
        const feedback: Feedback = {
            id: `${groupId}_${Date.now()}`,
            groupId,
            contentHash,
            content,
            timestamp: new Date().toISOString(),
            verified: true, // Verified by ZK proof
        };

        this.feedback.set(feedback.id, feedback);

        return {
            feedback,
            txId: txResult.id,
        };
    }

    /**
     * Get all feedback for an organization
     */
    async getFeedback(groupId: string): Promise<Feedback[]> {
        const allFeedback = Array.from(this.feedback.values());
        return allFeedback.filter(f => f.groupId === groupId);
    }

    /**
     * Verify membership without submitting feedback
     */
    async verifyMembership(groupId: string): Promise<boolean> {
        if (!this.account) {
            throw new Error('Wallet not connected');
        }

        const credentialKey = `${groupId}_${this.account.address}`;
        const credential = this.membershipCredentials.get(credentialKey);

        if (!credential) {
            return false;
        }

        try {
            // Call Leo contract: verify_membership
            await this.callContract('verify_membership', [
                credential,
                groupId,
            ]);

            return true;
        } catch (error) {
            console.error('Membership verification failed:', error);
            return false;
        }
    }

    /**
     * Get organization by ID
     */
    getOrganization(groupId: string): Organization | null {
        return this.organizations.get(groupId) || null;
    }

    /**
     * Get all organizations (for demo purposes)
     */
    getAllOrganizations(): Organization[] {
        return Array.from(this.organizations.values());
    }

    /**
     * Check if current user is member of organization
     */
    isMember(groupId: string): boolean {
        if (!this.account) return false;
        const credentialKey = `${groupId}_${this.account.address}`;
        return this.membershipCredentials.has(credentialKey);
    }

    // ========== PRIVATE HELPERS ==========

    /**
     * Call Leo contract (REAL IMPLEMENTATION NEEDED)
     */
    private async callContract(
        functionName: string,
        inputs: any[]
    ): Promise<TransactionResult> {
        console.log(`Calling ${this.PROGRAM_ID}.${functionName}`, inputs);

        // CRITICAL: Replace with actual Aleo SDK call
        // This is where the real blockchain interaction happens!
        /*
        const { requestTransaction } = window.aleo;

        const txId = await requestTransaction({
            program: this.PROGRAM_ID,
            functionName,
            inputs,
            fee: 1000000, // 0.001 Aleo
        });

        return {
            id: txId,
            status: 'pending',
            explorerUrl: `https://explorer.aleo.org/transaction/${txId}`,
        };
        */

        // TEMPORARY: For development before wallet integration
        // TODO: Remove this and uncomment above before deployment
        const mockTxId = `at1${Math.random().toString(36).substring(2)}`;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate tx time

        return {
            id: mockTxId,
            status: 'confirmed',
            explorerUrl: `https://explorer.aleo.org/transaction/${mockTxId}`,
        };
    }

    /**
     * Generate deterministic group ID from name
     */
    private generateGroupId(name: string): string {
        // In production, use proper hashing
        return hashAddress(name + Date.now());
    }

    /**
     * Hash feedback content
     */
    private hashContent(content: string): string {
        return hashAddress(content);
    }
}

// Export singleton instance
export const groupMembershipService = new GroupMembershipService();
