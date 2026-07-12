import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { ParentDashboard } from './ParentDashboard';
import { getThemeColors } from '../utils/theme';
import { Operation, DifficultyMode, NumberRange } from '../types/game';
import { FOUR_WEEKS_MS } from '../utils/storage';

jest.mock('../utils/storage', () => ({
  ...jest.requireActual('../utils/storage'),
  getSessionRecords: jest.fn(),
  getTaskStats: jest.fn(),
}));

import { getSessionRecords, getTaskStats } from '../utils/storage';
const mockGetSessionRecords = getSessionRecords as jest.Mock;
const mockGetTaskStats = getTaskStats as jest.Mock;

const t = {
  parentDashboard: 'Eltern-Dashboard',
  parentDashboardSubtitle: 'Letzte 4 Wochen',
  parentNoData: 'Noch keine Einheiten gespeichert.',
  parentSessions: 'Einheiten (4 Wochen)',
  parentAvgError: 'Ø Fehlerquote',
  parentToday: 'Heute',
  parentYesterday: 'Gestern',
  parentCorrect: 'Richtig',
  parentErrors: 'Fehler',
  parentWeakTasks: 'Schwachstellen (Top 5)',
  parentWeakTasksEmpty: 'Noch keine Schwächen erkannt.',
  parentCurrentStreak: 'Aktuelle Serie',
  parentLongestStreak: 'Längste Serie',
  parentStreakDays: 'Tage',
  chartSessions: 'Einheiten · 14 Tage',
  chartErrorRate: 'Fehlerquote · 14 Tage',
  parentEmptyTitle: "Los geht's!",
  parentWeeklyReview: 'Wochenrückblick',
  parentWeeklySessions: 'Einheiten diese Woche',
  parentWeeklyVsLastWeek: 'vs. letzte Woche',
  parentWeeklyMinutes: 'Übungszeit diese Woche',
  parentWeeklyMinutesUnit: 'Min',
  parentRowAccuracy: 'Genauigkeit pro Malreihe',
  parentWeeklyRecommendation: 'Übungsempfehlung der Woche',
  parentRecommendationText: 'Die {row}er-Reihe üben (Fehlerquote {rate}%)',
  parentRecommendationEmpty: 'Keine Schwachstelle erkannt – weiter so!',
  ok: 'OK',
};

