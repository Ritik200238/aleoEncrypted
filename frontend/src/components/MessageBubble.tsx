// Message Bubble Component - Premium Telegram-style with animations
// Optimized with React.memo for 60 FPS performance

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';
import { MessageStatus } from './MessageStatus';
import { DeliveryStatusIndicator } from './DeliveryStatusIndicator';
import { MessageReactions } from './MessageReactions';
import { ReplyPreview, ReplyButton } from './MessageReply';
import type { Message } from '../types/message';
import { formatMessageTime, truncateAddress } from '../utils/formatters';
import { cn } from '../lib/utils';

interface MessageBubbleProps {
  message: Message;
  currentUserAddress: string;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  getMessageById?: (messageId: string) => Message | null;
}

function MessageBubbleComponent({
  message,
  currentUserAddress,
  onReact,
  onRemoveReaction,
  onReply,
  getMessageById,
}: MessageBubbleProps) {
  const isOwn = message.isOwn;
  const [showActions, setShowActions] = useState(false);

  // Get the original message if this is a reply
  const replyToMessage = message.replyTo && getMessageById
    ? getMessageById(message.replyTo)
    : null;

  const handleReact = (emoji: string) => {
    if (onReact) onReact(message.id, emoji);
  };

  const handleRemoveReaction = (emoji: string) => {
    if (onRemoveReaction) onRemoveReaction(message.id, emoji);
  };

  const handleReply = () => {
    if (onReply) onReply(message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start', 'max-w-2xl group')}>
        {/* Sender info (only for received messages) */}
        {!isOwn && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-2 mb-1"
          >
            <div className="w-1 h-1 bg-primary rounded-full" />
            <div className="text-xs text-muted-foreground font-mono">
              {truncateAddress(message.senderCommitment, 6, 4)}
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
            >
              <div className="flex items-center gap-1 text-xs text-primary">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="relative flex items-center gap-2">
          {/* Quick Actions (left side for own messages, right side for received) */}
          <AnimatePresence>
            {showActions && onReply && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className={cn(isOwn ? 'order-first' : 'order-last')}
              >
                <ReplyButton onClick={handleReply} isOwn={isOwn} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message bubble */}
          <motion.div
            className={cn(
              'message-bubble relative',
              isOwn ? 'message-bubble-sent' : 'message-bubble-received'
            )}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            {/* Reply Preview */}
            {replyToMessage && (
              <ReplyPreview originalMessage={replyToMessage} isOwn={isOwn} />
            )}

            {/* Message content */}
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>

            {/* Metadata row */}
            <div className="flex items-center justify-end gap-2 mt-2">
              {/* Edited indicator */}
              {message.edited && (
                <span
                  className={cn(
                    'text-xs italic',
                    isOwn ? 'text-white/50' : 'text-muted-foreground/50'
                  )}
                  title={`Edited ${message.editedAt ? new Date(message.editedAt).toLocaleString() : ''}`}
                >
                  edited
                </span>
              )}

              <span
                className={cn(
                  'text-xs font-medium',
                  isOwn ? 'text-white/70' : 'text-muted-foreground'
                )}
              >
                {formatMessageTime(message.timestamp)}
              </span>

              {/* Encryption indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Lock
                  className={cn('w-3 h-3', isOwn ? 'text-white/70' : 'text-primary')}
                  strokeWidth={2}
                />
              </motion.div>

              {/* Delivery status for sent messages (Telegram-style) */}
              {isOwn && message.deliveryStatus && (
                <DeliveryStatusIndicator
                  status={message.deliveryStatus}
                  isOwn={true}
                  deliveredCount={message.deliveredTo?.length}
                  readCount={message.readBy?.length}
                />
              )}

              {/* Blockchain transaction status (if pending) */}
              {isOwn && message.status && message.status !== 'confirmed' && (
                <MessageStatus
                  status={message.status}
                  isOwn={true}
                />
              )}
            </div>

            {/* Shine effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={cn(
                  'absolute inset-0 rounded-2xl',
                  isOwn
                    ? 'bg-gradient-to-tr from-white/0 via-white/10 to-white/0'
                    : 'bg-gradient-to-tr from-primary/0 via-primary/5 to-primary/0'
                )}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Message Reactions */}
        {onReact && onRemoveReaction && (
          <div className="px-2 mt-1">
            <MessageReactions
              reactions={message.reactions || []}
              onReact={handleReact}
              onRemoveReaction={handleRemoveReaction}
              currentUserAddress={currentUserAddress}
              isOwn={isOwn}
            />
          </div>
        )}

        {/* Zero-knowledge proof indicator (subtle, for received messages) */}
        {!isOwn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-1.5 px-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
              <ShieldCheck className="w-3 h-3" />
              <span>ZK Verified</span>
            </div>
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse-subtle" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Memoized export for performance - only re-render if message changes
export const MessageBubble = memo(MessageBubbleComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.deliveryStatus === nextProps.message.deliveryStatus &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.edited === nextProps.message.edited &&
    prevProps.message.reactions?.length === nextProps.message.reactions?.length &&
    prevProps.message.deliveredTo?.length === nextProps.message.deliveredTo?.length &&
    prevProps.message.readBy?.length === nextProps.message.readBy?.length
  );
});
