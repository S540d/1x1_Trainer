/**
 * useAppGame Hook
 * Wires useGameLogic to the app's persistence and feedback side effects:
 * session records, streak update, badge unlocking, per-task statistics and
 * the Lernreise round result. Extracted from App.tsx (Issue #357, Punkt 1) —
 * the callbacks are unchanged, they just no longer live in the component.
 */

import { MutableRefObject, useState } from 'react';
import { useGameLogic } from './useGameLogic';
import { usePreferences } from './usePreferences';
import { useBadges } from './useBadges';
import { SoundEvent } from './useSounds';
import {
  recordRowTestResult,
  recordTaskResult,
  saveSessionRecord,
  statusForRowScore,
  updateStreakAfterSession,
} from '../utils/storage';
import { mergeTaskStat } from '../utils/taskStats';
import { Operation, RowMasteryStatus, SessionRecord, StreakData, TaskStat } from '../types/game';

interface UseAppGameParams {
  preferences: ReturnType<typeof usePreferences>;
  badgeSystem: ReturnType<typeof useBadges>;
  playSound: (event: SoundEvent) => void;
  taskStats: TaskStat[];
  setTaskStats: React.Dispatch<React.SetStateAction<TaskStat[]>>;
  setStreakData: (streak: StreakData) => void;
  setRoundsToday: React.Dispatch<React.SetStateAction<number>>;
  activeProfileIdRef: MutableRefObject<string | undefined>;
}

export function useAppGame({
  preferences,
  badgeSystem,
  playSound,
  taskStats,
  setTaskStats,
  setStreakData,
  setRoundsToday,
  activeProfileIdRef,
}: UseAppGameParams) {
  const [lernreiseResult, setLernreiseResult] = useState<{
    row: number;
    status: RowMasteryStatus | null;
  } | null>(null);

  const game = useGameLogic({
    initialOperation: preferences.operation,
    initialOperations: preferences.operations,
    initialTotalSolvedTasks: preferences.totalSolvedTasks,
    onTotalSolvedTasksChange: preferences.setTotalSolvedTasks,
    onSessionComplete: (record: SessionRecord) => {
      if (record.correctTasks === record.totalTasks) {
        playSound('perfect');
      }
      const pid = activeProfileIdRef.current;
      saveSessionRecord(record, pid)
        .then(async () => {
          setStreakData(await updateStreakAfterSession(pid));
          setRoundsToday((prev) => prev + 1);
          await badgeSystem.checkAndUnlock(record);
        })
        .catch((err) => console.error('Session save / badge unlock failed:', err));
    },
    taskStats,
    onTaskResult: (num1: number, num2: number, operation: Operation, isCorrect: boolean) => {
      setTaskStats((prev) => mergeTaskStat(prev, num1, num2, operation, isCorrect));
      recordTaskResult(num1, num2, operation, isCorrect, activeProfileIdRef.current);
    },
    numberRange: preferences.numberRange,
    challengeHighScore: preferences.challengeHighScore,
    onChallengeHighScoreChange: preferences.setChallengeHighScore,
    onLernreiseRoundComplete: (row, correctTasks, totalTasks) => {
      recordRowTestResult(row, correctTasks, totalTasks, activeProfileIdRef.current).then(() => {
        setLernreiseResult({ row, status: statusForRowScore(correctTasks, totalTasks) });
      });
    },
  });

  return { game, lernreiseResult, setLernreiseResult };
}
