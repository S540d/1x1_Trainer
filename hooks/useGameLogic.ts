/**
 * useGameLogic Hook
 * Manages all game state and logic
 */

import { useState, useMemo } from 'react';
import { GameMode, Operation, AnswerMode, DifficultyMode, GameState, NumberRange } from '../types/game';
import { TOTAL_TASKS, MAX_CHOICE_GENERATION_ATTEMPTS, MAX_RANDOM_ANSWER } from '../utils/constants';

interface UseGameLogicProps {
  initialOperations: Operation[];
  initialTotalSolvedTasks: number;
  initialNumberRange: NumberRange;
  onTotalSolvedTasksChange: (total: number) => void;
  onMotivationShow: (score: number) => void;
}

/**
 * Pure function to generate number sequence for NUMBER_SEQUENCE answer mode
 * Exported for testing purposes
 * @param num1 - First number in the operation
 * @param num2 - Second number in the operation
 * @param questionPart - Which part of the operation is being asked (0: num1, 1: num2, 2: result)
 * @param operation - Type of operation (ADDITION or MULTIPLICATION)
 * @returns Array of 10 numbers forming the sequence
 */
export function generateNumberSequenceForState(
  num1: number,
  num2: number,
  questionPart: number,
  operation: Operation
): number[] {
  const sequence: number[] = [];

  // Determine the base number for the sequence
  let base;
  if (questionPart === 0) {
    base = num2;
  } else if (questionPart === 1) {
    base = num1;
  } else {
    // For result, use one of the factors
    base = num1;
  }

  // Generate sequence based on operation type
  if (operation === Operation.ADDITION) {
    // For addition, generate: base+1, base+2, base+3, ..., base+10
    // Since num2 ∈ [1,10], correct answer (base+num2) will always be in sequence
    for (let i = 1; i <= 10; i++) {
      sequence.push(base + i);
    }
  } else {
    // For multiplication (or fallback), generate: base×1, base×2, base×3, ..., base×10
    // Since num2 ∈ [1,10], correct answer (base×num2) will always be in sequence
    for (let i = 1; i <= 10; i++) {
      sequence.push(base * i);
    }
  }

  return sequence;
}

