/**
 * useBadges Hook
 * Manages achievement badge state, persistence, and unlock logic.
 */

import { useState, useEffect, useCallback } from 'react';
import { SessionRecord, Operation, DifficultyMode, NumberRange } from '../types/game';
import {
  getBadges,
  saveBadges,
  getSessionRecords,
  getChallengeHighScore,
  getStreakData,
  saveStreakData,
  BadgeStore,
  StreakData,
} from '../utils/storage';
import { getChallengeLevelNumber } from '../utils/constants';

// --- pure badge-condition logic (exported for unit tests) ---

export function getStreakDays(records: SessionRecord[]): number {
  if (records.length === 0) return 0;

  const uniqueDays = new Set<string>();
  for (const r of records) {
    const d = new Date(r.timestamp);
    uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (!uniqueDays.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function countPerfectSessions(records: SessionRecord[]): number {
  return records.filter(
    r =>
      r.difficultyMode !== DifficultyMode.CHALLENGE &&
      r.totalTasks >= 10 &&
      r.correctTasks === r.totalTasks,
  ).length;
}

export function hasAllOperationsPerfect(records: SessionRecord[]): boolean {
  const ops: Operation[] = [
    Operation.ADDITION,
    Operation.SUBTRACTION,
    Operation.MULTIPLICATION,
    Operation.DIVISION,
  ];
  return ops.every(op =>
    records.some(
      r =>
        r.difficultyMode !== DifficultyMode.CHALLENGE &&
        r.totalTasks >= 10 &&
        r.correctTasks === r.totalTasks &&
        r.operations.includes(op),
    ),
  );
}

// streakDays is optional: if provided it overrides the in-records computation,
// allowing the persistent streak counter to bypass the 28-day session record prune limit.
export function computeNewlyUnlocked(
  record: SessionRecord,
  allRecords: SessionRecord[],
  challengeHighScore: number,
  existing: BadgeStore,
  streakDays?: number,
): string[] {
  const result: string[] = [];
  const unlock = (id: string) => {
    if (!existing[id]) result.push(id);
  };

  const streak = streakDays ?? getStreakDays(allRecords);
  if (streak >= 3)  unlock('streak_3');
  if (streak >= 7)  unlock('streak_7');
  if (streak >= 30) unlock('streak_30');

  const perfects = countPerfectSessions(allRecords);
  if (perfects >= 1) unlock('perfect_1');
  if (perfects >= 5) unlock('perfect_5');
  if (hasAllOperationsPerfect(allRecords)) unlock('all_operations');

  const levelNum = getChallengeLevelNumber(challengeHighScore);
  if (levelNum >= 3) unlock('challenge_level_3');
  if (levelNum >= 6) unlock('challenge_level_6');
  if (record.difficultyMode === DifficultyMode.CHALLENGE && record.errors === 0) {
    unlock('challenge_no_errors');
  }

  if (record.numberRange === NumberRange.RANGE_100) unlock('range_100');
  if (record.difficultyMode === DifficultyMode.CREATIVE) unlock('creative_mode');

  return result;
}

function todayISODate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

function yesterdayISODate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

export function advanceStreak(current: StreakData): StreakData {
  const today = todayISODate();
  if (current.lastPlayedDay === today) return current;
  if (current.lastPlayedDay === yesterdayISODate()) {
    return { currentStreak: current.currentStreak + 1, lastPlayedDay: today };
  }
  return { currentStreak: 1, lastPlayedDay: today };
}

// --- hook ---

export function useBadges() {
  const [badges, setBadges] = useState<BadgeStore>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  useEffect(() => {
    getBadges().then(b => {
      setBadges(b);
      setIsLoaded(true);
    });
  }, []);

  const checkAndUnlock = useCallback(async (record: SessionRecord) => {
    const [existing, allRecords, challengeHighScore, streakData] = await Promise.all([
      getBadges(),
      getSessionRecords(),
      getChallengeHighScore(),
      getStreakData(),
    ]);

    const updatedStreak = advanceStreak(streakData);
    await saveStreakData(updatedStreak);

    const newIds = computeNewlyUnlocked(
      record,
      allRecords,
      challengeHighScore,
      existing,
      updatedStreak.currentStreak,
    );
    if (newIds.length === 0) return;

    const now = Date.now();
    const updated: BadgeStore = { ...existing };
    for (const id of newIds) {
      updated[id] = now;
    }
    await saveBadges(updated);
    setBadges(updated);
    setNewlyUnlocked(newIds);
  }, []);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  return { badges, isLoaded, newlyUnlocked, checkAndUnlock, clearNewlyUnlocked };
}
