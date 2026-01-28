/**
 * Security Service - Production-Grade Security Controls
 *
 * Implements defense-in-depth security measures:
 * - Input validation and sanitization
 * - XSS attack prevention
 * - Rate limiting for blockchain operations
 * - Aleo address validation (bech32m format)
 * - File upload security
 * - Secure random generation
 *
 * SECURITY POSTURE:
 * - Assume all inputs are malicious until proven otherwise
 * - Fail closed (deny by default)
 * - Log security events for audit
 * - No sensitive data in error messages
 */

import DOMPurify from 'dompurify';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SECURITY_CONFIG = {
  // Rate limiting configuration
  rateLimits: {
    blockchain: {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
    },
    messageEncryption: {
      maxRequests: 100,
      windowMs: 60000,
    },
    fileUpload: {
      maxRequests: 5,
      windowMs: 60000,
    },
  },

  // File upload restrictions
  fileUpload: {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'application/pdf',
    ],
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.mp4', '.webm', '.mp3', '.wav', '.pdf'
    ],
  },

  // Input validation limits
  inputLimits: {
    maxMessageLength: 10000,
    maxUsernameLength: 50,
    maxGroupNameLength: 100,
    maxBioLength: 500,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },

  // Aleo address format
  aleo: {
    addressPrefix: 'aleo1',
    addressLength: 63, // bech32m encoded
    validAddressRegex: /^aleo1[a-z0-9]{58}$/,
  },

  // Content Security
  allowedUrlSchemes: ['https:', 'ipfs:'],
  maxUrlLength: 2048,
};

// ============================================================================
// TYPES
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
}

// ============================================================================
// SECURITY SERVICE CLASS
// ============================================================================

class SecurityService {
  private rateLimitStore: Map<string, RateLimitEntry> = new Map();
  private securityEventLog: Array<{ timestamp: number; event: string; severity: string }> = [];

  constructor() {
    // Initialize DOMPurify with strict configuration
    this.configureDOMPurify();

    // Start cleanup intervals
    this.startCleanupIntervals();
  }

  // ==========================================================================
  // INPUT VALIDATION
  // ==========================================================================

