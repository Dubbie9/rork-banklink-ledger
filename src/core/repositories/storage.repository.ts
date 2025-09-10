/**
 * Storage repository interface
 * Defines the contract for data persistence
 */
export interface StorageRepository {
  /**
   * Store a value with a key
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Retrieve a value by key
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Remove a value by key
   */
  removeItem(key: string): Promise<void>;

  /**
   * Store a secure value (encrypted)
   */
  setSecureItem(key: string, value: string): Promise<void>;

  /**
   * Retrieve a secure value (decrypted)
   */
  getSecureItem(key: string): Promise<string | null>;

  /**
   * Remove a secure value
   */
  removeSecureItem(key: string): Promise<void>;

  /**
   * Clear all stored data
   */
  clear(): Promise<void>;

  /**
   * Get all keys
   */
  getAllKeys(): Promise<string[]>;
}