/**
 * Cross-platform storage utilities for 1x1 Trainer
 * Handles localStorage (Web) and AsyncStorage (Mobile)
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, AVATAR_COLORS } from './constants';
import {
  ThemeMode,
  ThemeName,
  Language,
  Operation,
  NumberRange,
  DifficultyMode,
  SessionRecord,
  TaskStat,
  StreakData,
  ChildProfile,
} from '../types/game';

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

// ============================================================================
// Profile management
// ============================================================================

function generateId(): string {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export function profileKey(baseKey: string, profileId: string): string {
  return `${baseKey}-${profileId}`;
}

function resolveKey(baseKey: string, profileId?: string): string {
  return profileId ? profileKey(baseKey, profileId) : baseKey;
}

export const getProfiles = async (): Promise<ChildProfile[]> => {
  const value = await getStorageItem(STORAGE_KEYS.PROFILES);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as ChildProfile[];
  } catch {
    /* ignore */
  }
  return [];
};

export const saveProfiles = async (profiles: ChildProfile[]): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
};

export const getActiveProfileId = async (): Promise<string | null> => {
  return getStorageItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
};

export const setActiveProfileId = async (id: string): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
};

export const createProfile = async (name: string, avatarColor: string): Promise<ChildProfile> => {
  const profile: ChildProfile = {
    id: generateId(),
    name: name.trim(),
    avatarColor,
    createdAt: new Date().toISOString(),
  };
  const profiles = await getProfiles();
  profiles.push(profile);
  await saveProfiles(profiles);
  return profile;
};

export const deleteProfileData = async (profileId: string): Promise<void> => {
  const keysToDelete = [
    STORAGE_KEYS.STREAK,
    STORAGE_KEYS.TASK_STATS,
    STORAGE_KEYS.PARENT_STATS,
    STORAGE_KEYS.BADGES,
    STORAGE_KEYS.TOTAL_TASKS,
    STORAGE_KEYS.CHALLENGE_HIGHSCORE,
    STORAGE_KEYS.OPERATIONS,
    STORAGE_KEYS.NUMBER_RANGE,
  ];
  await Promise.all(keysToDelete.map((k) => removeStorageItem(profileKey(k, profileId))));
};

// Run once on first launch with profiles: copies existing global data into a default profile.
export const migrateToProfiles = async (): Promise<ChildProfile> => {
  const existing = await getProfiles();
  if (existing.length > 0) return existing[0];

  const defaultProfile: ChildProfile = {
    id: generateId(),
    name: 'Kind 1',
    avatarColor: AVATAR_COLORS[0],
    createdAt: new Date().toISOString(),
  };

  // Copy all per-profile global keys to profile-keyed keys
  const keysToCopy = [
    STORAGE_KEYS.STREAK,
    STORAGE_KEYS.TASK_STATS,
    STORAGE_KEYS.PARENT_STATS,
    STORAGE_KEYS.BADGES,
    STORAGE_KEYS.TOTAL_TASKS,
    STORAGE_KEYS.CHALLENGE_HIGHSCORE,
    STORAGE_KEYS.OPERATIONS,
    STORAGE_KEYS.NUMBER_RANGE,
  ];
  await Promise.all(
    keysToCopy.map(async (k) => {
      const value = await getStorageItem(k);
      if (value !== null) {
        await setStorageItem(profileKey(k, defaultProfile.id), value);
      }
    })
  );

  await saveProfiles([defaultProfile]);
  await setActiveProfileId(defaultProfile.id);
  return defaultProfile;
};

// ============================================================================
// Typed storage helpers
// ============================================================================

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

export const saveThemeName = async (themeName: ThemeName): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.THEME_NAME, themeName);
};

export const getThemeName = async (): Promise<ThemeName | null> => {
  const value = await getStorageItem(STORAGE_KEYS.THEME_NAME);
  if (
    value === 'sunset' ||
    value === 'ocean' ||
    value === 'space' ||
    value === 'forest' ||
    value === 'candy'
  ) {
    return value;
  }
  return null;
};

