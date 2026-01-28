// Utility functions for formatting data

/**
 * Truncate Aleo address for display
 * Example: aleo1abc...xyz
 */
export function truncateAddress(address: string, start = 8, end = 6): string {
  if (!address || address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format timestamp to readable format
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Just now (< 1 min)
  if (diffMins < 1) {
    return 'Just now';
  }

  // Minutes ago (< 1 hour)
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  // Hours ago (< 24 hours)
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  // Days ago (< 7 days)
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Older than 7 days - show date
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleDateString('en-US', options);
}

/**
 * Format message time (for message bubbles)
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Validate Aleo address format
 */
export function isValidAleoAddress(address: string): boolean {
  // Aleo addresses start with "aleo1" and are 63 characters
  return /^aleo1[a-z0-9]{59}$/.test(address);
}

/**
 * Format member count
 */
export function formatMemberCount(count: number): string {
  if (count === 1) {
    return '1 member';
  }
  return `${count} members`;
}

/**
 * Generate random color for avatar placeholder
 */
export function getAvatarColor(seed: string): string {
  const colors = [
    '#0088cc', // Telegram blue
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#45b7d1', // Light blue
    '#f7b731', // Yellow
    '#5f27cd', // Purple
    '#00d2d3', // Cyan
    '#ff9ff3', // Pink
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get initials from group name or address
 */
export function getInitials(text: string): string {
  if (!text) return '?';

  // If it's an address, use first 2 chars after "aleo1"
  if (text.startsWith('aleo1')) {
    return text.substring(5, 7).toUpperCase();
  }

  // Otherwise, get first letters of first two words
  const words = text.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return text.substring(0, 2).toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}