  /**
   * Validate and sanitize text input
   * Prevents XSS, injection attacks, and enforces length limits
   */
  validateTextInput(
    input: string,
    options: {
      maxLength?: number;
      minLength?: number;
      allowHtml?: boolean;
      fieldName?: string;
    } = {}
  ): ValidationResult {
    const { maxLength, minLength = 0, allowHtml = false, fieldName = 'Input' } = options;

    // Type check
    if (typeof input !== 'string') {
      return {
        isValid: false,
        error: `${fieldName} must be a string`,
      };
    }

    // Length validation
    if (input.length < minLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${minLength} characters`,
      };
    }

    if (maxLength && input.length > maxLength) {
      return {
        isValid: false,
        error: `${fieldName} cannot exceed ${maxLength} characters`,
      };
    }

    // Sanitize based on HTML allowance
    const sanitized = allowHtml
      ? this.sanitizeHtml(input)
      : this.sanitizeText(input);

    // Check for null bytes (potential injection)
    if (sanitized.includes('\0')) {
      this.logSecurityEvent('Null byte detected in input', 'HIGH');
      return {
        isValid: false,
        error: 'Invalid characters detected',
      };
    }

    return {
      isValid: true,
      sanitized,
    };
  }

  /**
   * Validate message content before encryption/sending
   */
  validateMessage(content: string): ValidationResult {
    return this.validateTextInput(content, {
      maxLength: SECURITY_CONFIG.inputLimits.maxMessageLength,
      minLength: 1,
      allowHtml: false,
      fieldName: 'Message',
    });
  }

  /**
   * Validate username
   */
  validateUsername(username: string): ValidationResult {
    const result = this.validateTextInput(username, {
      maxLength: SECURITY_CONFIG.inputLimits.maxUsernameLength,
      minLength: 3,
      allowHtml: false,
      fieldName: 'Username',
    });

    if (!result.isValid) return result;

    // Additional username-specific validation
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(result.sanitized!)) {
      return {
        isValid: false,
        error: 'Username can only contain letters, numbers, underscores, and hyphens',
      };
    }

    return result;
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): ValidationResult {
    const { minPasswordLength, maxPasswordLength } = SECURITY_CONFIG.inputLimits;

    if (password.length < minPasswordLength) {
      return {
        isValid: false,
        error: `Password must be at least ${minPasswordLength} characters`,
      };
    }

    if (password.length > maxPasswordLength) {
      return {
        isValid: false,
        error: `Password cannot exceed ${maxPasswordLength} characters`,
      };
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const complexityScore = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (complexityScore < 3) {
      return {
        isValid: false,
        error: 'Password must contain at least 3 of: uppercase, lowercase, number, special character',
      };
    }

    // Check for common weak passwords
    const weakPasswords = ['password123', 'Password123!', 'admin123', '123456789'];
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
      return {
        isValid: false,
        error: 'Password is too common',
      };
    }

    return {
      isValid: true,
      sanitized: password, // Don't modify passwords
    };
  }

  // ==========================================================================
  // ALEO ADDRESS VALIDATION
  // ==========================================================================

  /**
   * Validate Aleo blockchain address (bech32m format)
   * Format: aleo1 + 58 lowercase alphanumeric characters
   */
  validateAleoAddress(address: string): ValidationResult {
    if (typeof address !== 'string') {
      return {
        isValid: false,
        error: 'Address must be a string',
      };
    }

    const trimmed = address.trim();

    // Check prefix
    if (!trimmed.startsWith(SECURITY_CONFIG.aleo.addressPrefix)) {
      return {
        isValid: false,
        error: 'Invalid Aleo address: must start with "aleo1"',
      };
    }

    // Check length
    if (trimmed.length !== SECURITY_CONFIG.aleo.addressLength) {
      return {
        isValid: false,
        error: `Invalid Aleo address: must be exactly ${SECURITY_CONFIG.aleo.addressLength} characters`,
      };
    }

    // Check format (bech32m)
    if (!SECURITY_CONFIG.aleo.validAddressRegex.test(trimmed)) {
      return {
        isValid: false,
        error: 'Invalid Aleo address format',
      };
    }

    return {
      isValid: true,
      sanitized: trimmed,
    };
  }

  // ==========================================================================
  // XSS PROTECTION
  // ==========================================================================

  /**
   * Configure DOMPurify with strict security settings
   */
  private configureDOMPurify(): void {
    // Allow only safe tags for rich text (if ever needed)
    DOMPurify.setConfig({
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOWED_URI_REGEXP: /^(?:https?|ipfs):/i,
    });
  }

  /**
   * Sanitize HTML content to prevent XSS
   * Used for user-generated content that may contain formatting
   */
  sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    });
  }

  /**
   * Sanitize plain text (strip all HTML)
   * Used for messages, usernames, etc.
   */
  sanitizeText(text: string): string {
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  }

  /**
   * Escape HTML entities for display
   * Alternative to sanitization when you need to preserve exact content
   */
  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==========================================================================
  // RATE LIMITING
  // ==========================================================================

  /**
   * Check if operation is rate limited
   * Returns true if allowed, false if rate limit exceeded
   */
  checkRateLimit(
    identifier: string,
    limitType: 'blockchain' | 'messageEncryption' | 'fileUpload'
  ): { allowed: boolean; retryAfter?: number } {
    const limit = SECURITY_CONFIG.rateLimits[limitType];
    const key = `${limitType}:${identifier}`;
    const now = Date.now();

    const entry = this.rateLimitStore.get(key);

    // No previous entry, allow and create
    if (!entry) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + limit.windowMs,
      });
      return { allowed: true };
    }

    // Reset window expired, allow and reset
    if (now >= entry.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + limit.windowMs,
      });
      return { allowed: true };
    }

    // Within window, check limit
    if (entry.count >= limit.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      this.logSecurityEvent(
        `Rate limit exceeded for ${limitType} by ${identifier}`,
        'MEDIUM'
      );
      return { allowed: false, retryAfter };
    }

    // Increment counter
    entry.count++;
    return { allowed: true };
  }

  /**
   * Clear rate limit for identifier (use with caution)
   */
  clearRateLimit(identifier: string, limitType: string): void {
    const key = `${limitType}:${identifier}`;
    this.rateLimitStore.delete(key);
  }

  // ==========================================================================
  // FILE UPLOAD VALIDATION
  // ==========================================================================

  /**
   * Validate file before upload
   * Checks type, size, and filename for security issues
   */
  validateFileUpload(file: File): FileValidationResult {
    // Check file size
    if (file.size > SECURITY_CONFIG.fileUpload.maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds maximum of ${SECURITY_CONFIG.fileUpload.maxSizeBytes / 1024 / 1024}MB`,
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty',
      };
    }

