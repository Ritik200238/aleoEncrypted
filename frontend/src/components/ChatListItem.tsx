/**
 * Chat List Item - Individual chat in sidebar (Telegram-style)
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Pin, Volume2, VolumeX } from 'lucide-react';
import type { Chat } from '../models/Chat';
import { ChatModel } from '../models/Chat';
import { formatMessageTime, truncateAddress } from '../utils/formatters';
import { cn } from '../lib/utils';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  currentUserAddress: string;
  onClick: () => void;
}

function ChatListItemComponent({
  chat,
  isSelected,
  currentUserAddress,
  onClick,
}: ChatListItemProps) {
  const isDM = ChatModel.isDirectMessage(chat);
  const showOnlineIndicator = isDM && chat.isOnline;
  const showTypingIndicator = isDM && chat.isTyping;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full p-3 flex items-center gap-3 hover:bg-accent transition-colors border-b border-border text-left',
        isSelected && 'bg-accent'
      )}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
          isDM
            ? 'bg-gradient-to-br from-primary to-primary/60'
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        )}>
          {chat.avatar}
        </div>

        {/* Online indicator */}
        {showOnlineIndicator && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
          />
        )}

        {/* Muted indicator */}
        {chat.isMuted && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-muted rounded-full flex items-center justify-center">
            <VolumeX className="w-2.5 h-2.5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          {/* Name */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="font-semibold truncate">
              {ChatModel.getDisplayName(chat, currentUserAddress)}
            </span>

            {/* Pinned indicator */}
            {chat.isPinned && (
              <Pin className="w-3 h-3 text-primary flex-shrink-0" />
            )}

            {/* Group indicator */}
            {!isDM && (
              <Users className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            )}

            {/* Aleo verified badge */}
            {chat.aleoGroupId && (
              <Shield className="w-3 h-3 text-primary flex-shrink-0" title="Verified on Aleo" />
            )}
          </div>

          {/* Time */}
          {chat.lastMessageTime && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {formatMessageTime(chat.lastMessageTime)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Last message preview */}
          <div className="text-sm text-muted-foreground truncate flex-1">
            {showTypingIndicator ? (
              <span className="text-primary italic">typing...</span>
            ) : chat.lastMessage ? (
              <>
                {chat.type === 'group' && chat.lastMessageSender && (
                  <span className="font-medium">
                    {chat.lastMessageSender === currentUserAddress
                      ? 'You'
                      : truncateAddress(chat.lastMessageSender, 4, 2)}
                    :{' '}
                  </span>
                )}
                <span className="truncate">{chat.lastMessage}</span>
              </>
            ) : (
              <span className="italic">{isDM ? 'Start chatting' : 'No messages yet'}</span>
            )}
          </div>

          {/* Unread badge */}
          {chat.unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0',
                chat.isMuted
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </motion.div>
          )}
        </div>

        {/* Group member count */}
        {chat.type === 'group' && chat.memberCount && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {chat.memberCount} members
          </div>
        )}
      </div>
    </motion.button>
  );
}

export const ChatListItem = memo(ChatListItemComponent);
