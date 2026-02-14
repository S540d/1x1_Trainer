/**
 * Application Constants for 1x1 Trainer
 */

import { GameMode, NumberRange, Operation } from '../types/game';

export const APP_VERSION = '1.1.0';

// Game Configuration
export const TOTAL_TASKS = 10;
export const MAX_CHOICE_GENERATION_ATTEMPTS = 100;
export const MAX_RANDOM_ANSWER = 100;

// Storage Keys
export const STORAGE_KEYS = {
  LANGUAGE: 'app-language',
  THEME: 'app-theme',
  OPERATION: 'app-operation',
  OPERATIONS: 'app-operations',
  TOTAL_TASKS: 'app-total-tasks',
  NUMBER_RANGE: 'app-number-range',
  CHALLENGE_HIGHSCORE: 'app-challenge-highscore',
} as const;

// Challenge Mode Configuration
export const CHALLENGE_MAX_LIVES = 3;

export interface ChallengeLevel {
  minScore: number;
  numberRange: NumberRange;
  gameMode: GameMode;
  operations: Operation[] | null; // null = use user's selected operations
}

export const CHALLENGE_LEVELS: ChallengeLevel[] = [
  { minScore: 0,  numberRange: NumberRange.RANGE_10,  gameMode: GameMode.NORMAL, operations: [Operation.MULTIPLICATION] },
  { minScore: 5,  numberRange: NumberRange.RANGE_10,  gameMode: GameMode.NORMAL, operations: null },
  { minScore: 10, numberRange: NumberRange.RANGE_20,  gameMode: GameMode.NORMAL, operations: null },
  { minScore: 15, numberRange: NumberRange.RANGE_20,  gameMode: GameMode.MIXED,  operations: null },
  { minScore: 20, numberRange: NumberRange.RANGE_50,  gameMode: GameMode.MIXED,  operations: null },
  { minScore: 30, numberRange: NumberRange.RANGE_100, gameMode: GameMode.MIXED,  operations: null },
];

/**
 * Get the current challenge level based on score
 */
export function getChallengeLevel(score: number): ChallengeLevel {
  let level = CHALLENGE_LEVELS[0];
  for (const l of CHALLENGE_LEVELS) {
    if (score >= l.minScore) {
      level = l;
    }
  }
  return level;
}

/**
 * Get the level number (1-based) for a given score
 */
export function getChallengeLevelNumber(score: number): number {
  let levelNum = 1;
  for (let i = 0; i < CHALLENGE_LEVELS.length; i++) {
    if (score >= CHALLENGE_LEVELS[i].minScore) {
      levelNum = i + 1;
    }
  }
  return levelNum;
}

// Theme Colors - "Modern Professional" Design System
// Inspired by contemporary design trends with clean, sophisticated tones
export const THEME_COLORS = {
  DARK: {
    BACKGROUND: '#0F1419', // Deep slate gray with cool undertone
    TEXT: '#E8EAED', // Crisp white with subtle warmth
    TEXT_SECONDARY: '#9AA0A6',
    BORDER: '#2D3748', // Modern slate border
    CARD: '#1A202C', // Rich charcoal
    CARD_CORRECT: '#10B981', // Modern emerald green
    CARD_INCORRECT: '#EF4444', // Contemporary red
    BUTTON_INACTIVE: '#1E293B', // Slate gray
    BUTTON_INACTIVE_TEXT: '#94A3B8',
    SETTINGS_OVERLAY: 'rgba(15,20,25,0.8)',
    SETTINGS_MENU: '#1A202C',
  },
  LIGHT: {
    BACKGROUND: '#F8FAFC', // Clean, crisp off-white
    TEXT: '#0F172A', // Deep professional navy
    TEXT_SECONDARY: '#475569',
    BORDER: '#CBD5E1',
    CARD: '#FFFFFF', // Pure white cards for clean look
    CARD_CORRECT: '#D1FAE5', // Soft mint green
    CARD_INCORRECT: '#FEE2E2', // Soft coral red
    BUTTON_INACTIVE: '#F1F5F9', // Light slate
    BUTTON_INACTIVE_TEXT: '#475569',
    SETTINGS_OVERLAY: 'rgba(15,23,42,0.6)',
    SETTINGS_MENU: '#FFFFFF',
  },
} as const;