export const saveOperations = async (
  operations: Operation[],
  profileId?: string
): Promise<void> => {
  await setStorageItem(resolveKey(STORAGE_KEYS.OPERATIONS, profileId), JSON.stringify(operations));
};

export const getOperations = async (profileId?: string): Promise<Operation[]> => {
  const key = resolveKey(STORAGE_KEYS.OPERATIONS, profileId);
  const value = await getStorageItem(key);
  if (value) {
    try {
      const parsed = JSON.parse(value);
      if (
        Array.isArray(parsed) &&
        parsed.every((op) => ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION'].includes(op))
      ) {
        return parsed as Operation[];
      }
    } catch {
      // Fall through to migration logic
    }
  }

  // Migration: try old single-operation storage (global key only)
  if (!profileId) {
    const oldValue = await getStorageItem(STORAGE_KEYS.OPERATION);
    if (oldValue === 'ADDITION' || oldValue === 'SUBTRACTION' || oldValue === 'MULTIPLICATION') {
      const migratedOps = [oldValue as Operation];
      await saveOperations(migratedOps);
      return migratedOps;
    }
  }

  // Default: multiplication only
  return [Operation.MULTIPLICATION];
};

// Legacy function for backward compatibility
export const saveOperation = async (operation: Operation): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.OPERATION, operation);
};

export const getOperation = async (): Promise<Operation | null> => {
  const value = await getStorageItem(STORAGE_KEYS.OPERATION);
  if (value === 'ADDITION' || value === 'SUBTRACTION' || value === 'MULTIPLICATION') {
    return value as Operation;
  }
  return null;
};

export const saveTotalTasks = async (total: number, profileId?: string): Promise<void> => {
  await setStorageItem(resolveKey(STORAGE_KEYS.TOTAL_TASKS, profileId), total.toString());
};

export const getTotalTasks = async (profileId?: string): Promise<number | null> => {
  const value = await getStorageItem(resolveKey(STORAGE_KEYS.TOTAL_TASKS, profileId));
  if (value) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

export const saveChallengeHighScore = async (score: number, profileId?: string): Promise<void> => {
  await setStorageItem(resolveKey(STORAGE_KEYS.CHALLENGE_HIGHSCORE, profileId), score.toString());
};

export const getChallengeHighScore = async (profileId?: string): Promise<number> => {
  const value = await getStorageItem(resolveKey(STORAGE_KEYS.CHALLENGE_HIGHSCORE, profileId));
  if (value) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;

const VALID_OPERATIONS = new Set<string>(Object.values(Operation));
const VALID_DIFFICULTY_MODES = new Set<string>(Object.values(DifficultyMode));
const VALID_NUMBER_RANGES = new Set<string>(Object.values(NumberRange));

function isValidSessionRecord(r: unknown): r is SessionRecord {
  if (!r || typeof r !== 'object') return false;
  const obj = r as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.timestamp === 'number' &&
    Array.isArray(obj.operations) &&
    obj.operations.every((op: unknown) => typeof op === 'string' && VALID_OPERATIONS.has(op)) &&
    typeof obj.totalTasks === 'number' &&
    typeof obj.correctTasks === 'number' &&
    typeof obj.errors === 'number' &&
    typeof obj.errorRate === 'number' &&
    typeof obj.difficultyMode === 'string' &&
    VALID_DIFFICULTY_MODES.has(obj.difficultyMode) &&
    typeof obj.numberRange === 'string' &&
    VALID_NUMBER_RANGES.has(obj.numberRange)
  );
}

function pruneOldRecords(records: SessionRecord[], now: number): SessionRecord[] {
  return records.filter((r) => now - r.timestamp < FOUR_WEEKS_MS);
}

export const getSessionRecords = async (profileId?: string): Promise<SessionRecord[]> => {
  const key = resolveKey(STORAGE_KEYS.PARENT_STATS, profileId);
  const value = await getStorageItem(key);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.filter(isValidSessionRecord);
    const pruned = pruneOldRecords(valid, Date.now());
    if (pruned.length < valid.length) {
      await setStorageItem(key, JSON.stringify(pruned));
    }
    return pruned;
  } catch {
    return [];
  }
};

