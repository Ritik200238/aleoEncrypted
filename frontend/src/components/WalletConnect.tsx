// Wallet Connection Component - Modern Premium Design

import { motion } from 'framer-motion';
import { Lock, Shield, EyeOff, Sparkles } from 'lucide-react';
import { useAleo } from '../hooks/useAleo';
import { truncateAddress } from '../utils/formatters';
import { cn } from '../lib/utils';

export function WalletConnect() {
  const { address, connected, connecting, error, connect, disconnect } = useAleo();

  if (connected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 card"
      >
        <div className="avatar bg-gradient-to-br from-primary to-primary-600">
          {address.substring(5, 7).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{truncateAddress(address)}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>Connected</span>
          </div>
        </div>
        <button
          onClick={disconnect}
          className="btn-ghost px-4 py-2 text-sm"
        >
          Disconnect
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-6 relative z-10"
      >
        {/* App Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative mx-auto w-24 h-24"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-700 rounded-3xl shadow-2xl shadow-primary/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>

        {/* Title & Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            EncryptedSocial
          </h1>
          <p className="text-muted-foreground text-lg">Privacy by Default. Powered by Aleo.</p>
        </motion.div>

        {/* Connect Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-8 space-y-6 backdrop-blur-xl"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect your Aleo wallet to start sending encrypted messages with zero-knowledge
            privacy. Your conversations remain completely private.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            onClick={connect}
            disabled={connecting}
            className={cn(
              'btn-primary w-full relative overflow-hidden group',
              connecting && 'opacity-70 cursor-not-allowed'
            )}
            whileHover={{ scale: connecting ? 1 : 1.02 }}
            whileTap={{ scale: connecting ? 1 : 0.98 }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {connecting ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Connecting...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Connect Wallet
                </>
              )}
            </span>
            {!connecting && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>

          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Demo version using mock wallet. In production, connect your Leo Wallet for full
            functionality.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 text-sm"
        >
          {[
            { icon: Lock, text: 'End-to-end encrypted messages' },
            { icon: EyeOff, text: 'Zero-knowledge membership proofs' },
            { icon: Shield, text: 'No data harvesting or surveillance' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/50 border border-border/50 backdrop-blur-sm"
            >
              <feature.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Sparkle decoration */}
        <motion.div
          className="flex justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
