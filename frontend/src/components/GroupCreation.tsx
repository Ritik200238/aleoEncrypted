// Group Creation Modal Component - Premium animated modal

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Sparkles, Shield } from 'lucide-react';
import { encryptionService } from '../services/encryptionService';
import { storageService } from '../services/storageService';
import type { Group } from '../types/group';
import { MAX_GROUP_NAME_LENGTH } from '../utils/constants';
import { cn } from '../lib/utils';

interface GroupCreationProps {
  userAddress: string;
  onClose: () => void;
  onGroupCreated: (group: Group) => void;
}

export function GroupCreation({ userAddress, onClose, onGroupCreated }: GroupCreationProps) {
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (groupName.length > MAX_GROUP_NAME_LENGTH) {
      setError(`Group name must be less than ${MAX_GROUP_NAME_LENGTH} characters`);
      return;
    }

    setCreating(true);

    try {
      // Generate group ID
      const groupId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Generate group encryption key (now async)
      const groupKey = await encryptionService.deriveGroupKey(groupId, userAddress);

      // Create merkle root (now async)
      const merkleRoot = await encryptionService.hashAddress(userAddress);

      // Create group object
      const group: Group = {
        id: groupId,
        name: groupName,
        owner: userAddress,
        memberCount: 1,
        merkleRoot: merkleRoot,
        createdAt: Date.now(),
        members: [userAddress],
      };

      // Save group key
      storageService.saveGroupKey(groupId, groupKey);

      // Save member list
      storageService.saveMemberList(groupId, [userAddress]);

      console.log('✓ Group created:', { groupId, merkleRoot });

      // TODO: Create group on blockchain in background (Wave 3)
      // For now, just storing locally for demo purposes

      onGroupCreated(group);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create group';
      setError(errorMessage);
      console.error('Group creation error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !creating) {
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
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-bold">Create New Group</h2>
            </motion.div>
            <motion.button
              onClick={onClose}
              disabled={creating}
              className={cn(
                'w-9 h-9 rounded-lg hover:bg-accent flex items-center justify-center',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                creating && 'opacity-50 cursor-not-allowed'
              )}
              whileHover={creating ? {} : { scale: 1.05, rotate: 90 }}
              whileTap={creating ? {} : { scale: 0.95 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

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
                htmlFor="groupName"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Group Name
              </label>
              <motion.div
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  id="groupName"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className={cn(
                    'input-telegram w-full',
                    error && 'border-destructive focus:ring-destructive'
                  )}
                  maxLength={MAX_GROUP_NAME_LENGTH}
                  disabled={creating}
                  autoFocus
                />
              </motion.div>
              <div className="flex items-center justify-between mt-2">
                <motion.div
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {groupName.length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-1"
                    >
                      <Shield className="w-3 h-3 text-primary" />
                      <span>Private & encrypted</span>
                    </motion.span>
                  )}
                </motion.div>
                <div
                  className={cn(
                    'text-xs font-mono transition-colors',
                    groupName.length >= MAX_GROUP_NAME_LENGTH
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  )}
                >
                  {groupName.length}/{MAX_GROUP_NAME_LENGTH}
                </div>
              </div>
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
                  Your group will be created on the Aleo blockchain with zero-knowledge privacy.
                  Only group members can see messages.
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
                disabled={creating}
                whileHover={creating ? {} : { scale: 1.02 }}
                whileTap={creating ? {} : { scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className={cn(
                  'btn-primary flex-1 relative overflow-hidden',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                disabled={creating || !groupName.trim()}
                whileHover={creating || !groupName.trim() ? {} : { scale: 1.02 }}
                whileTap={creating || !groupName.trim() ? {} : { scale: 0.98 }}
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Create Group
                  </span>
                )}

                {/* Shine effect on hover */}
                {!creating && groupName.trim() && (
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