    // Check MIME type
    if (!SECURITY_CONFIG.fileUpload.allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    // Check file extension
    const extension = this.getFileExtension(file.name).toLowerCase();
    if (!SECURITY_CONFIG.fileUpload.allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File extension ${extension} is not allowed`,
      };
    }

    // Sanitize filename
    const sanitizedName = this.sanitizeFilename(file.name);

    // Check for path traversal attempts
    if (sanitizedName.includes('..') || sanitizedName.includes('/') || sanitizedName.includes('\\')) {
      this.logSecurityEvent('Path traversal attempt in filename', 'HIGH');
      return {
        isValid: false,
        error: 'Invalid filename',
      };
    }

    return {
      isValid: true,
      sanitizedName,
    };
  }

  /**
   * Sanitize filename to prevent injection
   */
  private sanitizeFilename(filename: string): string {
    // Remove any path components
    const basename = filename.split(/[/\\]/).pop() || 'file';

    // Replace dangerous characters
    return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  /**
   * Get file extension safely
   */
  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }

  // ==========================================================================
  // URL VALIDATION
  // ==========================================================================

  /**
   * Validate URL to prevent SSRF and malicious redirects
   */
  validateUrl(url: string): ValidationResult {
    if (typeof url !== 'string' || url.length === 0) {
      return {
        isValid: false,
        error: 'URL must be a non-empty string',
      };
    }

    if (url.length > SECURITY_CONFIG.maxUrlLength) {
      return {
        isValid: false,
        error: 'URL is too long',
      };
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return {
        isValid: false,
        error: 'Invalid URL format',
      };
    }

    // Check allowed schemes
    if (!SECURITY_CONFIG.allowedUrlSchemes.includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: `URL scheme ${parsedUrl.protocol} is not allowed`,
      };
    }

    // Check for localhost/private IP ranges (SSRF prevention)
    const hostname = parsedUrl.hostname.toLowerCase();
    const privateRanges = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '10.',
      '172.16.',
      '192.168.',
    ];

    if (privateRanges.some(range => hostname.startsWith(range))) {
      this.logSecurityEvent('Attempted access to private IP range', 'HIGH');
      return {
        isValid: false,
        error: 'Access to private networks is not allowed',
      };
    }

    return {
      isValid: true,
      sanitized: parsedUrl.toString(),
    };
  }

  // ==========================================================================
  // SECURE RANDOM GENERATION
  // ==========================================================================

  /**
   * Generate cryptographically secure random bytes
   */
  generateSecureRandomBytes(length: number): Uint8Array {
    if (length <= 0 || length > 65536) {
      throw new Error('Invalid random byte length');
    }

    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Generate secure random hex string
   */
  generateSecureRandomHex(length: number): string {
    const bytes = this.generateSecureRandomBytes(Math.ceil(length / 2));
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, length);
  }

  /**
   * Generate secure random ID (URL-safe base64)
   */
  generateSecureId(byteLength: number = 16): string {
    const bytes = this.generateSecureRandomBytes(byteLength);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // ==========================================================================
  // SECURITY EVENT LOGGING
  // ==========================================================================

  /**
   * Log security-relevant events (for audit trail)
   * In production, these should be sent to a SIEM system
   */
  private logSecurityEvent(event: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): void {
    const logEntry = {
      timestamp: Date.now(),
      event,
      severity,
    };

    this.securityEventLog.push(logEntry);

    // Keep only last 1000 events in memory
    if (this.securityEventLog.length > 1000) {
      this.securityEventLog.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[SECURITY ${severity}]`, event);
    }

    // In production, send to monitoring system
    // Example: sendToSIEM(logEntry);
  }

  /**
   * Get security event log (for debugging/audit)
   */
  getSecurityLog(): Array<{ timestamp: number; event: string; severity: string }> {
    return [...this.securityEventLog];
  }

  // ==========================================================================
  // CLEANUP & MAINTENANCE
  // ==========================================================================

  /**
   * Start periodic cleanup of expired rate limits
   */
  private startCleanupIntervals(): void {
    // Clean up rate limits every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.rateLimitStore.entries()) {
        if (now >= entry.resetTime) {
          this.rateLimitStore.delete(key);
        }
      }
    }, 60000);

    // Clean up old security logs every hour
    setInterval(() => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
      this.securityEventLog = this.securityEventLog.filter(
        entry => entry.timestamp > cutoff
      );
    }, 3600000);
  }

  /**
   * Clear all rate limits (use for testing only)
   */
  clearAllRateLimits(): void {
    this.rateLimitStore.clear();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Singleton instance
export const securityService = new SecurityService();

// Export types
export type { ValidationResult, FileValidationResult };

// Export configuration for testing
export { SECURITY_CONFIG };
