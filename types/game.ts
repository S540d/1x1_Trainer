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
}

export enum AnswerMode {
  INPUT = 'INPUT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  NUMBER_SEQUENCE = 'NUMBER_SEQUENCE',
}

export enum DifficultyMode {
  SIMPLE = 'SIMPLE',
  CREATIVE = 'CREATIVE',
}

export enum NumberRange {
  SMALL = 'SMALL',    // Up to 20 (1x-2x and addition up to 20)
  LARGE = 'LARGE',    // Up to 100 (full range)
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
  operation: Operation;
  enabledOperations: Operation[]; // User-selected operations for multi-select
  answerMode: AnswerMode;
  difficultyMode: DifficultyMode;
  questionPart: number; // 0: num1, 1: num2, 2: result
  showResult: boolean;
  lastAnswerCorrect: boolean | null;
  isAnswerChecked: boolean;
  totalSolvedTasks: number; // Track total tasks solved for motivation message
  selectedChoice: number | null; // For multiple choice and number sequence modes
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
