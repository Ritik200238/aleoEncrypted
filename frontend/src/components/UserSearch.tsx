/**
 * User Search Component
 * Search and discover users by handle with debounced on-chain lookups
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { userRegistryService, type UserProfile } from '../services/userRegistryService';
import { contactService } from '../services/contactService';
import { databaseService } from '../services/databaseService';
import { debounce, cn } from '../lib/utils';

interface UserSearchProps {
  onUserSelect?: (profile: UserProfile) => void;
  onAddContact?: (profile: UserProfile) => void;
  onClose?: () => void;
  showAddButton?: boolean;
  placeholder?: string;
}

export function UserSearch({
  onUserSelect,
  onAddContact,
  onClose,
  showAddButton = true,
  placeholder = 'Search by @handle...',
}: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedContacts, setAddedContacts] = useState<Set<string>>(new Set());

  // Load existing contacts
  useEffect(() => {
    loadExistingContacts();
  }, []);

  const loadExistingContacts = async () => {
    try {
      const contacts = await databaseService.getContacts();
      const contactAddresses = new Set(contacts.map(c => c.address));
      setAddedContacts(contactAddresses);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  };

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        // Search cached profiles first
        const cachedResults = await userRegistryService.searchCachedProfiles(query);

        if (cachedResults.length > 0) {
          setSearchResults(cachedResults);
          setIsSearching(false);
          return;
        }

        // If query looks like a handle, search on-chain
        if (query.startsWith('@') || /^[a-zA-Z0-9_]+$/.test(query)) {
          const profile = await userRegistryService.searchByHandle(query);

          if (profile) {
            setSearchResults([profile]);
          } else {
            setSearchResults([]);
            setError('User not found');
          }
        } else {
          setSearchResults([]);
          setError('Enter a valid @handle (3-20 characters)');
        }
      } catch (err) {
        console.error('Search failed:', err);
        setError('Search failed. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);
    performSearch(query);
  };

  // Handle add contact
  const handleAddContact = async (profile: UserProfile) => {
    try {
      // Check if already added
      if (addedContacts.has(profile.address)) {
        return;
      }

      // Add to contacts
      await databaseService.addContact({
        id: `contact_${profile.address}`,
        address: profile.address,
        displayName: profile.name,
        avatar: profile.avatar,
        bio: profile.bio,
        handle: profile.handle,
        publicKey: profile.address,
        isBlocked: false,
        addedAt: Date.now(),
      });

      // Update state
      setAddedContacts(prev => new Set([...prev, profile.address]));

      // Call callback if provided
      if (onAddContact) {
        onAddContact(profile);
      }

      console.log('✓ Contact added:', profile.handle);
    } catch (err) {
      console.error('Failed to add contact:', err);
      setError('Failed to add contact');
    }
  };

  // Handle user selection
  const handleUserSelect = (profile: UserProfile) => {
    if (onUserSelect) {
      onUserSelect(profile);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Search Users
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-12 py-3 rounded-lg bg-accent border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Help Text */}
        <p className="mt-2 text-xs text-muted-foreground">
          Search by @username or enter a handle (e.g., @alice)
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {error && !isSearching && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Start typing to search for users
            </p>
            <p className="text-xs text-muted-foreground">
              You can search by their @handle
            </p>
          </div>
        )}

        {searchQuery && !isSearching && searchResults.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No users found</p>
            <p className="text-xs text-muted-foreground">
              Try searching with a different handle
            </p>
          </div>
        )}

        <AnimatePresence>
          {searchResults.map((profile, index) => (
            <motion.div
              key={profile.address}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <UserSearchItem
                profile={profile}
                isAdded={addedContacts.has(profile.address)}
                showAddButton={showAddButton}
                onSelect={() => handleUserSelect(profile)}
                onAdd={() => handleAddContact(profile)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface UserSearchItemProps {
  profile: UserProfile;
  isAdded: boolean;
  showAddButton: boolean;
  onSelect: () => void;
  onAdd: () => void;
}

function UserSearchItem({
  profile,
  isAdded,
  showAddButton,
  onSelect,
  onAdd,
}: UserSearchItemProps) {
  return (
    <div
      className="p-4 flex items-center gap-3 hover:bg-accent transition-colors border-b border-border cursor-pointer"
      onClick={onSelect}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {profile.avatar.startsWith('http') ? (
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl">
            {profile.avatar || profile.name.charAt(0).toUpperCase()}
          </div>
        )}
        {profile.isRegistered && (
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background"
            title="Verified on-chain"
          >
            <CheckCircle className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{profile.name}</h3>
        </div>
        <p className="text-sm text-primary truncate">{profile.handle}</p>
        {profile.bio && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Add Button */}
      {showAddButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          disabled={isAdded}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
            isAdded
              ? 'bg-accent text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {isAdded ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Added
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Add
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * UserSearchModal - Modal version of UserSearch
 */
interface UserSearchModalProps extends UserSearchProps {
  isOpen: boolean;
}

export function UserSearchModal({ isOpen, onClose, ...props }: UserSearchModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background rounded-xl shadow-2xl w-full max-w-2xl h-[600px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <UserSearch {...props} onClose={onClose} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
