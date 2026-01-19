/**
 * usePreferences Hook
 * Manages user preferences with auto-save and auto-load
 */

import { useState, useEffect } from 'react';
import * as Localization from 'expo-localization';
import { Language, ThemeMode, Operation, NumberRange } from '../types/game';
import {
  getLanguage,
  saveLanguage,
  getTheme,
  saveTheme,
  getOperation,
  saveOperation,
  getTotalTasks,
  saveTotalTasks,
  getNumberRange,
  saveNumberRange,
} from '../utils/storage';

export function usePreferences() {
  const [language, setLanguage] = useState<Language>('en');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [operation, setOperation] = useState<Operation>(Operation.MULTIPLICATION);
  const [numberRange, setNumberRange] = useState<NumberRange>(NumberRange.LARGE);
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
          const locales = Localization.getLocales();
          const deviceLang = locales[0]?.languageCode || 'en';
          setLanguage(deviceLang === 'de' ? 'de' : 'en');
        }

        // Load theme
        const savedTheme = await getTheme();
        if (savedTheme) {
          setThemeMode(savedTheme);
        }

        // Load operation
        const savedOperation = await getOperation();
        if (savedOperation) {
          setOperation(savedOperation);
        }

        // Load total solved tasks
        const savedTotalTasks = await getTotalTasks();
        if (savedTotalTasks !== null) {
          setTotalSolvedTasks(savedTotalTasks);
        }

        // Load number range
        const savedNumberRange = await getNumberRange();
        if (savedNumberRange) {
          setNumberRange(savedNumberRange);
        }

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

  // Auto-save operation
  useEffect(() => {
    if (isLoaded) {
      saveOperation(operation);
    }
  }, [operation, isLoaded]);

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
    operation,
    setOperation,
    numberRange,
    setNumberRange,
    totalSolvedTasks,
    setTotalSolvedTasks,
    isLoaded,
  };
}
