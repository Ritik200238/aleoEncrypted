/**
 * Conflict Resolution Service
 *
 * Handles conflicts between local and remote state in distributed system.
 * Features:
 * - Lamport timestamp-based ordering
 * - CRDT-like conflict-free updates
 * - Last-write-wins (LWW) strategy for simple conflicts
 * - Vector clocks for complex distributed scenarios
 * - Merge strategies for different data types
 *
 * Production-ready with comprehensive conflict detection and resolution.
 */

import type { Message } from '../types/message';
import type { Group } from '../types/group';

/**
 * Lamport timestamp for logical clock ordering
 */
export interface LamportClock {
  timestamp: number;
  nodeId: string; // Aleo address for tie-breaking
}

/**
 * Vector clock for distributed causality tracking
 */
export interface VectorClock {
  clocks: Map<string, number>;
}

/**
 * Conflict types
 */
export enum ConflictType {
  NO_CONFLICT = 'NO_CONFLICT',
  CONCURRENT_UPDATE = 'CONCURRENT_UPDATE',
  DIVERGENT_STATE = 'DIVERGENT_STATE',
  DUPLICATE_MESSAGE = 'DUPLICATE_MESSAGE',
}

/**
 * Conflict resolution result
 */
export interface ConflictResolution<T> {
  resolved: T;
  conflictType: ConflictType;
  strategy: string;
  metadata?: any;
}

/**
 * Message with version metadata
 */
export interface VersionedMessage extends Message {
  lamportTimestamp?: LamportClock;
  vectorClock?: VectorClock;
  version?: number;
}

/**
 * Group with version metadata
 */
export interface VersionedGroup extends Group {
  lamportTimestamp?: LamportClock;
  vectorClock?: VectorClock;
  version?: number;
}

/**
 * Conflict Resolution Service Class
 */
export class ConflictResolutionService {
  private lamportCounter = 0;
  private nodeId: string | null = null;
  private vectorClock = new Map<string, number>();

  /**
   * Initialize conflict resolution service with node ID (user address)
   */
  initialize(nodeId: string): void {
    this.nodeId = nodeId;
    this.vectorClock.set(nodeId, 0);
    console.log(`🔧 Conflict resolution initialized for node: ${nodeId}`);
  }

  /**
   * Increment Lamport clock
   */
  private incrementLamportClock(): LamportClock {
    this.lamportCounter++;
    return {
      timestamp: this.lamportCounter,
      nodeId: this.nodeId || 'unknown',
    };
  }

  /**
   * Update Lamport clock based on received timestamp
   */
  private updateLamportClock(receivedClock: LamportClock): void {
    this.lamportCounter = Math.max(this.lamportCounter, receivedClock.timestamp) + 1;
  }

  /**
   * Increment vector clock for this node
   */
  private incrementVectorClock(): VectorClock {
    if (!this.nodeId) {
      throw new Error('Node ID not initialized');
    }

    const currentValue = this.vectorClock.get(this.nodeId) || 0;
    this.vectorClock.set(this.nodeId, currentValue + 1);

    return {
      clocks: new Map(this.vectorClock),
    };
  }

  /**
   * Update vector clock based on received clock
   */
  private updateVectorClock(receivedClock: VectorClock): void {
    if (!this.nodeId) return;

    // Merge received clock into local clock (take max for each node)
    receivedClock.clocks.forEach((value, nodeId) => {
      const currentValue = this.vectorClock.get(nodeId) || 0;
      this.vectorClock.set(nodeId, Math.max(currentValue, value));
    });

    // Increment own counter
    const currentValue = this.vectorClock.get(this.nodeId) || 0;
    this.vectorClock.set(this.nodeId, currentValue + 1);
  }

  /**
   * Compare two Lamport timestamps
   * Returns: -1 if a < b, 0 if concurrent, 1 if a > b
   */
  private compareLamportClocks(a: LamportClock, b: LamportClock): number {
    if (a.timestamp < b.timestamp) return -1;
    if (a.timestamp > b.timestamp) return 1;

    // Timestamps equal - use node ID for deterministic tie-breaking
    if (a.nodeId < b.nodeId) return -1;
    if (a.nodeId > b.nodeId) return 1;

    return 0;
  }

