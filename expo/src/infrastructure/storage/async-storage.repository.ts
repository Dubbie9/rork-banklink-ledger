import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { StorageRepository } from '../../core/repositories/storage.repository';

/**
 * AsyncStorage implementation of StorageRepository
 * Handles data persistence using React Native AsyncStorage and Expo SecureStore
 */
export class AsyncStorageRepository implements StorageRepository {
  private readonly keyPrefix = '@banklink:';

  /**
   * Store a value with a key
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.keyPrefix + key, value);
    } catch (error) {
      console.error('Failed to store item:', error);
      throw new Error('Failed to store data');
    }
  }

  /**
   * Retrieve a value by key
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.keyPrefix + key);
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  }

  /**
   * Remove a value by key
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.keyPrefix + key);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw new Error('Failed to remove data');
    }
  }

  /**
   * Store a secure value (encrypted)
   */
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Fallback to AsyncStorage on web (not truly secure)
        await this.setItem('secure_' + key, value);
      } else {
        await SecureStore.setItemAsync(this.keyPrefix + key, value);
      }
    } catch (error) {
      console.error('Failed to store secure item:', error);
      throw new Error('Failed to store secure data');
    }
  }

  /**
   * Retrieve a secure value (decrypted)
   */
  async getSecureItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Fallback to AsyncStorage on web
        return await this.getItem('secure_' + key);
      } else {
        return await SecureStore.getItemAsync(this.keyPrefix + key);
      }
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  /**
   * Remove a secure value
   */
  async removeSecureItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Fallback to AsyncStorage on web
        await this.removeItem('secure_' + key);
      } else {
        await SecureStore.deleteItemAsync(this.keyPrefix + key);
      }
    } catch (error) {
      console.error('Failed to remove secure item:', error);
      throw new Error('Failed to remove secure data');
    }
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith(this.keyPrefix));
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('Failed to clear data');
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith(this.keyPrefix))
        .map(key => key.replace(this.keyPrefix, ''));
    } catch (error) {
      console.error('Failed to get keys:', error);
      return [];
    }
  }
}