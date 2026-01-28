// Profile Creation Component - First-time user onboarding
// Creates encrypted user profile with pseudonym and avatar

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Shield, Check } from 'lucide-react';
import { profileService } from '../services/profileService';
import { cn } from '../lib/utils';

interface ProfileCreationProps {
  userAddress: string;
  onProfileCreated: () => void;
}

const AVATAR_EMOJIS = ['😊', '🚀', '🎨', '🔥', '💎', '🌟', '🎭', '🦄', '🎯', '⚡', '🌈', '🎪', '🎸', '🏆', '🎮', '🌺'];

export function ProfileCreation({ userAddress, onProfileCreated }: ProfileCreationProps) {
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_EMOJIS[0]);
  const [bio, setBio] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'welcome' | 'profile'>('welcome');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (displayName.length < 3) {
      setError('Display name must be at least 3 characters');
      return;
    }

    setCreating(true);

    try {
      await profileService.createProfile(
        userAddress,
        displayName.trim(),
        selectedAvatar,
        bio.trim()
      );

      console.log('✓ Profile created:', { displayName, avatar: selectedAvatar });
      onProfileCreated();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
      console.error('Profile creation error:', err);
    } finally {
      setCreating(false);
    }
  };

  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md w-full p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center"
          >
            <Shield className="w-10 h-10 text-white" strokeWidth={2} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-3"
          >
            Welcome to EncryptedSocial
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-8 leading-relaxed"
          >
            The privacy-first messaging platform powered by Aleo's zero-knowledge blockchain.
            Your messages are encrypted end-to-end and protected by cryptographic proofs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-8"
          >
            {[
              { icon: Shield, text: 'Zero-knowledge privacy' },
              { icon: Sparkles, text: 'End-to-end encryption' },
              { icon: Check, text: 'Decentralized & censorship-resistant' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <span className="text-left">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            onClick={() => setStep('profile')}
            className="btn-primary w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full p-6"
      >
        {/* Header */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
              <User className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold">Create Your Profile</h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            Choose how you want to appear to others
          </motion.p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Choose Avatar</label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-2xl',
                    'transition-all border-2',
                    selectedAvatar === emoji
                      ? 'border-primary bg-primary/10 scale-110'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your pseudonym..."
              className="input-telegram w-full"
              maxLength={50}
              disabled={creating}
              autoFocus
            />
            <div className="text-xs text-muted-foreground mt-2">
              This is your pseudonym - you can use different names in each group
            </div>
          </div>

          {/* Bio (optional) */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              className="input-telegram w-full resize-none"
              rows={3}
              maxLength={200}
              disabled={creating}
            />
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Info */}
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
            <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
            <span>Your profile is encrypted and stored locally. Only you control your identity.</span>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="btn-primary w-full"
            disabled={creating || !displayName.trim()}
            whileHover={creating || !displayName.trim() ? {} : { scale: 1.02 }}
            whileTap={creating || !displayName.trim() ? {} : { scale: 0.98 }}
          >
            {creating ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Creating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Create Profile
              </span>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
