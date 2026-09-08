/**
 * Task statistics helpers.
 * `mergeTaskStat` is the in-memory counterpart to `recordTaskResult()` in
 * storage.ts: it folds a single answer into the local TaskStat list that
 * feeds the PRACTICE mode's weak-task selection. Extracted from the inline
 * reducer in App.tsx (Issue #357, Punkt 1) so it can be unit-tested.
 */

import { Operation, TaskStat } from '../types/game';

export function mergeTaskStat(
  stats: TaskStat[],
  num1: number,
  num2: number,
  operation: Operation,
  isCorrect: boolean
): TaskStat[] {
  const idx = stats.findIndex(
    (s) => s.num1 === num1 && s.num2 === num2 && s.operation === operation
  );
  const lastSeen = new Date().toISOString();

  if (idx >= 0) {
    const existing = stats[idx];
    const updated: TaskStat = {
      ...existing,
      correctCount: existing.correctCount + (isCorrect ? 1 : 0),
      errorCount: existing.errorCount + (isCorrect ? 0 : 1),
      lastSeen,
    };
    const next = [...stats];
    next[idx] = updated;
    return next;
  }

  return [
    ...stats,
    {
      num1,
      num2,
      operation,
      correctCount: isCorrect ? 1 : 0,
      errorCount: isCorrect ? 0 : 1,
      lastSeen,
    },
  ];
}
