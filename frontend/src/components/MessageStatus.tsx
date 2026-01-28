// Message Status Component - Real-time transaction status tracking
// Shows pending/confirmed/failed states with automatic retry

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCheck, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

export type MessageStatus = 'sending' | 'pending' | 'confirmed' | 'failed';

interface MessageStatusProps {
  status: MessageStatus;
  onRetry?: () => void;
  isOwn?: boolean;
}

function MessageStatusComponent({ status, onRetry, isOwn = false }: MessageStatusProps) {
  const statusConfig = {
    sending: {
      icon: Clock,
      color: isOwn ? 'text-white/70' : 'text-muted-foreground',
      label: 'Sending...',
      animate: true,
    },
    pending: {
      icon: Check,
      color: isOwn ? 'text-white/70' : 'text-amber-500',
      label: 'Pending confirmation',
      animate: true,
    },
    confirmed: {
      icon: CheckCheck,
      color: isOwn ? 'text-white/90' : 'text-green-500',
      label: 'Delivered',
      animate: false,
    },
    failed: {
      icon: AlertCircle,
      color: 'text-destructive',
      label: 'Failed to send',
      animate: false,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5"
      >
        <motion.div
          animate={
            config.animate
              ? {
                  rotate: status === 'sending' ? 360 : 0,
                  scale: status === 'pending' ? [1, 1.2, 1] : 1,
                }
              : {}
          }
          transition={
            config.animate
              ? {
                  rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1.5, repeat: Infinity },
                }
              : {}
          }
        >
          <Icon className={cn('w-3.5 h-3.5', config.color)} strokeWidth={2} />
        </motion.div>

        {/* Show retry button for failed messages */}
        {status === 'failed' && onRetry && (
          <motion.button
            onClick={onRetry}
            className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Memoized export for performance
export const MessageStatus = memo(MessageStatusComponent);

// Status Badge Component (for message list)
interface StatusBadgeProps {
  status: MessageStatus;
  count?: number;
}

function StatusBadgeComponent({ status, count }: StatusBadgeProps) {
  const badgeConfig = {
    sending: {
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      label: 'Sending',
    },
    pending: {
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      label: 'Pending',
    },
    confirmed: {
      color: 'bg-green-500/10 text-green-500 border-green-500/20',
      label: 'Confirmed',
    },
    failed: {
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      label: 'Failed',
    },
  };

  const config = badgeConfig[status];

  if (status === 'confirmed' && !count) return null; // Don't show badge for confirmed

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        config.color
      )}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      <span>{config.label}</span>
      {count && count > 1 && <span className="font-bold">({count})</span>}
    </motion.div>
  );
}

export const StatusBadge = memo(StatusBadgeComponent);
