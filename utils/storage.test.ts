/**
 * Tests for storage.ts
 * Phase 2: Storage Layer - Basic CRUD and typed storage helpers
 */

import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  saveLanguage,
  getLanguage,
  saveTheme,
  getTheme,
  saveOperations,
  getOperations,
  saveOperation,
  getOperation,
  saveTotalTasks,
  getTotalTasks,
  saveNumberRange,
  getNumberRange,
  saveChallengeHighScore,
  getChallengeHighScore,
} from './storage';
import { Operation, ThemeMode, Language, NumberRange } from '../types/game';

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('storage.ts - Basic CRUD Operations', () => {
  let mockLocalStorage: { [key: string]: string };
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;
  let removeItemSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mock localStorage
    mockLocalStorage = {};
    
    // Create spies on localStorage methods
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return mockLocalStorage[key] || null;
    });
    
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
    
    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete mockLocalStorage[key];
    });
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('getStorageItem() and setStorageItem()', () => {
    it('should store and retrieve string values correctly', async () => {
      const key = 'test-key';
      const value = 'test-value';

      await setStorageItem(key, value);
      const retrieved = await getStorageItem(key);

      expect(retrieved).toBe(value);
      expect(setItemSpy).toHaveBeenCalledWith(key, value);
      expect(getItemSpy).toHaveBeenCalledWith(key);
    });

    it('should return null for non-existent keys', async () => {
      const result = await getStorageItem('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle null values gracefully', async () => {
      await setStorageItem('null-test', 'null');
      const result = await getStorageItem('null-test');
      expect(result).toBe('null');
    });

    it('should overwrite existing values', async () => {
      const key = 'overwrite-test';
      
      await setStorageItem(key, 'first-value');
      await setStorageItem(key, 'second-value');
      
      const result = await getStorageItem(key);
      expect(result).toBe('second-value');
    });
  });

  describe('removeStorageItem()', () => {
    it('should remove stored items', async () => {
      const key = 'remove-test';
      const value = 'to-be-removed';

      await setStorageItem(key, value);
      expect(await getStorageItem(key)).toBe(value);

      await removeStorageItem(key);
      expect(await getStorageItem(key)).toBeNull();
      expect(removeItemSpy).toHaveBeenCalledWith(key);
    });

    it('should handle removing non-existent keys gracefully', async () => {
      await removeStorageItem('non-existent');
      expect(removeItemSpy).toHaveBeenCalledWith('non-existent');
    });
  });
});

