/**
 * Application Constants for 1x1 Trainer
 */

import { GameMode, NumberRange, Operation, ThemeName } from '../types/game';

export const APP_VERSION = '1.5.0';
export const APP_NAME = '1×1 Trainer';
export const CONTACT_EMAIL = 'devsven@posteo.de';

// Game Configuration
export const TOTAL_TASKS = 10;
export const MAX_CHOICE_GENERATION_ATTEMPTS = 100;
export const MAX_RANDOM_ANSWER = 100;

// Storage Keys
export const STORAGE_KEYS = {
  LANGUAGE: 'app-language',
  THEME: 'app-theme',
  THEME_NAME: 'app-theme-name',
  OPERATION: 'app-operation',
  OPERATIONS: 'app-operations',
  TOTAL_TASKS: 'app-total-tasks',
  NUMBER_RANGE: 'app-number-range',
  CHALLENGE_HIGHSCORE: 'app-challenge-highscore',
  PARENT_STATS: 'app-parent-stats',
  ONBOARDING_DONE: 'app-onboarding-done',
  TASK_STATS: 'app-task-stats',
  BADGES: 'app-badges',
  STREAK: 'app-streak',
  SOUNDS_ENABLED: 'app-sounds-enabled',
  SOUNDS_VOLUME: 'app-sounds-volume',
  PROFILES: 'app-profiles',
  ACTIVE_PROFILE_ID: 'app-active-profile-id',
  ROW_MASTERY: 'app-row-mastery',
  LERNREISE_INTRO_DONE: 'app-lernreise-intro-done',
} as const;

// Lernreise / Reihen-Meisterschaft (Issue #277 1a): one node per times table
export const LERNREISE_ROW_COUNT = 12;

export const AVATAR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
] as const;

export type BadgeCategory = 'streak' | 'performance' | 'challenge' | 'explorer';

export interface BadgeDefinition {
  id: string;
  icon: string;
  category: BadgeCategory;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'streak_3', icon: '🔥', category: 'streak' },
  { id: 'streak_7', icon: '🔥🔥', category: 'streak' },
  { id: 'streak_30', icon: '🔥🔥🔥', category: 'streak' },
  { id: 'perfect_1', icon: '⭐', category: 'performance' },
  { id: 'perfect_5', icon: '🌟', category: 'performance' },
  { id: 'all_operations', icon: '💎', category: 'performance' },
  { id: 'challenge_level_3', icon: '🏆', category: 'challenge' },
  { id: 'challenge_level_6', icon: '👑', category: 'challenge' },
  { id: 'challenge_no_errors', icon: '❤️', category: 'challenge' },
  { id: 'range_100', icon: '🔢', category: 'explorer' },
  { id: 'creative_mode', icon: '🎨', category: 'explorer' },
];

// Challenge Mode Configuration
export const CHALLENGE_MAX_LIVES = 3;

export interface ChallengeLevel {
  minScore: number;
  numberRange: NumberRange;
  gameMode: GameMode;
  operations: readonly Operation[];
}

const ALL_OPERATIONS: readonly Operation[] = Object.freeze([
  Operation.ADDITION,
  Operation.SUBTRACTION,
  Operation.MULTIPLICATION,
  Operation.DIVISION,
]);

