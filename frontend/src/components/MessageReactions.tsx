/**
 * Message Reactions Component
 * Telegram-style emoji reactions with animations
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Reaction } from '../types/message';

interface MessageReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  currentUserAddress: string;
  isOwn?: boolean;
}

function MessageReactionsComponent({
  reactions,
  onReact,
  onRemoveReaction,
  currentUserAddress,
  isOwn = false,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Group reactions by emoji and count
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        count: 0,
        users: [],
        hasCurrentUser: false,
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.userAddress);
    if (reaction.userAddress === currentUserAddress) {
      acc[reaction.emoji].hasCurrentUser = true;
    }
    return acc;
  }, {} as Record<string, { count: number; users: string[]; hasCurrentUser: boolean }>);

  // Quick reaction emojis (most common)
  const quickEmojis = ['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '🎉'];

  const handleReaction = (emoji: string) => {
    const hasReacted = groupedReactions[emoji]?.hasCurrentUser;
    if (hasReacted) {
      onRemoveReaction(emoji);
    } else {
      onReact(emoji);
    }
    setShowPicker(false);
  };

  return (
    <div className="relative">
      {/* Existing Reactions */}
      {Object.keys(groupedReactions).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          <AnimatePresence mode="popLayout">
            {Object.entries(groupedReactions).map(([emoji, data]) => (
              <motion.button
                key={emoji}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReaction(emoji)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition-colors',
                  data.hasCurrentUser
                    ? isOwn
                      ? 'bg-white/20 border-white/40 text-white'
                      : 'bg-primary/20 border-primary/40 text-primary'
                    : isOwn
                    ? 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                    : 'bg-accent border-border hover:bg-accent/80'
                )}
                title={`${data.users.length} reaction${data.users.length > 1 ? 's' : ''}`}
              >
                <span>{emoji}</span>
                {data.count > 1 && (
                  <span className="text-xs font-medium">{data.count}</span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Reaction Button */}
      <div className="relative inline-block">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            'p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100',
            isOwn
              ? 'hover:bg-white/10 text-white/70'
              : 'hover:bg-accent text-muted-foreground'
          )}
          title="React to message"
        >
          {showPicker ? (
            <X className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </motion.button>

        {/* Reaction Picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute z-50 p-2 rounded-lg border shadow-lg backdrop-blur-sm',
                'bg-background/95 border-border',
                isOwn ? 'right-0 bottom-full mb-2' : 'left-0 bottom-full mb-2'
              )}
            >
              <div className="flex flex-wrap gap-1 max-w-[200px]">
                {quickEmojis.map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(emoji)}
                    className={cn(
                      'text-2xl p-2 rounded-lg hover:bg-accent transition-colors',
                      groupedReactions[emoji]?.hasCurrentUser && 'bg-primary/20'
                    )}
                    title={emoji}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const MessageReactions = memo(MessageReactionsComponent);

/**
 * Reaction Animation Component
 * For showing reaction animations when someone reacts
 */
interface ReactionAnimationProps {
  emoji: string;
  show: boolean;
}

export function ReactionAnimation({ emoji, show }: ReactionAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, y: 0 }}
          animate={{
            scale: [0, 1.5, 1],
            y: [-20, -40, -60],
            opacity: [1, 1, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute text-3xl pointer-events-none"
        >
          {emoji}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
