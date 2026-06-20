/**
 * usePreferences Hook
 * Manages user preferences with auto-save and auto-load
 */

import { useState, useEffect, useRef } from 'react';
import { Language, ThemeMode, ThemeName, Operation, NumberRange } from '../types/game';
import {
  getLanguage,
  saveLanguage,
  getTheme,
  saveTheme,
  getThemeName,
  saveThemeName,
  getOperations,
  saveOperations,
  getTotalTasks,
  saveTotalTasks,
  getNumberRange,
  saveNumberRange,
  getChallengeHighScore,
  saveChallengeHighScore,
  getSoundsEnabled,
  saveSoundsEnabled,
  getSoundsVolume,
  saveSoundsVolume,
} from '../utils/storage';
import { getDeviceLanguage } from '../utils/language';

export function usePreferences(profileId?: string) {
  // Track current profileId in a ref so auto-save closures always use the latest value
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;

  const [language, setLanguage] = useState<Language>('en');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [themeName, setThemeName] = useState<ThemeName>('sunset');
  const [operations, setOperations] = useState<Operation[]>([Operation.MULTIPLICATION]);
  const [numberRange, setNumberRange] = useState<NumberRange>(NumberRange.RANGE_100);
  const [totalSolvedTasks, setTotalSolvedTasks] = useState(0);
  const [challengeHighScore, setChallengeHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(75);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load global preferences once on mount (language, theme, sounds are not per-profile)
  useEffect(() => {
    const loadGlobalPreferences = async () => {
      try {
        const savedLanguage = await getLanguage();
        if (savedLanguage) {
          setLanguage(savedLanguage);
        } else {
          const detectedLang = getDeviceLanguage();
          setLanguage(detectedLang);
        }
        const savedTheme = await getTheme();
        if (savedTheme) setThemeMode(savedTheme);
        const savedThemeName = await getThemeName();
        if (savedThemeName) setThemeName(savedThemeName);
        const savedSoundsEnabled = await getSoundsEnabled();
        if (savedSoundsEnabled !== null) setSoundEnabled(savedSoundsEnabled);
        const savedSoundsVolume = await getSoundsVolume();
        if (savedSoundsVolume !== null) setSoundVolume(savedSoundsVolume);
      } catch (error) {
        console.error('Failed to load global preferences:', error);
      }
    };
    loadGlobalPreferences();
  }, []);

  // Load per-profile preferences when profileId changes (also runs on mount)
  useEffect(() => {
    let cancelled = false;
    const pid = profileId;

    setIsLoaded(false);

    const loadProfilePreferences = async () => {
      try {
        const savedOperations = await getOperations(pid);
        if (!cancelled) setOperations(savedOperations);

        const savedTotalTasks = await getTotalTasks(pid);
        if (!cancelled && savedTotalTasks !== null) setTotalSolvedTasks(savedTotalTasks);
        else if (!cancelled) setTotalSolvedTasks(0);

        const savedNumberRange = await getNumberRange(pid);
        if (!cancelled) setNumberRange(savedNumberRange);

        const savedHighScore = await getChallengeHighScore(pid);
        if (!cancelled) setChallengeHighScore(savedHighScore);
      } catch (error) {
        console.error('Failed to load profile preferences:', error);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    };

    loadProfilePreferences();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  // Auto-save global preferences (not per-profile)
  useEffect(() => {
    if (isLoaded) saveLanguage(language);
  }, [language, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveTheme(themeMode);
  }, [themeMode, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveThemeName(themeName);
  }, [themeName, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveSoundsEnabled(soundEnabled);
  }, [soundEnabled, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveSoundsVolume(soundVolume);
  }, [soundVolume, isLoaded]);

  // Auto-save per-profile preferences (use ref so closures always write to active profile)
  useEffect(() => {
    if (isLoaded) saveOperations(operations, profileIdRef.current);
  }, [operations, isLoaded]);

  // Toggle operation in multi-select
  const toggleOperation = (op: Operation) => {
    setOperations((prev) => {
      const newOps = prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op];
      if (newOps.length === 0) return prev;
      return newOps;
    });
  };

  useEffect(() => {
    if (isLoaded) saveTotalTasks(totalSolvedTasks, profileIdRef.current);
  }, [totalSolvedTasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveNumberRange(numberRange, profileIdRef.current);
  }, [numberRange, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveChallengeHighScore(challengeHighScore, profileIdRef.current);
  }, [challengeHighScore, isLoaded]);

  return {
    language,
    setLanguage,
    themeMode,
    setThemeMode,
    themeName,
    setThemeName,
    operation: operations.length > 0 ? operations[0] : Operation.MULTIPLICATION,
    operations,
    setOperations,
    toggleOperation,
    numberRange,
    setNumberRange,
    totalSolvedTasks,
    setTotalSolvedTasks,
    challengeHighScore,
    setChallengeHighScore,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    isLoaded,
  };
}
