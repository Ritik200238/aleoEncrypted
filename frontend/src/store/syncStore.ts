/**
 * Zustand Store for Synchronization State
 *
 * Global state management for real-time sync functionality.
 * Tracks sync status, errors, and provides actions for sync control.
 */

import { create } from 'zustand';
import { syncService, SyncEventType } from '../services/syncService';
import {
  websocketService,
  WsEventType,
  ConnectionState,
} from '../services/websocketService';
import { conflictResolutionService } from '../services/conflictResolution';

/**
 * Sync state interface
 */
interface SyncState {
  // Sync status
  isSyncing: boolean;
  lastSync: number | null;
  nextSync: number | null;

  // WebSocket status
  wsConnected: boolean;
  wsConnectionState: ConnectionState;

  // Error tracking
  error: Error | null;
  errorCount: number;

  // Statistics
  totalMessagesSynced: number;
  lastSyncDuration: number;

  // Circuit breaker status
  circuitOpen: boolean;

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
 * Create sync store
 */
export const useSyncStore = create<SyncState>((set, get) => {
  // Set up event listeners
  const setupSyncListeners = () => {
    syncService.addEventListener((event) => {
      switch (event.type) {
        case SyncEventType.SYNC_START:
          set({ isSyncing: true, error: null });
          break;

        case SyncEventType.SYNC_SUCCESS:
          set({
            isSyncing: true, // Still running
            lastSync: event.timestamp,
            error: null,
            errorCount: 0,
            circuitOpen: false,
          });
          break;

        case SyncEventType.SYNC_ERROR:
          set((state) => ({
            error: event.error || null,
            errorCount: state.errorCount + 1,
          }));
          break;

        case SyncEventType.NEW_MESSAGES:
          if (event.data?.count) {
            set((state) => ({
              totalMessagesSynced: state.totalMessagesSynced + event.data.count,
            }));
          }
          break;

        case SyncEventType.CONNECTION_LOST:
          set({ error: new Error('Connection lost') });
          break;

        case SyncEventType.CONNECTION_RESTORED:
          set({ error: null, errorCount: 0 });
          break;
      }
    });
  };

  const setupWebSocketListeners = () => {
    websocketService.addEventListener((event) => {
      switch (event.type) {
        case WsEventType.CONNECTED:
          set({
            wsConnected: true,
            wsConnectionState: ConnectionState.CONNECTED,
          });
          break;

        case WsEventType.DISCONNECTED:
          set({
            wsConnected: false,
            wsConnectionState: ConnectionState.DISCONNECTED,
          });
          break;

        case WsEventType.ERROR:
          set({
            wsConnectionState: ConnectionState.ERROR,
            error: event.error || new Error('WebSocket error'),
          });
          break;

        case WsEventType.NEW_MESSAGE:
          // Trigger immediate sync when new message arrives
          if (get().isSyncing) {
            syncService.syncNow().catch(console.error);
          }
          break;
      }
    });
  };

  // Initialize listeners
  setupSyncListeners();
  setupWebSocketListeners();

  return {
    // Initial state
    isSyncing: false,
    lastSync: null,
    nextSync: null,
    wsConnected: false,
    wsConnectionState: ConnectionState.DISCONNECTED,
    error: null,
    errorCount: 0,
    totalMessagesSynced: 0,
    lastSyncDuration: 0,
    circuitOpen: false,

    // Actions
    startSync: () => {
      try {
        syncService.start();
        set({ isSyncing: true, error: null });
      } catch (error) {
        set({ error: error as Error });
      }
    },

    stopSync: () => {
      syncService.stop();
      set({ isSyncing: false });
    },

    syncNow: async () => {
      try {
        await syncService.syncNow();
      } catch (error) {
        set({ error: error as Error });
      }
    },

    connectWebSocket: async (userAddress: string) => {
      try {
        set({ wsConnectionState: ConnectionState.CONNECTING });
        await websocketService.connect(userAddress);
      } catch (error) {
        set({
          error: error as Error,
          wsConnectionState: ConnectionState.ERROR,
        });
      }
    },

    disconnectWebSocket: () => {
      websocketService.disconnect();
      set({
        wsConnected: false,
        wsConnectionState: ConnectionState.DISCONNECTED,
      });
    },

    clearError: () => {
      set({ error: null, errorCount: 0 });
    },

    reset: () => {
      syncService.reset();
      websocketService.disconnect();
      conflictResolutionService.reset();

      set({
        isSyncing: false,
        lastSync: null,
        nextSync: null,
        wsConnected: false,
        wsConnectionState: ConnectionState.DISCONNECTED,
        error: null,
        errorCount: 0,
        totalMessagesSynced: 0,
        lastSyncDuration: 0,
        circuitOpen: false,
      });
    },
  };
});
