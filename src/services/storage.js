/**
 * Storage — two deliberately separate stores.
 *
 *   secureStorage   expo-secure-store, hardware-backed. Auth tokens ONLY.
 *   prefsStorage    AsyncStorage. Preferences and cached UI state ONLY.
 *
 * Why split: AsyncStorage is unencrypted plain text on disk. Putting a refresh
 * token there is the kind of thing that gets found in a Phase 8 security review
 * and is far cheaper to get right now than to retrofit across the app.
 *
 * Nothing sensitive goes in prefsStorage. Ever.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/* ── Secure: auth material only ────────────────────────────────────────── */

export const secureStorage = {
  async get(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`[secureStorage] read "${key}" failed:`, error?.message);
      return null;
    }
  },

  async set(key, value) {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return true;
    } catch (error) {
      console.warn(`[secureStorage] write "${key}" failed:`, error?.message);
      return false;
    }
  },

  async remove(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.warn(`[secureStorage] delete "${key}" failed:`, error?.message);
      return false;
    }
  },
};

export const SECURE_KEYS = {
  accessToken: 'lad.auth.access',
  refreshToken: 'lad.auth.refresh',
};

/* ── Preferences: never sensitive ──────────────────────────────────────── */

export const prefsStorage = {
  async getItem(name) {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.warn(`[prefsStorage] read "${name}" failed:`, error?.message);
      return null;
    }
  },

  async setItem(name, value) {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.warn(`[prefsStorage] write "${name}" failed:`, error?.message);
    }
  },

  async removeItem(name) {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.warn(`[prefsStorage] delete "${name}" failed:`, error?.message);
    }
  },
};

export default { secureStorage, prefsStorage, SECURE_KEYS };
