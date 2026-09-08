/**
 * useGameKeyboard Hook
 * Maps physical keyboard input on web (#258) onto the game actions.
 * Extracted from App.tsx (Issue #357, Punkt 1) — digits and backspace/clear
 * still only apply in INPUT answer mode, and the binding stays inactive
 * while any overlay is open.
 */

import { useKeyboardInput } from './useKeyboardInput';
import { useGameLogic } from './useGameLogic';
import { AnswerMode } from '../types/game';

export function useGameKeyboard(game: ReturnType<typeof useGameLogic>, enabled: boolean) {
  const inInputMode = () => game.gameState.answerMode === AnswerMode.INPUT;

  useKeyboardInput({
    enabled,
    onDigit: (digit) => {
      if (inInputMode()) game.handleNumberClick(digit);
    },
    onBackspace: () => {
      if (inInputMode()) game.handleNumberClick(-1);
    },
    onClear: () => {
      if (inInputMode()) game.handleNumberClick(-2);
    },
    onSubmit: () => {
      if (game.gameState.isAnswerChecked) {
        game.nextQuestion();
      } else {
        game.checkAnswer();
      }
    },
  });
}
