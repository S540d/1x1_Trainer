/**
 * Tests for useProfileData Hook (Issue #357, Punkt 1)
 * Covers the launch migration, the per-profile loads and the streak-warning
 * trigger (which must only fire in the evening for a still-savable streak).
 */

import { renderHook, act, RenderHookResult } from '@testing-library/react';
import { useProfileData } from './useProfileData';
import {
  getLocalDateString,
  getProfiles,
  getSessionRecords,
  getStreakData,
  getTaskStats,
  getYesterdayDateString,
  migrateToProfiles,
  setActiveProfileId,
} from '../utils/storage';
import { ChildProfile, DifficultyMode, NumberRange, Operation } from '../types/game';

jest.mock('../utils/storage', () => ({
  migrateToProfiles: jest.fn(),
  getProfiles: jest.fn(),
  getTaskStats: jest.fn(),
  getStreakData: jest.fn(),
  getSessionRecords: jest.fn(),
  setActiveProfileId: jest.fn(),
  getLocalDateString: jest.fn(),
  getYesterdayDateString: jest.fn(),
}));

const mocked = {
  migrateToProfiles: migrateToProfiles as jest.MockedFunction<typeof migrateToProfiles>,
  getProfiles: getProfiles as jest.MockedFunction<typeof getProfiles>,
  getTaskStats: getTaskStats as jest.MockedFunction<typeof getTaskStats>,
  getStreakData: getStreakData as jest.MockedFunction<typeof getStreakData>,
  getSessionRecords: getSessionRecords as jest.MockedFunction<typeof getSessionRecords>,
  setActiveProfileId: setActiveProfileId as jest.MockedFunction<typeof setActiveProfileId>,
  getLocalDateString: getLocalDateString as jest.MockedFunction<typeof getLocalDateString>,
  getYesterdayDateString: getYesterdayDateString as jest.MockedFunction<
    typeof getYesterdayDateString
  >,
};

const profileA: ChildProfile = {
  id: 'a',
  name: 'Anna',
  avatarColor: '#f00',
  createdAt: '2026-01-01T00:00:00.000Z',
};
const profileB: ChildProfile = {
  id: 'b',
  name: 'Ben',
  avatarColor: '#0f0',
  createdAt: '2026-01-02T00:00:00.000Z',
};

function makeCallbacks() {
  return {
    onMultipleProfilesFound: jest.fn(),
    onStreakAtRisk: jest.fn(),
  };
}

function setNow(hour: number) {
  jest.useFakeTimers().setSystemTime(new Date(2026, 0, 15, hour, 0, 0));
}

type Callbacks = ReturnType<typeof makeCallbacks>;
type Hook = RenderHookResult<ReturnType<typeof useProfileData>, unknown>;

/** Lets pending promises settle inside act(), so React state updates stay wrapped. */
async function flush() {
  await act(async () => {});
}

/**
 * Renders the hook and flushes its async load effects inside act(),
 * so assertions can run synchronously and React stays quiet.
 */
async function renderProfileData(cb: Callbacks): Promise<Hook> {
  let hook!: Hook;
  await act(async () => {
    hook = renderHook(() => useProfileData(cb));
  });
  // Second pass: the migration commits the active profile, which only then
  // triggers the per-profile loads (task stats, streak, rounds today).
  await flush();
  return hook;
}

