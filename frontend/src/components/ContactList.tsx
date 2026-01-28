/**
 * Contact List Component
 * Displays user contacts with search functionality
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Users } from 'lucide-react';
import type { Contact } from '../models/Contact';
import { ContactModel } from '../models/Contact';
import { contactService } from '../services/contactService';
import { cn } from '../lib/utils';

interface ContactListProps {
  onContactSelect: (contact: Contact) => void;
  selectedContactAddress?: string;
}

export function ContactList({ onContactSelect, selectedContactAddress }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts] = useState<Contact[]>(() => contactService.getContacts()); // Future: refresh on updates

  // Search contacts
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contacts;
    }
    return contactService.searchContacts(searchQuery);
  }, [contacts, searchQuery]);

  const handleAddContact = () => {
    // TODO: Open add contact modal
    console.log('Add contact clicked');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Contacts
          </h2>
          <button
            onClick={handleAddContact}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title="Add Contact"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {searchQuery ? 'No contacts found' : 'No contacts yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddContact}
                className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Add Your First Contact
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.address}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <ContactItem
                  contact={contact}
                  isSelected={contact.address === selectedContactAddress}
                  onClick={() => onContactSelect(contact)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

interface ContactItemProps {
  contact: Contact;
  isSelected: boolean;
  onClick: () => void;
}

function ContactItem({ contact, isSelected, onClick }: ContactItemProps) {
  const isOnline = ContactModel.isOnline(contact);
  const statusColor = ContactModel.getStatusColor(contact.status);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors border-b border-border',
        isSelected && 'bg-accent'
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl">
          {contact.avatar}
        </div>
        {/* Online Status */}
        {isOnline && (
          <div className={cn('absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background', statusColor)} />
        )}
      </div>

      {/* Contact Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="font-semibold truncate">{contact.displayName}</div>
        <div className="text-sm text-muted-foreground truncate">
          {contact.isTyping ? (
            <span className="text-primary italic">typing...</span>
          ) : contact.status === 'online' ? (
            <span className="text-green-500">online</span>
          ) : (
            <span>
              last seen {new Date(contact.lastSeen).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Typing Indicator */}
      {contact.isTyping && (
        <div className="flex gap-1">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      )}
    </button>
  );
}
