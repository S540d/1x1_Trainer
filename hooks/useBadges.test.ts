import {
  getStreakDays,
  countPerfectSessions,
  hasAllOperationsPerfect,
  computeNewlyUnlocked,
  advanceStreak,
} from './useBadges';
import { DifficultyMode, NumberRange, Operation } from '../types/game';
import type { SessionRecord } from '../types/game';
import type { BadgeStore } from '../utils/storage';

function makeRecord(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: Math.random().toString(),
    timestamp: Date.now(),
    operations: [Operation.MULTIPLICATION],
    totalTasks: 10,
    correctTasks: 10,
    errors: 0,
    errorRate: 0,
    difficultyMode: DifficultyMode.SIMPLE,
    numberRange: NumberRange.RANGE_10,
    ...overrides,
  };
}

function daysAgo(n: number): number {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d.getTime();
}

describe('getStreakDays', () => {
  it('returns 0 for empty records', () => {
    expect(getStreakDays([])).toBe(0);
  });

  it('returns 1 when only today has a session', () => {
    const records = [makeRecord({ timestamp: daysAgo(0) })];
    expect(getStreakDays(records)).toBe(1);
  });

  it('counts consecutive days ending today', () => {
    const records = [
      makeRecord({ timestamp: daysAgo(0) }),
      makeRecord({ timestamp: daysAgo(1) }),
      makeRecord({ timestamp: daysAgo(2) }),
    ];
    expect(getStreakDays(records)).toBe(3);
  });

  it('breaks streak when a day is missing', () => {
    const records = [
      makeRecord({ timestamp: daysAgo(0) }),
      // day 1 missing
      makeRecord({ timestamp: daysAgo(2) }),
    ];
    expect(getStreakDays(records)).toBe(1);
  });

  it('returns 0 when most recent session was yesterday only', () => {
    const records = [makeRecord({ timestamp: daysAgo(1) })];
    expect(getStreakDays(records)).toBe(0);
  });
});

describe('countPerfectSessions', () => {
  it('counts sessions where correctTasks === totalTasks in non-challenge mode', () => {
    const records = [
      makeRecord({ correctTasks: 10, totalTasks: 10 }),
      makeRecord({ correctTasks: 8, totalTasks: 10 }),
      makeRecord({ correctTasks: 10, totalTasks: 10 }),
    ];
    expect(countPerfectSessions(records)).toBe(2);
  });

  it('excludes challenge sessions', () => {
    const records = [
      makeRecord({ correctTasks: 10, totalTasks: 10, difficultyMode: DifficultyMode.CHALLENGE }),
    ];
    expect(countPerfectSessions(records)).toBe(0);
  });

  it('excludes sessions with fewer than 10 tasks', () => {
    const records = [makeRecord({ correctTasks: 5, totalTasks: 5 })];
    expect(countPerfectSessions(records)).toBe(0);
  });
});

describe('hasAllOperationsPerfect', () => {
  it('returns false when not all ops have a perfect session', () => {
    const records = [
      makeRecord({ operations: [Operation.ADDITION], correctTasks: 10 }),
      makeRecord({ operations: [Operation.SUBTRACTION], correctTasks: 10 }),
      makeRecord({ operations: [Operation.MULTIPLICATION], correctTasks: 10 }),
      // division missing
    ];
    expect(hasAllOperationsPerfect(records)).toBe(false);
  });

  it('returns true when all 4 operations have a perfect session', () => {
    const records = [
      makeRecord({ operations: [Operation.ADDITION], correctTasks: 10 }),
      makeRecord({ operations: [Operation.SUBTRACTION], correctTasks: 10 }),
      makeRecord({ operations: [Operation.MULTIPLICATION], correctTasks: 10 }),
      makeRecord({ operations: [Operation.DIVISION], correctTasks: 10 }),
    ];
    expect(hasAllOperationsPerfect(records)).toBe(true);
  });
});

