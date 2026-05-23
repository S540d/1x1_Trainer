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
  saveSessionRecord,
  getSessionRecords,
  getStreakData,
  saveStreakData,
  updateStreakAfterSession,
  getLocalDateString,
} from './storage';
import { Operation, ThemeMode, Language, NumberRange, DifficultyMode, SessionRecord, StreakData } from '../types/game';

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

describe('Session Records Storage', () => {
  let mockStore: { [key: string]: string };

  const makeRecord = (overrides: Partial<SessionRecord> = {}): SessionRecord => ({
    id: 'test-id',
    timestamp: Date.now(),
    operations: [Operation.MULTIPLICATION],
    totalTasks: 10,
    correctTasks: 8,
    errors: 2,
    errorRate: 0.2,
    difficultyMode: DifficultyMode.SIMPLE,
    numberRange: NumberRange.RANGE_10,
    ...overrides,
  });

  beforeEach(() => {
    mockStore = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockStore[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => { mockStore[key] = value; });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return empty array when no records stored', async () => {
    const result = await getSessionRecords();
    expect(result).toEqual([]);
  });

  it('should save and retrieve a session record', async () => {
    const record = makeRecord({ id: 'abc' });
    await saveSessionRecord(record);
    const result = await getSessionRecords();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('abc');
    expect(result[0].correctTasks).toBe(8);
    expect(result[0].errorRate).toBe(0.2);
  });

  it('should accumulate multiple records', async () => {
    await saveSessionRecord(makeRecord({ id: 'r1' }));
    await saveSessionRecord(makeRecord({ id: 'r2' }));
    const result = await getSessionRecords();
    expect(result).toHaveLength(2);
  });

  it('should prune records older than 28 days', async () => {
    const old = makeRecord({ id: 'old', timestamp: Date.now() - 29 * 24 * 60 * 60 * 1000 });
    const fresh = makeRecord({ id: 'fresh', timestamp: Date.now() });
    mockStore['app-parent-stats'] = JSON.stringify([old, fresh]);
    const result = await getSessionRecords();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fresh');
  });

  it('should filter out malformed entries missing operations', async () => {
    const bad = { id: 'bad', timestamp: Date.now(), totalTasks: 10 };
    const good = makeRecord({ id: 'good' });
    mockStore['app-parent-stats'] = JSON.stringify([bad, good]);
    const result = await getSessionRecords();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('good');
  });

  it('should return empty array for corrupted JSON', async () => {
    mockStore['app-parent-stats'] = '{not valid json}';
    const result = await getSessionRecords();
    expect(result).toEqual([]);
  });

  it('should return empty array when stored value is not an array', async () => {
    mockStore['app-parent-stats'] = '{"id":"x"}';
    const result = await getSessionRecords();
    expect(result).toEqual([]);
  });

  it('should correctly compute error rate in saved record', async () => {
    const record = makeRecord({ totalTasks: 10, correctTasks: 7, errors: 3, errorRate: 0.3 });
    await saveSessionRecord(record);
    const [retrieved] = await getSessionRecords();
    expect(retrieved.errorRate).toBe(0.3);
    expect(retrieved.errors).toBe(3);
  });
});

describe('getLocalDateString()', () => {
  it('should return YYYY-MM-DD format for today', () => {
    const result = getLocalDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return YYYY-MM-DD for a given date', () => {
    const d = new Date(2024, 0, 5); // Jan 5, 2024
    expect(getLocalDateString(d)).toBe('2024-01-05');
  });

  it('should pad month and day with leading zeros', () => {
    const d = new Date(2024, 2, 9); // Mar 9, 2024
    expect(getLocalDateString(d)).toBe('2024-03-09');
  });
});

