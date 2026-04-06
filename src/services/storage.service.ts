import * as SecureStore from 'expo-secure-store';

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Secure storage for sensitive data (auth tokens)
export const secureStorage = {
  // Store auth token securely
  async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store auth token securely:', error);
    }
  },

  // Get auth token
  async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  },

  // Store refresh token securely
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store refresh token securely:', error);
    }
  },

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  },

  // Remove auth tokens
  async removeAuthTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove secure tokens:', error);
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  },
};

// For non-sensitive data in Expo Go, we need to use a different approach
// Since AsyncStorage doesn't work, we can use a simple in-memory storage for development
// or use SecureStore with a prefix for non-sensitive data
const NON_SENSITIVE_PREFIX = 'ns_';

export const storage = {
  // Set item (non-sensitive data)
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Use SecureStore with a prefix for non-sensitive data
      await SecureStore.setItemAsync(`${NON_SENSITIVE_PREFIX}${key}`, value);
    } catch (error) {
      console.error(`Failed to store item ${key}:`, error);
    }
  },

  // Get item (non-sensitive data)
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(`${NON_SENSITIVE_PREFIX}${key}`);
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  },

  // Remove item (non-sensitive data)
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(`${NON_SENSITIVE_PREFIX}${key}`);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  },

  // Clear all storage (non-sensitive data only)
  async clear(): Promise<void> {
    // Note: We can't easily clear all SecureStore items without knowing all keys
    // This is a limitation of SecureStore
    console.warn('SecureStore does not support clearing all items easily');
  },
};
