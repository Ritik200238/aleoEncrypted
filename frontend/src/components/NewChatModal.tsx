/**
 * New Chat Modal - Create DM or Group (Telegram-style)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Users, Search, UserPlus, ChevronRight } from 'lucide-react';
import type { Contact } from '../models/Contact';
import { contactService } from '../services/contactService';
import { cn } from '../lib/utils';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserAddress: string;
  onCreateDM: (contact: Contact) => void;
  onCreateGroup: (contacts: Contact[], groupName: string, groupAvatar: string) => void;
}

type ModalView = 'main' | 'new-dm' | 'new-group';

export function NewChatModal({
  isOpen,
  onClose,
  currentUserAddress,
  onCreateDM,
  onCreateGroup,
}: NewChatModalProps) {
  const [view, setView] = useState<ModalView>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('👥');

  const contacts = contactService.getContacts();
  const filteredContacts = searchQuery
    ? contactService.searchContacts(searchQuery)
    : contacts;

  const handleCreateDM = (contact: Contact) => {
    onCreateDM(contact);
    handleClose();
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedContacts.length === 0) return;
    onCreateGroup(selectedContacts, groupName, groupAvatar);
    handleClose();
  };

  const handleClose = () => {
    setView('main');
    setSearchQuery('');
    setSelectedContacts([]);
    setGroupName('');
    setGroupAvatar('👥');
    onClose();
  };

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev =>
      prev.find(c => c.address === contact.address)
        ? prev.filter(c => c.address !== contact.address)
        : [...prev, contact]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {view === 'main' && 'New Chat'}
              {view === 'new-dm' && 'New Direct Message'}
              {view === 'new-group' && 'New Group'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {view === 'main' && (
              <div className="space-y-3">
                <motion.button
                  onClick={() => setView('new-dm')}
                  className="w-full p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-between group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">New Direct Message</div>
                      <div className="text-sm text-muted-foreground">Start a private chat</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  onClick={() => setView('new-group')}
                  className="w-full p-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors flex items-center justify-between group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">New Group</div>
                      <div className="text-sm text-muted-foreground">Create a group chat</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            )}

            {view === 'new-dm' && (
              <div>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>

                {/* Contact List */}
                <div className="space-y-2">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No contacts yet</p>
                      <p className="text-sm">Add contacts to start chatting</p>
                    </div>
                  ) : (
                    filteredContacts.map(contact => (
                      <motion.button
                        key={contact.address}
                        onClick={() => handleCreateDM(contact)}
                        className="w-full p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xl">
                          {contact.avatar}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{contact.displayName}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {contact.address}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            )}

            {view === 'new-group' && (
              <div>
                {/* Group Details */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Group Avatar</label>
                  <div className="flex gap-2 mb-4">
                    {['👥', '🎮', '🚀', '💼', '🎨', '🏆', '🌟', '🔥'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setGroupAvatar(emoji)}
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all',
                          groupAvatar === emoji
                            ? 'bg-primary scale-110'
                            : 'bg-accent hover:scale-105'
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <label className="block text-sm font-medium mb-2">Group Name</label>
                  <input
                    type="text"
                    placeholder="Enter group name..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>

                {/* Member Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Add Members ({selectedContacts.length} selected)
                  </label>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Contact List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredContacts.map(contact => {
                      const isSelected = selectedContacts.find(c => c.address === contact.address);
                      return (
                        <motion.button
                          key={contact.address}
                          onClick={() => toggleContactSelection(contact)}
                          className={cn(
                            'w-full p-3 rounded-lg transition-colors flex items-center gap-3',
                            isSelected ? 'bg-primary/20' : 'hover:bg-accent'
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xl">
                            {contact.avatar}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{contact.displayName}</div>
                          </div>
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            isSelected ? 'bg-primary border-primary' : 'border-border'
                          )}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {view !== 'main' && (
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => setView('main')}
                className="flex-1 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
              >
                Back
              </button>
              {view === 'new-group' && (
                <motion.button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedContacts.length === 0}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Group
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
