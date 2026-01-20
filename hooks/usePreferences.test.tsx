/**
 * Tests for usePreferences Hook
 * Phase 3: User preferences testing
 * - Language preference management
 * - Theme preference management
 * - Operation selection
 * - Number range selection
 * - Total solved tasks
 * - Loading state
 * - Auto-save behaviors
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePreferences } from './usePreferences';
import * as Localization from 'expo-localization';
import { Operation, NumberRange, Language, ThemeMode } from '../types/game';
import {
  getLanguage,
  saveLanguage,
  getTheme,
  saveTheme,
  getOperations,
  saveOperations,
  getTotalTasks,
  saveTotalTasks,
  getNumberRange,
  saveNumberRange,
} from '../utils/storage';

// Mock the storage module
jest.mock('../utils/storage', () => ({
  getLanguage: jest.fn(),
  saveLanguage: jest.fn(),
  getTheme: jest.fn(),
  saveTheme: jest.fn(),
  getOperations: jest.fn(),
  saveOperations: jest.fn(),
  getTotalTasks: jest.fn(),
  saveTotalTasks: jest.fn(),
  getNumberRange: jest.fn(),
  saveNumberRange: jest.fn(),
}));

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

describe('usePreferences Hook', () => {
  const mockGetLanguage = getLanguage as jest.MockedFunction<typeof getLanguage>;
  const mockSaveLanguage = saveLanguage as jest.MockedFunction<typeof saveLanguage>;
  const mockGetTheme = getTheme as jest.MockedFunction<typeof getTheme>;
  const mockSaveTheme = saveTheme as jest.MockedFunction<typeof saveTheme>;
  const mockGetOperations = getOperations as jest.MockedFunction<typeof getOperations>;
  const mockSaveOperations = saveOperations as jest.MockedFunction<typeof saveOperations>;
  const mockGetTotalTasks = getTotalTasks as jest.MockedFunction<typeof getTotalTasks>;
  const mockSaveTotalTasks = saveTotalTasks as jest.MockedFunction<typeof saveTotalTasks>;
  const mockGetNumberRange = getNumberRange as jest.MockedFunction<typeof getNumberRange>;
  const mockSaveNumberRange = saveNumberRange as jest.MockedFunction<typeof saveNumberRange>;
  const mockGetLocales = Localization.getLocales as jest.MockedFunction<typeof Localization.getLocales>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock implementations
    mockGetLanguage.mockResolvedValue(null);
    mockGetTheme.mockResolvedValue(null);
    mockGetOperations.mockResolvedValue([Operation.MULTIPLICATION]);
    mockGetTotalTasks.mockResolvedValue(null);
    mockGetNumberRange.mockResolvedValue(null);
    mockGetLocales.mockReturnValue([{ languageCode: 'en' } as any]);
  });

  describe('Initialization and Loading', () => {
    it('should start with isLoaded as false', () => {
      const { result } = renderHook(() => usePreferences());

      expect(result.current.isLoaded).toBe(false);
    });

    it('should set isLoaded to true after loading preferences', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });

    it('should load all preferences on mount', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(mockGetLanguage).toHaveBeenCalled();
      expect(mockGetTheme).toHaveBeenCalled();
      expect(mockGetOperations).toHaveBeenCalled();
      expect(mockGetTotalTasks).toHaveBeenCalled();
      expect(mockGetNumberRange).toHaveBeenCalled();
    });

    it('should initialize with default values when no saved preferences', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('en');
      expect(result.current.themeMode).toBe('light');
      expect(result.current.operations).toEqual([Operation.MULTIPLICATION]);
      expect(result.current.numberRange).toBe(NumberRange.LARGE);
      expect(result.current.totalSolvedTasks).toBe(0);
    });

    it('should set isLoaded to true even on error', async () => {
      mockGetLanguage.mockRejectedValue(new Error('Storage error'));

      // Mock console.error to avoid error output in tests
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load preferences:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Language Preference Management', () => {
    it('should detect system language (en) on first run', async () => {
      mockGetLocales.mockReturnValue([{ languageCode: 'en' } as any]);
      mockGetLanguage.mockResolvedValue(null);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('en');
      expect(mockGetLocales).toHaveBeenCalled();
    });

    it('should detect system language (de) on first run', async () => {
      mockGetLocales.mockReturnValue([{ languageCode: 'de' } as any]);
      mockGetLanguage.mockResolvedValue(null);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('de');
    });

    it('should default to en for unsupported language codes', async () => {
      mockGetLocales.mockReturnValue([{ languageCode: 'fr' } as any]);
      mockGetLanguage.mockResolvedValue(null);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('en');
    });

    it('should load saved language preference', async () => {
      mockGetLanguage.mockResolvedValue('de');

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('de');
    });

    it('should save language when changed by user', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.setLanguage('de');
      });

      await waitFor(() => {
        expect(mockSaveLanguage).toHaveBeenCalledWith('de');
      });
    });

    it('should not save language before isLoaded', async () => {
      const { result } = renderHook(() => usePreferences());

      expect(result.current.isLoaded).toBe(false);
      expect(mockSaveLanguage).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });

    it('should persist language across sessions', async () => {
      mockGetLanguage.mockResolvedValue('de');

      const { result: result1 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result1.current.isLoaded).toBe(true);
      });

      expect(result1.current.language).toBe('de');

      // Simulate a new session
      const { result: result2 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result2.current.isLoaded).toBe(true);
      });

      expect(result2.current.language).toBe('de');
    });
  });

  describe('Theme Preference Management', () => {
    it('should default to light theme when no saved preference', async () => {
      mockGetTheme.mockResolvedValue(null);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.themeMode).toBe('light');
    });

    it('should load saved theme preference (dark)', async () => {
      mockGetTheme.mockResolvedValue('dark');

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.themeMode).toBe('dark');
    });

    it('should load saved theme preference (system)', async () => {
      mockGetTheme.mockResolvedValue('system');

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.themeMode).toBe('system');
    });

    it('should allow user to override theme', async () => {
      mockGetTheme.mockResolvedValue('light');

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.setThemeMode('dark');
      });

      expect(result.current.themeMode).toBe('dark');
    });

    it('should save theme when changed by user', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.setThemeMode('dark');
      });

      await waitFor(() => {
        expect(mockSaveTheme).toHaveBeenCalledWith('dark');
      });
    });

    it('should not save theme before isLoaded', async () => {
      const { result } = renderHook(() => usePreferences());

      expect(result.current.isLoaded).toBe(false);
      expect(mockSaveTheme).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });

    it('should persist theme choice across sessions', async () => {
      mockGetTheme.mockResolvedValue('dark');

      const { result: result1 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result1.current.isLoaded).toBe(true);
      });

      expect(result1.current.themeMode).toBe('dark');

      const { result: result2 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result2.current.isLoaded).toBe(true);
      });

      expect(result2.current.themeMode).toBe('dark');
    });
  });

  describe('Operation Selection', () => {
    it('should load saved operations', async () => {
      mockGetOperations.mockResolvedValue([Operation.ADDITION, Operation.MULTIPLICATION]);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.operations).toEqual([
        Operation.ADDITION,
        Operation.MULTIPLICATION,
      ]);
    });

    it('should save operations when changed', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      const newOperations = [Operation.ADDITION, Operation.SUBTRACTION];

      act(() => {
        result.current.setOperations(newOperations);
      });

      await waitFor(() => {
        expect(mockSaveOperations).toHaveBeenCalledWith(newOperations);
      });
    });

    it('should toggle operation - add operation', async () => {
      mockGetOperations.mockResolvedValue([Operation.MULTIPLICATION]);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.toggleOperation(Operation.ADDITION);
      });

      expect(result.current.operations).toContain(Operation.ADDITION);
      expect(result.current.operations).toContain(Operation.MULTIPLICATION);
      expect(result.current.operations).toHaveLength(2);
    });

    it('should toggle operation - remove operation', async () => {
      mockGetOperations.mockResolvedValue([
        Operation.MULTIPLICATION,
        Operation.ADDITION,
      ]);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.toggleOperation(Operation.ADDITION);
      });

      expect(result.current.operations).toEqual([Operation.MULTIPLICATION]);
    });

    it('should prevent deselecting all operations (must keep at least 1)', async () => {
      mockGetOperations.mockResolvedValue([Operation.MULTIPLICATION]);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.toggleOperation(Operation.MULTIPLICATION);
      });

      // Should still have multiplication as it's the last one
      expect(result.current.operations).toEqual([Operation.MULTIPLICATION]);
      expect(result.current.operations).toHaveLength(1);
    });

    it('should save operations when toggled', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.toggleOperation(Operation.ADDITION);
      });

      await waitFor(() => {
        expect(mockSaveOperations).toHaveBeenCalled();
      });
    });

    it('should not save operations before isLoaded', async () => {
      const { result } = renderHook(() => usePreferences());

      expect(result.current.isLoaded).toBe(false);
      expect(mockSaveOperations).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });

    it('should persist operations across sessions', async () => {
      mockGetOperations.mockResolvedValue([
        Operation.ADDITION,
        Operation.SUBTRACTION,
      ]);

      const { result: result1 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result1.current.isLoaded).toBe(true);
      });

      expect(result1.current.operations).toEqual([
        Operation.ADDITION,
        Operation.SUBTRACTION,
      ]);

      const { result: result2 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result2.current.isLoaded).toBe(true);
      });

      expect(result2.current.operations).toEqual([
        Operation.ADDITION,
        Operation.SUBTRACTION,
      ]);
    });
  });

  describe('Number Range Selection', () => {
    it('should default to LARGE range when no saved preference', async () => {
      mockGetNumberRange.mockResolvedValue(null);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.numberRange).toBe(NumberRange.LARGE);
    });

    it('should load saved number range (SMALL)', async () => {
      mockGetNumberRange.mockResolvedValue(NumberRange.SMALL);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.numberRange).toBe(NumberRange.SMALL);
    });

    it('should load saved number range (LARGE)', async () => {
      mockGetNumberRange.mockResolvedValue(NumberRange.LARGE);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.numberRange).toBe(NumberRange.LARGE);
    });

    it('should save number range when changed', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.setNumberRange(NumberRange.SMALL);
      });

      await waitFor(() => {
        expect(mockSaveNumberRange).toHaveBeenCalledWith(NumberRange.SMALL);
      });
    });

    it('should not save number range before isLoaded', async () => {
      const { result } = renderHook(() => usePreferences());

      expect(result.current.isLoaded).toBe(false);
      expect(mockSaveNumberRange).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });

    it('should persist number range across sessions', async () => {
      mockGetNumberRange.mockResolvedValue(NumberRange.SMALL);

      const { result: result1 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result1.current.isLoaded).toBe(true);
      });

      expect(result1.current.numberRange).toBe(NumberRange.SMALL);

      const { result: result2 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result2.current.isLoaded).toBe(true);
      });

      expect(result2.current.numberRange).toBe(NumberRange.SMALL);
    });
  });

  describe('Total Solved Tasks', () => {
    it('should default to 0 when no saved value', async () => {
      mockGetTotalTasks.mockResolvedValue(null);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.totalSolvedTasks).toBe(0);
    });

    it('should load saved total tasks count', async () => {
      mockGetTotalTasks.mockResolvedValue(42);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.totalSolvedTasks).toBe(42);
    });

    it('should save total tasks when changed', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.setTotalSolvedTasks(100);
      });

      await waitFor(() => {
        expect(mockSaveTotalTasks).toHaveBeenCalledWith(100);
      });
    });

    it('should not save total tasks before isLoaded', async () => {
      const { result } = renderHook(() => usePreferences());

      expect(result.current.isLoaded).toBe(false);
      expect(mockSaveTotalTasks).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });

    it('should persist total tasks across sessions', async () => {
      mockGetTotalTasks.mockResolvedValue(25);

      const { result: result1 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result1.current.isLoaded).toBe(true);
      });

      expect(result1.current.totalSolvedTasks).toBe(25);

      const { result: result2 } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result2.current.isLoaded).toBe(true);
      });

      expect(result2.current.totalSolvedTasks).toBe(25);
    });
  });

  describe('Auto-save behavior', () => {
    it('should auto-save language after change', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      mockSaveLanguage.mockClear();

      act(() => {
        result.current.setLanguage('de');
      });

      await waitFor(() => {
        expect(mockSaveLanguage).toHaveBeenCalledWith('de');
      });
    });

    it('should auto-save theme after change', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      mockSaveTheme.mockClear();

      act(() => {
        result.current.setThemeMode('dark');
      });

      await waitFor(() => {
        expect(mockSaveTheme).toHaveBeenCalledWith('dark');
      });
    });

    it('should auto-save operations after change', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      mockSaveOperations.mockClear();

      act(() => {
        result.current.toggleOperation(Operation.ADDITION);
      });

      await waitFor(() => {
        expect(mockSaveOperations).toHaveBeenCalled();
      });
    });

    it('should auto-save number range after change', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      mockSaveNumberRange.mockClear();

      act(() => {
        result.current.setNumberRange(NumberRange.SMALL);
      });

      await waitFor(() => {
        expect(mockSaveNumberRange).toHaveBeenCalledWith(NumberRange.SMALL);
      });
    });

    it('should auto-save total tasks after change', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      mockSaveTotalTasks.mockClear();

      act(() => {
        result.current.setTotalSolvedTasks(15);
      });

      await waitFor(() => {
        expect(mockSaveTotalTasks).toHaveBeenCalledWith(15);
      });
    });

    it('should not trigger auto-save before isLoaded', async () => {
      // Track save calls before isLoaded becomes true
      let saveCallsBeforeLoad = 0;
      let isLoadedValue = false;

      mockSaveLanguage.mockImplementation(() => {
        if (!isLoadedValue) saveCallsBeforeLoad++;
        return Promise.resolve();
      });

      const { result } = renderHook(() => usePreferences());

      expect(result.current.isLoaded).toBe(false);

      await waitFor(() => {
        isLoadedValue = result.current.isLoaded;
        return result.current.isLoaded === true;
      });

      // No save calls should have been made before isLoaded became true
      expect(saveCallsBeforeLoad).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle language loading error gracefully', async () => {
      mockGetLanguage.mockRejectedValue(new Error('Storage error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load preferences:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle theme loading error gracefully', async () => {
      mockGetTheme.mockRejectedValue(new Error('Storage error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle operations loading error gracefully', async () => {
      mockGetOperations.mockRejectedValue(new Error('Storage error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle total tasks loading error gracefully', async () => {
      mockGetTotalTasks.mockRejectedValue(new Error('Storage error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle number range loading error gracefully', async () => {
      mockGetNumberRange.mockRejectedValue(new Error('Storage error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple preference changes in sequence', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.setLanguage('de');
      });

      act(() => {
        result.current.setThemeMode('dark');
      });

      act(() => {
        result.current.toggleOperation(Operation.ADDITION);
      });

      await waitFor(() => {
        expect(mockSaveLanguage).toHaveBeenCalledWith('de');
        expect(mockSaveTheme).toHaveBeenCalledWith('dark');
        expect(mockSaveOperations).toHaveBeenCalled();
      });
    });

    it('should maintain state consistency across preference changes', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.setLanguage('de');
        result.current.setThemeMode('dark');
        result.current.setNumberRange(NumberRange.SMALL);
      });

      expect(result.current.language).toBe('de');
      expect(result.current.themeMode).toBe('dark');
      expect(result.current.numberRange).toBe(NumberRange.SMALL);
    });

    it('should handle rapid preference changes', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.setLanguage('de');
        result.current.setLanguage('en');
        result.current.setLanguage('de');
      });

      await waitFor(() => {
        expect(result.current.language).toBe('de');
      });
    });

    it('should load all preferences correctly from storage', async () => {
      mockGetLanguage.mockResolvedValue('de');
      mockGetTheme.mockResolvedValue('dark');
      mockGetOperations.mockResolvedValue([Operation.ADDITION, Operation.SUBTRACTION]);
      mockGetTotalTasks.mockResolvedValue(50);
      mockGetNumberRange.mockResolvedValue(NumberRange.SMALL);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('de');
      expect(result.current.themeMode).toBe('dark');
      expect(result.current.operations).toEqual([Operation.ADDITION, Operation.SUBTRACTION]);
      expect(result.current.totalSolvedTasks).toBe(50);
      expect(result.current.numberRange).toBe(NumberRange.SMALL);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing locale data', async () => {
      mockGetLocales.mockReturnValue([]);
      mockGetLanguage.mockResolvedValue(null);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('en');
    });

    it('should handle locale without languageCode', async () => {
      mockGetLocales.mockReturnValue([{} as any]);
      mockGetLanguage.mockResolvedValue(null);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.language).toBe('en');
    });

    it('should handle zero total tasks', async () => {
      mockGetTotalTasks.mockResolvedValue(0);

      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.totalSolvedTasks).toBe(0);
    });

    it('should handle setting same value - effect triggers on each change', async () => {
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // Clear initial load saves
      mockSaveLanguage.mockClear();

      // Change to 'de'
      act(() => {
        result.current.setLanguage('de');
      });

      await waitFor(() => {
        expect(result.current.language).toBe('de');
      });

      expect(mockSaveLanguage).toHaveBeenCalledWith('de');
      expect(mockSaveLanguage).toHaveBeenCalledTimes(1);

      mockSaveLanguage.mockClear();

      // Change to 'en' 
      act(() => {
        result.current.setLanguage('en');
      });

      await waitFor(() => {
        expect(result.current.language).toBe('en');
      });

      // Should have been called again with the new value
      expect(mockSaveLanguage).toHaveBeenCalledWith('en');
      expect(mockSaveLanguage).toHaveBeenCalledTimes(1);
    });
  });
});
