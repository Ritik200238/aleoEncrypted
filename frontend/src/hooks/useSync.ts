/**
 * useSync Hook
 *
 * React hook for accessing synchronization state and controls.
 * Provides easy access to sync status, WebSocket status, and sync controls.
 * Auto-refreshes components when sync state changes.
 *
 * Usage:
 * ```tsx
 * const { isSyncing, lastSync, error, syncNow } = useSync();
 * ```
 */

import { useEffect, useCallback } from 'react';
import { useSyncStore } from '../store/syncStore';
import { syncService } from '../services/syncService';
import { websocketService } from '../services/websocketService';

/**
 * Sync hook return type
 */
export interface UseSyncReturn {
  // Sync status
  isSyncing: boolean;
  lastSync: number | null;
  lastSyncFormatted: string | null;
  nextSync: number | null;

  // WebSocket status
  wsConnected: boolean;
  wsAvailable: boolean;

  // Error state
  error: Error | null;
  errorCount: number;
  hasError: boolean;

  // Statistics
  totalMessagesSynced: number;
  syncHealth: 'good' | 'warning' | 'error';

  // Actions
  startSync: () => void;
  stopSync: () => void;
  syncNow: () => Promise<void>;
  connectWebSocket: (userAddress: string) => Promise<void>;
  disconnectWebSocket: () => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Main useSync hook
 */
export function useSync(): UseSyncReturn {
  const store = useSyncStore();

  // Format last sync time
  const lastSyncFormatted = useCallback(() => {
    if (!store.lastSync) return null;

    const secondsAgo = Math.floor((Date.now() - store.lastSync) / 1000);

    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    }

    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
      return `${minutesAgo}m ago`;
    }

    const hoursAgo = Math.floor(minutesAgo / 60);
    return `${hoursAgo}h ago`;
  }, [store.lastSync]);

  // Calculate sync health
  const syncHealth = useCallback((): 'good' | 'warning' | 'error' => {
    if (store.error || store.errorCount >= 3) {
      return 'error';
    }

    if (store.errorCount > 0) {
      return 'warning';
    }

    return 'good';
  }, [store.error, store.errorCount]);

  return {
    // Sync status
    isSyncing: store.isSyncing,
    lastSync: store.lastSync,
    lastSyncFormatted: lastSyncFormatted(),
    nextSync: store.nextSync,

    // WebSocket status
    wsConnected: store.wsConnected,
    wsAvailable: websocketService.isWebSocketAvailable(),

    // Error state
    error: store.error,
    errorCount: store.errorCount,
    hasError: store.error !== null,

    // Statistics
    totalMessagesSynced: store.totalMessagesSynced,
    syncHealth: syncHealth(),

    // Actions
    startSync: store.startSync,
    stopSync: store.stopSync,
    syncNow: store.syncNow,
    connectWebSocket: store.connectWebSocket,
    disconnectWebSocket: store.disconnectWebSocket,
    clearError: store.clearError,
    reset: store.reset,
  };
}

/**
 * Hook for auto-starting sync on mount
 */
export function useAutoSync(userAddress: string | null, enabled = true) {
  const { startSync, stopSync, connectWebSocket, disconnectWebSocket } = useSync();

  useEffect(() => {
    if (!enabled || !userAddress) {
      return;
    }

    // Start polling sync
    startSync();

    // Try to connect WebSocket (fallback to polling if unavailable)
    connectWebSocket(userAddress).catch((error) => {
      console.warn('WebSocket connection failed, using polling only:', error);
    });

    // Cleanup on unmount
    return () => {
      stopSync();
      disconnectWebSocket();
    };
  }, [userAddress, enabled, startSync, stopSync, connectWebSocket, disconnectWebSocket]);
}

/**
 * Hook for sync status indicator
 * Returns simple status for UI display
 */
export function useSyncStatus() {
  const { isSyncing, lastSync, error, wsConnected } = useSync();

  const getStatus = useCallback((): {
    label: string;
    color: 'green' | 'yellow' | 'red' | 'gray';
    icon: 'syncing' | 'synced' | 'error' | 'offline';
  } => {
    if (error) {
      return {
        label: 'Sync Error',
        color: 'red',
        icon: 'error',
      };
    }

    if (!isSyncing) {
      return {
        label: 'Offline',
        color: 'gray',
        icon: 'offline',
      };
    }

    if (wsConnected) {
      return {
        label: 'Live',
        color: 'green',
        icon: 'synced',
      };
    }

    const timeSinceSync = lastSync ? Date.now() - lastSync : Infinity;

    if (timeSinceSync < 10000) {
      // Synced within 10s
      return {
        label: 'Synced',
        color: 'green',
        icon: 'synced',
      };
    }

    return {
      label: 'Syncing',
      color: 'yellow',
      icon: 'syncing',
    };
  }, [isSyncing, lastSync, error, wsConnected]);

  return getStatus();
}

/**
 * Hook for group-specific sync
 */
export function useGroupSync(groupId: string | null) {
  useEffect(() => {
    if (!groupId) return;

    // Register group for syncing
    syncService.registerGroup(groupId);

    // Join WebSocket room for real-time updates
    if (websocketService.isConnected()) {
      websocketService.joinGroup(groupId);
    }

    return () => {
      // Cleanup
      syncService.unregisterGroup(groupId);
      if (websocketService.isConnected()) {
        websocketService.leaveGroup(groupId);
      }
    };
  }, [groupId]);
}

/**
 * Hook for listening to new messages
 */
export function useNewMessages(
  onNewMessage: (data: { groupId: string; messageId: string }) => void
) {
  useEffect(() => {
    const listener = (event: any) => {
      if (event.type === 'NEW_MESSAGES' && event.data?.messages) {
        event.data.messages.forEach((message: any) => {
          onNewMessage({
            groupId: message.groupId,
            messageId: message.id,
          });
        });
      }
    };

    syncService.addEventListener(listener);

    return () => {
      syncService.removeEventListener(listener);
    };
  }, [onNewMessage]);
}

/**
 * Hook for typing indicators
 */
export function useTypingIndicator(groupId: string) {
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (websocketService.isConnected()) {
        websocketService.sendTyping(groupId, isTyping);
      }
    },
    [groupId]
  );

  return { sendTyping };
}

/**
 * Hook for periodic sync refresh
 * Refreshes component when new data arrives
 */
export function useSyncRefresh(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    const listener = (event: any) => {
      if (event.type === 'NEW_MESSAGES' || event.type === 'SYNC_SUCCESS') {
        callback();
      }
    };

    syncService.addEventListener(listener);

    return () => {
      syncService.removeEventListener(listener);
    };
  }, [callback, ...deps]);
}
