/**
 * Complete Sync System Integration Example
 *
 * This file demonstrates how to integrate the real-time sync system
 * into your Encrypted Social Aleo application.
 *
 * Copy and adapt the patterns shown here for your components.
 */

import React, { useEffect, useState } from 'react';
import {
  useSync,
  useAutoSync,
  useGroupSync,
  useNewMessages,
  useTypingIndicator,
  useSyncStatus,
} from '../hooks/useSync';
import {
  SimpleSyncIndicator,
  DetailedSyncIndicator,
  SyncStatusBadge,
  SyncErrorBanner,
} from '../components/SyncIndicator';
import { conflictResolutionService } from '../services/conflictResolution';
import type { Message } from '../types/message';

/**
 * Example 1: Basic App Integration
 * Add this to your main App component
 */
export const AppWithSync: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Auto-start sync when user connects wallet
  useAutoSync(userAddress);

  // Initialize conflict resolution
  useEffect(() => {
    if (userAddress) {
      conflictResolutionService.initialize(userAddress);
    }
  }, [userAddress]);

  return (
    <div className="app">
      {/* Show sync status in header */}
      <header className="flex justify-between items-center p-4 bg-white border-b">
        <h1 className="text-xl font-bold">Encrypted Social</h1>
        <SyncStatusBadge />
      </header>

      {/* Show errors globally */}
      <SyncErrorBanner />

      {/* Your app content */}
      <main>
        {/* ... */}
      </main>
    </div>
  );
};

/**
 * Example 2: Chat Interface with Real-Time Sync
 */