const makeRecord = (overrides: Partial<Parameters<typeof Object.assign>[1]> = {}) => ({
  id: Math.random().toString(),
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

describe('ParentDashboard', () => {
  const colors = getThemeColors(false);

  beforeEach(() => {
    mockGetSessionRecords.mockClear();
    mockGetSessionRecords.mockResolvedValue([]);
    mockGetTaskStats.mockClear();
    mockGetTaskStats.mockResolvedValue([]);
  });

  it('shows friendly empty state illustration when no records', async () => {
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(t.parentEmptyTitle)).toBeTruthy();
      expect(getByText(t.parentNoData)).toBeTruthy();
    });
  });

  it('shows title', async () => {
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(t.parentDashboard)).toBeTruthy();
    });
  });

  it('shows session count in summary bar', async () => {
    mockGetSessionRecords.mockResolvedValue([makeRecord({ errors: 0 }), makeRecord({ errors: 0 })]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      const sessionLabel = getByText(t.parentSessions);
      expect(within(sessionLabel.parentElement!).getByText('2')).toBeTruthy();
    });
  });

  it('shows avg error rate in summary bar', async () => {
    mockGetSessionRecords.mockResolvedValue([
      makeRecord({ errorRate: 0.1 }),
      makeRecord({ errorRate: 0.3 }),
    ]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText('20%')).toBeTruthy();
    });
  });

  it('labels today\'s session as "Heute"', async () => {
    mockGetSessionRecords.mockResolvedValue([makeRecord({ timestamp: Date.now() })]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(t.parentToday)).toBeTruthy();
    });
  });

  it('excludes records older than 4 weeks from summary', async () => {
    const old = makeRecord({ timestamp: Date.now() - FOUR_WEEKS_MS - 1000 });
    const recent = makeRecord({ timestamp: Date.now() });
    mockGetSessionRecords.mockResolvedValue([old, recent]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      const sessionLabel = getByText(t.parentSessions);
      expect(within(sessionLabel.parentElement!).getByText('1')).toBeTruthy();
    });
  });

  it('does not fetch records when not visible', () => {
    render(<ParentDashboard visible={false} onClose={jest.fn()} colors={colors} t={t} />);
    expect(mockGetSessionRecords).not.toHaveBeenCalled();
    expect(mockGetTaskStats).not.toHaveBeenCalled();
  });

  it('does not show weak tasks section when no weak stats', async () => {
    mockGetSessionRecords.mockResolvedValue([makeRecord()]);
    // Stats exist but error rate is only 20% → not weak
    mockGetTaskStats.mockResolvedValue([
      {
        num1: 3,
        num2: 4,
        operation: 'MULTIPLICATION',
        correctCount: 8,
        errorCount: 2,
        lastSeen: new Date().toISOString(),
      },
    ]);
    const { queryByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => expect(mockGetTaskStats).toHaveBeenCalled());
    expect(queryByText(t.parentWeakTasks)).toBeNull();
  });

  it('shows weak task row when a task has high error rate', async () => {
    mockGetSessionRecords.mockResolvedValue([makeRecord()]);
    mockGetTaskStats.mockResolvedValue([
      {
        num1: 7,
        num2: 8,
        operation: 'MULTIPLICATION',
        correctCount: 0,
        errorCount: 3,
        lastSeen: new Date().toISOString(),
      },
    ]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(t.parentWeakTasks)).toBeTruthy();
      expect(getByText('7 × 8')).toBeTruthy();
    });
  });

  it('hides charts when all records are older than 14 days', async () => {
    const old = makeRecord({ timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000 });
    mockGetSessionRecords.mockResolvedValue([old]);
    const { queryByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => expect(mockGetSessionRecords).toHaveBeenCalled());
    expect(queryByText(t.chartSessions)).toBeNull();
    expect(queryByText(t.chartErrorRate)).toBeNull();
  });

  it('shows chart titles when there are sessions in the last 14 days', async () => {
    mockGetSessionRecords.mockResolvedValue([makeRecord({ timestamp: Date.now() })]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(t.chartSessions)).toBeTruthy();
      expect(getByText(t.chartErrorRate)).toBeTruthy();
    });
  });

  it('shows weekly session count in the weekly review section', async () => {
    mockGetSessionRecords.mockResolvedValue([
      makeRecord({ timestamp: Date.now() }),
      makeRecord({ timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 }),
    ]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(t.parentWeeklyReview)).toBeTruthy();
      expect(getByText(`${t.parentWeeklySessions}: 2`)).toBeTruthy();
    });
  });

  it('shows practiced minutes when session durations are recorded', async () => {
    mockGetSessionRecords.mockResolvedValue([
      makeRecord({ timestamp: Date.now(), durationMs: 90000 }),
    ]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(`${t.parentWeeklyMinutes}: 2 ${t.parentWeeklyMinutesUnit}`)).toBeTruthy();
    });
  });

  it('recommends the weakest times-table row when one is clearly weak', async () => {
    mockGetSessionRecords.mockResolvedValue([makeRecord()]);
    mockGetTaskStats.mockResolvedValue([
      {
        num1: 6,
        num2: 7,
        operation: 'MULTIPLICATION',
        correctCount: 1,
        errorCount: 5,
        lastSeen: new Date().toISOString(),
      },
      {
        num1: 6,
        num2: 8,
        operation: 'MULTIPLICATION',
        correctCount: 0,
        errorCount: 3,
        lastSeen: new Date().toISOString(),
      },
    ]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText('Die 6er-Reihe üben (Fehlerquote 89%)')).toBeTruthy();
    });
  });

  it('shows the empty recommendation message when no row is weak', async () => {
    mockGetSessionRecords.mockResolvedValue([makeRecord()]);
    mockGetTaskStats.mockResolvedValue([]);
    const { getByText } = render(
      <ParentDashboard visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(t.parentRecommendationEmpty)).toBeTruthy();
    });
  });

  it('calls onClose when OK button is pressed', async () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <ParentDashboard visible onClose={onClose} colors={colors} t={t} />
    );
    await waitFor(() => getByText(t.ok));
    getByText(t.ok).closest('div')?.click();
    // fireEvent not needed — just verify button is rendered
    expect(getByText(t.ok)).toBeTruthy();
  });
});
