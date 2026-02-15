/**
 * useGameLogic Hook
 * Manages all game state and logic
 */

import { useState, useMemo } from 'react';
import { GameMode, Operation, AnswerMode, DifficultyMode, GameState, NumberRange, ChallengeState } from '../types/game';
import { TOTAL_TASKS, MAX_CHOICE_GENERATION_ATTEMPTS, MAX_RANDOM_ANSWER, CHALLENGE_MAX_LIVES, getChallengeLevel, getChallengeLevelNumber } from '../utils/constants';

interface UseGameLogicProps {
  initialOperation: Operation;
  initialOperations?: Operation[]; // Optional: array of selected operations
  initialTotalSolvedTasks: number;
  onTotalSolvedTasksChange: (total: number) => void;
  onMotivationShow: (score: number) => void;
  numberRange: NumberRange;
  challengeHighScore?: number;
  onChallengeHighScoreChange?: (score: number) => void;
}

/**
 * Pure function to generate number sequence for NUMBER_SEQUENCE answer mode
 * Exported for testing purposes
 * @param num1 - First number in the operation
 * @param num2 - Second number in the operation
 * @param questionPart - Which part of the operation is being asked (0: num1, 1: num2, 2: result)
 * @param operation - Type of operation
 * @param maxNumber - Maximum number in the range (10, 20, 50, or 100)
 * @returns Array of 10 numbers forming the sequence
 */
export function generateNumberSequenceForState(
  num1: number,
  num2: number,
  questionPart: number,
  operation: Operation,
  maxNumber: number = 10
): number[] {
  const sequence: number[] = [];

  // Determine which number is being asked for and generate appropriate sequence
  // For multiplication/division: we need the multiplication table of the known factor
  // For addition/subtraction: we need a range around the known value

  if (operation === Operation.MULTIPLICATION) {
    // For multiplication, the sequence depends on what we're asking for:
    // - If asking for a FACTOR (questionPart 0 or 1): show simple sequence 1-10
    // - If asking for RESULT (questionPart 2): show multiples of one factor

    if (questionPart === 2) {
      // Asking for result: num1 × num2 = ?
      // Show multiples of num1: num1×1, num1×2, ..., num1×10
      const base = num1;
      for (let i = 1; i <= 10; i++) {
        sequence.push(base * i);
      }
    } else {
      // Asking for a factor: ? × num2 = result OR num1 × ? = result
      // Show simple sequence: 1 to min(10, maxNumber)
      const limit = Math.min(10, maxNumber);
      for (let i = 1; i <= limit; i++) {
        sequence.push(i);
      }
    }
  } else if (operation === Operation.ADDITION) {
    // For addition:
    // - If asking for ADDEND (questionPart 0 or 1): show simple sequence 1-10
    // - If asking for SUM (questionPart 2): show range around the CORRECT ANSWER

    if (questionPart === 2) {
      // Asking for sum: num1 + num2 = ?
      // Show range around correct answer: (result-4) to (result+5)
      const correctAnswer = num1 + num2;
      const startValue = Math.max(1, correctAnswer - 4);

      for (let i = 0; i < 10; i++) {
        sequence.push(startValue + i);
      }
    } else {
      // Asking for an addend: ? + num2 = result OR num1 + ? = result
      // Show simple sequence: 1 to min(10, maxNumber)
      const limit = Math.min(10, maxNumber);
      for (let i = 1; i <= limit; i++) {
        sequence.push(i);
      }
    }
  } else if (operation === Operation.SUBTRACTION) {
    // For subtraction:
    // - If asking for MINUEND or SUBTRAHEND (questionPart 0 or 1): show simple sequence 1-10
    // - If asking for DIFFERENCE (questionPart 2): show range around the CORRECT ANSWER

    if (questionPart === 2) {
      // Asking for difference: num1 - num2 = ?
      // Show range around correct answer: (result-4) to (result+5)
      const correctAnswer = num1 - num2;
      const startValue = Math.max(1, correctAnswer - 4);

      for (let i = 0; i < 10; i++) {
        sequence.push(startValue + i);
      }
    } else {
      // Asking for minuend or subtrahend: ? - num2 = result OR num1 - ? = result
      // Show simple sequence: 1 to min(10, maxNumber)
      const limit = Math.min(10, maxNumber);
      for (let i = 1; i <= limit; i++) {
        sequence.push(i);
      }
    }
  } else if (operation === Operation.DIVISION) {
    // For division, all question types should show simple sequence 1-10
    // since we're always looking for a factor or quotient (both in range 1-10)

    if (questionPart === 0) {
      // Asking for dividend: ? ÷ num2 = result
      // The dividend = divisor × quotient, so show multiples of num2
      const base = num2;
      for (let i = 1; i <= 10; i++) {
        sequence.push(base * i);
      }
    } else {
      // Asking for divisor OR quotient: num1 ÷ ? = result OR num1 ÷ num2 = ?
      // Both divisor and quotient are in range 1 to min(10, maxNumber)
      // Show simple sequence
      const limit = Math.min(10, maxNumber);
      for (let i = 1; i <= limit; i++) {
        sequence.push(i);
      }
    }
  }

  return sequence;
}

