/**
 * useTheme Hook
 * Manages theme state and system dark mode detection
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { ThemeMode, ThemeColors } from '../types/game';
import { getThemeColors } from '../utils/theme';

export function useTheme(initialTheme: ThemeMode = 'light') {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const [systemDarkMode, setSystemDarkMode] = useState(false);

  // Detect system dark mode (only on web)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)'); // platform-safe
      setSystemDarkMode(darkModeQuery.matches);

      const handler = (e: MediaQueryListEvent) => setSystemDarkMode(e.matches);
      darkModeQuery.addEventListener('change', handler);
      return () => darkModeQuery.removeEventListener('change', handler);
    }
  }, []);

  // Calculate effective dark mode
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && systemDarkMode);

  // Get theme colors
  const colors: ThemeColors = getThemeColors(isDarkMode);

  return {
    themeMode,
    setThemeMode,
    isDarkMode,
    colors,
  };
}
