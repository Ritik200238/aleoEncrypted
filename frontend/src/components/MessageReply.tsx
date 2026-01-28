/**
 * Message Reply Component
 * Telegram-style reply-to-message UI
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Reply, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { truncateAddress } from '../utils/formatters';
import type { Message } from '../types/message';

/**
 * Reply Preview in Message Bubble
 * Shows the quoted message inside the message bubble
 */
interface ReplyPreviewProps {
  originalMessage: Message | null;
  isOwn?: boolean;
}

function ReplyPreviewComponent({ originalMessage, isOwn = false }: ReplyPreviewProps) {
  if (!originalMessage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'mb-2 pl-3 border-l-2 py-1',
        isOwn ? 'border-white/40' : 'border-primary'
      )}
    >
      <div
        className={cn(
          'text-xs font-medium mb-0.5',
          isOwn ? 'text-white/90' : 'text-primary'
        )}
      >
        {originalMessage.isOwn
          ? 'You'
          : truncateAddress(originalMessage.senderCommitment, 6, 4)}
      </div>
      <div
        className={cn(
          'text-sm line-clamp-2',
          isOwn ? 'text-white/70' : 'text-muted-foreground'
        )}
      >
        {originalMessage.content}
      </div>
    </motion.div>
  );
}

export const ReplyPreview = memo(ReplyPreviewComponent);

/**
 * Reply Input Bar
 * Shows above the message input when replying to a message
 */
interface ReplyInputBarProps {
  originalMessage: Message;
  onCancel: () => void;
}

function ReplyInputBarComponent({ originalMessage, onCancel }: ReplyInputBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-4 py-2 bg-accent border-t border-border"
    >
      <Reply className="w-4 h-4 text-primary flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-primary">
          Replying to{' '}
          {originalMessage.isOwn
            ? 'yourself'
            : truncateAddress(originalMessage.senderCommitment, 6, 4)}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {originalMessage.content}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onCancel}
        className="p-1 rounded-full hover:bg-background transition-colors"
        title="Cancel reply"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </motion.button>
    </motion.div>
  );
}

export const ReplyInputBar = memo(ReplyInputBarComponent);

/**
 * Reply Button
 * Button to initiate a reply (shown on hover)
 */
interface ReplyButtonProps {
  onClick: () => void;
  isOwn?: boolean;
}

function ReplyButtonComponent({ onClick, isOwn = false }: ReplyButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        'p-1.5 rounded-full transition-colors',
        isOwn
          ? 'bg-white/10 hover:bg-white/20 text-white'
          : 'bg-accent hover:bg-accent/80 text-primary'
      )}
      title="Reply to message"
    >
      <Reply className="w-4 h-4" />
    </motion.button>
  );
}

export const ReplyButton = memo(ReplyButtonComponent);

/**
 * Reply Thread Indicator
 * Shows a visual thread line connecting reply to original message
 */
interface ReplyThreadIndicatorProps {
  show: boolean;
  isOwn?: boolean;
}

export function ReplyThreadIndicator({ show, isOwn = false }: ReplyThreadIndicatorProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: '100%', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'absolute w-0.5 top-0 bottom-0',
        isOwn ? 'right-full mr-2 bg-white/20' : 'left-full ml-2 bg-primary/20'
      )}
    />
  );
}
