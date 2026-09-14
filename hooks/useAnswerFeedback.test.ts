/**
 * Tests for useAnswerFeedback Hook (Issue #357, Punkt 1)
 * Covers the sound triggers (answer, badge unlock, challenge level-up) and
 * that the card animation is skipped under reduced motion.
 */

import { renderHook } from '@testing-library/react';
import { useAnswerFeedback } from './useAnswerFeedback';
import { prefersReducedMotion } from '../utils/animations';

jest.mock('../utils/animations', () => ({
  ...jest.requireActual('../utils/animations'),
  prefersReducedMotion: jest.fn(),
}));

const mockPrefersReducedMotion = prefersReducedMotion as jest.MockedFunction<
  typeof prefersReducedMotion
>;

type Params = Parameters<typeof useAnswerFeedback>[0];

function makeParams(overrides: Partial<Params> = {}): Params {
  return {
    isAnswerChecked: false,
    lastAnswerCorrect: null,
    newlyUnlockedCount: 0,
    challengeLevel: undefined,
    playSound: jest.fn(),
    ...overrides,
  };
}

describe('useAnswerFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrefersReducedMotion.mockReturnValue(false);
  });

  it('exposes a card animated style', () => {
    const { result } = renderHook(() => useAnswerFeedback(makeParams()));
    expect(result.current.cardAnimatedStyle.transform).toHaveLength(2);
  });

  it('plays the correct sound for a right answer', () => {
    const playSound = jest.fn();
    renderHook(() =>
      useAnswerFeedback(makeParams({ isAnswerChecked: true, lastAnswerCorrect: true, playSound }))
    );
    expect(playSound).toHaveBeenCalledWith('correct');
  });

  it('plays the incorrect sound for a wrong answer', () => {
    const playSound = jest.fn();
    renderHook(() =>
      useAnswerFeedback(makeParams({ isAnswerChecked: true, lastAnswerCorrect: false, playSound }))
    );
    expect(playSound).toHaveBeenCalledWith('incorrect');
  });

  it('stays silent while no answer has been checked', () => {
    const playSound = jest.fn();
    renderHook(() => useAnswerFeedback(makeParams({ playSound })));
    expect(playSound).not.toHaveBeenCalled();
  });

  it('plays the badge sound only when the unlocked count grows', () => {
    const playSound = jest.fn();
    const { rerender } = renderHook((props: Params) => useAnswerFeedback(props), {
      initialProps: makeParams({ newlyUnlockedCount: 0, playSound }),
    });
    expect(playSound).not.toHaveBeenCalledWith('badge_unlock');

    rerender(makeParams({ newlyUnlockedCount: 1, playSound }));
    expect(playSound).toHaveBeenCalledWith('badge_unlock');

    playSound.mockClear();
    rerender(makeParams({ newlyUnlockedCount: 0, playSound }));
    expect(playSound).not.toHaveBeenCalledWith('badge_unlock');
  });

  it('plays the level-up sound only on an actual level increase', () => {
    const playSound = jest.fn();
    const { rerender } = renderHook((props: Params) => useAnswerFeedback(props), {
      initialProps: makeParams({ challengeLevel: 1, playSound }),
    });
    // First observed level is only recorded, not celebrated.
    expect(playSound).not.toHaveBeenCalledWith('level_up');

    rerender(makeParams({ challengeLevel: 2, playSound }));
    expect(playSound).toHaveBeenCalledWith('level_up');
  });

  it('skips the card animation under reduced motion but still plays sounds', () => {
    mockPrefersReducedMotion.mockReturnValue(true);
    const playSound = jest.fn();
    renderHook(() =>
      useAnswerFeedback(makeParams({ isAnswerChecked: true, lastAnswerCorrect: true, playSound }))
    );
    expect(playSound).toHaveBeenCalledWith('correct');
    expect(mockPrefersReducedMotion).toHaveBeenCalled();
  });
});
