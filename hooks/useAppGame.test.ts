/**
 * Tests for useAppGame Hook (Issue #357, Punkt 1)
 * useGameLogic itself is mocked here — what matters is the wiring around it:
 * which side effects the session/task/Lernreise callbacks trigger.
 */

import { renderHook, act } from '@testing-library/react';
import { useAppGame } from './useAppGame';
import { useGameLogic } from './useGameLogic';
import {
  recordRowTestResult,
  recordTaskResult,
  saveSessionRecord,
  updateStreakAfterSession,
} from '../utils/storage';
import { DifficultyMode, NumberRange, Operation, SessionRecord, StreakData } from '../types/game';

jest.mock('./useGameLogic', () => ({ useGameLogic: jest.fn(() => ({ gameState: {} })) }));
jest.mock('../utils/storage', () => ({
  saveSessionRecord: jest.fn(),
  updateStreakAfterSession: jest.fn(),
  recordTaskResult: jest.fn(),
  recordRowTestResult: jest.fn(),
  statusForRowScore: jest.fn(() => 'gold'),
}));

const mockUseGameLogic = useGameLogic as jest.MockedFunction<typeof useGameLogic>;
const mockSaveSessionRecord = saveSessionRecord as jest.MockedFunction<typeof saveSessionRecord>;
const mockUpdateStreak = updateStreakAfterSession as jest.MockedFunction<
  typeof updateStreakAfterSession
>;
const mockRecordTaskResult = recordTaskResult as jest.MockedFunction<typeof recordTaskResult>;
const mockRecordRowTestResult = recordRowTestResult as jest.MockedFunction<
  typeof recordRowTestResult
>;

const streak: StreakData = { currentStreak: 3, lastPlayedDate: '2026-01-15', longestStreak: 5 };

function makeRecord(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: 'r1',
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

function setup() {
  const params = {
    playSound: jest.fn(),
    setTaskStats: jest.fn(),
    setStreakData: jest.fn(),
    setRoundsToday: jest.fn(),
    badgeSystem: { checkAndUnlock: jest.fn().mockResolvedValue(undefined) },
    taskStats: [],
    activeProfileIdRef: { current: 'p1' },
    preferences: {
      operation: Operation.MULTIPLICATION,
      operations: [Operation.MULTIPLICATION],
      totalSolvedTasks: 0,
      setTotalSolvedTasks: jest.fn(),
      numberRange: NumberRange.RANGE_10,
      challengeHighScore: 0,
      setChallengeHighScore: jest.fn(),
    },
  };

  const hook = renderHook(() => useAppGame(params as unknown as Parameters<typeof useAppGame>[0]));
  const config = mockUseGameLogic.mock.calls[0][0];
  return { hook, config, params };
}

describe('useAppGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGameLogic.mockReturnValue({ gameState: {} } as never);
    mockSaveSessionRecord.mockResolvedValue(undefined as never);
    mockUpdateStreak.mockResolvedValue(streak);
    mockRecordRowTestResult.mockResolvedValue(undefined as never);
  });

  it('starts without a Lernreise result', () => {
    const { hook } = setup();
    expect(hook.result.current.lernreiseResult).toBeNull();
  });

  it('persists a finished session, updates streak and rounds, and unlocks badges', async () => {
    const { config, params } = setup();

    await act(async () => {
      config.onSessionComplete?.(makeRecord({ correctTasks: 8 }));
    });

    expect(mockSaveSessionRecord).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }), 'p1');
    expect(params.setStreakData).toHaveBeenCalledWith(streak);
    expect(params.setRoundsToday).toHaveBeenCalled();
    expect(params.badgeSystem.checkAndUnlock).toHaveBeenCalled();
  });

  it('plays the perfect sound only on a flawless session', async () => {
    const { config, params } = setup();

    await act(async () => {
      config.onSessionComplete?.(makeRecord({ correctTasks: 10, totalTasks: 10 }));
    });
    expect(params.playSound).toHaveBeenCalledWith('perfect');

    params.playSound.mockClear();
    await act(async () => {
      config.onSessionComplete?.(makeRecord({ correctTasks: 9, totalTasks: 10 }));
    });
    expect(params.playSound).not.toHaveBeenCalledWith('perfect');
  });

  it('records a task result both in memory and in storage', () => {
    const { config, params } = setup();

    act(() => {
      config.onTaskResult?.(3, 4, Operation.MULTIPLICATION, true);
    });

    expect(params.setTaskStats).toHaveBeenCalled();
    expect(mockRecordTaskResult).toHaveBeenCalledWith(3, 4, Operation.MULTIPLICATION, true, 'p1');
  });

  it('stores the Lernreise row result and exposes its status', async () => {
    const { hook, config } = setup();

    await act(async () => {
      config.onLernreiseRoundComplete?.(7, 10, 10);
    });

    expect(mockRecordRowTestResult).toHaveBeenCalledWith(7, 10, 10, 'p1');
    expect(hook.result.current.lernreiseResult).toEqual({ row: 7, status: 'gold' });
  });

  it('can clear the Lernreise result again', async () => {
    const { hook, config } = setup();
    await act(async () => {
      config.onLernreiseRoundComplete?.(7, 10, 10);
    });

    act(() => hook.result.current.setLernreiseResult(null));

    expect(hook.result.current.lernreiseResult).toBeNull();
  });
});
