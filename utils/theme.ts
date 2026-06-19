/**
 * Theme utilities for 1x1 Trainer
 */

import { ThemeColors, ThemeName } from '../types/game';
import { THEMES } from './constants';

export const getThemeColors = (
  isDarkMode: boolean,
  themeName: ThemeName = 'sunset'
): ThemeColors => {
  const theme = THEMES[themeName] ?? THEMES.sunset;
  const variant = isDarkMode ? theme.DARK : theme.LIGHT;
  return {
    background: variant.BACKGROUND,
    text: variant.TEXT,
    textSecondary: variant.TEXT_SECONDARY,
    border: variant.BORDER,
    card: variant.CARD,
    cardCorrect: variant.CARD_CORRECT,
    cardIncorrect: variant.CARD_INCORRECT,
    buttonInactive: variant.BUTTON_INACTIVE,
    buttonInactiveText: variant.BUTTON_INACTIVE_TEXT,
    settingsOverlay: variant.SETTINGS_OVERLAY,
    settingsMenu: variant.SETTINGS_MENU,
    gradientPrimary: variant.GRADIENT_PRIMARY,
  };
};