describe('computeNewlyUnlocked', () => {
  const existing: BadgeStore = {};

  it('unlocks range_100 when record uses RANGE_100', () => {
    const record = makeRecord({ numberRange: NumberRange.RANGE_100 });
    const ids = computeNewlyUnlocked(record, [record], 0, existing);
    expect(ids).toContain('range_100');
  });

  it('unlocks creative_mode when record is creative', () => {
    const record = makeRecord({ difficultyMode: DifficultyMode.CREATIVE });
    const ids = computeNewlyUnlocked(record, [record], 0, existing);
    expect(ids).toContain('creative_mode');
  });

  // #253: challenge records always carry 3 errors (game over), so the badge
  // is based on the challengeFlawlessLevel3 flag instead of errors === 0.
  it('unlocks challenge_no_errors when level 3 was reached with all lives', () => {
    const record = makeRecord({
      difficultyMode: DifficultyMode.CHALLENGE,
      errors: 3,
      challengeFlawlessLevel3: true,
    });
    const ids = computeNewlyUnlocked(record, [record], 0, existing);
    expect(ids).toContain('challenge_no_errors');
  });

  it('does not unlock challenge_no_errors without the flawless flag', () => {
    const record = makeRecord({ difficultyMode: DifficultyMode.CHALLENGE, errors: 3 });
    const ids = computeNewlyUnlocked(record, [record], 0, existing);
    expect(ids).not.toContain('challenge_no_errors');
  });

  it('does not unlock challenge_no_errors for non-challenge records with the flag', () => {
    const record = makeRecord({ challengeFlawlessLevel3: true });
    const ids = computeNewlyUnlocked(record, [record], 0, existing);
    expect(ids).not.toContain('challenge_no_errors');
  });

  it('unlocks challenge_level_3 when challengeHighScore reaches level 3 (score=10)', () => {
    const record = makeRecord();
    const ids = computeNewlyUnlocked(record, [record], 10, existing);
    expect(ids).toContain('challenge_level_3');
    expect(ids).not.toContain('challenge_level_6');
  });

  it('unlocks challenge_level_6 when challengeHighScore reaches level 6 (score=30)', () => {
    const record = makeRecord();
    const ids = computeNewlyUnlocked(record, [record], 30, existing);
    expect(ids).toContain('challenge_level_3');
    expect(ids).toContain('challenge_level_6');
  });

  it('unlocks perfect_1 on first perfect session', () => {
    const record = makeRecord({ timestamp: daysAgo(0), correctTasks: 10, totalTasks: 10 });
    const ids = computeNewlyUnlocked(record, [record], 0, existing);
    expect(ids).toContain('perfect_1');
  });

  it('does not re-unlock already earned badges', () => {
    const record = makeRecord({ numberRange: NumberRange.RANGE_100 });
    const alreadyHas: BadgeStore = { range_100: Date.now() - 1000 };
    const ids = computeNewlyUnlocked(record, [record], 0, alreadyHas);
    expect(ids).not.toContain('range_100');
  });

  it('unlocks streak_3 after 3 consecutive days (via persisted streak)', () => {
    const record = makeRecord({ timestamp: daysAgo(0) });
    const ids = computeNewlyUnlocked(record, [record], 0, existing, 3);
    expect(ids).toContain('streak_3');
    expect(ids).not.toContain('streak_7');
  });

  it('unlocks streak_30 when persisted streak is 30 (bypasses 28-day prune)', () => {
    const record = makeRecord({ timestamp: daysAgo(0) });
    const ids = computeNewlyUnlocked(record, [record], 0, existing, 30);
    expect(ids).toContain('streak_3');
    expect(ids).toContain('streak_7');
    expect(ids).toContain('streak_30');
  });
});

describe('advanceStreak', () => {
  function isoToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }
  function isoYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  it('starts streak at 1 on first ever play', () => {
    const result = advanceStreak({ currentStreak: 0, lastPlayedDate: '', longestStreak: 0 });
    expect(result.currentStreak).toBe(1);
    expect(result.lastPlayedDate).toBe(isoToday());
  });

  it('does not increase streak when called twice on same day', () => {
    const today = isoToday();
    const result = advanceStreak({ currentStreak: 5, lastPlayedDate: today, longestStreak: 5 });
    expect(result.currentStreak).toBe(5);
  });

  it('increments streak on consecutive day', () => {
    const result = advanceStreak({
      currentStreak: 4,
      lastPlayedDate: isoYesterday(),
      longestStreak: 4,
    });
    expect(result.currentStreak).toBe(5);
    expect(result.lastPlayedDate).toBe(isoToday());
  });

  it('resets streak to 1 after a gap', () => {
    const result = advanceStreak({
      currentStreak: 10,
      lastPlayedDate: '2020-01-01',
      longestStreak: 10,
    });
    expect(result.currentStreak).toBe(1);
  });
});
