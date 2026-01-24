/**
 * Application Constants for 1x1 Trainer
 */

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
} as const;

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