export const CHALLENGE_LEVELS: ChallengeLevel[] = [
  {
    minScore: 0,
    numberRange: NumberRange.RANGE_10,
    gameMode: GameMode.NORMAL,
    operations: [Operation.MULTIPLICATION],
  },
  {
    minScore: 5,
    numberRange: NumberRange.RANGE_10,
    gameMode: GameMode.NORMAL,
    operations: ALL_OPERATIONS,
  },
  {
    minScore: 10,
    numberRange: NumberRange.RANGE_20,
    gameMode: GameMode.NORMAL,
    operations: ALL_OPERATIONS,
  },
  {
    minScore: 15,
    numberRange: NumberRange.RANGE_20,
    gameMode: GameMode.MIXED,
    operations: ALL_OPERATIONS,
  },
  {
    minScore: 20,
    numberRange: NumberRange.RANGE_50,
    gameMode: GameMode.MIXED,
    operations: ALL_OPERATIONS,
  },
  {
    minScore: 30,
    numberRange: NumberRange.RANGE_100,
    gameMode: GameMode.MIXED,
    operations: ALL_OPERATIONS,
  },
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
    BACKGROUND: '#F0F4FF', // Soft indigo-tinted white
    TEXT: '#0F172A', // Deep professional navy
    TEXT_SECONDARY: '#475569',
    BORDER: '#CBD5E1',
    CARD: '#FFFFFF', // Pure white cards for clean look
    CARD_CORRECT: '#ECFDF5', // Subtle emerald tint
    CARD_INCORRECT: '#FFF1F2', // Subtle rose tint
    BUTTON_INACTIVE: '#F1F5F9', // Light slate
    BUTTON_INACTIVE_TEXT: '#475569',
    SETTINGS_OVERLAY: 'rgba(15,23,42,0.6)',
    SETTINGS_MENU: '#FFFFFF',
  },
} as const;

type ThemeVariant = {
  BACKGROUND: string;
  TEXT: string;
  TEXT_SECONDARY: string;
  BORDER: string;
  CARD: string;
  CARD_CORRECT: string;
  CARD_INCORRECT: string;
  BUTTON_INACTIVE: string;
  BUTTON_INACTIVE_TEXT: string;
  SETTINGS_OVERLAY: string;
  SETTINGS_MENU: string;
  GRADIENT_PRIMARY: readonly [string, string];
};

const SHARED_LIGHT = {
  TEXT: '#0F172A',
  TEXT_SECONDARY: '#475569',
  CARD_CORRECT: '#ECFDF5',
  CARD_INCORRECT: '#FFF1F2',
  SETTINGS_OVERLAY: 'rgba(15,23,42,0.6)',
  SETTINGS_MENU: '#FFFFFF',
  CARD: '#FFFFFF',
} as const;

const SHARED_DARK = {
  TEXT: '#E8EAED',
  TEXT_SECONDARY: '#9AA0A6',
  CARD_CORRECT: '#10B981',
  CARD_INCORRECT: '#EF4444',
  SETTINGS_OVERLAY: 'rgba(15,20,25,0.8)',
} as const;