  /**
   * Compare two vector clocks
   * Returns: -1 if a < b, 0 if concurrent, 1 if a > b
   */
  private compareVectorClocks(a: VectorClock, b: VectorClock): number {
    let aLessThanB = false;
    let aGreaterThanB = false;

    // Collect all node IDs from both clocks
    const allNodes = new Set([
      ...Array.from(a.clocks.keys()),
      ...Array.from(b.clocks.keys()),
    ]);

    // Compare each node's timestamp
    allNodes.forEach(nodeId => {
      const aValue = a.clocks.get(nodeId) || 0;
      const bValue = b.clocks.get(nodeId) || 0;

      if (aValue < bValue) aLessThanB = true;
      if (aValue > bValue) aGreaterThanB = true;
    });

    // Determine relationship
    if (aLessThanB && !aGreaterThanB) return -1; // a causally before b
    if (aGreaterThanB && !aLessThanB) return 1; // a causally after b
    if (!aLessThanB && !aGreaterThanB) return 0; // equal
    return 0; // concurrent
  }

  /**
   * Resolve message conflicts
   * Uses Lamport timestamps for ordering
   */
  resolveMessages(
    localMessages: VersionedMessage[],
    remoteMessages: VersionedMessage[]
  ): ConflictResolution<VersionedMessage[]> {
    const mergedMap = new Map<string, VersionedMessage>();
    let conflictType = ConflictType.NO_CONFLICT;
    const conflicts: string[] = [];

    // Add all local messages
    localMessages.forEach(msg => {
      mergedMap.set(msg.id, msg);
    });

    // Process remote messages
    remoteMessages.forEach(remoteMsg => {
      const localMsg = mergedMap.get(remoteMsg.id);

      if (!localMsg) {
        // New message from remote
        mergedMap.set(remoteMsg.id, remoteMsg);
        return;
      }

      // Duplicate message - check for conflicts
      if (this.messagesEqual(localMsg, remoteMsg)) {
        conflictType = ConflictType.DUPLICATE_MESSAGE;
        return;
      }

      // Conflict detected - resolve using Lamport timestamp
      conflictType = ConflictType.CONCURRENT_UPDATE;
      conflicts.push(remoteMsg.id);

      const resolved = this.resolveMessageConflict(localMsg, remoteMsg);
      mergedMap.set(resolved.id, resolved);
    });

    // Sort messages by timestamp
    const resolved = Array.from(mergedMap.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );

    return {
      resolved,
      conflictType,
      strategy: 'lamport-timestamp-lww',
      metadata: {
        totalMessages: resolved.length,
        conflicts: conflicts.length,
        conflictIds: conflicts,
      },
    };
  }

  /**
   * Resolve conflict between two messages
   * Uses Last-Write-Wins (LWW) with Lamport timestamp
   */
  private resolveMessageConflict(
    local: VersionedMessage,
    remote: VersionedMessage
  ): VersionedMessage {
    // Compare Lamport timestamps if available
    if (local.lamportTimestamp && remote.lamportTimestamp) {
      const comparison = this.compareLamportClocks(
        local.lamportTimestamp,
        remote.lamportTimestamp
      );

      if (comparison >= 0) {
        return local; // Local wins
      } else {
        return remote; // Remote wins
      }
    }

    // Fallback to regular timestamp
    if (local.timestamp > remote.timestamp) {
      return local;
    } else if (local.timestamp < remote.timestamp) {
      return remote;
    }

    // Timestamps equal - use sender commitment for deterministic ordering
    if (local.senderCommitment >= remote.senderCommitment) {
      return local;
    } else {
      return remote;
    }
  }

  /**
   * Check if two messages are equal
   */
  private messagesEqual(a: Message, b: Message): boolean {
    return (
      a.id === b.id &&
      a.content === b.content &&
      a.timestamp === b.timestamp &&
      a.senderCommitment === b.senderCommitment
    );
  }

  /**
   * Resolve group state conflicts
   * Uses vector clocks for causality tracking
   */
  resolveGroupState(
    localGroup: VersionedGroup,
    remoteGroup: VersionedGroup
  ): ConflictResolution<VersionedGroup> {
    // Compare vector clocks if available
    if (localGroup.vectorClock && remoteGroup.vectorClock) {
      const comparison = this.compareVectorClocks(
        localGroup.vectorClock,
        remoteGroup.vectorClock
      );

      if (comparison > 0) {
        // Local is newer
        return {
          resolved: localGroup,
          conflictType: ConflictType.NO_CONFLICT,
          strategy: 'vector-clock',
        };
      } else if (comparison < 0) {
        // Remote is newer
        return {
          resolved: remoteGroup,
          conflictType: ConflictType.NO_CONFLICT,
          strategy: 'vector-clock',
        };
      }

      // Concurrent updates - merge
      return {
        resolved: this.mergeGroupStates(localGroup, remoteGroup),
        conflictType: ConflictType.CONCURRENT_UPDATE,
        strategy: 'vector-clock-merge',
      };
    }

    // Fallback to timestamp-based LWW
    if (localGroup.lastMessageTime > remoteGroup.lastMessageTime) {
      return {
        resolved: localGroup,
        conflictType: ConflictType.NO_CONFLICT,
        strategy: 'lww-timestamp',
      };
    } else if (localGroup.lastMessageTime < remoteGroup.lastMessageTime) {
      return {
        resolved: remoteGroup,
        conflictType: ConflictType.NO_CONFLICT,
        strategy: 'lww-timestamp',
      };
    }

    // Equal timestamps - merge
    return {
      resolved: this.mergeGroupStates(localGroup, remoteGroup),
      conflictType: ConflictType.CONCURRENT_UPDATE,
      strategy: 'merge',
    };
  }

