import { mergeTaskStat } from './taskStats';
import { Operation, TaskStat } from '../types/game';

const stat = (overrides: Partial<TaskStat> = {}): TaskStat => ({
  num1: 3,
  num2: 4,
  operation: Operation.MULTIPLICATION,
  correctCount: 0,
  errorCount: 0,
  lastSeen: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('mergeTaskStat', () => {
  it('appends a new entry with a correct answer counted', () => {
    const result = mergeTaskStat([], 3, 4, Operation.MULTIPLICATION, true);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      num1: 3,
      num2: 4,
      operation: Operation.MULTIPLICATION,
      correctCount: 1,
      errorCount: 0,
    });
  });

  it('appends a new entry with a wrong answer counted', () => {
    const result = mergeTaskStat([], 3, 4, Operation.MULTIPLICATION, false);

    expect(result[0]).toMatchObject({ correctCount: 0, errorCount: 1 });
  });

  it('increments the matching entry instead of appending', () => {
    const existing = [stat({ correctCount: 2, errorCount: 1 })];

    const result = mergeTaskStat(existing, 3, 4, Operation.MULTIPLICATION, true);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ correctCount: 3, errorCount: 1 });
  });

  it('refreshes lastSeen on the updated entry', () => {
    const existing = [stat()];

    const result = mergeTaskStat(existing, 3, 4, Operation.MULTIPLICATION, true);

    expect(result[0].lastSeen).not.toBe(existing[0].lastSeen);
  });

  it('does not mutate the input list or its entries', () => {
    const existing = [stat({ correctCount: 2 })];
    const snapshot = JSON.parse(JSON.stringify(existing));

    const result = mergeTaskStat(existing, 3, 4, Operation.MULTIPLICATION, true);

    expect(existing).toEqual(snapshot);
    expect(result).not.toBe(existing);
    expect(result[0]).not.toBe(existing[0]);
  });

  it('treats a different operation on the same numbers as a separate task', () => {
    const existing = [stat({ correctCount: 2 })];

    const result = mergeTaskStat(existing, 3, 4, Operation.ADDITION, true);

    expect(result).toHaveLength(2);
    expect(result[0].correctCount).toBe(2);
    expect(result[1]).toMatchObject({ operation: Operation.ADDITION, correctCount: 1 });
  });

  it('does not match a swapped factor pair', () => {
    const existing = [stat()];

    const result = mergeTaskStat(existing, 4, 3, Operation.MULTIPLICATION, true);

    expect(result).toHaveLength(2);
  });
});