describe('storage.ts - Typed Storage Helpers', () => {
  let mockLocalStorage: { [key: string]: string };
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeEach(() => {
    mockLocalStorage = {};
    
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return mockLocalStorage[key] || null;
    });
    
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('Language storage', () => {
    it('should save and retrieve language preference', async () => {
      await saveLanguage('en' as Language);
      const language = await getLanguage();
      expect(language).toBe('en');
    });

    it('should save and retrieve German language', async () => {
      await saveLanguage('de' as Language);
      const language = await getLanguage();
      expect(language).toBe('de');
    });

    it('should return null if no language is stored', async () => {
      const language = await getLanguage();
      expect(language).toBeNull();
    });

    it('should return null for invalid language values', async () => {
      mockLocalStorage['app-language'] = 'fr';
      const language = await getLanguage();
      expect(language).toBeNull();
    });
  });

  describe('Theme storage', () => {
    it('should save and retrieve light theme', async () => {
      await saveTheme('light' as ThemeMode);
      const theme = await getTheme();
      expect(theme).toBe('light');
    });

    it('should save and retrieve dark theme', async () => {
      await saveTheme('dark' as ThemeMode);
      const theme = await getTheme();
      expect(theme).toBe('dark');
    });

    it('should save and retrieve system theme', async () => {
      await saveTheme('system' as ThemeMode);
      const theme = await getTheme();
      expect(theme).toBe('system');
    });

    it('should return null if no theme is stored', async () => {
      const theme = await getTheme();
      expect(theme).toBeNull();
    });

    it('should return null for invalid theme values', async () => {
      mockLocalStorage['app-theme'] = 'invalid';
      const theme = await getTheme();
      expect(theme).toBeNull();
    });
  });

  describe('Operations storage', () => {
    it('should save and retrieve single operation', async () => {
      await saveOperations([Operation.MULTIPLICATION]);
      const operations = await getOperations();
      expect(operations).toEqual([Operation.MULTIPLICATION]);
    });

    it('should save and retrieve multiple operations', async () => {
      const ops = [Operation.ADDITION, Operation.MULTIPLICATION];
      await saveOperations(ops);
      const operations = await getOperations();
      expect(operations).toEqual(ops);
    });

    it('should save and retrieve all operations', async () => {
      const ops = [Operation.ADDITION, Operation.SUBTRACTION, Operation.MULTIPLICATION];
      await saveOperations(ops);
      const operations = await getOperations();
      expect(operations).toEqual(ops);
    });

    it('should return default (MULTIPLICATION) if no operations stored', async () => {
      const operations = await getOperations();
      expect(operations).toEqual([Operation.MULTIPLICATION]);
    });

    it('should migrate from old single-operation storage', async () => {
      // Simulate old storage format
      mockLocalStorage['app-operation'] = Operation.ADDITION;
      
      const operations = await getOperations();
      expect(operations).toEqual([Operation.ADDITION]);
      
      // Verify migration saved new format
      expect(mockLocalStorage['app-operations']).toBe(JSON.stringify([Operation.ADDITION]));
    });

    it('should handle corrupted JSON gracefully', async () => {
      mockLocalStorage['app-operations'] = '{invalid json}';
      const operations = await getOperations();
      expect(operations).toEqual([Operation.MULTIPLICATION]);
    });

    it('should validate operation values', async () => {
      mockLocalStorage['app-operations'] = JSON.stringify(['INVALID_OP']);
      const operations = await getOperations();
      expect(operations).toEqual([Operation.MULTIPLICATION]);
    });
  });

  describe('Legacy operation storage', () => {
    it('should save single operation (legacy)', async () => {
      await saveOperation(Operation.ADDITION);
      const operation = await getOperation();
      expect(operation).toBe(Operation.ADDITION);
    });

    it('should retrieve legacy operation', async () => {
      mockLocalStorage['app-operation'] = Operation.SUBTRACTION;
      const operation = await getOperation();
      expect(operation).toBe(Operation.SUBTRACTION);
    });

    it('should return null if no legacy operation stored', async () => {
      const operation = await getOperation();
      expect(operation).toBeNull();
    });
  });

  describe('Total tasks storage', () => {
    it('should save and retrieve total tasks', async () => {
      await saveTotalTasks(42);
      const total = await getTotalTasks();
      expect(total).toBe(42);
    });

    it('should handle zero tasks', async () => {
      await saveTotalTasks(0);
      const total = await getTotalTasks();
      expect(total).toBe(0);
    });

    it('should handle large numbers', async () => {
      await saveTotalTasks(99999);
      const total = await getTotalTasks();
      expect(total).toBe(99999);
    });

    it('should return null if no total tasks stored', async () => {
      const total = await getTotalTasks();
      expect(total).toBeNull();
    });

    it('should return null for invalid number values', async () => {
      mockLocalStorage['app-total-tasks'] = 'not-a-number';
      const total = await getTotalTasks();
      expect(total).toBeNull();
    });
  });

  describe('Number range storage', () => {
    it('should save and retrieve RANGE_10', async () => {
      await saveNumberRange(NumberRange.RANGE_10);
      const range = await getNumberRange();
      expect(range).toBe(NumberRange.RANGE_10);
    });

    it('should save and retrieve RANGE_20', async () => {
      await saveNumberRange(NumberRange.RANGE_20);
      const range = await getNumberRange();
      expect(range).toBe(NumberRange.RANGE_20);
    });

    it('should save and retrieve RANGE_50', async () => {
      await saveNumberRange(NumberRange.RANGE_50);
      const range = await getNumberRange();
      expect(range).toBe(NumberRange.RANGE_50);
    });

    it('should save and retrieve RANGE_100', async () => {
      await saveNumberRange(NumberRange.RANGE_100);
      const range = await getNumberRange();
      expect(range).toBe(NumberRange.RANGE_100);
    });

    it('should return default RANGE_100 if no range stored', async () => {
      const range = await getNumberRange();
      expect(range).toBe(NumberRange.RANGE_100);
    });

    it('should return default RANGE_100 for invalid range values', async () => {
      mockLocalStorage['app-number-range'] = 'INVALID';
      const range = await getNumberRange();
      expect(range).toBe(NumberRange.RANGE_100);
    });

    it('should migrate old SMALL to RANGE_10', async () => {
      mockLocalStorage['app-number-range'] = 'SMALL';
      const range = await getNumberRange();
      expect(range).toBe(NumberRange.RANGE_10);
    });

    it('should migrate old MEDIUM to RANGE_20', async () => {
      mockLocalStorage['app-number-range'] = 'MEDIUM';
      const range = await getNumberRange();
      expect(range).toBe(NumberRange.RANGE_20);
    });

    it('should migrate old LARGE to RANGE_100', async () => {
      mockLocalStorage['app-number-range'] = 'LARGE';
      const range = await getNumberRange();
      expect(range).toBe(NumberRange.RANGE_100);
    });
  });
});

describe('storage.ts - Error Handling', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;
  let removeItemSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock localStorage to throw errors
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should handle getStorageItem errors gracefully', async () => {
    const result = await getStorageItem('test');
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle setStorageItem errors gracefully', async () => {
    await expect(setStorageItem('test', 'value')).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle removeStorageItem errors gracefully', async () => {
    await expect(removeStorageItem('test')).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});

describe('Challenge High Score Storage', () => {
  let mockStore: { [key: string]: string };

  beforeEach(() => {
    mockStore = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return mockStore[key] || null;
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      mockStore[key] = value;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should save and retrieve challenge high score', async () => {
    await saveChallengeHighScore(42);
    const result = await getChallengeHighScore();
    expect(result).toBe(42);
  });

  it('should return 0 when no high score is saved', async () => {
    const result = await getChallengeHighScore();
    expect(result).toBe(0);
  });

  it('should return 0 for invalid stored value', async () => {
    mockStore['app-challenge-highscore'] = 'invalid';
    const result = await getChallengeHighScore();
    expect(result).toBe(0);
  });

  it('should overwrite previous high score', async () => {
    await saveChallengeHighScore(10);
    await saveChallengeHighScore(25);
    const result = await getChallengeHighScore();
    expect(result).toBe(25);
  });
});
