/**
 * Tests for theme.ts
 * Phase 4: Utilities - Theme color selection
 */

import { getThemeColors } from './theme';
import { THEME_COLORS } from './constants';

describe('theme.ts - Theme Color Selection', () => {
  describe('Dark Mode Colors', () => {
    it('should return dark theme colors when isDarkMode is true', () => {
      const colors = getThemeColors(true);

      expect(colors).toEqual({
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
      });
    });

    it('should have valid dark mode background color', () => {
      const colors = getThemeColors(true);
      expect(colors.background).toBe('#0F1419');
      expect(colors.background).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should have valid dark mode text color', () => {
      const colors = getThemeColors(true);
      expect(colors.text).toBe('#E8EAED');
      expect(colors.text).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should have distinct correct and incorrect card colors', () => {
      const colors = getThemeColors(true);
      expect(colors.cardCorrect).not.toBe(colors.cardIncorrect);
      expect(colors.cardCorrect).toBe('#10B981');
      expect(colors.cardIncorrect).toBe('#EF4444');
    });
  });

  describe('Light Mode Colors', () => {
    it('should return light theme colors when isDarkMode is false', () => {
      const colors = getThemeColors(false);

      expect(colors).toEqual({
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
      });
    });

    it('should have valid light mode background color', () => {
      const colors = getThemeColors(false);
      expect(colors.background).toBe('#F0F4FF');
      expect(colors.background).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should have valid light mode text color', () => {
      const colors = getThemeColors(false);
      expect(colors.text).toBe('#0F172A');
      expect(colors.text).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should have distinct correct and incorrect card colors', () => {
      const colors = getThemeColors(false);
      expect(colors.cardCorrect).not.toBe(colors.cardIncorrect);
      expect(colors.cardCorrect).toBe('#ECFDF5');
      expect(colors.cardIncorrect).toBe('#FFF1F2');
    });
  });

  describe('Color Contrast and Accessibility', () => {
    it('should have different background colors for light and dark modes', () => {
      const lightColors = getThemeColors(false);
      const darkColors = getThemeColors(true);

      expect(lightColors.background).not.toBe(darkColors.background);
    });

    it('should have different text colors for light and dark modes', () => {
      const lightColors = getThemeColors(false);
      const darkColors = getThemeColors(true);

      expect(lightColors.text).not.toBe(darkColors.text);
    });

    it('should have all required color properties', () => {
      const colors = getThemeColors(false);

      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('text');
      expect(colors).toHaveProperty('textSecondary');
      expect(colors).toHaveProperty('border');
      expect(colors).toHaveProperty('card');
      expect(colors).toHaveProperty('cardCorrect');
      expect(colors).toHaveProperty('cardIncorrect');
      expect(colors).toHaveProperty('buttonInactive');
      expect(colors).toHaveProperty('buttonInactiveText');
      expect(colors).toHaveProperty('settingsOverlay');
      expect(colors).toHaveProperty('settingsMenu');
    });

    it('should return valid color strings for all properties', () => {
      const lightColors = getThemeColors(false);
      const darkColors = getThemeColors(true);

      // Check all colors are strings
      Object.values(lightColors).forEach((color) => {
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      });

      Object.values(darkColors).forEach((color) => {
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Consistency', () => {
    it('should return consistent colors for repeated calls with same input', () => {
      const colors1 = getThemeColors(true);
      const colors2 = getThemeColors(true);

      expect(colors1).toEqual(colors2);
    });

    it('should return consistent colors for false input', () => {
      const colors1 = getThemeColors(false);
      const colors2 = getThemeColors(false);

      expect(colors1).toEqual(colors2);
    });
  });
});