export const saveSessionRecord = async (
  record: SessionRecord,
  profileId?: string
): Promise<void> => {
  const records = await getSessionRecords(profileId);
  records.push(record);
  await setStorageItem(resolveKey(STORAGE_KEYS.PARENT_STATS, profileId), JSON.stringify(records));
};

// Returns true when onboarding is done (value = 'true').
// Returns false for null (never seen) or 'pending' (explicitly reset).
export const getOnboardingDone = async (): Promise<boolean> => {
  const value = await getStorageItem(STORAGE_KEYS.ONBOARDING_DONE);
  return value === 'true';
};

export const setOnboardingDone = async (): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
};

export const resetOnboarding = async (): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.ONBOARDING_DONE, 'pending');
};

function isValidTaskStat(r: unknown): r is TaskStat {
  if (!r || typeof r !== 'object') return false;
  const obj = r as Record<string, unknown>;
  return (
    typeof obj.num1 === 'number' &&
    typeof obj.num2 === 'number' &&
    typeof obj.operation === 'string' &&
    VALID_OPERATIONS.has(obj.operation) &&
    typeof obj.correctCount === 'number' &&
    typeof obj.errorCount === 'number' &&
    typeof obj.lastSeen === 'string'
  );
}

export const getTaskStats = async (profileId?: string): Promise<TaskStat[]> => {
  const value = await getStorageItem(resolveKey(STORAGE_KEYS.TASK_STATS, profileId));
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTaskStat);
  } catch {
    return [];
  }
};

export const saveTaskStats = async (stats: TaskStat[], profileId?: string): Promise<void> => {
  await setStorageItem(resolveKey(STORAGE_KEYS.TASK_STATS, profileId), JSON.stringify(stats));
};

let taskStatsQueue: Promise<void> = Promise.resolve();

export const recordTaskResult = async (
  num1: number,
  num2: number,
  operation: Operation,
  isCorrect: boolean,
  profileId?: string
): Promise<void> => {
  taskStatsQueue = taskStatsQueue.then(async () => {
    const stats = await getTaskStats(profileId);
    const existing = stats.find(
      (s) => s.num1 === num1 && s.num2 === num2 && s.operation === operation
    );
    if (existing) {
      if (isCorrect) existing.correctCount++;
      else existing.errorCount++;
      existing.lastSeen = new Date().toISOString();
    } else {
      stats.push({
        num1,
        num2,
        operation,
        correctCount: isCorrect ? 1 : 0,
        errorCount: isCorrect ? 0 : 1,
        lastSeen: new Date().toISOString(),
      });
    }
    await saveTaskStats(stats, profileId);
  });
  return taskStatsQueue;
};

export const getWeakTasks = (
  stats: TaskStat[],
  minAttempts = 3,
  minErrorRate = 0.3
): TaskStat[] => {
  return stats
    .filter((s) => {
      const total = s.correctCount + s.errorCount;
      const rate = total > 0 ? s.errorCount / total : 0;
      return total >= minAttempts && rate > minErrorRate;
    })
    .sort((a, b) => {
      const rateA = a.errorCount / (a.correctCount + a.errorCount);
      const rateB = b.errorCount / (b.correctCount + b.errorCount);
      return rateB - rateA;
    });
};

// Badge storage – maps badgeId → unlock timestamp
export type BadgeStore = Record<string, number>;

export const getBadges = async (profileId?: string): Promise<BadgeStore> => {
  const value = await getStorageItem(resolveKey(STORAGE_KEYS.BADGES, profileId));
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const validated: BadgeStore = {};
      for (const [key, val] of Object.entries(parsed)) {
        if (typeof val === 'number' && Number.isFinite(val)) {
          validated[key] = val;
        }
      }
      return validated;
    }
  } catch {
    /* ignore */
  }
  return {};
};

export const saveBadges = async (badges: BadgeStore, profileId?: string): Promise<void> => {
  await setStorageItem(resolveKey(STORAGE_KEYS.BADGES, profileId), JSON.stringify(badges));
};

// Streak storage helpers