export const ChatWithSync: React.FC<{ groupId: string }> = ({ groupId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { sendTyping } = useTypingIndicator(groupId);

  // Auto-sync this group
  useGroupSync(groupId);

  // Listen for new messages
  useNewMessages(({ groupId: gId }) => {
    if (gId === groupId) {
      // Reload messages when new ones arrive
      loadMessages();
    }
  });

  const loadMessages = async () => {
    // Load messages from storage
    // They're already decrypted and synced by syncService
    const storedMessages = storageService.loadMessages(groupId);
    setMessages(storedMessages);
  };

  useEffect(() => {
    loadMessages();
  }, [groupId]);

  const handleTyping = (typing: boolean) => {
    setIsTyping(typing);
    sendTyping(typing);
  };

  return (
    <div className="chat-interface">
      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <input
        type="text"
        onFocus={() => handleTyping(true)}
        onBlur={() => handleTyping(false)}
        placeholder="Type a message..."
      />
    </div>
  );
};

/**
 * Example 3: Settings Panel with Sync Controls
 */
export const SettingsWithSyncControls: React.FC = () => {
  const sync = useSync();

  return (
    <div className="settings-panel p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      {/* Sync Status Section */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Synchronization</h3>
        <DetailedSyncIndicator />
      </section>

      {/* Manual Controls */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Manual Controls</h3>
        <div className="flex gap-2">
          <button
            onClick={sync.startSync}
            disabled={sync.isSyncing}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Start Sync
          </button>
          <button
            onClick={sync.stopSync}
            disabled={!sync.isSyncing}
            className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
          >
            Stop Sync
          </button>
          <button
            onClick={sync.syncNow}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Sync Now
          </button>
        </div>
      </section>

      {/* Statistics */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Messages Synced</div>
            <div className="text-2xl font-bold">
              {sync.totalMessagesSynced}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Sync Health</div>
            <div className="text-2xl font-bold capitalize">
              {sync.syncHealth}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">WebSocket</div>
            <div className="text-2xl font-bold">
              {sync.wsConnected ? '✓' : '✗'}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Last Sync</div>
            <div className="text-lg font-medium">
              {sync.lastSyncFormatted || 'Never'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * Example 4: Message List with Auto-Refresh
 */
export const MessageListWithAutoRefresh: React.FC<{ groupId: string }> = ({
  groupId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // Load from storage (already synced and decrypted)
      const msgs = storageService.loadMessages(groupId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh when new messages arrive
  useSyncRefresh(
    () => {
      loadMessages();
    },
    [groupId]
  );

  useEffect(() => {
    loadMessages();
  }, [groupId]);

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div key={msg.id} className="message">
          <div className="message-content">{msg.content}</div>
          <div className="message-time">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Example 5: Minimal Status Indicator
 */
export const MinimalChat: React.FC = () => {
  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>Group Chat</h2>
        {/* Simple sync indicator */}
        <SimpleSyncIndicator />
      </header>
      <div className="chat-messages">{/* ... */}</div>
    </div>
  );
};

/**
 * Example 6: Custom Sync Status Handler
 */
export const CustomSyncHandler: React.FC = () => {
  const status = useSyncStatus();

  useEffect(() => {
    // Custom logic based on sync status
    if (status.icon === 'error') {
      // Show notification
      console.error('Sync error detected');
      // Could trigger toast notification, etc.
    } else if (status.icon === 'synced') {
      console.log('All messages synced');
    }
  }, [status]);

  return null; // Invisible component
};

/**
 * Example 7: Manual Conflict Resolution
 */
export const ManualConflictResolution: React.FC = () => {
  const handleMergeConflicts = async () => {
    const localMessages = storageService.loadMessages('group-123');
    const remoteMessages = []; // Fetch from blockchain

    const result = conflictResolutionService.resolveMessages(
      localMessages,
      remoteMessages
    );

    console.log('Resolved messages:', result.resolved);
    console.log('Conflict type:', result.conflictType);
    console.log('Strategy:', result.strategy);

    // Save resolved messages
    storageService.saveMessages('group-123', result.resolved);
  };

  return (
    <button onClick={handleMergeConflicts}>Resolve Conflicts</button>
  );
};

/**
 * Example 8: Complete Integration Pattern
 *
 * This shows the recommended pattern for integrating all sync features
 */
export const CompleteIntegrationExample: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string | null>(
    'aleo1...' // From wallet
  );
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  // 1. Auto-start sync
  useAutoSync(userAddress);

  // 2. Initialize conflict resolution
  useEffect(() => {
    if (userAddress) {
      conflictResolutionService.initialize(userAddress);
    }
  }, [userAddress]);

  // 3. Sync current group
  useGroupSync(currentGroupId);

  // 4. Listen for new messages
  useNewMessages(({ groupId, messageId }) => {
    console.log(`New message ${messageId} in group ${groupId}`);
    // Show notification, update UI, etc.
  });

  return (
    <div className="app-container">
      {/* Global error banner */}
      <SyncErrorBanner />

      {/* Header with status */}
      <header className="flex justify-between items-center p-4">
        <h1>Encrypted Social</h1>
        <SyncStatusBadge />
      </header>

      {/* Main content */}
      <div className="main-content">
        {/* Sidebar with groups */}
        <aside className="sidebar">
          {/* Group list */}
        </aside>

        {/* Chat area */}
        <main className="chat-area">
          {currentGroupId ? (
            <ChatWithSync groupId={currentGroupId} />
          ) : (
            <div>Select a group</div>
          )}
        </main>

        {/* Settings panel */}
        <aside className="settings">
          <SettingsWithSyncControls />
        </aside>
      </div>
    </div>
  );
};

/**
 * Utility Components (used in examples above)
 */

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
  <div className={`message-bubble ${message.isOwn ? 'own' : 'other'}`}>
    <p>{message.content}</p>
    <span className="timestamp">
      {new Date(message.timestamp).toLocaleTimeString()}
    </span>
  </div>
);

// Mock imports for example purposes
const storageService = {
  loadMessages: (groupId: string): Message[] => [],
  saveMessages: (groupId: string, messages: Message[]) => {},
};

const useSyncRefresh = (callback: () => void, deps: any[]) => {
  // Imported from useSync.ts
};

export default CompleteIntegrationExample;