export function useGameLogic({
  initialOperations,
  initialTotalSolvedTasks,
  initialNumberRange,
  onTotalSolvedTasksChange,
  onMotivationShow,
}: UseGameLogicProps) {
  const [gameState, setGameState] = useState<GameState>({
    num1: 1,
    num2: 1,
    userAnswer: '',
    score: 0,
    currentTask: 1,
    totalTasks: TOTAL_TASKS,
    gameMode: GameMode.NORMAL,
    operation: initialOperations[0] || Operation.MULTIPLICATION,
    enabledOperations: initialOperations,
    answerMode: AnswerMode.INPUT,
    difficultyMode: DifficultyMode.SIMPLE,
    questionPart: 2,
    showResult: false,
    lastAnswerCorrect: null,
    isAnswerChecked: false,
    totalSolvedTasks: initialTotalSolvedTasks,
    selectedChoice: null,
  });

  // Helper: Get correct answer for current question
  const getCorrectAnswer = () => {
    let result: number;

    if (gameState.operation === Operation.ADDITION) {
      result = gameState.num1 + gameState.num2;
    } else if (gameState.operation === Operation.SUBTRACTION) {
      result = gameState.num1 - gameState.num2;
    } else {
      result = gameState.num1 * gameState.num2;
    }

    switch (gameState.questionPart) {
      case 0:
        return gameState.num1;
      case 1:
        return gameState.num2;
      default:
        return result;
    }
  };

  // Validate if a question meets all requirements
  const isValidQuestion = (num1: number, num2: number, operation: Operation): boolean => {
    // Rule 1: Only positive whole numbers (no zero)
    if (num1 <= 0 || num2 <= 0) return false;

    // Calculate result based on operation
    let result: number;
    if (operation === Operation.ADDITION) {
      result = num1 + num2;
    } else if (operation === Operation.SUBTRACTION) {
      result = num1 - num2;
    } else {
      result = num1 * num2;
    }

    // Rule 2: No zero result
    if (result <= 0) return false;

    // Rule 3: Result must be within range limits
    if (initialNumberRange === NumberRange.SMALL && result > 20) return false;
    if (initialNumberRange === NumberRange.LARGE && result > 100) return false;

    // Rule 4: All elements (num1, num2) must be within range limits
    if (initialNumberRange === NumberRange.SMALL && (num1 > 20 || num2 > 20)) return false;
    if (initialNumberRange === NumberRange.LARGE && (num1 > 100 || num2 > 100)) return false;

    // Rule 5: At "up to 20" - no Addition or Subtraction of two 2-digit numbers
    if (initialNumberRange === NumberRange.SMALL && (operation === Operation.ADDITION || operation === Operation.SUBTRACTION)) {
      const is2Digit1 = num1 >= 10;
      const is2Digit2 = num2 >= 10;
      if (is2Digit1 && is2Digit2) return false;
    }

    // Rule 6: For Subtraction - result must be positive (num1 > num2)
    if (operation === Operation.SUBTRACTION && num1 <= num2) return false;

    return true;
  };

  // Generate a new question
  const generateQuestion = (mode: GameMode = gameState.gameMode) => {
    // Randomly select operation from enabled operations
    const selectedOperation =
      gameState.enabledOperations[Math.floor(Math.random() * gameState.enabledOperations.length)] ||
      Operation.MULTIPLICATION;

    let newNum1: number;
    let newNum2: number;
    let attempts = 0;
    const MAX_ATTEMPTS = 50;

    // Generate valid numbers with retries
    do {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        // Fallback to safe defaults
        if (selectedOperation === Operation.MULTIPLICATION) {
          newNum1 = 1;
          newNum2 = 1;
        } else {
          newNum1 = 10;
          newNum2 = 5;
        }
        break;
      }

      // Apply number range restrictions based on selected operation
      if (initialNumberRange === NumberRange.SMALL) {
        // "Up to 20" mode with operation-specific rules
        if (selectedOperation === Operation.MULTIPLICATION) {
          // Only 1x and 2x tables (no two 2-digit numbers)
          newNum1 = Math.floor(Math.random() * 2) + 1; // 1 or 2
          newNum2 = Math.floor(Math.random() * 10) + 1; // 1-10
        } else if (selectedOperation === Operation.SUBTRACTION) {
          // Subtraction: ensure positive result (num1 > num2), both ≤ 20
          // Generate with restriction: no two 2-digit numbers
          const maxNum1 = 20;
          newNum1 = Math.floor(Math.random() * maxNum1) + 1; // 1-20
          // Ensure num2 < num1 and no two 2-digit numbers
          const num1Is2Digit = newNum1 >= 10;
          const maxNum2 = num1Is2Digit ? 9 : Math.min(newNum1 - 1, 20);
          newNum2 = Math.floor(Math.random() * maxNum2) + 1;
        } else {
          // Addition: keep numbers small so sum doesn't exceed 20
          // Avoid two 2-digit numbers
          newNum1 = Math.floor(Math.random() * 10) + 1; // 1-10
          newNum2 = Math.floor(Math.random() * 10) + 1; // 1-10
        }
      } else {
        // "Up to 100" mode
        if (selectedOperation === Operation.SUBTRACTION) {
          // Ensure positive result: num1 > num2
          newNum1 = Math.floor(Math.random() * 100) + 1;
          newNum2 = Math.floor(Math.random() * (newNum1 - 1)) + 1;
        } else {
          // Addition and Multiplication: full range (1-10)
          newNum1 = Math.floor(Math.random() * 10) + 1;
          newNum2 = Math.floor(Math.random() * 10) + 1;
        }
      }
    } while (!isValidQuestion(newNum1, newNum2, selectedOperation));

    let newQuestionPart = 2;

    switch (mode) {
      case GameMode.NORMAL:
        newQuestionPart = 2;
        break;
      case GameMode.FIRST_MISSING:
        newQuestionPart = 0;
        break;
      case GameMode.SECOND_MISSING:
        newQuestionPart = 1;
        break;
      case GameMode.MIXED:
        newQuestionPart = Math.floor(Math.random() * 3);
        break;
    }

    // In CREATIVE mode (which uses MIXED), randomize answer mode each question
    // NUMBER_SEQUENCE only available when asking for result (questionPart === 2)
    let newAnswerMode = gameState.answerMode;
    if (gameState.difficultyMode === DifficultyMode.CREATIVE) {
      const availableModes =
        newQuestionPart === 2
          ? [AnswerMode.INPUT, AnswerMode.MULTIPLE_CHOICE, AnswerMode.NUMBER_SEQUENCE]
          : [AnswerMode.INPUT, AnswerMode.MULTIPLE_CHOICE];
      newAnswerMode = availableModes[Math.floor(Math.random() * availableModes.length)];
    }

    setGameState((prev) => ({
      ...prev,
      operation: selectedOperation,
      num1: newNum1,
      num2: newNum2,
      userAnswer: '',
      questionPart: newQuestionPart,
      answerMode: newAnswerMode,
      lastAnswerCorrect: null,
      isAnswerChecked: false,
      selectedChoice: null,
    }));
  };

  // Handle user input (for input mode)
  const onUserInput = (input: string) => {
    if (!gameState.isAnswerChecked) {
      setGameState((prev) => ({
        ...prev,
        userAnswer: input,
        lastAnswerCorrect: null,
      }));
    }
  };

  // Handle number pad click
  const handleNumberClick = (num: number) => {
    let currentAnswer = gameState.userAnswer;
    if (num === -1) {
      // Backspace
      currentAnswer = currentAnswer.slice(0, -1);
    } else if (num === -2) {
      // Clear
      currentAnswer = '';
    } else {
      currentAnswer += num.toString();
    }
    onUserInput(currentAnswer);
  };

  // Handle choice click (for multiple choice and number sequence)
  const handleChoiceClick = (value: number) => {
    if (!gameState.isAnswerChecked) {
      setGameState((prev) => ({
        ...prev,
        selectedChoice: value,
        lastAnswerCorrect: null,
      }));
    }
  };

  // Check answer
  const checkAnswer = () => {
    // Validate that user has provided an answer
    const hasInput =
      gameState.answerMode === AnswerMode.INPUT
        ? gameState.userAnswer !== ''
        : gameState.selectedChoice !== null;

    if (!hasInput) return;

    const correctAnswer = getCorrectAnswer();
    let isCorrect = false;

    if (gameState.answerMode === AnswerMode.INPUT) {
      isCorrect = parseInt(gameState.userAnswer) === correctAnswer;
    } else {
      isCorrect = gameState.selectedChoice === correctAnswer;
    }

    const newScore = isCorrect ? gameState.score + 1 : gameState.score;

    setGameState((prev) => ({
      ...prev,
      lastAnswerCorrect: isCorrect,
      score: newScore,
      isAnswerChecked: true,
    }));
  };

  // Next question
  const nextQuestion = () => {
    const isLastTask = gameState.currentTask === gameState.totalTasks;
    const newTotalSolvedTasks = gameState.totalSolvedTasks + 1;
    
    setGameState((prev) => {
      // Show motivation message after every 10 tasks
      if (newTotalSolvedTasks > 0 && newTotalSolvedTasks % 10 === 0) {
        onMotivationShow(prev.score);
      }
      
      if (isLastTask) {
        // Last task - show results
        return { 
          ...prev, 
          showResult: true,
          totalSolvedTasks: newTotalSolvedTasks,
        };
      } else {
        // Continue to next task
        return {
          ...prev,
          currentTask: prev.currentTask + 1,
          totalSolvedTasks: newTotalSolvedTasks,
        };
      }
    });

    // Notify parent about total tasks change
    onTotalSolvedTasksChange(newTotalSolvedTasks);

    if (!isLastTask) {
      setTimeout(() => generateQuestion(), 0);
    }
  };

  // Restart game
  const restartGame = () => {
    setGameState((prev) => ({
      ...prev,
      score: 0,
      currentTask: 1,
      showResult: false,
    }));
    setTimeout(() => generateQuestion(), 0);
  };

  // Continue game (keep score, reset to task 1)
  const continueGame = () => {
    setGameState((prev) => ({
      ...prev,
      currentTask: 1,
      showResult: false,
    }));
    setTimeout(() => generateQuestion(), 0);
  };

  // Change game mode
  const changeGameMode = (newMode: GameMode) => {
    setGameState((prev) => ({
      ...prev,
      gameMode: newMode,
      currentTask: 1,
      score: 0,
      showResult: false,
    }));
    setTimeout(() => generateQuestion(newMode), 0);
  };

  // Update enabled operations (called when user toggles operations)
  const updateEnabledOperations = (operations: Operation[]) => {
    if (operations.length === 0) return; // Don't allow empty operations
    setGameState((prev) => ({
      ...prev,
      enabledOperations: operations,
      currentTask: 1,
      score: 0,
      showResult: false,
    }));
    setTimeout(() => generateQuestion(), 0);
  };

  // Change answer mode
  const changeAnswerMode = (newMode: AnswerMode) => {
    setGameState((prev) => ({
      ...prev,
      answerMode: newMode,
      currentTask: 1,
      score: 0,
      showResult: false,
      userAnswer: '',
      selectedChoice: null,
    }));
    setTimeout(() => generateQuestion(), 0);
  };

  // Change difficulty mode
  const changeDifficultyMode = (newMode: DifficultyMode) => {
    let newGameMode: GameMode;
    let newAnswerMode: AnswerMode;

    if (newMode === DifficultyMode.SIMPLE) {
      // Simple: Normal tasks with keypad input
      newGameMode = GameMode.NORMAL;
      newAnswerMode = AnswerMode.INPUT;
    } else {
      // Creative: Mixed tasks with random answer mode
      newGameMode = GameMode.MIXED;
      const answerModes = [AnswerMode.INPUT, AnswerMode.MULTIPLE_CHOICE, AnswerMode.NUMBER_SEQUENCE];
      newAnswerMode = answerModes[Math.floor(Math.random() * answerModes.length)];
    }

    setGameState((prev) => ({
      ...prev,
      difficultyMode: newMode,
      gameMode: newGameMode,
      answerMode: newAnswerMode,
      currentTask: 1,
      score: 0,
      showResult: false,
      userAnswer: '',
      selectedChoice: null,
    }));
    setTimeout(() => generateQuestion(newGameMode), 0);
  };

  // Generate multiple choice options
  const generateMultipleChoices = () => {
    const correctAnswer = getCorrectAnswer();
    const choices = [correctAnswer];

    // Generate two wrong answers
    let attempts = 0;
    while (choices.length < 3 && attempts < MAX_CHOICE_GENERATION_ATTEMPTS) {
      attempts++;
      let wrongAnswer;
      if (Math.random() < 0.5) {
        // Nearby wrong answer
        const offset = Math.floor(Math.random() * 8) - 4;
        const adjustedOffset = offset >= 0 ? offset + 1 : offset;
        wrongAnswer = correctAnswer + adjustedOffset;
      } else {
        // Random wrong answer
        wrongAnswer = Math.floor(Math.random() * MAX_RANDOM_ANSWER) + 1;
      }

      if (wrongAnswer > 0 && wrongAnswer !== correctAnswer && !choices.includes(wrongAnswer)) {
        choices.push(wrongAnswer);
      }
    }

    // Ensure we always have 3 choices
    if (choices.length < 3) {
      const fallbacks = [correctAnswer + 1, correctAnswer + 2, correctAnswer - 1, correctAnswer - 2];
      for (const fallback of fallbacks) {
        if (fallback > 0 && fallback !== correctAnswer && !choices.includes(fallback)) {
          choices.push(fallback);
          if (choices.length === 3) break;
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    return choices;
  };

  // Generate number sequence
  // Note: NUMBER_SEQUENCE is only used when questionPart === 2 (asking for result)
  // This is enforced in generateQuestion() lines 85-87. The base calculation handles
  // all questionPart values defensively, but only questionPart===2 will call this function.
  const generateNumberSequence = () => {
    return generateNumberSequenceForState(gameState.num1, gameState.num2, gameState.questionPart, gameState.operation);
  };

  // Memoize choices and sequence
  const multipleChoices = useMemo(() => {
    if (gameState.answerMode === AnswerMode.MULTIPLE_CHOICE) {
      return generateMultipleChoices();
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.num1, gameState.num2, gameState.questionPart, gameState.operation, gameState.answerMode]);

  const numberSequence = useMemo(() => {
    if (gameState.answerMode === AnswerMode.NUMBER_SEQUENCE) {
      return generateNumberSequence();
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.num1, gameState.num2, gameState.questionPart, gameState.operation, gameState.answerMode]);

  // Get operator symbol
  const operatorSymbol =
    gameState.operation === Operation.ADDITION
      ? '+'
      : gameState.operation === Operation.SUBTRACTION
      ? '−'
      : '×';

  return {
    gameState,
    generateQuestion,
    checkAnswer,
    nextQuestion,
    restartGame,
    continueGame,
    changeGameMode,
    updateEnabledOperations,
    changeAnswerMode,
    changeDifficultyMode,
    handleNumberClick,
    handleChoiceClick,
    multipleChoices,
    numberSequence,
    operatorSymbol,
    getCorrectAnswer,
  };
}
