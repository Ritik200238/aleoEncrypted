/**
 * Delivery Status Indicator - Telegram-style checkmarks
 * Shows sent ✓, delivered ✓✓, and read ✓✓ (blue) indicators
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock } from 'lucide-react';
import type { DeliveryStatus } from '../types/message';

interface DeliveryStatusIndicatorProps {
  status: DeliveryStatus;
  isOwn?: boolean;
  deliveredCount?: number; // For group chats
  readCount?: number; // For group chats
}

function DeliveryStatusIndicatorComponent({
  status,
  isOwn = false,
  deliveredCount,
  readCount,
}: DeliveryStatusIndicatorProps) {
  if (!isOwn) return null; // Only show for own messages

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className="w-3.5 h-3.5 text-white/70" strokeWidth={2} />
          </motion.div>
        );

      case 'sent':
        return (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check className="w-3.5 h-3.5 text-white/70" strokeWidth={2.5} />
          </motion.div>
        );

      case 'delivered':
        return (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <CheckCheck className="w-3.5 h-3.5 text-white/70" strokeWidth={2.5} />
          </motion.div>
        );

      case 'read':
        return (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  const getTooltipText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        if (deliveredCount && deliveredCount > 0) {
          return `Delivered to ${deliveredCount} member${deliveredCount > 1 ? 's' : ''}`;
        }
        return 'Delivered';
      case 'read':
        if (readCount && readCount > 0) {
          return `Read by ${readCount} member${readCount > 1 ? 's' : ''}`;
        }
        return 'Read';
      default:
        return '';
    }
  };

  return (
    <div
      className="inline-flex items-center"
      title={getTooltipText()}
    >
      {getStatusIcon()}
    </div>
  );
}

export const DeliveryStatusIndicator = memo(DeliveryStatusIndicatorComponent);
