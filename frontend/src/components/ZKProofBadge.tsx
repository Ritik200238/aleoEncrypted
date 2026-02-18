/**
 * ZK Proof Badge - Shows zero-knowledge proof verification status
 * Displays when messages are verified using Aleo ZK proofs
 */

import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Info } from 'lucide-react';
import { useState } from 'react';

interface ZKProofBadgeProps {
  isVerified: boolean;
  memberCommitment?: string;
  merkleRoot?: string;
  showDetails?: boolean;
}

export function ZKProofBadge({
  isVerified,
  memberCommitment,
  merkleRoot,
  showDetails = false,
}: ZKProofBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isVerified) return null;

  return (
    <div className="relative inline-flex items-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Shield className="w-3 h-3 text-green-500" />
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        <span className="text-xs font-medium text-green-600 dark:text-green-400">
          ZK Verified
        </span>
      </motion.div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-card border border-border rounded-lg shadow-lg z-50"
        >
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Merkle Membership Verified
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sender proved group membership via group_membership.aleo — identity stays hidden on-chain.
                </p>
              </div>
            </div>

            {showDetails && memberCommitment && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-mono text-muted-foreground truncate">
                  Commitment: {memberCommitment.substring(0, 16)}...
                </p>
              </div>
            )}

            {showDetails && merkleRoot && (
              <div>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  Root: {merkleRoot.substring(0, 16)}...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * ZK Proof Status Panel - Detailed view for group info
 */
interface ZKProofStatusProps {
  groupId: string;
  merkleRoot: string;
  memberCount: number;
  memberProofs?: Array<{
    address: string;
    commitment: string;
    merklePath: string[];
    verified: boolean;
  }>;
}

export function ZKProofStatusPanel({
  groupId,
  merkleRoot,
  memberCount,
  memberProofs = [],
}: ZKProofStatusProps) {
  const verifiedCount = memberProofs.filter(p => p.verified).length;

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <Shield className="w-6 h-6 text-green-500" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            Zero-Knowledge Privacy
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Group membership verified via group_membership.aleo Merkle proof (8-level Merkle tree + nullifier)
          </p>

          <div className="mt-3 space-y-2">
            {/* Member Stats */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Members with Merkle Credentials:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {verifiedCount}/{memberCount}
              </span>
            </div>

            {/* Merkle Root */}
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded border border-border">
              <p className="text-xs text-muted-foreground mb-1">Merkle Root</p>
              <p className="text-xs font-mono text-foreground break-all">
                {merkleRoot}
              </p>
            </div>

            {/* Group ID */}
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded border border-border">
              <p className="text-xs text-muted-foreground mb-1">Group ID</p>
              <p className="text-xs font-mono text-foreground break-all">
                {groupId}
              </p>
            </div>
          </div>

          {/* Member Proofs List */}
          {memberProofs.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-foreground mb-2">
                Member Verification Status
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {memberProofs.map((proof, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-white/50 dark:bg-black/20 rounded text-xs"
                  >
                    <span className="font-mono truncate flex-1">
                      {proof.address.substring(0, 12)}...
                    </span>
                    {proof.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>How it works:</strong> Each member's identity is hashed into a commitment,
              which is added to a Merkle tree. Messages prove membership without revealing who sent them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline ZK Verification Indicator - Small badge for message bubbles
 */
export function ZKVerifiedIndicator() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-500/20"
      title="Verified with Zero-Knowledge Proof"
    >
      <Shield className="w-2.5 h-2.5 text-green-500" />
      <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
        ZK
      </span>
    </motion.div>
  );
}
