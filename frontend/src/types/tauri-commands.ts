/**
 * TypeScript type definitions for Tauri Rust backend commands
 * Auto-generated types matching Rust structs
 */

import { invoke } from '@tauri-apps/api/core';

// ============================================================================
// Data Types
// ============================================================================

export interface Message {
  id: string;
  chat_id: string;
  sender_address: string;
  recipient_address: string;
  content: string;              // Decrypted content
  encrypted_content: string;     // Base64 encrypted
  nonce: string;                // Base64 nonce
  timestamp: number;            // Unix timestamp in milliseconds
  is_sent: boolean;
  is_read: boolean;
  tx_hash: string | null;
}

export interface Chat {
  id: string;
  contact_address: string;
  contact_name: string;
  last_message: string | null;
  last_message_time: number;
  unread_count: number;
  created_at: number;
}

export interface Contact {
  id: string;
  address: string;              // Aleo address
  name: string;
  public_key: string;           // Base64 encoded
  avatar: string | null;
  is_favorite: boolean;
  created_at: number;
  last_seen: number | null;
}

export interface EncryptionResponse {
  ciphertext: string;           // Base64 encoded
  nonce: string;               // Base64 encoded
}

export interface KeyPairResponse {
  public_key: string;           // Base64 encoded
  private_key: string;          // Base64 encoded
}

export interface NetworkStatus {
  is_connected: boolean;
  network_name: string;
  block_height: number | null;
}

export interface DatabaseStats {
  message_count: number;
  chat_count: number;
  contact_count: number;
  db_size_bytes: number;
}

// ============================================================================
// Encryption Commands
// ============================================================================

export async function encryptMessage(
  plaintext: string,
  key: string
): Promise<EncryptionResponse> {
  return invoke('encrypt_message', { plaintext, key });
}

export async function decryptMessage(
  ciphertext: string,
  nonce: string,
  key: string
): Promise<string> {
  return invoke('decrypt_message', { ciphertext, nonce, key });
}

export async function generateKeyPair(): Promise<KeyPairResponse> {
  return invoke('generate_key_pair');
}

export async function deriveSharedSecret(
  privateKey: string,
  publicKey: string
): Promise<string> {
  return invoke('derive_shared_secret', { privateKey, publicKey });
}

// ============================================================================
// Database Commands - Messages
// ============================================================================

export async function storeMessage(messageData: Message): Promise<void> {
  return invoke('store_message', { messageData });
}

export async function getMessages(
  chatId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> {
  return invoke('get_messages', { chatId, limit, offset });
}

export async function searchMessages(query: string): Promise<Message[]> {
  return invoke('search_messages', { query });
}

export async function deleteMessage(
  chatId: string,
  messageId: string
): Promise<void> {
  return invoke('delete_message', { chatId, messageId });
}

// ============================================================================
// Database Commands - Chats
// ============================================================================

export async function storeChat(chatData: Chat): Promise<void> {
  return invoke('store_chat', { chatData });
}

export async function getChats(): Promise<Chat[]> {
  return invoke('get_chats');
}

export async function getChat(chatId: string): Promise<Chat | null> {
  return invoke('get_chat', { chatId });
}

export async function deleteChat(chatId: string): Promise<void> {
  return invoke('delete_chat', { chatId });
}

// ============================================================================
// Database Commands - Contacts
// ============================================================================

export async function storeContact(contactData: Contact): Promise<void> {
  return invoke('store_contact', { contactData });
}

export async function getContacts(): Promise<Contact[]> {
  return invoke('get_contacts');
}

export async function getContactByAddress(
  address: string
): Promise<Contact | null> {
  return invoke('get_contact_by_address', { address });
}

export async function deleteContact(contactId: string): Promise<void> {
  return invoke('delete_contact', { contactId });
}

// ============================================================================
// System Commands
// ============================================================================

export async function getAppDataDir(): Promise<string> {
  return invoke('get_app_data_dir');
}

export async function getAppConfigDir(): Promise<string> {
  return invoke('get_app_config_dir');
}

export async function getAppCacheDir(): Promise<string> {
  return invoke('get_app_cache_dir');
}

export async function showNotification(
  title: string,
  body: string
): Promise<void> {
  return invoke('show_notification', { title, body });
}

// ============================================================================
// Blockchain Commands
// ============================================================================

export async function checkNetworkStatus(): Promise<NetworkStatus> {
  return invoke('check_network_status');
}

export async function submitTransaction(
  transactionData: string
): Promise<string> {
  return invoke('submit_transaction', { transactionData });
}

export async function getTransactionStatus(txHash: string): Promise<string> {
  return invoke('get_transaction_status', { txHash });
}

// ============================================================================
// Utility Commands
// ============================================================================

export async function getDatabaseStats(): Promise<DatabaseStats> {
  return invoke('get_database_stats');
}

export async function clearAllData(): Promise<void> {
  return invoke('clear_all_data');
}

export async function exportDatabase(): Promise<string> {
  return invoke('export_database');
}

export async function hashData(data: string): Promise<string> {
  return invoke('hash_data', { data });
}

export async function generateAddressCommitment(
  address: string
): Promise<string> {
  return invoke('generate_address_commitment', { address });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a random ID for messages, chats, or contacts
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp to readable date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Check if a message was sent recently (within last 5 minutes)
 */
export function isRecentMessage(timestamp: number): boolean {
  return Date.now() - timestamp < 5 * 60 * 1000;
}

/**
 * Validate Aleo address format
 */
export function isValidAleoAddress(address: string): boolean {
  // Basic validation - Aleo addresses start with "aleo1"
  return /^aleo1[a-z0-9]{58}$/.test(address);
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// Error Handling Helper
// ============================================================================

/**
 * Execute a command with error handling and retry logic
 */
export async function executeWithRetry<T>(
  command: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await command();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

// ============================================================================
// Export All
// ============================================================================

export const TauriCommands = {
  // Encryption
  encryptMessage,
  decryptMessage,
  generateKeyPair,
  deriveSharedSecret,

  // Messages
  storeMessage,
  getMessages,
  searchMessages,
  deleteMessage,

  // Chats
  storeChat,
  getChats,
  getChat,
  deleteChat,

  // Contacts
  storeContact,
  getContacts,
  getContactByAddress,
  deleteContact,

  // System
  getAppDataDir,
  getAppConfigDir,
  getAppCacheDir,
  showNotification,

  // Blockchain
  checkNetworkStatus,
  submitTransaction,
  getTransactionStatus,

  // Utilities
  getDatabaseStats,
  clearAllData,
  exportDatabase,
  hashData,
  generateAddressCommitment,
};

export default TauriCommands;
