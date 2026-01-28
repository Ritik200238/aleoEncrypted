/**
 * Chat List Sidebar - Left panel with all chats (Telegram-style)
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Menu, MessageSquare, Archive } from 'lucide-react';
import { ChatListItem } from './ChatListItem';
import type { Chat } from '../models/Chat';
import { ChatModel } from '../models/Chat';
import { cn } from '../lib/utils';

interface ChatListSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  currentUserAddress: string;
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
  onProfileClick: () => void;
}

export function ChatListSidebar({
  chats,
  selectedChatId,
  currentUserAddress,
  onChatSelect,
  onNewChat,
  onProfileClick,
}: ChatListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Filter and sort chats
  const displayChats = useMemo(() => {
    let filtered = showArchived
      ? chats.filter(c => c.isArchived)
      : chats.filter(c => !c.isArchived);

    if (searchQuery.trim()) {
      filtered = ChatModel.searchChats(filtered, searchQuery);
    }

    return ChatModel.sortChats(filtered);
  }, [chats, searchQuery, showArchived]);

  const totalUnread = useMemo(() => {
    return chats
      .filter(c => !c.isArchived)
      .reduce((sum, chat) => sum + chat.unreadCount, 0);
  }, [chats]);

  const archivedCount = chats.filter(c => c.isArchived).length;

  return (
    <div className="w-80 flex flex-col h-full border-r border-border bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onProfileClick}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <motion.h1
            className="text-xl font-bold flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <MessageSquare className="w-5 h-5 text-primary" />
            EncryptedSocial
            {totalUnread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-bold"
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </motion.span>
            )}
          </motion.h1>

          <motion.button
            onClick={onNewChat}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Tabs: Chats / Archived */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowArchived(false)}
            className={cn(
              'flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              !showArchived
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            )}
          >
            Chats
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              showArchived
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            )}
          >
            <Archive className="w-4 h-4" />
            Archived
            {archivedCount > 0 && (
              <span className="text-xs">({archivedCount})</span>
            )}
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {displayChats.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full p-8 text-center"
            >
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">
                {searchQuery
                  ? 'No chats found'
                  : showArchived
                  ? 'No archived chats'
                  : 'No chats yet'}
              </p>
              {!searchQuery && !showArchived && (
                <button
                  onClick={onNewChat}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start Your First Chat
                </button>
              )}
            </motion.div>
          ) : (
            displayChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
              >
                <ChatListItem
                  chat={chat}
                  isSelected={chat.id === selectedChatId}
                  currentUserAddress={currentUserAddress}
                  onClick={() => onChatSelect(chat)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer - Aleo Status */}
      <div className="p-3 border-t border-border bg-accent/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Connected to Aleo Network</span>
        </div>
      </div>
    </div>
  );
}
