/**
 * Type definitions for synchronization system
 */

import type { Message } from './message';

/**
 * Sync event payload
 */
export interface SyncEventPayload {
  messages?: Message[];
  count?: number;
  groupId?: string;
  error?: Error;
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  pollInterval?: number;
  maxRetries?: number;
  baseBackoffDelay?: number;
  maxBackoffDelay?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
}

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url?: string;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  heartbeatInterval?: number;
}

/**
 * Sync statistics
 */
export interface SyncStatistics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalMessagesSynced: number;
  averageSyncDuration: number;
  lastSyncTimestamp: number;
}

/**
 * Circuit breaker status
 */
export interface CircuitBreakerStatus {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTimestamp: number;
  nextRetryTimestamp: number;
}

/**
 * Conflict resolution metadata
 */
export interface ConflictMetadata {
  totalConflicts: number;
  resolvedConflicts: number;
  strategy: string;
  conflictIds: string[];
}
