/**
 * Application Constants for 1x1 Trainer
 */

export const APP_VERSION = '1.0.10';

// Game Configuration
export const TOTAL_TASKS = 10;
export const MAX_CHOICE_GENERATION_ATTEMPTS = 100;
export const MAX_RANDOM_ANSWER = 100;

// Storage Keys
export const STORAGE_KEYS = {
  LANGUAGE: 'app-language',
  THEME: 'app-theme',
  OPERATION: 'app-operation',
  TOTAL_TASKS: 'app-total-tasks',
} as const;

// Theme Colors
export const THEME_COLORS = {
  DARK: {
    BACKGROUND: '#121212',
    TEXT: '#E0E0E0',
    TEXT_SECONDARY: '#B0B0B0',
    BORDER: '#333',
    CARD: '#1E1E1E',
    CARD_CORRECT: '#1B5E20',
    CARD_INCORRECT: '#B71C1C',
    BUTTON_INACTIVE: '#2C2C2C',
    BUTTON_INACTIVE_TEXT: '#B0B0B0',
    SETTINGS_OVERLAY: 'rgba(0,0,0,0.7)',
    SETTINGS_MENU: '#1E1E1E',
  },
  LIGHT: {
    BACKGROUND: '#fff',
    TEXT: '#000',
    TEXT_SECONDARY: '#666',
    BORDER: '#E0E0E0',
    CARD: '#f5f5f5',
    CARD_CORRECT: '#C8E6C9',
    CARD_INCORRECT: '#FFCDD2',
    BUTTON_INACTIVE: '#E0E0E0',
    BUTTON_INACTIVE_TEXT: '#000',
    SETTINGS_OVERLAY: 'rgba(0,0,0,0.7)',
    SETTINGS_MENU: '#fff',
  },
} as const;
