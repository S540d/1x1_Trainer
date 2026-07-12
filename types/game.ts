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
  PRACTICE = 'PRACTICE',
}

export enum NumberRange {
  RANGE_10 = 'RANGE_10', // 1-10
  RANGE_20 = 'RANGE_20', // 1-20
  RANGE_50 = 'RANGE_50', // 1-50
  RANGE_100 = 'RANGE_100', // 1-100
}

export interface ChallengeState {
  lives: number;
  level: number;
  errors: number;
  highScore: number;
  isNewHighScore?: boolean;
  // True once level 3 was reached while all lives were still intact —
  // basis for the challenge_no_errors badge (#253)
  flawlessLevel3?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeName = 'sunset' | 'ocean' | 'space' | 'forest' | 'candy';
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
  // Per-task result of the current round, indexed by task position (0-based).
  // null = not answered yet. Drives the segmented progress bar.
  answerHistory: (boolean | null)[];
}

export interface TaskStat {
  num1: number;
  num2: number;
  operation: Operation;
  correctCount: number;
  errorCount: number;
  lastSeen: string; // ISO date
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  operations: Operation[];
  totalTasks: number;
  correctTasks: number;
  errors: number;
  errorRate: number;
  difficultyMode: DifficultyMode;
  numberRange: NumberRange;
  // Challenge only: level 3 was reached with all lives intact (#253)
  challengeFlawlessLevel3?: boolean;
  // Wall-clock time spent on the round; absent on sessions recorded before #277
  durationMs?: number;
}

export interface AchievementBadge {
  id: string;
  unlockedAt: number;
}

export interface StreakData {
  currentStreak: number;
  lastPlayedDate: string; // YYYY-MM-DD (local date)
  longestStreak: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: string; // ISO date
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
  gradientPrimary: readonly [string, string];
}
