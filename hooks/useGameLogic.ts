/**
 * useGameLogic Hook
 * Manages all game state and logic
 */

import { useState, useMemo } from 'react';
import { GameMode, Operation, AnswerMode, DifficultyMode, GameState } from '../types/game';
import { TOTAL_TASKS, MAX_CHOICE_GENERATION_ATTEMPTS, MAX_RANDOM_ANSWER } from '../utils/constants';

interface UseGameLogicProps {
  initialOperation: Operation;
  initialTotalSolvedTasks: number;
  onTotalSolvedTasksChange: (total: number) => void;
  onMotivationShow: (score: number) => void;
}

export function useGameLogic({
  initialOperation,
  initialTotalSolvedTasks,
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
    operation: initialOperation,
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
    const result =
      gameState.operation === Operation.ADDITION
        ? gameState.num1 + gameState.num2
        : gameState.num1 * gameState.num2;

    switch (gameState.questionPart) {
      case 0:
        return gameState.num1;
      case 1:
        return gameState.num2;
      default:
        return result;
    }
  };

  // Generate a new question
  const generateQuestion = (mode: GameMode = gameState.gameMode) => {
    const newNum1 = Math.floor(Math.random() * 10) + 1;
    const newNum2 = Math.floor(Math.random() * 10) + 1;
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
    const isLastTask = gameState.currentTask >= gameState.totalTasks;
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

  // Change operation
  const changeOperation = (newOperation: Operation) => {
    setGameState((prev) => ({
      ...prev,
      operation: newOperation,
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
  const generateNumberSequence = () => {
    const sequence: number[] = [];

    // Determine the base number for the sequence
    let base;
    if (gameState.questionPart === 0) {
      base = gameState.num2;
    } else if (gameState.questionPart === 1) {
      base = gameState.num1;
    } else {
      // For result, use one of the factors
      base = gameState.num1;
    }

    // Generate sequence: base, 2*base, 3*base, ...
    for (let i = 1; i <= 10; i++) {
      sequence.push(base * i);
    }

    return sequence;
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
  const operatorSymbol = gameState.operation === Operation.ADDITION ? '+' : '×';

  return {
    gameState,
    generateQuestion,
    checkAnswer,
    nextQuestion,
    restartGame,
    changeGameMode,
    changeOperation,
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
