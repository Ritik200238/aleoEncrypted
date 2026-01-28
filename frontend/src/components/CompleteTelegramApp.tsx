/**
 * Complete Telegram App - Full implementation with all features
 * Sidebar | Main View | Info Panel
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { TelegramSidebar } from './TelegramSidebar';
import { ChatListSidebar } from './ChatListSidebar';
import { ChatInterface } from './ChatInterface';
import { ContactList } from './ContactList';
import { CallsList } from './CallsList';
import { SavedMessages } from './SavedMessages';
import { SettingsPanel } from './SettingsPanel';
import { NewChatModal } from './NewChatModal';
import { ChannelCreationModal } from './ChannelCreationModal';
import { ProfileSettings } from './ProfileSettings';
import { TransactionToast, type Transaction } from './TransactionStatus';
import type { Chat } from '../models/Chat';
import type { Contact } from '../models/Contact';
import { chatService } from '../services/chatService';
import { contactService } from '../services/contactService';
import { leoContractService } from '../services/leoContractService';
import { ALEO_CONFIG } from '../config/aleoConfig';
import { toast } from './Toast';

type ViewType = 'chats' | 'contacts' | 'calls' | 'saved' | 'settings';

interface CompleteTelegramAppProps {
  userAddress: string;
}

export function CompleteTelegramApp({ userAddress }: CompleteTelegramAppProps) {
  const wallet = useWallet();
  const [currentView, setCurrentView] = useState<ViewType>('chats');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Blockchain state
  const [pendingTx, setPendingTx] = useState<Transaction | null>(null);
  const [useBlockchain, setUseBlockchain] = useState(ALEO_CONFIG.features.useBlockchain);

  // Initialize Leo contract service with wallet
  useEffect(() => {
    if (wallet) {
      leoContractService.setWallet(wallet);
    }
  }, [wallet]);

  // Load chats
  useEffect(() => {
    loadChats();
  }, []);

  // Apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadChats = () => {
    const allChats = chatService.getSortedChats();
    setChats(allChats);
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setCurrentView('chats');
    setShowChatInfo(false);

    // Mark as read
    chatService.markAsRead(chat.id);
    loadChats();
  };

  const handleContactSelect = (contact: Contact) => {
    // Create or get DM
    const dm = chatService.getOrCreateDirectMessage(
      userAddress,
      contact.address,
      contact.displayName,
      contact.avatar
    );

    loadChats();
    setSelectedChat(dm);
    setCurrentView('chats');
    toast.success(`Opened chat with ${contact.displayName}`);
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
    setCurrentView('chats');
    toast.success(`Started chat with ${contact.displayName}`);
  };

  const handleCreateGroup = async (contacts: Contact[], groupName: string, groupAvatar: string) => {
    // Create group with blockchain integration
    if (useBlockchain && ALEO_CONFIG.features.useBlockchain) {
      try {
        // Show pending transaction
        const tx: Transaction = {
          id: `temp_${Date.now()}`,
          type: 'create_group',
          status: 'pending',
          timestamp: Date.now(),
          description: `Creating group "${groupName}" with ${contacts.length} members`,
        };
        setPendingTx(tx);
        toast.info('Creating group on Aleo blockchain...');

        // Deploy to blockchain
        const result = await leoContractService.createGroup(groupName);

        // Generate ZK proofs for all members
        const memberAddresses = [userAddress, ...contacts.map(c => c.address)];
        const zkProofs = memberAddresses.map((addr, index) =>
          leoContractService.generateMembershipProof(addr, memberAddresses, index)
        );

        // Wait for transaction confirmation
        await leoContractService.waitForConfirmation(result.transactionId);

        // Create local chat with blockchain metadata
        const group = chatService.createGroup(
          userAddress,
          groupName,
          groupAvatar,
          contacts.map(c => c.address),
          `Group with ${contacts.length} members`
        );

        // Store blockchain metadata
        group.blockchainData = {
          groupId: result.groupId,
          transactionId: result.transactionId,
          merkleRoot: result.merkleRoot,
          programId: ALEO_CONFIG.programIds.groupManager,
        };
        chatService.saveChat(group);

        // Update transaction status
        setPendingTx({ ...tx, status: 'confirmed' });
        setTimeout(() => setPendingTx(null), 3000);

        loadChats();
        setSelectedChat(group);
        setCurrentView('chats');
        toast.success(`Group "${groupName}" created on blockchain! 🎉`);
      } catch (error) {
        console.error('Blockchain group creation failed:', error);
        setPendingTx((tx) => tx ? { ...tx, status: 'failed' } : null);
        toast.error('Blockchain transaction failed. Creating local group...');

        // Fallback to local storage
        const group = chatService.createGroup(
          userAddress,
          groupName,
          groupAvatar,
          contacts.map(c => c.address),
          `Group with ${contacts.length} members`
        );
        loadChats();
        setSelectedChat(group);
        setCurrentView('chats');
      }
    } else {
      // Local storage only (for demo mode)
      const group = chatService.createGroup(
        userAddress,
        groupName,
        groupAvatar,
        contacts.map(c => c.address),
        `Group with ${contacts.length} members`
      );

      loadChats();
      setSelectedChat(group);
      setCurrentView('chats');
      toast.success(`Group "${groupName}" created!`);
    }
  };

  const handleChannelCreated = (channelId: string) => {
    loadChats();
    const channel = chatService.getChat(channelId);
    if (channel) {
      setSelectedChat(channel);
      setCurrentView('chats');
    }
  };

  const handleVoiceCall = () => {
    if (!selectedChat) return;
    toast.info('Voice call feature coming soon with Aleo WebRTC!');
  };

  const handleVideoCall = () => {
    if (!selectedChat) return;
    toast.info('Video call feature coming soon with Aleo WebRTC!');
  };

  const totalUnread = chats
    .filter(c => !c.isArchived)
    .reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className="flex h-screen bg-background">
      {/* Left: Telegram Sidebar (80px) */}
      <div className="w-20">
        <TelegramSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewGroup={() => setShowNewChatModal(true)}
          onNewChannel={() => setShowNewChannelModal(true)}
          onProfileClick={() => setShowProfile(true)}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          userAddress={userAddress}
          unreadCount={totalUnread}
        />
      </div>

      {/* Middle Left: Content Sidebar (320px) */}
      <div className="w-80 border-r border-border">
        {currentView === 'chats' && (
          <ChatListSidebar
            chats={chats}
            selectedChatId={selectedChat?.id || null}
            currentUserAddress={userAddress}
            onChatSelect={handleChatSelect}
            onNewChat={() => setShowNewChatModal(true)}
            onProfileClick={() => setShowProfile(true)}
          />
        )}

        {currentView === 'contacts' && (
          <ContactList
            onContactSelect={handleContactSelect}
            selectedContactAddress={selectedChat?.participants.find(p => p !== userAddress)}
          />
        )}

        {currentView === 'calls' && <CallsList />}

        {currentView === 'saved' && (
          <div className="h-full flex items-center justify-center p-8 text-center">
            <div>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-4xl">📌</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Saved Messages</h3>
              <p className="text-sm text-muted-foreground">
                Click here to open your saved messages
              </p>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="h-full flex items-center justify-center p-8 text-center">
            <div>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                <span className="text-4xl">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Settings</h3>
              <p className="text-sm text-muted-foreground">
                View settings in the main panel →
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'chats' && selectedChat ? (
            <motion.div
              key={`chat-${selectedChat.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Chat Header */}
              <div className="h-16 border-b border-border px-4 flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="lg:hidden p-2 hover:bg-accent rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-2xl cursor-pointer"
                    onClick={() => setShowChatInfo(!showChatInfo)}
                    style={{
                      background: selectedChat.type === 'direct'
                        ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                        : selectedChat.type === 'channel'
                        ? 'linear-gradient(135deg, #f97316, #dc2626)'
                        : 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                    }}
                  >
                    {selectedChat.avatar}
                  </div>

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
                    ) : selectedChat.type === 'channel' ? (
                      <span className="text-xs text-muted-foreground">
                        Channel • Broadcast
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {selectedChat.memberCount} members
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedChat.type === 'direct' && (
                    <>
                      <motion.button
                        onClick={handleVoiceCall}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Phone className="w-5 h-5" />
                      </motion.button>

                      <motion.button
                        onClick={handleVideoCall}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Video className="w-5 h-5" />
                      </motion.button>
                    </>
                  )}

                  <motion.button
                    onClick={() => setShowChatInfo(!showChatInfo)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <ChatInterface groupId={selectedChat.id} userAddress={userAddress} />
            </motion.div>
          ) : currentView === 'saved' ? (
            <SavedMessages userAddress={userAddress} />
          ) : currentView === 'settings' ? (
            <SettingsPanel
              onProfileClick={() => setShowProfile(true)}
              isDarkMode={isDarkMode}
              onThemeToggle={() => setIsDarkMode(!isDarkMode)}
            />
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center max-w-md">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-6xl">💬</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">EncryptedSocial</h2>
                <p className="text-muted-foreground mb-6">
                  Private messaging powered by Aleo blockchain
                </p>
                {currentView === 'chats' && (
                  <motion.button
                    onClick={() => setShowNewChatModal(true)}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Your First Chat
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Chat Info (Optional) */}
      <AnimatePresence>
        {showChatInfo && selectedChat && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l border-border bg-card overflow-hidden"
          >
            <div className="p-6 h-full overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Chat Info</h3>

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

              {selectedChat.description && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium mb-2">Description</h5>
                  <p className="text-sm text-muted-foreground">
                    {selectedChat.description}
                  </p>
                </div>
              )}

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

      <ChannelCreationModal
        isOpen={showNewChannelModal}
        onClose={() => setShowNewChannelModal(false)}
        currentUserAddress={userAddress}
        onChannelCreated={handleChannelCreated}
      />

      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProfileSettings onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}

      {/* Blockchain Transaction Status */}
      <AnimatePresence>
        {pendingTx && (
          <TransactionToast
            transaction={pendingTx}
            onClose={() => setPendingTx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
