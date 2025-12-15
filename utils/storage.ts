/**
 * Cross-platform storage utilities for 1x1 Trainer
 * Handles localStorage (Web) and AsyncStorage (Mobile)
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';
import { ThemeMode, Language, Operation } from '../types/game';

/**
 * Get a value from storage (platform-safe)
 */
export const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key); // platform-safe
    } else {
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    console.error(`Failed to get storage item ${key}:`, error);
    return null;
  }
};

/**
 * Set a value in storage (platform-safe)
 */
export const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value); // platform-safe
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.error(`Failed to set storage item ${key}:`, error);
  }
};

/**
 * Remove a value from storage (platform-safe)
 */
export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key); // platform-safe
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Failed to remove storage item ${key}:`, error);
  }
};

// Typed storage helpers

export const saveLanguage = async (language: Language): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.LANGUAGE, language);
};

export const getLanguage = async (): Promise<Language | null> => {
  const value = await getStorageItem(STORAGE_KEYS.LANGUAGE);
  if (value === 'en' || value === 'de') {
    return value;
  }
  return null;
};

export const saveTheme = async (theme: ThemeMode): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.THEME, theme);
};

export const getTheme = async (): Promise<ThemeMode | null> => {
  const value = await getStorageItem(STORAGE_KEYS.THEME);
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return null;
};

export const saveOperation = async (operation: Operation): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.OPERATION, operation);
};

export const getOperation = async (): Promise<Operation | null> => {
  const value = await getStorageItem(STORAGE_KEYS.OPERATION);
  if (value === 'ADDITION' || value === 'MULTIPLICATION') {
    return value;
  }
  return null;
};

export const saveTotalTasks = async (total: number): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.TOTAL_TASKS, total.toString());
};

export const getTotalTasks = async (): Promise<number | null> => {
  const value = await getStorageItem(STORAGE_KEYS.TOTAL_TASKS);
  if (value) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};
