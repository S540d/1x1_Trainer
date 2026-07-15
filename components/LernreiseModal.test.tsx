import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { LernreiseModal } from './LernreiseModal';
import { getThemeColors } from '../utils/theme';
import { RowMastery } from '../types/game';

jest.mock('../utils/storage', () => ({
  ...jest.requireActual('../utils/storage'),
  getRowMastery: jest.fn(),
}));

import { getRowMastery } from '../utils/storage';
const mockGetRowMastery = getRowMastery as jest.Mock;

const t = {
  lernreiseTitle: 'Lernreise',
  lernreiseSubtitle: 'Meistere jede Malreihe – Bronze, Silber, Gold',
  lernreiseRowLabel: '{row}er-Reihe',
  ok: 'OK',
};

function emptyMastery(): RowMastery[] {
  return Array.from({ length: 12 }, (_, i) => ({ row: i + 1, bestScore: 0, status: null }));
}

describe('LernreiseModal', () => {
  const colors = getThemeColors(false);

  beforeEach(() => {
    mockGetRowMastery.mockReset();
    mockGetRowMastery.mockResolvedValue(emptyMastery());
  });

  it('shows the title and subtitle', async () => {
    const { getByText } = render(
      <LernreiseModal visible onClose={jest.fn()} onSelectRow={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      expect(getByText(t.lernreiseTitle)).toBeTruthy();
      expect(getByText(t.lernreiseSubtitle)).toBeTruthy();
    });
  });

  it('does not fetch mastery when not visible', () => {
    render(
      <LernreiseModal
        visible={false}
        onClose={jest.fn()}
        onSelectRow={jest.fn()}
        colors={colors}
        t={t}
      />
    );
    expect(mockGetRowMastery).not.toHaveBeenCalled();
  });

  it('shows row 1 as playable and row 2 as locked initially', async () => {
    const { getByText } = render(
      <LernreiseModal visible onClose={jest.fn()} onSelectRow={jest.fn()} colors={colors} t={t} />
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
      <LernreiseModal visible onClose={jest.fn()} onSelectRow={jest.fn()} colors={colors} t={t} />
    );
    await waitFor(() => {
      const row1Icon = getByText('1er-Reihe').parentElement!.firstChild as HTMLElement;
      expect(row1Icon.textContent).toBe('🥈');
    });
    // row 2 is now unlocked (row 1 has a status) → playable icon, no lock
    const row2Icon = getByText('2er-Reihe').parentElement!.firstChild as HTMLElement;
    expect(row2Icon.textContent).toBe('▶');
  });

  it('tapping a locked row does not call onSelectRow or onClose', async () => {
    const onSelectRow = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <LernreiseModal visible onClose={onClose} onSelectRow={onSelectRow} colors={colors} t={t} />
    );
    await waitFor(() => expect(getByText('2er-Reihe')).toBeTruthy());
    fireEvent.click(getByText('2er-Reihe'));
    expect(onSelectRow).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('tapping an unlocked row closes the modal and selects the row', async () => {
    const onSelectRow = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <LernreiseModal visible onClose={onClose} onSelectRow={onSelectRow} colors={colors} t={t} />
    );
    await waitFor(() => expect(getByText('1er-Reihe')).toBeTruthy());
    fireEvent.click(getByText('1er-Reihe'));
    expect(onClose).toHaveBeenCalled();
    expect(onSelectRow).toHaveBeenCalledWith(1);
  });

  it('passes profileId through to storage calls', async () => {
    render(
      <LernreiseModal
        visible
        onClose={jest.fn()}
        onSelectRow={jest.fn()}
        colors={colors}
        t={t}
        profileId="abc"
      />
    );
    await waitFor(() => expect(mockGetRowMastery).toHaveBeenCalledWith('abc'));
  });
});
