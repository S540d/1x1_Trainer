/**
 * usePreferences Hook
 * Manages user preferences with auto-save and auto-load
 */

import { useState, useEffect } from 'react';
import { Language, ThemeMode, Operation, NumberRange } from '../types/game';
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
import { getDeviceLanguage } from '../utils/language';

export function usePreferences() {
  const [language, setLanguage] = useState<Language>('en');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [operations, setOperations] = useState<Operation[]>([Operation.MULTIPLICATION]);
  const [numberRange, setNumberRange] = useState<NumberRange>(NumberRange.RANGE_100);
  const [totalSolvedTasks, setTotalSolvedTasks] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load language
        const savedLanguage = await getLanguage();
        if (savedLanguage) {
          setLanguage(savedLanguage);
        } else {
          // Auto-detect device language
          const detectedLang = getDeviceLanguage();
          setLanguage(detectedLang);
          // Language will be saved by the auto-save effect once isLoaded is true
        }

        // Load theme
        const savedTheme = await getTheme();
        if (savedTheme) {
          setThemeMode(savedTheme);
        }

        // Load operations
        const savedOperations = await getOperations();
        setOperations(savedOperations);

        // Load total solved tasks
        const savedTotalTasks = await getTotalTasks();
        if (savedTotalTasks !== null) {
          setTotalSolvedTasks(savedTotalTasks);
        }

        // Load number range (always returns a value, with migration)
        const savedNumberRange = await getNumberRange();
        setNumberRange(savedNumberRange);

        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        setIsLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  // Auto-save language
  useEffect(() => {
    if (isLoaded) {
      saveLanguage(language);
    }
  }, [language, isLoaded]);

  // Auto-save theme
  useEffect(() => {
    if (isLoaded) {
      saveTheme(themeMode);
    }
  }, [themeMode, isLoaded]);

  // Auto-save operations
  useEffect(() => {
    if (isLoaded) {
      saveOperations(operations);
    }
  }, [operations, isLoaded]);

  // Toggle operation in multi-select
  const toggleOperation = (op: Operation) => {
    setOperations(prev => {
      const newOps = prev.includes(op)
        ? prev.filter(o => o !== op)
        : [...prev, op];

      // Ensure at least one operation is always enabled
      if (newOps.length === 0) return prev;

      return newOps;
    });
  };

  // Auto-save total solved tasks
  useEffect(() => {
    if (isLoaded) {
      saveTotalTasks(totalSolvedTasks);
    }
  }, [totalSolvedTasks, isLoaded]);

  // Auto-save number range
  useEffect(() => {
    if (isLoaded) {
      saveNumberRange(numberRange);
    }
  }, [numberRange, isLoaded]);

  return {
    language,
    setLanguage,
    themeMode,
    setThemeMode,
    operation: operations.length > 0
      ? operations[0]
      : Operation.MULTIPLICATION, // First selected operation as primary
    operations,
    setOperations,
    toggleOperation,
    numberRange,
    setNumberRange,
    totalSolvedTasks,
    setTotalSolvedTasks,
    isLoaded,
  };
}
