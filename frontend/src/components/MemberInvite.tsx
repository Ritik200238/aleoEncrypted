// Member Invite Modal Component - Premium animated modal

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react';
import { merkleService } from '../services/merkleService';
import { storageService } from '../services/storageService';
import type { Group } from '../types/group';
import { isValidAleoAddress } from '../utils/formatters';
import { cn } from '../lib/utils';

interface MemberInviteProps {
  group: Group;
  onClose: () => void;
  onMemberAdded: () => void;
}

export function MemberInvite({ group, onClose, onMemberAdded }: MemberInviteProps) {
  const [memberAddress, setMemberAddress] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = memberAddress.length > 0 && isValidAleoAddress(memberAddress);
  const showValidation = memberAddress.length > 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!memberAddress.trim()) {
      setError('Member address is required');
      return;
    }

    if (!isValidAleoAddress(memberAddress)) {
      setError('Invalid Aleo address format');
      return;
    }

    // Check if already a member
    const currentMembers = storageService.loadMemberList(group.id);
    if (currentMembers.includes(memberAddress)) {
      setError('This address is already a member');
      return;
    }

    setAdding(true);

    try {
      // Update local storage
      storageService.addMember(group.id, memberAddress);

      // Update group member count
      storageService.updateGroup(group.id, {
        memberCount: group.memberCount + 1,
        members: [...currentMembers, memberAddress],
      });

      // Update merkle root
      const updatedMembers = [...currentMembers, memberAddress];
      const newMerkleRoot = merkleService.getMerkleRoot(updatedMembers);

      storageService.updateGroup(group.id, {
        merkleRoot: newMerkleRoot,
      });

      console.log('✓ Member added:', { memberAddress, merkleRoot: newMerkleRoot });

      // TODO: Add member on blockchain in background (Wave 3)
      // For now, just storing locally for demo purposes

      onMemberAdded();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member';
      setError(errorMessage);
      console.error('Add member error:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !adding) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="card max-w-md w-full p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-bold">Add Member</h2>
            </motion.div>
            <motion.button
              onClick={onClose}
              disabled={adding}
              className={cn(
                'w-9 h-9 rounded-lg hover:bg-accent flex items-center justify-center',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                adding && 'opacity-50 cursor-not-allowed'
              )}
              whileHover={adding ? {} : { scale: 1.05, rotate: 90 }}
              whileTap={adding ? {} : { scale: 0.95 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Group info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 p-3 bg-accent/50 rounded-lg border border-border/50"
          >
            <div className="text-sm text-muted-foreground">
              Adding member to <span className="font-semibold text-foreground">{group.name}</span>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <label
                htmlFor="memberAddress"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Aleo Address
              </label>
              <div className="relative">
                <input
                  id="memberAddress"
                  type="text"
                  value={memberAddress}
                  onChange={(e) => setMemberAddress(e.target.value)}
                  placeholder="aleo1..."
                  className={cn(
                    'input-telegram w-full font-mono text-sm pr-10',
                    error && 'border-destructive focus:ring-destructive',
                    isValid && 'border-green-500/50 focus:ring-green-500'
                  )}
                  disabled={adding}
                  autoFocus
                />
                {/* Validation indicator */}
                <AnimatePresence mode="wait">
                  {showValidation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {isValid ? (
                        <ShieldCheck className="w-5 h-5 text-green-500" strokeWidth={2} />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive" strokeWidth={2} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.div
                className="text-xs text-muted-foreground mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Enter the Aleo address of the person you want to add
              </motion.div>
            </div>

            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-start gap-2"
                >
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 bg-primary/10 border border-primary/20 rounded-lg"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-3 h-3 text-primary" strokeWidth={2.5} />
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  The new member will be added to the group's merkle tree. They can start sending
                  encrypted messages immediately.
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex gap-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={adding}
                whileHover={adding ? {} : { scale: 1.02 }}
                whileTap={adding ? {} : { scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className={cn(
                  'btn-primary flex-1 relative overflow-hidden',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                disabled={adding || !memberAddress.trim() || !isValid}
                whileHover={adding || !isValid ? {} : { scale: 1.02 }}
                whileTap={adding || !isValid ? {} : { scale: 0.98 }}
              >
                {adding ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </span>
                )}

                {/* Shine effect on hover */}
                {!adding && isValid && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
