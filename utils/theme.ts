/**
 * Theme utilities for 1x1 Trainer
 */

import { ThemeColors } from '../types/game';
import { THEME_COLORS } from './constants';

/**
 * Get theme colors based on dark mode state
 */
export const getThemeColors = (isDarkMode: boolean): ThemeColors => {
  if (isDarkMode) {
    return {
      background: THEME_COLORS.DARK.BACKGROUND,
      text: THEME_COLORS.DARK.TEXT,
      textSecondary: THEME_COLORS.DARK.TEXT_SECONDARY,
      border: THEME_COLORS.DARK.BORDER,
      card: THEME_COLORS.DARK.CARD,
      cardCorrect: THEME_COLORS.DARK.CARD_CORRECT,
      cardIncorrect: THEME_COLORS.DARK.CARD_INCORRECT,
      buttonInactive: THEME_COLORS.DARK.BUTTON_INACTIVE,
      buttonInactiveText: THEME_COLORS.DARK.BUTTON_INACTIVE_TEXT,
      settingsOverlay: THEME_COLORS.DARK.SETTINGS_OVERLAY,
      settingsMenu: THEME_COLORS.DARK.SETTINGS_MENU,
    };
  } else {
    return {
      background: THEME_COLORS.LIGHT.BACKGROUND,
      text: THEME_COLORS.LIGHT.TEXT,
      textSecondary: THEME_COLORS.LIGHT.TEXT_SECONDARY,
      border: THEME_COLORS.LIGHT.BORDER,
      card: THEME_COLORS.LIGHT.CARD,
      cardCorrect: THEME_COLORS.LIGHT.CARD_CORRECT,
      cardIncorrect: THEME_COLORS.LIGHT.CARD_INCORRECT,
      buttonInactive: THEME_COLORS.LIGHT.BUTTON_INACTIVE,
      buttonInactiveText: THEME_COLORS.LIGHT.BUTTON_INACTIVE_TEXT,
      settingsOverlay: THEME_COLORS.LIGHT.SETTINGS_OVERLAY,
      settingsMenu: THEME_COLORS.LIGHT.SETTINGS_MENU,
    };
  }
};
