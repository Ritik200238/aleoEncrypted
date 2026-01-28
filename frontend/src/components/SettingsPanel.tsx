/**
 * Settings Panel - Complete Telegram-style settings
 * Includes: Notifications, Privacy, Security, Language, Folders, Theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Shield,
  Globe,
  Folder,
  Moon,
  User,
  Lock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  ChevronRight,
  Check,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsPanelProps {
  onProfileClick: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export function SettingsPanel({
  onProfileClick,
  isDarkMode,
  onThemeToggle,
}: SettingsPanelProps) {
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [lastSeenVisible, setLastSeenVisible] = useState(true);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);
  const [language, setLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your privacy and preferences
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account
          </h3>

          <button
            onClick={onProfileClick}
            className="w-full p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="text-left">
                <div className="font-medium">Edit Profile</div>
                <div className="text-sm text-muted-foreground">
                  Change avatar, name, bio
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.section>

        {/* Notifications Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications & Sounds
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Push notifications for new messages
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    notificationsEnabled ? 'bg-primary' : 'bg-border'
                  )}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5"
                    animate={{ left: notificationsEnabled ? '26px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundsEnabled ? (
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">Message Sounds</div>
                    <div className="text-sm text-muted-foreground">
                      Play sound on new messages
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSoundsEnabled(!soundsEnabled)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    soundsEnabled ? 'bg-primary' : 'bg-border'
                  )}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5"
                    animate={{ left: soundsEnabled ? '26px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Privacy & Security Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy & Security
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {profileVisible ? (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">Profile Visibility</div>
                    <div className="text-sm text-muted-foreground">
                      Who can see your profile photo
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setProfileVisible(!profileVisible)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    profileVisible ? 'bg-primary' : 'bg-border'
                  )}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5"
                    animate={{ left: profileVisible ? '26px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Last Seen</div>
                    <div className="text-sm text-muted-foreground">
                      Show when you were last online
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setLastSeenVisible(!lastSeenVisible)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    lastSeenVisible ? 'bg-primary' : 'bg-border'
                  )}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5"
                    animate={{ left: lastSeenVisible ? '26px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Read Receipts</div>
                    <div className="text-sm text-muted-foreground">
                      Show blue checkmarks when read
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setReadReceiptsEnabled(!readReceiptsEnabled)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    readReceiptsEnabled ? 'bg-primary' : 'bg-border'
                  )}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5"
                    animate={{ left: readReceiptsEnabled ? '26px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            {/* Aleo ZK Privacy Info */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-primary mb-1">
                    Aleo Zero-Knowledge Privacy
                  </div>
                  <div className="text-sm text-muted-foreground">
                    All messages are end-to-end encrypted with AES-256-GCM.
                    Group membership verified with zero-knowledge proofs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Language Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Language
          </h3>

          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  'w-full p-4 rounded-xl transition-colors flex items-center justify-between',
                  language === lang.code
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-accent hover:bg-accent/80'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Appearance Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Appearance
          </h3>

          <button
            onClick={onThemeToggle}
            className="w-full p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-blue-500" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
              <div className="text-left">
                <div className="font-medium">Night Mode</div>
                <div className="text-sm text-muted-foreground">
                  {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                </div>
              </div>
            </div>
            <button
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                isDarkMode ? 'bg-primary' : 'bg-border'
              )}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5"
                animate={{ left: isDarkMode ? '26px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </button>
        </motion.section>

        {/* Folders Section (Coming Soon) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Folders
          </h3>

          <div className="p-4 rounded-xl bg-accent">
            <div className="text-center py-4">
              <Folder className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Organize your chats with folders
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Coming soon
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
