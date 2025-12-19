import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const ACTIVE_PACKAGE_KEY = 'active_package';
const ACTIVE_ROLE_KEY = 'active_role';

// List of all known keys in secure storage
const KNOWN_KEYS = [TOKEN_KEY, ACTIVE_PACKAGE_KEY, ACTIVE_ROLE_KEY];

/**
 * Secure storage utility that uses expo-secure-store on native
 * and localStorage on web
 */
export class SecureStorage {
  /**
   * Store a value securely
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Error storing item:', error);
      throw error;
    }
  }

  /**
   * Retrieve a value securely
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  }

  /**
   * Remove a value securely
   */
  static async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  }

  /**
   * Store authentication token
   */
  static async setToken(token: string): Promise<void> {
    return this.setItem(TOKEN_KEY, token);
  }

  /**
   * Get authentication token
   */
  static async getToken(): Promise<string | null> {
    return this.getItem(TOKEN_KEY);
  }

  /**
   * Remove authentication token
   */
  static async removeToken(): Promise<void> {
    return this.removeItem(TOKEN_KEY);
  }

  /**
   * Clear all secure storage data
   * On web: clears all localStorage
   * On native: deletes all known keys
   */
  static async clearAll(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear();
        }
      } else {
        // Delete all known keys
        await Promise.all(
          KNOWN_KEYS.map(key => SecureStore.deleteItemAsync(key).catch(() => {
            // Ignore errors for keys that don't exist
          }))
        );
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