export function useGameLogic({
  initialOperation,
  initialOperations,
  initialTotalSolvedTasks,
  onTotalSolvedTasksChange,
  onMotivationShow,
  numberRange,
  challengeHighScore = 0,
  onChallengeHighScoreChange,
}: UseGameLogicProps) {
  // Helper: Get max number based on number range
  const getMaxNumber = (range: NumberRange = numberRange) => {
    switch (range) {
      case NumberRange.RANGE_10:
        return 10;
      case NumberRange.RANGE_20:
        return 20;
      case NumberRange.RANGE_50:
        return 50;
      case NumberRange.RANGE_100:
        return 100;
      default:
        return 10;
    }
  };

  const maxNumber = getMaxNumber();
  // Use initialOperations if provided, otherwise fallback to single initialOperation
  const selectedOps = initialOperations && initialOperations.length > 0
    ? initialOperations
    : [initialOperation || Operation.MULTIPLICATION];

  const [gameState, setGameState] = useState<GameState>({
    num1: 1,
    num2: 1,
    userAnswer: '',
    score: 0,
    currentTask: 1,
    totalTasks: TOTAL_TASKS,
    gameMode: GameMode.NORMAL,
    operation: selectedOps[0],
    selectedOperations: new Set(selectedOps),
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
    
    switch (gameState.operation) {
      case Operation.ADDITION:
        result = gameState.num1 + gameState.num2;
        break;
      case Operation.SUBTRACTION:
        result = gameState.num1 - gameState.num2;
        break;
      case Operation.MULTIPLICATION:
        result = gameState.num1 * gameState.num2;
        break;
      case Operation.DIVISION:
        result = gameState.num1 / gameState.num2;
        break;
      default:
        result = 0;
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

  // Generate a new question with proper number generation for each operation
  const generateQuestion = (mode: GameMode = gameState.gameMode, operationSet: Set<Operation> = gameState.selectedOperations, overrideMaxNumber?: number) => {
    // Pick a random operation from selected operations
    const operations = Array.from(operationSet);
    const selectedOp = operations[Math.floor(Math.random() * operations.length)];

    let newNum1: number;
    let newNum2: number;
    const effectiveMaxNumber = overrideMaxNumber ?? maxNumber;

    // Generate appropriate numbers based on operation
    // IMPORTANT: ALL numbers (operands AND results) must be within numberRange
    switch (selectedOp) {
      case Operation.ADDITION:
        // For addition: ensure sum (num1 + num2) is within range
        // Strategy: Pick num1, then num2 such that sum <= effectiveMaxNumber
        newNum1 = Math.floor(Math.random() * (effectiveMaxNumber - 1)) + 1; // 1 to effectiveMaxNumber-1
        const maxNum2ForAddition = effectiveMaxNumber - newNum1; // Ensure sum <= effectiveMaxNumber
        newNum2 = Math.floor(Math.random() * maxNum2ForAddition) + 1; // 1 to (effectiveMaxNumber - num1)
        break;

      case Operation.MULTIPLICATION:
        // For multiplication: ensure product (num1 * num2) is within range
        // Strategy: Pick smaller factor from 1-10 (pedagogy), then ensure product <= effectiveMaxNumber
        const maxFirstFactor = Math.min(10, effectiveMaxNumber);
        newNum1 = Math.floor(Math.random() * maxFirstFactor) + 1; // 1 to min(10, effectiveMaxNumber)
        const maxSecondFactor = Math.min(10, Math.floor(effectiveMaxNumber / newNum1)); // Ensure product <= effectiveMaxNumber
        newNum2 = Math.floor(Math.random() * maxSecondFactor) + 1;
        break;

      case Operation.SUBTRACTION:
        // For subtraction: ensure minuend, subtrahend AND difference are all within range
        // Strategy: Pick difference first, then subtrahend, calculate minuend
        const difference = Math.floor(Math.random() * (effectiveMaxNumber - 1)) + 1; // 1 to effectiveMaxNumber-1
        const maxSubtrahend = effectiveMaxNumber - difference; // Ensure minuend = subtrahend + difference <= effectiveMaxNumber
        newNum2 = Math.floor(Math.random() * maxSubtrahend) + 1; // subtrahend
        newNum1 = newNum2 + difference; // minuend = subtrahend + difference
        break;

      case Operation.DIVISION:
        // For division: ensure dividend, divisor AND quotient are all within range
        // Strategy: Pick divisor and quotient from range, calculate dividend
        const maxDivisor = Math.min(10, effectiveMaxNumber); // Keep divisor 1-10 for pedagogy
        newNum2 = Math.floor(Math.random() * maxDivisor) + 1; // divisor: 1 to min(10, effectiveMaxNumber)

        // Calculate max quotient ensuring dividend = divisor × quotient <= effectiveMaxNumber
        const maxQuotient = Math.min(10, Math.floor(effectiveMaxNumber / newNum2));
        const quotient = Math.floor(Math.random() * maxQuotient) + 1; // quotient: 1 to maxQuotient
        newNum1 = newNum2 * quotient; // dividend = divisor × quotient
        break;

      default:
        newNum1 = Math.floor(Math.random() * effectiveMaxNumber) + 1;
        newNum2 = Math.floor(Math.random() * effectiveMaxNumber) + 1;
    }
    
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
      num1: newNum1,
      num2: newNum2,
      operation: selectedOp,
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

    setGameState((prev) => {
      const newState: GameState = {
        ...prev,
        lastAnswerCorrect: isCorrect,
        score: newScore,
        isAnswerChecked: true,
      };

      // Challenge mode: update lives on wrong answer
      if (prev.difficultyMode === DifficultyMode.CHALLENGE && prev.challengeState && !isCorrect) {
        const newLives = prev.challengeState.lives - 1;
        const newErrors = prev.challengeState.errors + 1;
        newState.challengeState = {
          ...prev.challengeState,
          lives: newLives,
          errors: newErrors,
        };
        // Game over when no lives left
        if (newLives <= 0) {
          newState.showResult = true;
          // Update high score if beaten
          if (newScore > prev.challengeState.highScore) {
            newState.challengeState.highScore = newScore;
            onChallengeHighScoreChange?.(newScore);
          }
        }
      }

      // Challenge mode: update level on correct answer
      if (prev.difficultyMode === DifficultyMode.CHALLENGE && prev.challengeState && isCorrect) {
        const newLevel = getChallengeLevelNumber(newScore);
        newState.challengeState = {
          ...prev.challengeState,
          level: newLevel,
        };
      }

      return newState;
    });
  };

  // Next question
  const nextQuestion = () => {
    const isChallenge = gameState.difficultyMode === DifficultyMode.CHALLENGE;

    // In challenge mode, game over is handled by checkAnswer (lives === 0)
    if (isChallenge) {
      // If game is already over (showResult = true from checkAnswer), don't continue
      if (gameState.showResult) return;

      const newTotalSolvedTasks = gameState.totalSolvedTasks + 1;

      setGameState((prev) => ({
        ...prev,
        currentTask: prev.currentTask + 1,
        totalSolvedTasks: newTotalSolvedTasks,
      }));

      onTotalSolvedTasksChange(newTotalSolvedTasks);

      // Generate next question with challenge level settings
      const level = getChallengeLevel(gameState.score);
      const challengeOps = new Set(level.operations);
      const challengeMaxNumber = getMaxNumber(level.numberRange);

      setTimeout(() => generateQuestion(level.gameMode, challengeOps, challengeMaxNumber), 0);
      return;
    }

    // Normal/Creative mode: original logic
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
    if (gameState.difficultyMode === DifficultyMode.CHALLENGE) {
      // Restart challenge with fresh lives
      const newChallengeState: ChallengeState = {
        lives: CHALLENGE_MAX_LIVES,
        level: 1,
        errors: 0,
        highScore: gameState.challengeState?.highScore ?? challengeHighScore,
      };

      setGameState((prev) => ({
        ...prev,
        score: 0,
        currentTask: 1,
        showResult: false,
        challengeState: newChallengeState,
      }));

      const level1Ops = new Set([Operation.MULTIPLICATION]);
      setTimeout(() => generateQuestion(GameMode.NORMAL, level1Ops, 10), 0);
      return;
    }

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

  // Toggle operation selection (allow multiple operations)
  const toggleOperation = (operation: Operation) => {
    setGameState((prev) => {
      const newSelectedOperations = new Set(prev.selectedOperations);
      
      if (newSelectedOperations.has(operation)) {
        // Prevent deselecting the last operation
        if (newSelectedOperations.size === 1) {
          return prev; // Don't allow deselecting the last operation
        }
        newSelectedOperations.delete(operation);
      } else {
        newSelectedOperations.add(operation);
      }

      const newState = {
        ...prev,
        selectedOperations: newSelectedOperations,
        currentTask: 1,
        score: 0,
        showResult: false,
      };
      
      // Generate a new question with the updated operations
      setTimeout(() => generateQuestion(prev.gameMode, newSelectedOperations), 0);
      
      return newState;
    });
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

    if (newMode === DifficultyMode.CHALLENGE) {
      // Challenge: Start at level 1 with 3 lives
      newGameMode = GameMode.NORMAL;
      newAnswerMode = AnswerMode.INPUT;

      const initialChallengeState: ChallengeState = {
        lives: CHALLENGE_MAX_LIVES,
        level: 1,
        errors: 0,
        highScore: challengeHighScore,
      };

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
        challengeState: initialChallengeState,
      }));

      // Level 1 starts with multiplication only, range 10
      const level1Ops = new Set([Operation.MULTIPLICATION]);
      setTimeout(() => generateQuestion(newGameMode, level1Ops, 10), 0);
      return;
    }

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
      challengeState: undefined,
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
    return generateNumberSequenceForState(gameState.num1, gameState.num2, gameState.questionPart, gameState.operation, maxNumber);
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
  const operatorSymbol = () => {
    switch (gameState.operation) {
      case Operation.ADDITION:
        return '+';
      case Operation.SUBTRACTION:
        return '−';
      case Operation.MULTIPLICATION:
        return '×';
      case Operation.DIVISION:
        return '÷';
      default:
        return '?';
    }
  };

  return {
    gameState,
    generateQuestion,
    checkAnswer,
    nextQuestion,
    restartGame,
    continueGame,
    changeGameMode,
    toggleOperation,
    changeAnswerMode,
    changeDifficultyMode,
    handleNumberClick,
    handleChoiceClick,
    multipleChoices,
    numberSequence,
    operatorSymbol: operatorSymbol(),
    getCorrectAnswer,
  };
}
