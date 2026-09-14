/**
 * Tests for useGameKeyboard Hook (Issue #357, Punkt 1)
 * Verifies the mapping from physical keys onto game actions, in particular
 * that digit/backspace/clear only apply in INPUT answer mode.
 */

import { renderHook } from '@testing-library/react';
import { useGameKeyboard } from './useGameKeyboard';
import { useGameLogic } from './useGameLogic';
import { AnswerMode } from '../types/game';

type Game = ReturnType<typeof useGameLogic>;

function pressKey(key: string) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });
  window.dispatchEvent(event); // platform-safe — test-only, jsdom always provides window
}

function makeGame(overrides: { answerMode?: AnswerMode; isAnswerChecked?: boolean } = {}) {
  return {
    gameState: {
      answerMode: overrides.answerMode ?? AnswerMode.INPUT,
      isAnswerChecked: overrides.isAnswerChecked ?? false,
    },
    handleNumberClick: jest.fn(),
    checkAnswer: jest.fn(),
    nextQuestion: jest.fn(),
  } as unknown as Game;
}

describe('useGameKeyboard', () => {
  it('forwards digits in INPUT mode', () => {
    const game = makeGame();
    renderHook(() => useGameKeyboard(game, true));

    pressKey('7');

    expect(game.handleNumberClick).toHaveBeenCalledWith(7);
  });

  it('maps Backspace to -1 and Escape to -2', () => {
    const game = makeGame();
    renderHook(() => useGameKeyboard(game, true));

    pressKey('Backspace');
    pressKey('Escape');

    expect(game.handleNumberClick).toHaveBeenCalledWith(-1);
    expect(game.handleNumberClick).toHaveBeenCalledWith(-2);
  });

  it('ignores digits outside INPUT mode', () => {
    const game = makeGame({ answerMode: AnswerMode.MULTIPLE_CHOICE });
    renderHook(() => useGameKeyboard(game, true));

    pressKey('7');
    pressKey('Backspace');
    pressKey('Escape');

    expect(game.handleNumberClick).not.toHaveBeenCalled();
  });

  it('submits with checkAnswer while the answer is unchecked', () => {
    const game = makeGame({ isAnswerChecked: false });
    renderHook(() => useGameKeyboard(game, true));

    pressKey('Enter');

    expect(game.checkAnswer).toHaveBeenCalled();
    expect(game.nextQuestion).not.toHaveBeenCalled();
  });

  it('advances with nextQuestion once the answer is checked', () => {
    const game = makeGame({ isAnswerChecked: true });
    renderHook(() => useGameKeyboard(game, true));

    pressKey('Enter');

    expect(game.nextQuestion).toHaveBeenCalled();
    expect(game.checkAnswer).not.toHaveBeenCalled();
  });

  it('stays inactive while disabled (an overlay is open)', () => {
    const game = makeGame();
    renderHook(() => useGameKeyboard(game, false));

    pressKey('7');
    pressKey('Enter');

    expect(game.handleNumberClick).not.toHaveBeenCalled();
    expect(game.checkAnswer).not.toHaveBeenCalled();
  });
});