export const THEMES: Record<ThemeName, { label: string; LIGHT: ThemeVariant; DARK: ThemeVariant }> =
  {
    sunset: {
      label: '🍊 Sunset',
      LIGHT: {
        ...SHARED_LIGHT,
        BACKGROUND: '#F0F4FF',
        BORDER: '#CBD5E1',
        BUTTON_INACTIVE: '#F1F5F9',
        BUTTON_INACTIVE_TEXT: '#475569',
        GRADIENT_PRIMARY: ['#667eea', '#764ba2'],
      },
      DARK: {
        ...SHARED_DARK,
        BACKGROUND: '#0F1419',
        BORDER: '#2D3748',
        CARD: '#1A202C',
        BUTTON_INACTIVE: '#1E293B',
        BUTTON_INACTIVE_TEXT: '#94A3B8',
        SETTINGS_MENU: '#1A202C',
        GRADIENT_PRIMARY: ['#667eea', '#764ba2'],
      },
    },
    ocean: {
      label: '🌊 Ocean',
      LIGHT: {
        ...SHARED_LIGHT,
        BACKGROUND: '#F0FAFF',
        BORDER: '#BAE6FD',
        BUTTON_INACTIVE: '#E0F2FE',
        BUTTON_INACTIVE_TEXT: '#0369A1',
        GRADIENT_PRIMARY: ['#06b6d4', '#0284c7'],
      },
      DARK: {
        ...SHARED_DARK,
        BACKGROUND: '#062637',
        BORDER: '#0C4A6E',
        CARD: '#0C3549',
        BUTTON_INACTIVE: '#0C3549',
        BUTTON_INACTIVE_TEXT: '#7DD3FC',
        SETTINGS_MENU: '#0C3549',
        GRADIENT_PRIMARY: ['#06b6d4', '#0284c7'],
      },
    },
    space: {
      label: '🚀 Space',
      LIGHT: {
        ...SHARED_LIGHT,
        BACKGROUND: '#F5F3FF',
        BORDER: '#C4B5FD',
        BUTTON_INACTIVE: '#EDE9FE',
        BUTTON_INACTIVE_TEXT: '#5B21B6',
        GRADIENT_PRIMARY: ['#8B5CF6', '#4F46E5'],
      },
      DARK: {
        ...SHARED_DARK,
        BACKGROUND: '#0E0B1F',
        BORDER: '#3730A3',
        CARD: '#1A1435',
        BUTTON_INACTIVE: '#1A1435',
        BUTTON_INACTIVE_TEXT: '#A78BFA',
        SETTINGS_MENU: '#1A1435',
        GRADIENT_PRIMARY: ['#8B5CF6', '#4F46E5'],
      },
    },
    forest: {
      label: '🌿 Forest',
      LIGHT: {
        ...SHARED_LIGHT,
        BACKGROUND: '#F0FFF4',
        BORDER: '#86EFAC',
        BUTTON_INACTIVE: '#DCFCE7',
        BUTTON_INACTIVE_TEXT: '#15803D',
        GRADIENT_PRIMARY: ['#22c55e', '#15803d'],
      },
      DARK: {
        ...SHARED_DARK,
        BACKGROUND: '#0A1F10',
        BORDER: '#166534',
        CARD: '#132A1A',
        BUTTON_INACTIVE: '#132A1A',
        BUTTON_INACTIVE_TEXT: '#86EFAC',
        SETTINGS_MENU: '#132A1A',
        GRADIENT_PRIMARY: ['#22c55e', '#15803d'],
      },
    },
    candy: {
      label: '🩷 Candy',
      LIGHT: {
        ...SHARED_LIGHT,
        BACKGROUND: '#FFF0F7',
        BORDER: '#F9A8D4',
        BUTTON_INACTIVE: '#FCE7F3',
        BUTTON_INACTIVE_TEXT: '#BE185D',
        GRADIENT_PRIMARY: ['#ec4899', '#f43f5e'],
      },
      DARK: {
        ...SHARED_DARK,
        BACKGROUND: '#1F0A14',
        BORDER: '#831843',
        CARD: '#2D1020',
        BUTTON_INACTIVE: '#2D1020',
        BUTTON_INACTIVE_TEXT: '#F9A8D4',
        SETTINGS_MENU: '#2D1020',
        GRADIENT_PRIMARY: ['#ec4899', '#f43f5e'],
      },
    },
  };

export const DESIGN_TOKENS = {
  GRADIENT_PRIMARY: ['#667eea', '#764ba2'] as const,
  GRADIENT_CORRECT: ['#43e97b', '#38f9d7'] as const,
  GRADIENT_INCORRECT: ['#f857a6', '#ff5858'] as const,
  GRADIENT_GOLD: ['#f9d423', '#ff4e50'] as const,

  NUMPAD_CARD_BG: '#ffffff',
  NUMPAD_BUTTON_BG: '#f7f8ff',
  NUMPAD_BACKSPACE_BG: '#f0f4ff',
  NUMPAD_ICON_COLOR: '#764ba2',
  NUMPAD_BORDER_RADIUS: 28,
  NUMPAD_BUTTON_RADIUS: 16,

  CHOICE_BUTTON_BG: '#f7f8ff',
  CHOICE_SELECTED_BG: '#EEF2FF',
  CHOICE_SELECTED_BORDER: '#667eea',
  CHOICE_CORRECT_BG: '#ECFDF5',
  CHOICE_CORRECT_BORDER: '#43e97b',
  CHOICE_INCORRECT_BG: '#FFF1F2',
  CHOICE_INCORRECT_BORDER: '#f857a6',

  DOT_ACTIVE_COLOR: '#764ba2',
  DOT_INACTIVE_COLOR: '#CBD5E1',

  FONT_UI: 'Nunito_700Bold',
  FONT_NUMBER: 'Baloo2_700Bold',
} as const;
