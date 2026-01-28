// Profile Settings Component - Manage user profile and group aliases
// Wave 4: Selective identity disclosure and per-group aliases

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Edit2, Save, Shield, Eye, EyeOff } from 'lucide-react';
import { profileService } from '../services/profileService';
import type { UserProfile } from '../types/profile';
import { cn } from '../lib/utils';

interface ProfileSettingsProps {
  userAddress: string;
  onClose: () => void;
}

const AVATAR_EMOJIS = ['😊', '🚀', '🎨', '🔥', '💎', '🌟', '🎭', '🦄', '🎯', '⚡', '🌈', '🎪', '🎸', '🏆', '🎵', '🌺', '🎮', '🌸', '🎹', '🏀'];

export function ProfileSettings({ userAddress, onClose }: ProfileSettingsProps) {
  const currentProfile = profileService.getMyProfile();

  const [displayName, setDisplayName] = useState(currentProfile?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile?.avatar || AVATAR_EMOJIS[0]);
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setSaving(true);

    try {
      await profileService.updateProfile({
        displayName: displayName.trim(),
        avatar: selectedAvatar,
        bio: bio.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !saving) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="card max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
                <User className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-bold">Profile Settings</h2>
            </div>
            <motion.button
              onClick={onClose}
              disabled={saving}
              className={cn(
                'w-9 h-9 rounded-lg hover:bg-accent flex items-center justify-center',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                saving && 'opacity-50 cursor-not-allowed'
              )}
              whileHover={saving ? {} : { scale: 1.05, rotate: 90 }}
              whileTap={saving ? {} : { scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Avatar Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-3">Avatar</label>
            <div className="grid grid-cols-10 gap-2">
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
                  disabled={saving}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div className="mb-5">
            <label htmlFor="displayName" className="block text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your pseudonym..."
              className="input-telegram w-full"
              maxLength={50}
              disabled={saving}
            />
          </div>

          {/* Bio */}
          <div className="mb-5">
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              className="input-telegram w-full resize-none"
              rows={3}
              maxLength={200}
              disabled={saving}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {bio.length}/200 characters
            </div>
          </div>

          {/* Error/Success */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm"
              >
                Profile updated successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={saving}
              whileHover={saving ? {} : { scale: 1.02 }}
              whileTap={saving ? {} : { scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSave}
              className="btn-primary flex-1"
              disabled={saving || !displayName.trim()}
              whileHover={saving || !displayName.trim() ? {} : { scale: 1.02 }}
              whileTap={saving || !displayName.trim() ? {} : { scale: 0.98 }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