export function getLocalDateString(date?: Date): string {
  const d = date ?? new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

const STREAK_DEFAULT: StreakData = { currentStreak: 0, lastPlayedDate: '', longestStreak: 0 };

function isNonNegInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && Number.isInteger(v);
}

function isLocalDateString(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export const getStreakData = async (profileId?: string): Promise<StreakData> => {
  const value = await getStorageItem(resolveKey(STORAGE_KEYS.STREAK, profileId));
  if (!value) return STREAK_DEFAULT;
  try {
    const parsed = JSON.parse(value);
    if (
      isNonNegInt(parsed.currentStreak) &&
      isLocalDateString(parsed.lastPlayedDate) &&
      isNonNegInt(parsed.longestStreak)
    ) {
      const data = parsed as StreakData;
      // A streak is only alive if the last play was today or yesterday.
      // Report 0 for older dates so the UI never shows an already-broken
      // streak (#255); longestStreak is preserved and the stored record is
      // normalized on the next session via updateStreakAfterSession.
      if (
        data.lastPlayedDate === getLocalDateString() ||
        data.lastPlayedDate === getYesterdayDateString()
      ) {
        return data;
      }
      return { ...data, currentStreak: 0 };
    }
  } catch {
    // fall through
  }
  return STREAK_DEFAULT;
};

export const saveStreakData = async (data: StreakData, profileId?: string): Promise<void> => {
  await setStorageItem(resolveKey(STORAGE_KEYS.STREAK, profileId), JSON.stringify(data));
};

export const updateStreakAfterSession = async (profileId?: string): Promise<StreakData> => {
  const today = getLocalDateString();
  const data = await getStreakData(profileId);

  if (data.lastPlayedDate === today) {
    return data;
  }

  const newStreak = data.lastPlayedDate === getYesterdayDateString() ? data.currentStreak + 1 : 1;

  const updated: StreakData = {
    currentStreak: newStreak,
    lastPlayedDate: today,
    longestStreak: Math.max(newStreak, data.longestStreak),
  };

  await saveStreakData(updated, profileId);
  return updated;
};

export const saveNumberRange = async (range: NumberRange, profileId?: string): Promise<void> => {
  await setStorageItem(resolveKey(STORAGE_KEYS.NUMBER_RANGE, profileId), range);
};

export const getNumberRange = async (profileId?: string): Promise<NumberRange> => {
  const key = resolveKey(STORAGE_KEYS.NUMBER_RANGE, profileId);
  const value = await getStorageItem(key);

  // Handle new format
  if (
    value === 'RANGE_10' ||
    value === 'RANGE_20' ||
    value === 'RANGE_50' ||
    value === 'RANGE_100'
  ) {
    return value as NumberRange;
  }

  // Migration: handle old format (global key only)
  if (!profileId) {
    if (value === 'SMALL') {
      const migratedValue = NumberRange.RANGE_10;
      await saveNumberRange(migratedValue);
      return migratedValue;
    }
    if (value === 'MEDIUM') {
      const migratedValue = NumberRange.RANGE_20;
      await saveNumberRange(migratedValue);
      return migratedValue;
    }
    if (value === 'LARGE') {
      const migratedValue = NumberRange.RANGE_100;
      await saveNumberRange(migratedValue);
      return migratedValue;
    }
  }

  // Default: 1-100 for existing users
  return NumberRange.RANGE_100;
};

export const saveSoundsEnabled = async (enabled: boolean): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.SOUNDS_ENABLED, enabled ? 'true' : 'false');
};

export const getSoundsEnabled = async (): Promise<boolean | null> => {
  const value = await getStorageItem(STORAGE_KEYS.SOUNDS_ENABLED);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

export const saveSoundsVolume = async (volume: number): Promise<void> => {
  await setStorageItem(STORAGE_KEYS.SOUNDS_VOLUME, String(volume));
};

export const getSoundsVolume = async (): Promise<number | null> => {
  const value = await getStorageItem(STORAGE_KEYS.SOUNDS_VOLUME);
  if (value === null) return null;
  const n = Number(value);
  if (!Number.isNaN(n) && n >= 0 && n <= 100) return n;
  return null;
};
