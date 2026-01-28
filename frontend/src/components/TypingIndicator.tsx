/**
 * Typing Indicator Component
 * Displays animated "User is typing..." indicator in Telegram style
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { truncateAddress } from '../utils/formatters';

interface TypingIndicatorProps {
  userAddress?: string;
  displayName?: string;
  isGroup?: boolean;
}

function TypingIndicatorComponent({
  userAddress,
  displayName,
  isGroup = false,
}: TypingIndicatorProps) {
  const getUserLabel = () => {
    if (displayName) return displayName;
    if (userAddress) return truncateAddress(userAddress, 6, 4);
    return 'Someone';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 px-4 py-2"
      >
        {/* Avatar placeholder for group chats */}
        {isGroup && (
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <span className="text-sm">💬</span>
          </motion.div>
        )}

        <div className="flex flex-col">
          {/* User name (only in groups) */}
          {isGroup && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs text-primary font-medium mb-0.5"
            >
              {getUserLabel()}
            </motion.div>
          )}

          {/* Typing animation */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
              />
            </div>

            <motion.span
              className="text-sm text-muted-foreground italic"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isGroup ? 'typing...' : `${getUserLabel()} is typing...`}
            </motion.span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export const TypingIndicator = memo(TypingIndicatorComponent);

/**
 * Compact Typing Indicator (for message list preview)
 */
interface CompactTypingIndicatorProps {
  className?: string;
}

function CompactTypingIndicatorComponent({ className }: CompactTypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-primary"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-primary"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-primary"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
      />
      <span className="text-xs text-primary italic ml-1">typing...</span>
    </div>
  );
}

export const CompactTypingIndicator = memo(CompactTypingIndicatorComponent);
