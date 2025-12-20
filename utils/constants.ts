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

// Theme Colors - "Soft & Modern" Design System
export const THEME_COLORS = {
  DARK: {
    BACKGROUND: '#0A0A0A', // Warmes Dunkelgrau statt pures Schwarz
    TEXT: '#F5F5F5', // Helleres Text für bessere Lesbarkeit
    TEXT_SECONDARY: '#B0B0B0',
    BORDER: '#404040', // Weichere Border-Farbe
    CARD: '#1A1A1A', // Wärmerer Ton
    CARD_CORRECT: '#2E7D32', // Satter Grün-Ton
    CARD_INCORRECT: '#C62828', // Satter Rot-Ton
    BUTTON_INACTIVE: '#252525', // Wärmerer Ton
    BUTTON_INACTIVE_TEXT: '#B0B0B0',
    SETTINGS_OVERLAY: 'rgba(0,0,0,0.7)',
    SETTINGS_MENU: '#1A1A1A',
  },
  LIGHT: {
    BACKGROUND: '#FAFAFA', // Cremeweiß statt pures Weiß
    TEXT: '#1A1A1A', // Weicheres Schwarz
    TEXT_SECONDARY: '#666',
    BORDER: '#E0E0E0',
    CARD: '#EFEFEF', // Weicherer Kontrast
    CARD_CORRECT: '#C8E6C9',
    CARD_INCORRECT: '#FFCDD2',
    BUTTON_INACTIVE: '#EFEFEF', // Weicherer Kontrast
    BUTTON_INACTIVE_TEXT: '#1A1A1A',
    SETTINGS_OVERLAY: 'rgba(0,0,0,0.5)',
    SETTINGS_MENU: '#FAFAFA',
  },
} as const;
