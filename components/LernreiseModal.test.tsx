import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { LernreiseModal } from './LernreiseModal';
import { getThemeColors } from '../utils/theme';
import { RowMastery } from '../types/game';

jest.mock('../utils/storage', () => ({
  ...jest.requireActual('../utils/storage'),
  getRowMastery: jest.fn(),
  recordRowTestResult: jest.fn(),
  recordTaskResult: jest.fn(),
}));

import { getRowMastery, recordRowTestResult } from '../utils/storage';
const mockGetRowMastery = getRowMastery as jest.Mock;
const mockRecordRowTestResult = recordRowTestResult as jest.Mock;

const t = {
  lernreiseTitle: 'Lernreise',
  lernreiseSubtitle: 'Meistere jede Malreihe – Bronze, Silber, Gold',
  lernreiseRowLabel: '{row}er-Reihe',
  lernreiseResultScore: '{score}/10 richtig',
  lernreiseResultGold: 'Gold! Perfekt gemeistert!',
  lernreiseResultSilver: 'Silber! Toll gemacht!',
  lernreiseResultBronze: 'Bronze! Gut gemacht!',
  lernreiseResultRetry: 'Noch nicht ganz – versuch es nochmal!',
  lernreiseBackToMap: 'Zurück zur Lernreise',
  check: 'Prüfen',
  nextQuestion: 'Weiter →',
  ok: 'OK',
};

function emptyMastery(): RowMastery[] {
  return Array.from({ length: 12 }, (_, i) => ({ row: i + 1, bestScore: 0, status: null }));
}

// Clicks the digit's Numpad button. When a digit is already echoed in the
// answer box, getAllByText returns both; the Numpad button is always the
// last DOM match since it renders after the question row.
function clickDigit(getAllByText: (text: string) => HTMLElement[], digit: string) {
  const matches = getAllByText(digit);
  fireEvent.click(matches[matches.length - 1]);
}

describe('LernreiseModal', () => {
  const colors = getThemeColors(false);

  beforeEach(() => {
    mockGetRowMastery.mockReset();
    mockGetRowMastery.mockResolvedValue(emptyMastery());
    mockRecordRowTestResult.mockReset();
  });

  it('shows the title and subtitle', async () => {
    const { getByText } = render(
      <LernreiseModal visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(t.lernreiseTitle)).toBeTruthy();
      expect(getByText(t.lernreiseSubtitle)).toBeTruthy();
    });
  });

  it('does not fetch mastery when not visible', () => {
    render(<LernreiseModal visible={false} onClose={jest.fn()} colors={colors} t={t} />);
    expect(mockGetRowMastery).not.toHaveBeenCalled();
  });

  it('shows row 1 as playable and row 2 as locked initially', async () => {
    const { getByText } = render(
      <LernreiseModal visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => expect(getByText('1er-Reihe')).toBeTruthy());
    const row1Icon = getByText('1er-Reihe').parentElement!.firstChild as HTMLElement;
    const row2Icon = getByText('2er-Reihe').parentElement!.firstChild as HTMLElement;
    expect(row1Icon.textContent).toBe('▶');
    expect(row2Icon.textContent).toBe('🔒');
  });

  it('shows the earned badge on an already-mastered row and unlocks the next one', async () => {
    const mastery = emptyMastery();
    mastery[0] = { row: 1, bestScore: 9, status: 'silver' };
    mockGetRowMastery.mockResolvedValue(mastery);
    const { getByText } = render(
      <LernreiseModal visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      const row1Icon = getByText('1er-Reihe').parentElement!.firstChild as HTMLElement;
      expect(row1Icon.textContent).toBe('🥈');
    });
    // row 2 is now unlocked (row 1 has a status) → playable icon, no lock
    const row2Icon = getByText('2er-Reihe').parentElement!.firstChild as HTMLElement;
    expect(row2Icon.textContent).toBe('▶');
  });

  it('tapping a locked row does not start a test', async () => {
    const { getByText, queryByText } = render(
      <LernreiseModal visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => expect(getByText('2er-Reihe')).toBeTruthy());
    fireEvent.click(getByText('2er-Reihe'));
    expect(queryByText(t.check)).toBeNull();
  });

  it('tapping an unlocked row starts the test view', async () => {
    const { getByText } = render(
      <LernreiseModal visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => expect(getByText('1er-Reihe')).toBeTruthy());
    fireEvent.click(getByText('1er-Reihe'));
    expect(getByText(t.check)).toBeTruthy();
  });

  it('completes a perfect row test, awards gold, and unlocks the next row', async () => {
    mockRecordRowTestResult.mockImplementation(async (row: number, score: number) => {
      const result = emptyMastery();
      result[row - 1] = { row, bestScore: score, status: 'gold' };
      return result;
    });

    const { getByText, getAllByText } = render(
      <LernreiseModal visible onClose={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => expect(getByText('1er-Reihe')).toBeTruthy());
    fireEvent.click(getByText('1er-Reihe'));

    for (let i = 0; i < 10; i++) {
      const equation = getAllByText(/^1 × \d+ =$/)[0].textContent!;
      const factor = parseInt(equation.match(/× (\d+) =/)![1], 10);
      for (const digit of (1 * factor).toString()) {
        clickDigit(getAllByText, digit);
      }
      fireEvent.click(getByText(t.check));
      fireEvent.click(getByText(t.nextQuestion));
    }

    await waitFor(() => {
      expect(getByText('10/10 richtig')).toBeTruthy();
      expect(getByText(t.lernreiseResultGold)).toBeTruthy();
    });
    expect(mockRecordRowTestResult).toHaveBeenCalledWith(1, 10, 10, undefined);

    fireEvent.click(getByText(t.lernreiseBackToMap));
    await waitFor(() => {
      expect(getByText('🥇')).toBeTruthy();
      expect(getByText('▶')).toBeTruthy(); // row 2 unlocked
    });
  });

  it('passes profileId through to storage calls', async () => {
    render(<LernreiseModal visible onClose={jest.fn()} colors={colors} t={t} profileId="abc" />);
    await waitFor(() => expect(mockGetRowMastery).toHaveBeenCalledWith('abc'));
  });
});
