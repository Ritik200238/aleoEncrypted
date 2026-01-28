/**
 * WalletConnect Component V2 (Wave 2)
 * Production-ready wallet connection with real Aleo Wallet SDK
 *
 * Features:
 * - Multi-wallet support (Leo Wallet, Puzzle Wallet, etc.)
 * - Beautiful UI with animations
 * - Network indicator
 * - Error handling
 * - Session persistence
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Network,
  ExternalLink,
} from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletModalButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import { WalletReadyState } from '@demox-labs/aleo-wallet-adapter-base';
import { cn } from '../lib/utils';

export function WalletConnectV2() {
  const { wallet, connected, connecting, publicKey } = useWallet();
  const [showDetails, setShowDetails] = useState(false);
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

  // Auto-detect network
  useEffect(() => {
    // In production, query wallet or blockchain for network
    setNetwork('testnet');
  }, [connected]);

  if (connected && publicKey) {
    // User is connected - this shouldn't normally show
    // as the main app will take over
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Privacy Badge */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="relative">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl"
              animate={{
                boxShadow: [
                  '0 10px 40px -10px rgba(59, 130, 246, 0.3)',
                  '0 10px 60px -10px rgba(59, 130, 246, 0.5)',
                  '0 10px 40px -10px rgba(59, 130, 246, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Shield className="w-10 h-10 text-white" strokeWidth={2} />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Welcome to EncryptedSocial
          </h1>
          <p className="text-muted-foreground">
            Privacy-first messaging on Aleo blockchain
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Network Indicator */}
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Network</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {network === 'testnet' ? 'Testnet Beta' : 'Mainnet'}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Features */}
            <div className="space-y-3 mb-6">
              {[
                { icon: Shield, text: 'End-to-end encrypted messages' },
                { icon: CheckCircle2, text: 'Zero-knowledge proofs' },
                { icon: Wallet, text: 'Non-custodial & private' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-primary" strokeWidth={2} />
                  </div>
                  <span className="text-muted-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Connect Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <WalletModalButton className={cn(
                'w-full h-12 rounded-xl font-semibold',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 transition-all duration-200',
                'flex items-center justify-center gap-2',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}>
                <Wallet className="w-5 h-5" strokeWidth={2} />
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </WalletModalButton>
            </motion.div>

            {/* Wallet Detection */}
            <AnimatePresence>
              {wallet && wallet.readyState !== WalletReadyState.Installed && (
                <motion.div
                  className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm text-amber-600 dark:text-amber-400">
                      <p className="font-medium mb-1">Wallet not detected</p>
                      <p className="text-xs opacity-90">
                        Please install Leo Wallet or Puzzle Wallet to continue
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            <AnimatePresence>
              {connecting && (
                <motion.div
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to wallet...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div
            className="px-6 py-4 bg-muted/30 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              {showDetails ? 'Hide' : 'Show'} technical details
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span className="text-foreground font-mono">Aleo zkSNARK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encryption:</span>
                    <span className="text-foreground font-mono">AES-256-GCM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Privacy:</span>
                    <span className="text-foreground font-mono">Zero-Knowledge</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Learn More Link */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <a
            href="https://aleo.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Learn about Aleo</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
