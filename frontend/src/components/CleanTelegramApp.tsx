/**
 * Clean Telegram App - Fixed Layout (No Overlapping!)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Users,
  Phone,
  Settings as SettingsIcon,
  Search,
  Plus,
  Shield,
  Sun,
  Moon,
  Video,
  MoreVertical,
  UserPlus,
  X,
  Send,
  Smile,
  Paperclip,
} from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import type { Contact } from '../models/Contact';
import { contactService } from '../services/contactService';

type ViewType = 'chats' | 'contacts' | 'calls' | 'settings';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: number;
  unread: number;
  isOnline: boolean;
}

interface CleanTelegramAppProps {
  userAddress: string;
}

export function CleanTelegramApp({ userAddress }: CleanTelegramAppProps) {
  const [currentView, setCurrentView] = useState<ViewType>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      avatar: '👩‍💼',
      lastMessage: 'Hey! How are you doing?',
      timestamp: Date.now() - 1800000,
      unread: 2,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Bob Smith',
      avatar: '👨‍💻',
      lastMessage: 'The project looks great!',
      timestamp: Date.now() - 7200000,
      unread: 0,
      isOnline: false,
    },
    {
      id: '3',
      name: 'Team Dev',
      avatar: '👥',
      lastMessage: 'Meeting at 3 PM',
      timestamp: Date.now() - 18000000,
      unread: 5,
      isOnline: false,
    },
  ]);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    let loadedContacts = contactService.getContacts();

    // Add sample contacts if none exist
    if (loadedContacts.length === 0) {
      const sampleContacts: Contact[] = [
        {
          address: 'aleo1alice123456789abcdefghijklmnopqrstuvwxyz12345',
          displayName: 'Alice Johnson',
          avatar: '👩‍💼',
          bio: 'Product Manager @ TechCorp',
          status: 'online',
          lastSeen: Date.now(),
          isTyping: false,
        },
        {
          address: 'aleo1bob987654321zyxwvutsrqponmlkjihgfedcba98765',
          displayName: 'Bob Smith',
          avatar: '👨‍💻',
          bio: 'Full Stack Developer',
          status: 'offline',
          lastSeen: Date.now() - 3600000,
          isTyping: false,
        },
        {
          address: 'aleo1charlie11111111111111111111111111111111111',
          displayName: 'Charlie Davis',
          avatar: '🧑‍🔬',
          bio: 'Blockchain Researcher',
          status: 'away',
          lastSeen: Date.now() - 7200000,
          isTyping: false,
        },
        {
          address: 'aleo1diana222222222222222222222222222222222222',
          displayName: 'Diana Martinez',
          avatar: '👩‍🎨',
          bio: 'UI/UX Designer',
          status: 'online',
          lastSeen: Date.now(),
          isTyping: false,
        },
        {
          address: 'aleo1evan333333333333333333333333333333333333',
          displayName: 'Evan Wilson',
          avatar: '👨‍🚀',
          bio: 'Crypto Enthusiast',
          status: 'offline',
          lastSeen: Date.now() - 86400000,
          isTyping: false,
        },
      ];

      sampleContacts.forEach(contact => contactService.addContact(contact));
      loadedContacts = sampleContacts;
    }

    setContacts(loadedContacts);
  };

  const handleAddContact = (newContact: { name: string; address: string }) => {
    const contact: Contact = {
      address: newContact.address,
      displayName: newContact.name,
      avatar: '👤',
      bio: '',
      status: 'offline',
      lastSeen: Date.now(),
      isTyping: false,
    };
    contactService.addContact(contact);
    loadContacts();
    setShowAddContact(false);
  };

  const handleContactClick = (contact: Contact) => {
    // Create/open DM with contact
    const existingChat = chats.find(c => c.name === contact.displayName);
    if (existingChat) {
      setSelectedChat(existingChat);
    } else {
      const newChat: Chat = {
        id: Date.now().toString(),
        name: contact.displayName,
        avatar: contact.avatar,
        lastMessage: 'No messages yet',
        timestamp: Date.now(),
        unread: 0,
        isOnline: contact.status === 'online',
      };
      setChats([newChat, ...chats]);
      setSelectedChat(newChat);
    }
    setCurrentView('chats');
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* LEFT SIDEBAR - 320px */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* HEADER */}
        <div className="p-4 bg-slate-900/95 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold">EncryptedSocial</h1>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User Address */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-mono">{userAddress.substring(0, 15)}...</span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-800">
          {[
            { id: 'chats', icon: MessageCircle, label: 'Chats' },
            { id: 'contacts', icon: Users, label: 'Contacts' },
            { id: 'calls', icon: Phone, label: 'Calls' },
            { id: 'settings', icon: SettingsIcon, label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as ViewType)}
              className={`flex-1 px-4 py-3 text-xs font-medium transition-colors relative ${
                currentView === tab.id ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4 mx-auto mb-1" />
              {tab.label}
              {currentView === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto">
          {/* CHATS VIEW */}
          {currentView === 'chats' && (
            <div>
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-slate-800 transition-colors border-b border-slate-800 ${
                    selectedChat?.id === chat.id ? 'bg-slate-800' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                      {chat.avatar}
                    </div>
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate">{chat.name}</span>
                      <span className="text-xs text-slate-500">{formatTime(chat.timestamp)}</span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                      {chat.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* CONTACTS VIEW */}
          {currentView === 'contacts' && (
            <div>
              <div className="p-4 border-b border-slate-800">
                <button
                  onClick={() => setShowAddContact(true)}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Contact
                </button>
              </div>
              {contacts.map((contact) => (
                <button
                  key={contact.address}
                  onClick={() => handleContactClick(contact)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-slate-800 transition-colors border-b border-slate-800"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                    {contact.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{contact.displayName}</div>
                    <div className="text-sm text-slate-400 truncate">
                      {contact.status === 'online' ? (
                        <span className="text-green-500">online</span>
                      ) : (
                        `last seen ${formatTime(contact.lastSeen)}`
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* CALLS VIEW */}
          {currentView === 'calls' && (
            <div className="p-8 text-center text-slate-500">
              <Phone className="w-16 h-16 mx-auto mb-4 text-slate-700" />
              <p>No recent calls</p>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {currentView === 'settings' && (
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Account</h3>
                <div className="p-3 bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-400">Connected Wallet</div>
                  <div className="font-mono text-xs mt-1">{userAddress}</div>
                </div>
              </div>
              <div className="mt-4">
                <WalletMultiButton className="!w-full !bg-slate-800 !rounded-lg" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                  {selectedChat.avatar}
                </div>
                <div>
                  <div className="font-semibold">{selectedChat.name}</div>
                  <div className="text-xs text-slate-400">
                    {selectedChat.isOnline ? 'online' : 'offline'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-800 rounded-lg">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-800 rounded-lg">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-800 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-center text-slate-500 text-sm mb-8">
                Start of conversation with {selectedChat.name}
              </div>
              {/* Sample messages */}
              <div className="mb-4 flex">
                <div className="max-w-xs bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-2">
                  <p>{selectedChat.lastMessage}</p>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatTime(selectedChat.timestamp)}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-800 rounded-lg">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="p-2 hover:bg-slate-800 rounded-lg">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-24 h-24 mx-auto mb-4 text-slate-700" />
              <h2 className="text-2xl font-bold mb-2">EncryptedSocial</h2>
              <p className="text-slate-400">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* ADD CONTACT MODAL */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Contact</h2>
              <button onClick={() => setShowAddContact(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddContact({
                  name: formData.get('name') as string,
                  address: formData.get('address') as string,
                });
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Aleo Address</label>
                <input
                  name="address"
                  type="text"
                  required
                  pattern="aleo1[a-z0-9]{58}"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="aleo1..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
