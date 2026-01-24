/**
 * Tests for useTheme Hook
 * Tests theme management, system dark mode detection, and color calculation
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTheme } from './useTheme';
import { Platform } from 'react-native';
import { ThemeMode } from '../types/game';

// Mock React Native Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn((obj) => obj.web),
}));

// Mock getThemeColors
jest.mock('../utils/theme', () => ({
  getThemeColors: jest.fn((isDarkMode: boolean) => ({
    background: isDarkMode ? '#0F1419' : '#F8FAFC',
    text: isDarkMode ? '#E5E7EB' : '#1F2937',
    card: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    primary: '#6200EE',
    cardCorrect: '#10B981',
    cardIncorrect: '#EF4444',
    textSecondary: isDarkMode ? '#9CA3AF' : '#6B7280',
    settingsOverlay: 'rgba(0,0,0,0.5)',
    settingsMenu: isDarkMode ? '#1F2937' : '#FFFFFF',
  })),
}));

describe('useTheme Hook', () => {
  let mockMatchMedia: jest.Mock;
  let mockAddEventListener: jest.Mock;
  let mockRemoveEventListener: jest.Mock;

  beforeEach(() => {
    // Reset Platform.OS to web for most tests
    (Platform as any).OS = 'web';

    // Mock matchMedia
    mockAddEventListener = jest.fn();
    mockRemoveEventListener = jest.fn();
    mockMatchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    // Setup window.matchMedia // platform-safe
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with light theme by default', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.themeMode).toBe('light');
      expect(result.current.isDarkMode).toBe(false);
    });

    it('should initialize with provided theme mode', () => {
      const { result } = renderHook(() => useTheme('dark'));

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDarkMode).toBe(true);
    });

    it('should initialize with system theme mode', () => {
      const { result } = renderHook(() => useTheme('system'));

      expect(result.current.themeMode).toBe('system');
    });
  });

  describe('Theme Mode Changes', () => {
    it('should update themeMode when initialTheme prop changes', async () => {
      const { result, rerender } = renderHook(
        ({ theme }) => useTheme(theme),
        { initialProps: { theme: 'light' as ThemeMode } }
      );

      expect(result.current.themeMode).toBe('light');

      rerender({ theme: 'dark' as ThemeMode });

      await waitFor(() => {
        expect(result.current.themeMode).toBe('dark');
      });
    });

    it('should calculate isDarkMode correctly for dark theme', () => {
      const { result } = renderHook(() => useTheme('dark'));

      expect(result.current.isDarkMode).toBe(true);
    });

    it('should calculate isDarkMode correctly for light theme', () => {
      const { result } = renderHook(() => useTheme('light'));

      expect(result.current.isDarkMode).toBe(false);
    });
  });

  describe('System Dark Mode Detection (Web)', () => {
    it('should detect system dark mode on web', async () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      const { result } = renderHook(() => useTheme('system'));

      await waitFor(() => {
        expect(result.current.isDarkMode).toBe(true);
      });
    });

    it('should detect system light mode on web', async () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      const { result } = renderHook(() => useTheme('system'));

      await waitFor(() => {
        expect(result.current.isDarkMode).toBe(false);
      });
    });

    it('should register system theme change listener', () => {
      renderHook(() => useTheme('system'));

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update isDarkMode when system theme changes', async () => {
      let changeHandler: (e: MediaQueryListEvent) => void;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      });

      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      const { result } = renderHook(() => useTheme('system'));

      expect(result.current.isDarkMode).toBe(false);

      // Simulate system theme change to dark
      act(() => {
        changeHandler!({ matches: true } as MediaQueryListEvent);
      });

      await waitFor(() => {
        expect(result.current.isDarkMode).toBe(true);
      });
    });

    it('should cleanup listener on unmount', () => {
      const { unmount } = renderHook(() => useTheme('system'));

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should handle missing window gracefully on non-web platforms', () => {
      // On non-web platforms, window might not be defined
      // The hook should still work without crashing
      (Platform as any).OS = 'ios';

      const { result } = renderHook(() => useTheme('system'));

      // Should default to light mode without system detection
      expect(result.current.isDarkMode).toBe(false);
      expect(result.current.themeMode).toBe('system');
    });

    it('should not setup listener when matchMedia is not available', () => {
      Object.defineProperty(window, 'matchMedia', { // platform-safe
        writable: true,
        value: undefined,
      });

      renderHook(() => useTheme('system'));

      expect(mockAddEventListener).not.toHaveBeenCalled();
    });
  });

  describe('System Dark Mode Detection (Mobile)', () => {
    it('should not setup listener on iOS', () => {
      (Platform as any).OS = 'ios';

      renderHook(() => useTheme('system'));

      expect(mockMatchMedia).not.toHaveBeenCalled();
      expect(mockAddEventListener).not.toHaveBeenCalled();
    });

    it('should not setup listener on Android', () => {
      (Platform as any).OS = 'android';

      renderHook(() => useTheme('system'));

      expect(mockMatchMedia).not.toHaveBeenCalled();
      expect(mockAddEventListener).not.toHaveBeenCalled();
    });

    it('should default to light mode on mobile when system theme is selected', () => {
      (Platform as any).OS = 'ios';

      const { result } = renderHook(() => useTheme('system'));

      expect(result.current.isDarkMode).toBe(false);
    });
  });

  describe('Color Calculation', () => {
    it('should return dark colors when isDarkMode is true', () => {
      const { result } = renderHook(() => useTheme('dark'));

      expect(result.current.colors.background).toBe('#0F1419');
      expect(result.current.colors.text).toBe('#E5E7EB');
    });

    it('should return light colors when isDarkMode is false', () => {
      const { result } = renderHook(() => useTheme('light'));

      expect(result.current.colors.background).toBe('#F8FAFC');
      expect(result.current.colors.text).toBe('#1F2937');
    });

    it('should have all required color properties', () => {
      const { result } = renderHook(() => useTheme('light'));

      expect(result.current.colors).toHaveProperty('background');
      expect(result.current.colors).toHaveProperty('text');
      expect(result.current.colors).toHaveProperty('card');
      expect(result.current.colors).toHaveProperty('border');
      expect(result.current.colors).toHaveProperty('primary');
      expect(result.current.colors).toHaveProperty('cardCorrect');
      expect(result.current.colors).toHaveProperty('cardIncorrect');
      expect(result.current.colors).toHaveProperty('textSecondary');
      expect(result.current.colors).toHaveProperty('settingsOverlay');
      expect(result.current.colors).toHaveProperty('settingsMenu');
    });
  });

  describe('Theme Mode with System Detection', () => {
    it('should respect explicit dark theme even if system is light', () => {
      mockMatchMedia.mockReturnValue({
        matches: false, // System is light
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      const { result } = renderHook(() => useTheme('dark'));

      expect(result.current.isDarkMode).toBe(true);
    });

    it('should respect explicit light theme even if system is dark', () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // System is dark
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      const { result } = renderHook(() => useTheme('light'));

      expect(result.current.isDarkMode).toBe(false);
    });

    it('should follow system preference when theme is system', async () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // System is dark
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      const { result } = renderHook(() => useTheme('system'));

      await waitFor(() => {
        expect(result.current.isDarkMode).toBe(true);
      });
    });
  });

  describe('Return Values', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useTheme('light'));

      expect(result.current).toHaveProperty('themeMode');
      expect(result.current).toHaveProperty('setThemeMode');
      expect(result.current).toHaveProperty('isDarkMode');
      expect(result.current).toHaveProperty('colors');
    });

    it('should provide setThemeMode function', () => {
      const { result } = renderHook(() => useTheme('light'));

      expect(typeof result.current.setThemeMode).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme mode changes', async () => {
      const { result, rerender } = renderHook(
        ({ theme }) => useTheme(theme),
        { initialProps: { theme: 'light' as ThemeMode } }
      );

      rerender({ theme: 'dark' as ThemeMode });
      rerender({ theme: 'system' as ThemeMode });
      rerender({ theme: 'light' as ThemeMode });

      await waitFor(() => {
        expect(result.current.themeMode).toBe('light');
      });
    });

    it('should handle system theme changes while in explicit theme mode', async () => {
      let changeHandler: (e: MediaQueryListEvent) => void;
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      });

      const { result } = renderHook(() => useTheme('dark'));

      // System changes to dark - should not affect explicit dark theme
      act(() => {
        if (changeHandler) {
          changeHandler({ matches: true } as MediaQueryListEvent);
        }
      });

      await waitFor(() => {
        expect(result.current.isDarkMode).toBe(true);
      });
    });
  });
});
