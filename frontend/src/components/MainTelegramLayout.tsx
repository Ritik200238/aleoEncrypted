/**
 * Main Telegram Layout - Complete 3-column Telegram UI
 * Sidebar | Chat Window | Profile/Info Pane
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { ChatListSidebar } from './ChatListSidebar';
import { ChatInterface } from './ChatInterface';
import { NewChatModal } from './NewChatModal';
import { ProfileSettings } from './ProfileSettings';
import type { Chat } from '../models/Chat';
import type { Contact } from '../models/Contact';
import { chatService } from '../services/chatService';
import { contactService } from '../services/contactService';
import { toast } from './Toast';
import { cn } from '../lib/utils';

interface MainTelegramLayoutProps {
  userAddress: string;
}

export function MainTelegramLayout({ userAddress }: MainTelegramLayoutProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);

  // Load chats
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = () => {
    const allChats = chatService.getSortedChats();
    setChats(allChats);
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatInfo(false);

    // Mark as read
    chatService.markAsRead(chat.id);
    loadChats();
  };

  const handleCreateDM = (contact: Contact) => {
    const dm = chatService.getOrCreateDirectMessage(
      userAddress,
      contact.address,
      contact.displayName,
      contact.avatar
    );

    loadChats();
    setSelectedChat(dm);
    toast.success(`Started chat with ${contact.displayName}`);
  };

  const handleCreateGroup = (contacts: Contact[], groupName: string, groupAvatar: string) => {
    const group = chatService.createGroup(
      userAddress,
      groupName,
      groupAvatar,
      contacts.map(c => c.address),
      `Group with ${contacts.length} members`
    );

    loadChats();
    setSelectedChat(group);
    toast.success(`Group "${groupName}" created!`);
  };

  const handleVoiceCall = () => {
    if (!selectedChat) return;
    toast.info('Voice call feature coming soon with Aleo WebRTC!');
    // Future: Integrate with Aleo-based WebRTC
  };

  const handleVideoCall = () => {
    if (!selectedChat) return;
    toast.info('Video call feature coming soon with Aleo WebRTC!');
    // Future: Integrate with Aleo-based WebRTC
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Chat List */}
      <ChatListSidebar
        chats={chats}
        selectedChatId={selectedChat?.id || null}
        currentUserAddress={userAddress}
        onChatSelect={handleChatSelect}
        onNewChat={() => setShowNewChatModal(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      {/* Middle - Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-border px-4 flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                {/* Mobile: Back button */}
                <button
                  onClick={() => setSelectedChat(null)}
                  className="lg:hidden p-2 hover:bg-accent rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Chat Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-2xl cursor-pointer"
                  onClick={() => setShowChatInfo(!showChatInfo)}
                  style={{
                    background: selectedChat.type === 'direct'
                      ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                      : 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                  }}
                >
                  {selectedChat.avatar}
                </div>

                {/* Chat Name & Status */}
                <div className="flex flex-col cursor-pointer" onClick={() => setShowChatInfo(!showChatInfo)}>
                  <h3 className="font-semibold">{selectedChat.name}</h3>
                  {selectedChat.type === 'direct' ? (
                    <span className="text-xs text-muted-foreground">
                      {selectedChat.isOnline ? (
                        <span className="text-green-500">online</span>
                      ) : selectedChat.lastSeen ? (
                        `last seen ${new Date(selectedChat.lastSeen).toLocaleDateString()}`
                      ) : (
                        'offline'
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {selectedChat.memberCount} members
                    </span>
                  )}
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleVoiceCall}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Voice Call (Coming Soon)"
                >
                  <Phone className="w-5 h-5" />
                </motion.button>

                <motion.button
                  onClick={handleVideoCall}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Video Call (Coming Soon)"
                >
                  <Video className="w-5 h-5" />
                </motion.button>

                <motion.button
                  onClick={() => setShowChatInfo(!showChatInfo)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Chat Info"
                >
                  <MoreVertical className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Chat Messages */}
            <ChatInterface
              groupId={selectedChat.id}
              userAddress={userAddress}
            />
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md"
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-6xl">💬</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">EncryptedSocial</h2>
              <p className="text-muted-foreground mb-6">
                Private, secure messaging powered by Aleo blockchain
              </p>
              <motion.button
                onClick={() => setShowNewChatModal(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your First Chat
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Chat Info (Optional) */}
      <AnimatePresence>
        {showChatInfo && selectedChat && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l border-border bg-card overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Chat Info</h3>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-5xl mb-3">
                  {selectedChat.avatar}
                </div>
                <h4 className="text-lg font-semibold">{selectedChat.name}</h4>
                {selectedChat.type === 'group' && (
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.memberCount} members
                  </p>
                )}
              </div>

              {/* Description */}
              {selectedChat.description && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium mb-2">Description</h5>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.description}
                  </p>
                </div>
              )}

              {/* Aleo Info */}
              {selectedChat.aleoGroupId && (
                <div className="p-4 rounded-lg bg-primary/10 mb-4">
                  <div className="text-sm font-medium mb-1">Aleo Verified</div>
                  <div className="text-xs text-muted-foreground font-mono break-all">
                    {selectedChat.aleoGroupId}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    chatService.toggleMute(selectedChat.id);
                    loadChats();
                    toast.success(selectedChat.isMuted ? 'Chat unmuted' : 'Chat muted');
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors text-left"
                >
                  {selectedChat.isMuted ? 'Unmute' : 'Mute'} Notifications
                </button>

                <button
                  onClick={() => {
                    chatService.togglePin(selectedChat.id);
                    loadChats();
                    toast.success(selectedChat.isPinned ? 'Chat unpinned' : 'Chat pinned');
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors text-left"
                >
                  {selectedChat.isPinned ? 'Unpin' : 'Pin'} Chat
                </button>

                <button
                  onClick={() => {
                    chatService.toggleArchive(selectedChat.id);
                    loadChats();
                    setSelectedChat(null);
                    toast.success('Chat archived');
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors text-left"
                >
                  Archive Chat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        currentUserAddress={userAddress}
        onCreateDM={handleCreateDM}
        onCreateGroup={handleCreateGroup}
      />

      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProfileSettings onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
