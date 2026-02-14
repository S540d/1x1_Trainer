/**
 * Game Types and Enums for 1x1 Trainer
 */

export enum GameMode {
  NORMAL = 'NORMAL',
  FIRST_MISSING = 'FIRST_MISSING',
  SECOND_MISSING = 'SECOND_MISSING',
  MIXED = 'MIXED',
}

export enum Operation {
  ADDITION = 'ADDITION',
  SUBTRACTION = 'SUBTRACTION',
  MULTIPLICATION = 'MULTIPLICATION',
  DIVISION = 'DIVISION',
}

export enum AnswerMode {
  INPUT = 'INPUT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  NUMBER_SEQUENCE = 'NUMBER_SEQUENCE',
}

export enum DifficultyMode {
  SIMPLE = 'SIMPLE',
  CREATIVE = 'CREATIVE',
  CHALLENGE = 'CHALLENGE',
}

export enum NumberRange {
  RANGE_10 = 'RANGE_10',   // 1-10
  RANGE_20 = 'RANGE_20',   // 1-20
  RANGE_50 = 'RANGE_50',   // 1-50
  RANGE_100 = 'RANGE_100', // 1-100
}

export interface ChallengeState {
  lives: number;
  level: number;
  errors: number;
  highScore: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'de';

export interface GameState {
  num1: number;
  num2: number;
  userAnswer: string;
  score: number;
  currentTask: number;
  totalTasks: number;
  gameMode: GameMode;
  operation: Operation; // Current operation being used
  selectedOperations: Set<Operation>; // Operations that can be randomly selected
  answerMode: AnswerMode;
  difficultyMode: DifficultyMode;
  questionPart: number; // 0: num1, 1: num2, 2: result
  showResult: boolean;
  lastAnswerCorrect: boolean | null;
  isAnswerChecked: boolean;
  totalSolvedTasks: number; // Track total tasks solved for motivation message
  selectedChoice: number | null; // For multiple choice and number sequence modes
  challengeState?: ChallengeState; // Challenge mode state
}

export interface ThemeColors {
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  cardCorrect: string;
  cardIncorrect: string;
  buttonInactive: string;
  buttonInactiveText: string;
  settingsOverlay: string;
  settingsMenu: string;
}
