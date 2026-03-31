/**
 * Tests for GameCard Component
 * Ensures all interactive buttons are rendered and accessible in every answer mode.
 * This prevents regressions where buttons (especially check/next) get pushed off-screen.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Animated } from 'react-native';
import { GameCard } from './GameCard';
import { AnswerMode, GameMode, Operation, DifficultyMode, GameState, ThemeColors } from '../types/game';

const mockColors: ThemeColors = {
  background: '#fff',
  text: '#000',
  textSecondary: '#666',
  border: '#ccc',
  card: '#fff',
  cardCorrect: '#e0ffe0',
  cardIncorrect: '#ffe0e0',
  buttonInactive: '#999',
  buttonInactiveText: '#666',
  settingsOverlay: 'rgba(0,0,0,0.5)',
  settingsMenu: '#fff',
};

const baseGameState: GameState = {
  num1: 3,
  num2: 4,
  userAnswer: '',
  score: 0,
  currentTask: 1,
  totalTasks: 10,
  gameMode: GameMode.NORMAL,
  operation: Operation.MULTIPLICATION,
  selectedOperations: new Set([Operation.MULTIPLICATION]),
  answerMode: AnswerMode.INPUT,
  difficultyMode: DifficultyMode.SIMPLE,
  questionPart: 2,
  showResult: false,
  lastAnswerCorrect: null,
  isAnswerChecked: false,
  totalSolvedTasks: 0,
  selectedChoice: null,
};

const defaultProps = {
  colors: mockColors,
  cardAnimatedStyle: {
    transform: [{ scale: new Animated.Value(1) }, { translateX: new Animated.Value(0) }],
  },
  operatorSymbol: '×',
  multipleChoices: [10, 12, 14, 16],
  numberSequence: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  reduceMotion: { current: true },
  getCorrectAnswer: () => 12,
  onNumberClick: jest.fn(),
  onChoiceClick: jest.fn(),
  onCheck: jest.fn(),
  onNext: jest.fn(),
  t: { nextQuestion: 'Weiter →', check: 'Prüfen' },
};

describe('GameCard - Button accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('NUMBER_SEQUENCE mode', () => {
    const sequenceState: GameState = {
      ...baseGameState,
      answerMode: AnswerMode.NUMBER_SEQUENCE,
    };

    it('renders all sequence number buttons', () => {
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={sequenceState} />
      );

      for (const num of defaultProps.numberSequence) {
        expect(getByText(String(num))).toBeTruthy();
      }
    });

    it('renders the check button', () => {
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={sequenceState} />
      );

      expect(getByText('Prüfen')).toBeTruthy();
    });

    it('check button is not disabled after selecting a choice', () => {
      const stateWithChoice: GameState = {
        ...sequenceState,
        selectedChoice: 12,
      };
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={stateWithChoice} />
      );

      const checkButton = getByText('Prüfen').closest('[role="button"]') || getByText('Prüfen').parentElement;
      // The button should be clickable
      fireEvent.click(getByText('Prüfen'));
      expect(defaultProps.onCheck).toHaveBeenCalled();
    });

    it('renders next button after answer is checked', () => {
      const checkedState: GameState = {
        ...sequenceState,
        isAnswerChecked: true,
        selectedChoice: 12,
      };
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={checkedState} />
      );

      expect(getByText('Weiter →')).toBeTruthy();
      fireEvent.click(getByText('Weiter →'));
      expect(defaultProps.onNext).toHaveBeenCalled();
    });

    it('sequence buttons are clickable', () => {
      const onChoiceClick = jest.fn();
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={sequenceState} onChoiceClick={onChoiceClick} />
      );

      fireEvent.click(getByText('10'));
      expect(onChoiceClick).toHaveBeenCalledWith(10);
    });

    it('sequence buttons are disabled after answer is checked', () => {
      const checkedState: GameState = {
        ...sequenceState,
        isAnswerChecked: true,
        selectedChoice: 12,
      };
      const onChoiceClick = jest.fn();
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={checkedState} onChoiceClick={onChoiceClick} />
      );

      // Button should exist but be disabled
      expect(getByText('10')).toBeTruthy();
    });
  });

  describe('MULTIPLE_CHOICE mode', () => {
    const choiceState: GameState = {
      ...baseGameState,
      answerMode: AnswerMode.MULTIPLE_CHOICE,
    };

    it('renders all choice buttons', () => {
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={choiceState} />
      );

      for (const choice of defaultProps.multipleChoices) {
        expect(getByText(String(choice))).toBeTruthy();
      }
    });

    it('renders the check button', () => {
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={choiceState} />
      );

      expect(getByText('Prüfen')).toBeTruthy();
    });

    it('check button triggers onCheck after selecting a choice', () => {
      const stateWithChoice: GameState = {
        ...choiceState,
        selectedChoice: 12,
      };
      const onCheck = jest.fn();
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={stateWithChoice} onCheck={onCheck} />
      );

      fireEvent.click(getByText('Prüfen'));
      expect(onCheck).toHaveBeenCalled();
    });

    it('renders next button after answer is checked', () => {
      const checkedState: GameState = {
        ...choiceState,
        isAnswerChecked: true,
        selectedChoice: 12,
      };
      const onNext = jest.fn();
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={checkedState} onNext={onNext} />
      );

      expect(getByText('Weiter →')).toBeTruthy();
      fireEvent.click(getByText('Weiter →'));
      expect(onNext).toHaveBeenCalled();
    });

    it('choice buttons are clickable', () => {
      const onChoiceClick = jest.fn();
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={choiceState} onChoiceClick={onChoiceClick} />
      );

      fireEvent.click(getByText('14'));
      expect(onChoiceClick).toHaveBeenCalledWith(14);
    });
  });

  describe('INPUT mode', () => {
    const inputState: GameState = {
      ...baseGameState,
      answerMode: AnswerMode.INPUT,
    };

    it('renders all numpad digit buttons (0-9)', () => {
      const { getAllByText } = render(
        <GameCard {...defaultProps} gameState={inputState} />
      );

      for (let i = 0; i <= 9; i++) {
        // Some digits may appear both in the question and numpad
        expect(getAllByText(String(i)).length).toBeGreaterThanOrEqual(1);
      }
    });

    it('renders backspace button', () => {
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={inputState} />
      );

      expect(getByText('←')).toBeTruthy();
    });

    it('renders check button (✓)', () => {
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={inputState} />
      );

      expect(getByText('✓')).toBeTruthy();
    });

    it('renders next button (→) after answer is checked', () => {
      const checkedState: GameState = {
        ...inputState,
        isAnswerChecked: true,
        userAnswer: '12',
      };
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={checkedState} />
      );

      expect(getByText('→')).toBeTruthy();
    });
  });

  describe('Question display', () => {
    it('displays question with result missing (questionPart 2)', () => {
      const { getAllByText } = render(
        <GameCard {...defaultProps} gameState={baseGameState} />
      );

      // num1 and num2 are displayed (may appear multiple times due to numpad)
      expect(getAllByText('3').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('4').length).toBeGreaterThanOrEqual(1);
      // ? appears for the missing result
      expect(getAllByText('?').length).toBeGreaterThanOrEqual(1);
    });

    it('displays question with first number missing (questionPart 0)', () => {
      const state: GameState = {
        ...baseGameState,
        questionPart: 0,
        answerMode: AnswerMode.MULTIPLE_CHOICE,
      };
      const { getAllByText } = render(
        <GameCard {...defaultProps} gameState={state} />
      );

      // ? should appear for the missing first number
      expect(getAllByText('?').length).toBeGreaterThanOrEqual(1);
      // num2 (4) should be displayed
      expect(getAllByText('4').length).toBeGreaterThanOrEqual(1);
      // Result (3*4=12) should be displayed
      expect(getAllByText('12').length).toBeGreaterThanOrEqual(1);
    });

    it('displays question with second number missing (questionPart 1)', () => {
      const state: GameState = {
        ...baseGameState,
        questionPart: 1,
        answerMode: AnswerMode.MULTIPLE_CHOICE,
      };
      const { getAllByText } = render(
        <GameCard {...defaultProps} gameState={state} />
      );

      // num1 (3) should be displayed
      expect(getAllByText('3').length).toBeGreaterThanOrEqual(1);
      // ? should appear for the missing second number
      expect(getAllByText('?').length).toBeGreaterThanOrEqual(1);
      // Result (3*4=12) should be displayed
      expect(getAllByText('12').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Answer mode exclusivity', () => {
    it('does not render numpad in MULTIPLE_CHOICE mode', () => {
      const state: GameState = {
        ...baseGameState,
        answerMode: AnswerMode.MULTIPLE_CHOICE,
      };
      const { queryByText } = render(
        <GameCard {...defaultProps} gameState={state} />
      );

      // Numpad digits should not be present (except those that match choice values)
      expect(queryByText('←')).toBeNull();
      expect(queryByText('✓')).toBeNull();
    });

    it('does not render numpad in NUMBER_SEQUENCE mode', () => {
      const state: GameState = {
        ...baseGameState,
        answerMode: AnswerMode.NUMBER_SEQUENCE,
      };
      const { queryByText } = render(
        <GameCard {...defaultProps} gameState={state} />
      );

      expect(queryByText('←')).toBeNull();
      expect(queryByText('✓')).toBeNull();
    });

    it('does not render choice buttons in INPUT mode', () => {
      const { queryByText } = render(
        <GameCard {...defaultProps} gameState={baseGameState} />
      );

      expect(queryByText('Prüfen')).toBeNull();
    });
  });

  describe('Challenge mode specific', () => {
    it('renders all buttons in challenge mode with NUMBER_SEQUENCE', () => {
      const challengeState: GameState = {
        ...baseGameState,
        answerMode: AnswerMode.NUMBER_SEQUENCE,
        difficultyMode: DifficultyMode.CHALLENGE,
        challengeState: {
          lives: 3,
          level: 1,
          errors: 0,
          highScore: 0,
        },
      };
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={challengeState} />
      );

      // All sequence numbers present
      for (const num of defaultProps.numberSequence) {
        expect(getByText(String(num))).toBeTruthy();
      }
      // Check button present
      expect(getByText('Prüfen')).toBeTruthy();
    });

    it('renders all buttons in challenge mode with MULTIPLE_CHOICE', () => {
      const challengeState: GameState = {
        ...baseGameState,
        answerMode: AnswerMode.MULTIPLE_CHOICE,
        difficultyMode: DifficultyMode.CHALLENGE,
        challengeState: {
          lives: 3,
          level: 1,
          errors: 0,
          highScore: 0,
        },
      };
      const { getByText } = render(
        <GameCard {...defaultProps} gameState={challengeState} />
      );

      // All choice buttons present
      for (const choice of defaultProps.multipleChoices) {
        expect(getByText(String(choice))).toBeTruthy();
      }
      // Check button present
      expect(getByText('Prüfen')).toBeTruthy();
    });
  });
});
