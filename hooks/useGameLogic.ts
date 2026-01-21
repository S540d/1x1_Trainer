/**
 * useGameLogic Hook
 * Manages all game state and logic
 */

import { useState, useMemo } from 'react';
import { GameMode, Operation, AnswerMode, DifficultyMode, GameState } from '../types/game';
import { TOTAL_TASKS, MAX_CHOICE_GENERATION_ATTEMPTS, MAX_RANDOM_ANSWER } from '../utils/constants';

interface UseGameLogicProps {
  initialOperation: Operation;
  initialOperations?: Operation[]; // Optional: array of selected operations
  initialTotalSolvedTasks: number;
  onTotalSolvedTasksChange: (total: number) => void;
  onMotivationShow: (score: number) => void;
}

/**
 * Pure function to generate number sequence for NUMBER_SEQUENCE answer mode
 * Exported for testing purposes
 * @param num1 - First number in the operation
 * @param num2 - Second number in the operation
 * @param questionPart - Which part of the operation is being asked (0: num1, 1: num2, 2: result)
 * @param operation - Type of operation
 * @returns Array of 10 numbers forming the sequence
 */
export function generateNumberSequenceForState(
  num1: number,
  num2: number,
  questionPart: number,
  operation: Operation
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
      // Show simple sequence: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
      for (let i = 1; i <= 10; i++) {
        sequence.push(i);
      }
    }
  } else if (operation === Operation.ADDITION) {
    // For addition:
    // - If asking for ADDEND (questionPart 0 or 1): show simple sequence 1-10
    // - If asking for SUM (questionPart 2): show range num1+1 to num1+10

    if (questionPart === 2) {
      // Asking for sum: num1 + num2 = ?
      // Show: num1+1, num1+2, ..., num1+10
      const base = num1;
      for (let i = 1; i <= 10; i++) {
        sequence.push(base + i);
      }
    } else {
      // Asking for an addend: ? + num2 = result OR num1 + ? = result
      // Show simple sequence: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
      for (let i = 1; i <= 10; i++) {
        sequence.push(i);
      }
    }
  } else if (operation === Operation.SUBTRACTION) {
    // For subtraction:
    // - If asking for MINUEND or SUBTRAHEND (questionPart 0 or 1): show simple sequence 1-10
    // - If asking for DIFFERENCE (questionPart 2): show range around num1

    if (questionPart === 2) {
      // Asking for difference: num1 - num2 = ?
      // Show range around num1: base-4 to base+5
      const base = num1;
      for (let i = -4; i <= 5; i++) {
        const value = base + i;
        if (value > 0) {
          sequence.push(value);
        }
      }
      // Ensure we have exactly 10 values
      while (sequence.length < 10) {
        sequence.push(base + sequence.length);
      }
    } else {
      // Asking for minuend or subtrahend: ? - num2 = result OR num1 - ? = result
      // Show simple sequence: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
      for (let i = 1; i <= 10; i++) {
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
      // Both divisor and quotient are in range 1-10
      // Show simple sequence: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
      for (let i = 1; i <= 10; i++) {
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
}: UseGameLogicProps) {
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
  const generateQuestion = (mode: GameMode = gameState.gameMode, operationSet: Set<Operation> = gameState.selectedOperations) => {
    // Pick a random operation from selected operations
    const operations = Array.from(operationSet);
    const selectedOp = operations[Math.floor(Math.random() * operations.length)];
    
    let newNum1: number;
    let newNum2: number;
    
    // Generate appropriate numbers based on operation
    switch (selectedOp) {
      case Operation.ADDITION:
      case Operation.MULTIPLICATION:
        // For addition and multiplication: both numbers 1-10
        newNum1 = Math.floor(Math.random() * 10) + 1;
        newNum2 = Math.floor(Math.random() * 10) + 1;
        break;
        
      case Operation.SUBTRACTION:
        // For subtraction: ensure result is positive and at least 1
        // num1 should be larger than num2
        newNum2 = Math.floor(Math.random() * 9) + 1; // 1-9
        newNum1 = newNum2 + Math.floor(Math.random() * (10 - newNum2)) + 1; // num2+1 to 10
        break;
        
      case Operation.DIVISION:
        // For division: ensure clean division (no remainders)
        // First pick divisor (num2), then pick result, then calculate dividend (num1)
        newNum2 = Math.floor(Math.random() * 10) + 1; // divisor: 1-10
        const quotient = Math.floor(Math.random() * 10) + 1; // result: 1-10
        newNum1 = newNum2 * quotient; // dividend = divisor × quotient
        break;
        
      default:
        newNum1 = Math.floor(Math.random() * 10) + 1;
        newNum2 = Math.floor(Math.random() * 10) + 1;
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
