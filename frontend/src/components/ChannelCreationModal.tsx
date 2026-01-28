/**
 * Channel Creation Modal - Create public/private channels
 * Channels are broadcast-only (owner posts, others can view)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, Lock, Globe, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { chatService } from '../services/chatService';
import { toast } from './Toast';

interface ChannelCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserAddress: string;
  onChannelCreated: (channelId: string) => void;
}

export function ChannelCreationModal({
  isOpen,
  onClose,
  currentUserAddress,
  onChannelCreated,
}: ChannelCreationModalProps) {
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channelAvatar, setChannelAvatar] = useState('📢');
  const [isPrivate, setIsPrivate] = useState(false);

  const avatarOptions = ['📢', '📻', '🎙️', '📡', '🎬', '🎵', '🎮', '💼', '🔬', '🎨', '🏆', '🚀'];

  const handleCreate = () => {
    if (!channelName.trim()) {
      toast.error('Please enter a channel name');
      return;
    }

    // Create channel (using group model with type='channel')
    const channel = chatService.createGroup(
      currentUserAddress,
      channelName,
      channelAvatar,
      [], // Channels start with no members (broadcast only)
      channelDescription || `${isPrivate ? 'Private' : 'Public'} channel`
    );

    // Mark as channel
    channel.type = 'channel';

    // Save
    chatService.saveChat(channel);

    toast.success(`Channel "${channelName}" created!`);
    onChannelCreated(channel.id);
    handleClose();
  };

  const handleClose = () => {
    setChannelName('');
    setChannelDescription('');
    setChannelAvatar('📢');
    setIsPrivate(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-lg"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Radio className="w-6 h-6 text-primary" />
              New Channel
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Channel Type */}
            <div>
              <label className="block text-sm font-medium mb-3">Channel Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsPrivate(false)}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    !isPrivate
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-border/80'
                  )}
                >
                  <Globe className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-medium mb-1">Public</div>
                  <div className="text-xs text-muted-foreground">
                    Anyone can find and join
                  </div>
                </button>

                <button
                  onClick={() => setIsPrivate(true)}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    isPrivate
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-border/80'
                  )}
                >
                  <Lock className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="font-medium mb-1">Private</div>
                  <div className="text-xs text-muted-foreground">
                    Invite-only access
                  </div>
                </button>
              </div>
            </div>

            {/* Channel Avatar */}
            <div>
              <label className="block text-sm font-medium mb-3">Channel Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setChannelAvatar(emoji)}
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all',
                      channelAvatar === emoji
                        ? 'bg-primary scale-110 shadow-lg'
                        : 'bg-accent hover:scale-105 hover:bg-accent/80'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Channel Name</label>
              <input
                type="text"
                placeholder="Enter channel name..."
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={50}
                autoFocus
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {channelName.length}/50
              </div>
            </div>

            {/* Channel Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="What's your channel about?"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {channelDescription.length}/200
              </div>
            </div>

            {/* Aleo Info */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="text-sm">
                <div className="font-medium text-primary mb-1">
                  🔐 Aleo Zero-Knowledge Channels
                </div>
                <div className="text-muted-foreground text-xs">
                  • Verified ownership with Aleo blockchain
                  <br />
                  • Privacy-preserving subscriber list
                  <br />
                  • Token-gated access (coming soon)
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleCreate}
              disabled={!channelName.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Channel
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