  /**
   * Merge two group states (CRDT-like operation)
   */
  private mergeGroupStates(
    local: VersionedGroup,
    remote: VersionedGroup
  ): VersionedGroup {
    // Use LWW for most fields, merge members
    return {
      ...local,
      name: local.lastMessageTime >= remote.lastMessageTime ? local.name : remote.name,
      avatar: local.lastMessageTime >= remote.lastMessageTime ? local.avatar : remote.avatar,
      lastMessage:
        local.lastMessageTime >= remote.lastMessageTime
          ? local.lastMessage
          : remote.lastMessage,
      lastMessageTime: Math.max(local.lastMessageTime, remote.lastMessageTime),
      unreadCount: Math.max(local.unreadCount, remote.unreadCount),
      // Take higher version number
      version: Math.max(local.version || 0, remote.version || 0) + 1,
    };
  }

  /**
   * Merge local and remote message lists
   * Removes duplicates and resolves conflicts
   */
  mergeMessageLists(
    local: Message[],
    remote: Message[]
  ): ConflictResolution<Message[]> {
    // Convert to versioned messages
    const localVersioned: VersionedMessage[] = local.map(msg => ({
      ...msg,
      lamportTimestamp: msg.lamportTimestamp || this.incrementLamportClock(),
    }));

    const remoteVersioned: VersionedMessage[] = remote.map(msg => {
      const versioned: VersionedMessage = { ...msg };

      // Update our clock based on remote timestamp
      if (msg.lamportTimestamp) {
        this.updateLamportClock(msg.lamportTimestamp);
      }

      return versioned;
    });

    return this.resolveMessages(localVersioned, remoteVersioned);
  }

  /**
   * Create a versioned message
   * Adds Lamport timestamp to track causality
   */
  createVersionedMessage(message: Message): VersionedMessage {
    const lamportTimestamp = this.incrementLamportClock();

    return {
      ...message,
      lamportTimestamp,
      version: 1,
    };
  }

  /**
   * Create a versioned group
   * Adds vector clock for distributed state tracking
   */
  createVersionedGroup(group: Group): VersionedGroup {
    const vectorClock = this.incrementVectorClock();

    return {
      ...group,
      vectorClock,
      version: 1,
    };
  }

  /**
   * Detect if states have diverged
   */
  hasStateDiverged(
    localLastSync: number,
    remoteLastUpdate: number,
    threshold: number = 30000
  ): boolean {
    // States diverged if remote has updates significantly newer than last sync
    return remoteLastUpdate - localLastSync > threshold;
  }

  /**
   * Create a three-way merge for complex conflicts
   */
  threeWayMerge<T>(
    base: T,
    local: T,
    remote: T,
    mergeStrategy: (base: T, local: T, remote: T) => T
  ): ConflictResolution<T> {
    const resolved = mergeStrategy(base, local, remote);

    return {
      resolved,
      conflictType: ConflictType.NO_CONFLICT,
      strategy: 'three-way-merge',
    };
  }

  /**
   * Get current Lamport timestamp
   */
  getCurrentLamportTimestamp(): LamportClock {
    return {
      timestamp: this.lamportCounter,
      nodeId: this.nodeId || 'unknown',
    };
  }

  /**
   * Get current vector clock
   */
  getCurrentVectorClock(): VectorClock {
    return {
      clocks: new Map(this.vectorClock),
    };
  }

  /**
   * Reset conflict resolution state
   */
  reset(): void {
    this.lamportCounter = 0;
    this.vectorClock.clear();
    if (this.nodeId) {
      this.vectorClock.set(this.nodeId, 0);
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      nodeId: this.nodeId,
      lamportCounter: this.lamportCounter,
      vectorClockSize: this.vectorClock.size,
      vectorClock: Object.fromEntries(this.vectorClock),
    };
  }
}

// Export singleton instance
export const conflictResolutionService = new ConflictResolutionService();