describe('Streak Storage', () => {
  let mockStore: { [key: string]: string };

  beforeEach(() => {
    mockStore = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockStore[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => { mockStore[key] = value; });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return default streak when nothing is stored', async () => {
    const result = await getStreakData();
    expect(result).toEqual({ currentStreak: 0, lastPlayedDate: '', longestStreak: 0 });
  });

  it('should save and retrieve streak data', async () => {
    const data: StreakData = { currentStreak: 5, lastPlayedDate: '2024-01-10', longestStreak: 7 };
    await saveStreakData(data);
    const result = await getStreakData();
    expect(result).toEqual(data);
  });

  it('should return default for corrupted streak data', async () => {
    mockStore['app-streak'] = '{invalid json}';
    const result = await getStreakData();
    expect(result).toEqual({ currentStreak: 0, lastPlayedDate: '', longestStreak: 0 });
  });

  it('should return default for streak data with wrong types', async () => {
    mockStore['app-streak'] = JSON.stringify({ currentStreak: 'five', lastPlayedDate: 123, longestStreak: null });
    const result = await getStreakData();
    expect(result).toEqual({ currentStreak: 0, lastPlayedDate: '', longestStreak: 0 });
  });

  it('should return default for NaN streak values', async () => {
    mockStore['app-streak'] = JSON.stringify({ currentStreak: NaN, lastPlayedDate: '2024-01-10', longestStreak: 5 });
    const result = await getStreakData();
    expect(result).toEqual({ currentStreak: 0, lastPlayedDate: '', longestStreak: 0 });
  });

  it('should return default for negative streak values', async () => {
    mockStore['app-streak'] = JSON.stringify({ currentStreak: -1, lastPlayedDate: '2024-01-10', longestStreak: 5 });
    const result = await getStreakData();
    expect(result).toEqual({ currentStreak: 0, lastPlayedDate: '', longestStreak: 0 });
  });

  it('should return default for invalid date format', async () => {
    mockStore['app-streak'] = JSON.stringify({ currentStreak: 3, lastPlayedDate: '2024/01/10', longestStreak: 3 });
    const result = await getStreakData();
    expect(result).toEqual({ currentStreak: 0, lastPlayedDate: '', longestStreak: 0 });
  });

  it('should return default for Infinity streak', async () => {
    mockStore['app-streak'] = JSON.stringify({ currentStreak: Infinity, lastPlayedDate: '2024-01-10', longestStreak: 5 });
    const result = await getStreakData();
    expect(result).toEqual({ currentStreak: 0, lastPlayedDate: '', longestStreak: 0 });
  });
});

describe('updateStreakAfterSession()', () => {
  let mockStore: { [key: string]: string };

  beforeEach(() => {
    mockStore = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockStore[key] || null);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => { mockStore[key] = value; });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should start streak at 1 for first session', async () => {
    const result = await updateStreakAfterSession();
    expect(result.currentStreak).toBe(1);
    expect(result.lastPlayedDate).toBe(getLocalDateString());
    expect(result.longestStreak).toBe(1);
  });

  it('should not change streak when already played today', async () => {
    const today = getLocalDateString();
    mockStore['app-streak'] = JSON.stringify({ currentStreak: 3, lastPlayedDate: today, longestStreak: 5 });
    const result = await updateStreakAfterSession();
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(5);
  });

  it('should increment streak for consecutive day', async () => {
    jest.useFakeTimers();
    const today = new Date(2024, 5, 15); // Jun 15
    jest.setSystemTime(today);

    const yesterday = new Date(2024, 5, 14);
    mockStore['app-streak'] = JSON.stringify({
      currentStreak: 4,
      lastPlayedDate: getLocalDateString(yesterday),
      longestStreak: 4,
    });

    const result = await updateStreakAfterSession();
    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(5);
    expect(result.lastPlayedDate).toBe('2024-06-15');
  });

  it('should reset streak to 1 after a gap', async () => {
    jest.useFakeTimers();
    const today = new Date(2024, 5, 15);
    jest.setSystemTime(today);

    const twoDaysAgo = new Date(2024, 5, 13);
    mockStore['app-streak'] = JSON.stringify({
      currentStreak: 10,
      lastPlayedDate: getLocalDateString(twoDaysAgo),
      longestStreak: 10,
    });

    const result = await updateStreakAfterSession();
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(10); // longestStreak preserved
    expect(result.lastPlayedDate).toBe('2024-06-15');
  });

  it('should update longestStreak when new streak exceeds it', async () => {
    jest.useFakeTimers();
    const today = new Date(2024, 5, 15);
    jest.setSystemTime(today);

    const yesterday = new Date(2024, 5, 14);
    mockStore['app-streak'] = JSON.stringify({
      currentStreak: 7,
      lastPlayedDate: getLocalDateString(yesterday),
      longestStreak: 7,
    });

    const result = await updateStreakAfterSession();
    expect(result.currentStreak).toBe(8);
    expect(result.longestStreak).toBe(8);
  });

  it('should not decrease longestStreak after reset', async () => {
    jest.useFakeTimers();
    const today = new Date(2024, 5, 15);
    jest.setSystemTime(today);

    const threeDaysAgo = new Date(2024, 5, 12);
    mockStore['app-streak'] = JSON.stringify({
      currentStreak: 3,
      lastPlayedDate: getLocalDateString(threeDaysAgo),
      longestStreak: 15,
    });

    const result = await updateStreakAfterSession();
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(15);
  });
});
