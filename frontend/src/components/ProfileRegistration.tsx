/**
 * Profile Registration Component
 * Allows users to register their profile on-chain
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { userRegistryService, type UserProfile } from '../services/userRegistryService';
import { cn } from '../lib/utils';

interface ProfileRegistrationProps {
  walletAddress: string;
  onSuccess?: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export function ProfileRegistration({
  walletAddress,
  onSuccess,
  onCancel,
}: ProfileRegistrationProps) {
  const [formData, setFormData] = useState({
    handle: '',
    name: '',
    avatar: '',
    bio: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Validate handle
  const validateHandle = async (handle: string) => {
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;

    if (cleanHandle.length < 3 || cleanHandle.length > 20) {
      setErrors(prev => ({
        ...prev,
        handle: 'Handle must be 3-20 characters',
      }));
      setHandleAvailable(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanHandle)) {
      setErrors(prev => ({
        ...prev,
        handle: 'Handle can only contain letters, numbers, and underscore',
      }));
      setHandleAvailable(false);
      return;
    }

    // Check availability
    setIsCheckingHandle(true);
    setErrors(prev => ({ ...prev, handle: '' }));

    try {
      const handleHash = userRegistryService.hashHandle(cleanHandle);
      const available = await userRegistryService.isHandleAvailable(handleHash);

      setHandleAvailable(available);

      if (!available) {
        setErrors(prev => ({
          ...prev,
          handle: 'Handle already taken',
        }));
      }
    } catch (err) {
      console.error('Handle check failed:', err);
      setHandleAvailable(null);
    } finally {
      setIsCheckingHandle(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    if (field === 'handle' && value.length >= 3) {
      validateHandle(value);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.handle.trim()) {
      newErrors.handle = 'Handle is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!handleAvailable) {
      newErrors.handle = 'Please choose an available handle';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Generate default avatar if not provided
      const avatarUrl =
        formData.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.handle}`;

      // Register profile on-chain
      const profile = await userRegistryService.registerProfile({
        handle: formData.handle,
        name: formData.name,
        avatar: avatarUrl,
        bio: formData.bio,
      });

      setSuccessMessage('Profile registered successfully!');

      // Call success callback
      if (onSuccess) {
        setTimeout(() => onSuccess(profile), 1500);
      }
    } catch (err: any) {
      console.error('Profile registration failed:', err);
      setErrors({
        submit: err.message || 'Registration failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background rounded-xl border border-border p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <UserCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Create Your Profile</h2>
          <p className="text-muted-foreground">
            Register your profile on-chain to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Handle */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Handle <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.handle}
                onChange={(e) => handleInputChange('handle', e.target.value)}
                placeholder="@username"
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-accent border transition-all',
                  errors.handle
                    ? 'border-red-500 focus:ring-red-500'
                    : handleAvailable
                    ? 'border-green-500 focus:ring-green-500'
                    : 'border-border focus:ring-primary',
                  'focus:outline-none focus:ring-2'
                )}
              />
              {isCheckingHandle && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isCheckingHandle && handleAvailable === true && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
              {!isCheckingHandle && handleAvailable === false && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.handle && (
              <p className="mt-1 text-sm text-red-500">{errors.handle}</p>
            )}
            {handleAvailable && !errors.handle && (
              <p className="mt-1 text-sm text-green-500">
                Handle is available!
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              className={cn(
                'w-full px-4 py-3 rounded-lg bg-accent border transition-all',
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-primary',
                'focus:outline-none focus:ring-2'
              )}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Avatar URL (optional)
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => handleInputChange('avatar', e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="flex-1 px-4 py-3 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formData.avatar && (
                <img
                  src={formData.avatar}
                  alt="Avatar preview"
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Leave empty for auto-generated avatar
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Bio (optional)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={160}
              className="w-full px-4 py-3 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.bio.length}/160 characters
            </p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-500">{errors.submit}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-500">{successMessage}</p>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !handleAvailable}
              className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Profile'
              )}
            </button>
          </div>
        </form>

        {/* Wallet Info */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Wallet: {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
