/**
 * Telegram Sidebar Menu - Complete menu system
 * Includes: Profile, Groups, Channels, Contacts, Calls, Saved Messages, Settings
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Users,
  Radio,
  UserPlus,
  Phone,
  Bookmark,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Menu,
  X,
  Search,
  MessageCircle,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

type SidebarView = 'chats' | 'contacts' | 'calls' | 'saved' | 'settings';

interface TelegramSidebarProps {
  currentView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onNewGroup: () => void;
  onNewChannel: () => void;
  onProfileClick: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  userAddress: string;
  unreadCount?: number;
}

export function TelegramSidebar({
  currentView,
  onViewChange,
  onNewGroup,
  onNewChannel,
  onProfileClick,
  isDarkMode,
  onThemeToggle,
  userAddress,
  unreadCount = 0,
}: TelegramSidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      id: 'profile' as const,
      icon: User,
      label: 'My Profile',
      action: onProfileClick,
    },
    {
      id: 'new-group' as const,
      icon: Users,
      label: 'New Group',
      action: onNewGroup,
    },
    {
      id: 'new-channel' as const,
      icon: Radio,
      label: 'New Channel',
      action: onNewChannel,
    },
    {
      id: 'contacts' as const,
      icon: UserPlus,
      label: 'Contacts',
      action: () => onViewChange('contacts'),
    },
    {
      id: 'calls' as const,
      icon: Phone,
      label: 'Calls',
      action: () => onViewChange('calls'),
    },
    {
      id: 'saved' as const,
      icon: Bookmark,
      label: 'Saved Messages',
      action: () => onViewChange('saved'),
    },
    {
      id: 'settings' as const,
      icon: SettingsIcon,
      label: 'Settings',
      action: () => onViewChange('settings'),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          {/* Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>

          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">EncryptedSocial</h1>
          </motion.div>

          {/* Theme Toggle */}
          <motion.button
            onClick={onThemeToggle}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-500" />
            )}
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Aleo Status */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-mono truncate">{userAddress.substring(0, 12)}...</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border bg-accent/30">
        <button
          onClick={() => onViewChange('chats')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            currentView === 'chats'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <MessageCircle className="w-4 h-4 mx-auto mb-1" />
          Chats
          {currentView === 'chats' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
          {unreadCount > 0 && currentView !== 'chats' && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </button>

        <button
          onClick={() => onViewChange('contacts')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            currentView === 'contacts'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <UserPlus className="w-4 h-4 mx-auto mb-1" />
          Contacts
          {currentView === 'contacts' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>

        <button
          onClick={() => onViewChange('calls')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            currentView === 'calls'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Phone className="w-4 h-4 mx-auto mb-1" />
          Calls
          {currentView === 'calls' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    item.action();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer - Quick Actions */}
      <div className="mt-auto p-3 border-t border-border bg-accent/30">
        <div className="flex gap-2">
          <motion.button
            onClick={onNewGroup}
            className="flex-1 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="w-4 h-4 mx-auto mb-1" />
            New Group
          </motion.button>

          <motion.button
            onClick={onNewChannel}
            className="flex-1 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Radio className="w-4 h-4 mx-auto mb-1" />
            Channel
          </motion.button>
        </div>
      </div>
    </div>
  );
}
