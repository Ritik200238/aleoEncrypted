/**
 * Transaction Status - Shows blockchain transaction progress
 * Displays pending/confirmed/failed states for Aleo transactions
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle, ExternalLink, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  type: 'create_group' | 'add_member' | 'send_message';
  status: TransactionStatus;
  timestamp: number;
  description?: string;
  explorerUrl?: string;
}

interface TransactionStatusProps {
  transaction: Transaction;
  onClose?: () => void;
}

export function TransactionStatus({ transaction, onClose }: TransactionStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (transaction.status === 'pending') {
      const interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - transaction.timestamp) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [transaction.status, transaction.timestamp]);

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'pending':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'confirmed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 'pending':
        return 'Transaction Pending';
      case 'confirmed':
        return 'Transaction Confirmed';
      case 'failed':
        return 'Transaction Failed';
    }
  };

  const getTypeText = () => {
    switch (transaction.type) {
      case 'create_group':
        return 'Creating group on Aleo blockchain';
      case 'add_member':
        return 'Adding member to group';
      case 'send_message':
        return 'Sending encrypted message';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'p-4 rounded-xl border shadow-lg',
        transaction.status === 'pending' && 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
        transaction.status === 'confirmed' && 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
        transaction.status === 'failed' && 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getStatusIcon()}</div>

        <div className="flex-1">
          <h4 className="font-semibold mb-1">{getStatusText()}</h4>
          <p className="text-sm text-muted-foreground mb-2">{getTypeText()}</p>

          {transaction.description && (
            <p className="text-xs text-muted-foreground mb-2">{transaction.description}</p>
          )}

          {transaction.status === 'pending' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{timeElapsed}s elapsed</span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <code className="text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded font-mono">
              {transaction.id.substring(0, 16)}...
            </code>

            {transaction.explorerUrl && (
              <a
                href={transaction.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View in Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {onClose && transaction.status !== 'pending' && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Transaction List - Shows all recent transactions
 */
interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (tx: Transaction) => void;
}

export function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {transactions.map((tx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => onTransactionClick?.(tx)}
            className={cn(
              'cursor-pointer',
              onTransactionClick && 'hover:opacity-80 transition-opacity'
            )}
          >
            <TransactionStatus transaction={tx} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Transaction Toast - Floating notification for transaction updates
 */
interface TransactionToastProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionToast({ transaction, onClose }: TransactionToastProps) {
  useEffect(() => {
    // Auto-close confirmed/failed transactions after 5 seconds
    if (transaction.status !== 'pending') {
      const timeout = setTimeout(onClose, 5000);
      return () => clearTimeout(timeout);
    }
  }, [transaction.status, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-4 right-4 z-50 max-w-md"
    >
      <TransactionStatus transaction={transaction} onClose={onClose} />
    </motion.div>
  );
}