describe('useProfileData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocked.migrateToProfiles.mockResolvedValue(profileA);
    mocked.getProfiles.mockResolvedValue([profileA]);
    mocked.getTaskStats.mockResolvedValue([]);
    mocked.getSessionRecords.mockResolvedValue([]);
    mocked.getLocalDateString.mockReturnValue('2026-01-15');
    mocked.getYesterdayDateString.mockReturnValue('2026-01-14');
    mocked.getStreakData.mockResolvedValue({
      currentStreak: 0,
      lastPlayedDate: '',
      longestStreak: 0,
    });
    setNow(10);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adopts the migrated default profile', async () => {
    const cb = makeCallbacks();
    const { result } = await renderProfileData(cb);

    expect(result.current.activeProfile).toEqual(profileA);
    expect(result.current.profiles).toEqual([profileA]);
    expect(cb.onMultipleProfilesFound).not.toHaveBeenCalled();
  });

  it('asks for a profile choice when more than one profile exists', async () => {
    mocked.getProfiles.mockResolvedValue([profileA, profileB]);
    const cb = makeCallbacks();
    await renderProfileData(cb);

    expect(cb.onMultipleProfilesFound).toHaveBeenCalled();
  });

  it('keeps the activeProfileId ref in sync for callbacks', async () => {
    const { result } = await renderProfileData(makeCallbacks());

    expect(result.current.activeProfileIdRef.current).toBe('a');
  });

  it('loads task stats for the active profile', async () => {
    mocked.getTaskStats.mockResolvedValue([
      {
        num1: 2,
        num2: 3,
        operation: Operation.MULTIPLICATION,
        correctCount: 1,
        errorCount: 0,
        lastSeen: '2026-01-15T00:00:00.000Z',
      },
    ]);
    const { result } = await renderProfileData(makeCallbacks());

    expect(result.current.taskStats).toHaveLength(1);
    expect(mocked.getTaskStats).toHaveBeenCalledWith('a');
  });

  it("counts only today's session records as rounds today", async () => {
    const today = new Date(2026, 0, 15, 9).getTime();
    const yesterday = new Date(2026, 0, 14, 9).getTime();
    mocked.getSessionRecords.mockResolvedValue([
      makeRecord(today),
      makeRecord(today),
      makeRecord(yesterday),
    ]);
    mocked.getLocalDateString.mockImplementation((date?: Date) =>
      date && date.getTime() === yesterday ? '2026-01-14' : '2026-01-15'
    );

    const { result } = await renderProfileData(makeCallbacks());

    expect(result.current.roundsToday).toBe(2);
  });

  it('warns in the evening when the streak is still savable', async () => {
    setNow(21);
    mocked.getStreakData.mockResolvedValue({
      currentStreak: 4,
      lastPlayedDate: '2026-01-14',
      longestStreak: 9,
    });
    const cb = makeCallbacks();
    await renderProfileData(cb);

    expect(cb.onStreakAtRisk).toHaveBeenCalled();
  });

  it('does not warn before the evening', async () => {
    setNow(12);
    mocked.getStreakData.mockResolvedValue({
      currentStreak: 4,
      lastPlayedDate: '2026-01-14',
      longestStreak: 9,
    });
    const cb = makeCallbacks();
    const { result } = await renderProfileData(cb);

    expect(result.current.streakData.currentStreak).toBe(4);
    expect(cb.onStreakAtRisk).not.toHaveBeenCalled();
  });

  it('does not warn for an already broken streak', async () => {
    setNow(21);
    mocked.getStreakData.mockResolvedValue({
      currentStreak: 4,
      lastPlayedDate: '2026-01-10',
      longestStreak: 9,
    });
    const cb = makeCallbacks();
    const { result } = await renderProfileData(cb);

    expect(result.current.streakData.currentStreak).toBe(4);
    expect(cb.onStreakAtRisk).not.toHaveBeenCalled();
  });

  it('persists the choice when switching profiles', async () => {
    const { result } = await renderProfileData(makeCallbacks());
    expect(result.current.activeProfile).toEqual(profileA);

    await act(async () => {
      await result.current.switchProfile(profileB);
    });
    await flush();

    expect(result.current.activeProfile).toEqual(profileB);
    expect(mocked.setActiveProfileId).toHaveBeenCalledWith('b');
  });

  it('falls back to the first remaining profile when the active one is deleted', async () => {
    mocked.getProfiles.mockResolvedValue([profileA, profileB]);
    const { result } = await renderProfileData(makeCallbacks());
    expect(result.current.activeProfile).toEqual(profileA);

    act(() => result.current.applyProfilesChange([profileB]));
    await flush();

    expect(result.current.profiles).toEqual([profileB]);
    expect(result.current.activeProfile).toEqual(profileB);
    expect(mocked.setActiveProfileId).toHaveBeenCalledWith('b');
  });

  it('keeps the active profile when an unrelated profile is removed', async () => {
    mocked.getProfiles.mockResolvedValue([profileA, profileB]);
    const { result } = await renderProfileData(makeCallbacks());
    expect(result.current.activeProfile).toEqual(profileA);
    mocked.setActiveProfileId.mockClear();

    act(() => result.current.applyProfilesChange([profileA]));
    await flush();

    expect(result.current.activeProfile).toEqual(profileA);
    expect(mocked.setActiveProfileId).not.toHaveBeenCalled();
  });
});

function makeRecord(timestamp: number) {
  return {
    id: String(timestamp) + Math.random(),
    timestamp,
    operations: [Operation.MULTIPLICATION],
    totalTasks: 10,
    correctTasks: 10,
    errors: 0,
    errorRate: 0,
    difficultyMode: DifficultyMode.SIMPLE,
    numberRange: NumberRange.RANGE_10,
  };
}
