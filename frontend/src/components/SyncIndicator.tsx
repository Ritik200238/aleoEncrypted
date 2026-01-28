/**
 * Sync Indicator Component
 *
 * Visual indicator showing real-time sync status.
 * Displays sync state, WebSocket connection, and provides manual sync control.
 *
 * Example usage component demonstrating the sync system.
 */

import React from 'react';
import { useSync, useSyncStatus } from '../hooks/useSync';

/**
 * Icon components for sync states
 */
const SyncIcons = {
  syncing: () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ),
  synced: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
  offline: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
      />
    </svg>
  ),
};

/**
 * Simple Sync Indicator (Minimal)
 */
export const SimpleSyncIndicator: React.FC = () => {
  const status = useSyncStatus();

  const colorClasses = {
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    gray: 'text-gray-400',
  };

  const IconComponent = SyncIcons[status.icon];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={colorClasses[status.color]}>
        <IconComponent />
      </span>
      <span className="text-gray-600">{status.label}</span>
    </div>
  );
};

/**
 * Detailed Sync Indicator (With Controls)
 */
export const DetailedSyncIndicator: React.FC = () => {
  const {
    isSyncing,
    lastSyncFormatted,
    wsConnected,
    error,
    totalMessagesSynced,
    syncHealth,
    syncNow,
    clearError,
  } = useSync();

  const healthColors = {
    good: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  };

  const handleSyncNow = async () => {
    try {
      await syncNow();
    } catch (err) {
      console.error('Manual sync failed:', err);
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${healthColors[syncHealth]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Sync Status</h3>
          {wsConnected && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              Live
            </span>
          )}
        </div>
        <button
          onClick={handleSyncNow}
          disabled={!isSyncing}
          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sync Now
        </button>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="font-medium">
            {isSyncing ? 'Active' : 'Stopped'}
          </span>
        </div>

        {lastSyncFormatted && (
          <div className="flex justify-between">
            <span className="text-gray-600">Last Sync:</span>
            <span className="font-medium">{lastSyncFormatted}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">WebSocket:</span>
          <span className="font-medium">
            {wsConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Messages Synced:</span>
          <span className="font-medium">{totalMessagesSynced}</span>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            <div className="flex justify-between items-start">
              <div className="text-xs text-red-700">{error.message}</div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Sync Status Badge (For Header/Navbar)
 */
export const SyncStatusBadge: React.FC = () => {
  const status = useSyncStatus();
  const { wsConnected } = useSync();

  const dotColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
      <div className="relative">
        <div className={`h-2 w-2 rounded-full ${dotColors[status.color]}`} />
        {wsConnected && (
          <div className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
      <span className="text-xs font-medium text-gray-700">{status.label}</span>
    </div>
  );
};

/**
 * Sync Error Banner
 */
export const SyncErrorBanner: React.FC = () => {
  const { error, clearError, syncNow } = useSync();

  if (!error) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="text-red-500 mt-0.5">
            <SyncIcons.error />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-800">Sync Error</h4>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
            <button
              onClick={() => syncNow()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry Now
            </button>
          </div>
        </div>
        <button
          onClick={clearError}
          className="text-red-400 hover:text-red-600"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Example: Full Sync Dashboard
 */
export const SyncDashboard: React.FC = () => {
  const sync = useSync();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Sync Dashboard</h2>

      {/* Error Banner */}
      <SyncErrorBanner />

      {/* Main Status Card */}
      <DetailedSyncIndicator />

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-600">Sync Health</div>
          <div className="text-2xl font-bold capitalize mt-1">
            {sync.syncHealth}
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-600">Error Count</div>
          <div className="text-2xl font-bold mt-1">{sync.errorCount}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={sync.startSync}
          disabled={sync.isSyncing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Sync
        </button>
        <button
          onClick={sync.stopSync}
          disabled={!sync.isSyncing}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stop Sync
        </button>
        <button
          onClick={sync.reset}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default SyncStatusBadge;
