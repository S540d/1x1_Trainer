import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Linking,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

enum GameMode {
  NORMAL = 'NORMAL',
  FIRST_MISSING = 'FIRST_MISSING',
  SECOND_MISSING = 'SECOND_MISSING',
  MIXED = 'MIXED',
}

enum Operation {
  ADDITION = 'ADDITION',
  MULTIPLICATION = 'MULTIPLICATION',
}

enum AnswerMode {
  INPUT = 'INPUT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  NUMBER_SEQUENCE = 'NUMBER_SEQUENCE',
}

type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'en' | 'de';

const APP_VERSION = '1.0.9';

const translations = {
  en: {
    // Settings Menu
    appearance: 'APPEARANCE',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'LANGUAGE',
    english: 'English',
    german: 'Deutsch',
    gameMode: 'GAME MODE',
    operation: 'OPERATION',
    addition: 'Addition',
    multiplication: 'Multiplication',
    answerMode: 'ANSWER MODE',
    inputMode: 'Number Input',
    multipleChoiceMode: 'Multiple Choice',
    numberSequenceMode: 'Number Sequence',
    feedback: 'Send Feedback',
    support: 'support me',
    about: 'ABOUT',
    version: 'Version',
    copyright: '© 2025 Sven Strohkark',
    license: 'License: MIT',
    // Game UI
    task: 'Task',
    points: 'Points',
    of: 'of',
    // Game Modes
    normalMode: 'Normal Tasks',
    firstMissing: 'First Number Missing',
    secondMissing: 'Second Number Missing',
    mixedMode: 'Mixed',
    // Buttons
    check: 'Check',
    nextQuestion: 'Next Question',
    playAgain: 'Play Again',
    // Results Modal
    great: 'Great!',
    youSolved: 'You solved',
    tasksCorrectly: 'tasks correctly',
    // Motivation Message
    motivationTitle: 'Great Progress!',
    motivationMessage: 'You have already solved 10 tasks. Let\'s try another round!',
    motivationButton: 'Continue',
  },
  de: {
    // Settings Menu
    appearance: 'ERSCHEINUNGSBILD',
    light: 'Hell',
    dark: 'Dunkel',
    system: 'System',
    language: 'SPRACHE',
    english: 'English',
    german: 'Deutsch',
    gameMode: 'SPIELMODUS',
    operation: 'RECHENART',
    addition: 'Addition',
    multiplication: 'Multiplikation',
    answerMode: 'ANTWORTMODUS',
    inputMode: 'Zahleneingabe',
    multipleChoiceMode: 'Auswahl',
    numberSequenceMode: 'Zahlenreihe',
    feedback: 'Feedback senden',
    support: 'support me',
    about: 'ÜBER',
    version: 'Version',
    copyright: '© 2025 Sven Strohkark',
    license: 'Lizenz: MIT',
    // Game UI
    task: 'Aufgabe',
    points: 'Punkte',
    of: 'von',
    // Game Modes
    normalMode: 'Normale Aufgaben',
    firstMissing: 'Erste Zahl fehlt',
    secondMissing: 'Zweite Zahl fehlt',
    mixedMode: 'Gemischt',
    // Buttons
    check: 'Prüfen',
    nextQuestion: 'Nächste Frage',
    playAgain: 'Nochmal spielen',
    // Results Modal
    great: 'Super!',
    youSolved: 'Du hast',
    tasksCorrectly: 'Aufgaben richtig gelöst',
    // Motivation Message
    motivationTitle: 'Toll gemacht!',
    motivationMessage: 'Du hast schon 10 Aufgaben gerechnet. Lass uns noch eine Runde versuchen!',
    motivationButton: 'Weiter',
  },
};

interface GameState {
  num1: number;
  num2: number;
  userAnswer: string;
  score: number;
  currentTask: number;
  totalTasks: number;
  gameMode: GameMode;
  operation: Operation;
  answerMode: AnswerMode;
  questionPart: number; // 0: num1, 1: num2, 2: result
  showResult: boolean;
  lastAnswerCorrect: boolean | null;
  isAnswerChecked: boolean;
  totalSolvedTasks: number; // Track total tasks solved for motivation message
  selectedChoice: number | null; // For multiple choice and number sequence modes
}

const TOTAL_TASKS = 10;
const MAX_CHOICE_GENERATION_ATTEMPTS = 100;
const MAX_RANDOM_ANSWER = 100;

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    num1: 1,
    num2: 1,
    userAnswer: '',
    score: 0,
    currentTask: 1,
    totalTasks: TOTAL_TASKS,
    gameMode: GameMode.NORMAL,
    operation: Operation.MULTIPLICATION,
    answerMode: AnswerMode.INPUT,
    questionPart: 2,
    showResult: false,
    lastAnswerCorrect: null,
    isAnswerChecked: false,
    totalSolvedTasks: 0,
    selectedChoice: null,
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [systemDarkMode, setSystemDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showMotivation, setShowMotivation] = useState(false);
  const t = translations[language];

  // Calculate effective dark mode
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && systemDarkMode);

  // Dynamic colors based on theme
  const colors = {
    background: isDarkMode ? '#121212' : '#fff',
    text: isDarkMode ? '#E0E0E0' : '#000',
    textSecondary: isDarkMode ? '#B0B0B0' : '#666',
    border: isDarkMode ? '#333' : '#E0E0E0',
    card: isDarkMode ? '#1E1E1E' : '#f5f5f5',
    cardCorrect: isDarkMode ? '#1B5E20' : '#C8E6C9',
    cardIncorrect: isDarkMode ? '#B71C1C' : '#FFCDD2',
    buttonInactive: isDarkMode ? '#2C2C2C' : '#E0E0E0',
    buttonInactiveText: isDarkMode ? '#B0B0B0' : '#000',
    settingsOverlay: 'rgba(0,0,0,0.7)',
    settingsMenu: isDarkMode ? '#1E1E1E' : '#fff',
  };

  // Load preferences and detect system theme on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load language from storage
        let savedLanguage: string | null = null;
        if (Platform.OS === 'web') {
          savedLanguage = localStorage.getItem('app-language'); // platform-safe
        } else {
          savedLanguage = await AsyncStorage.getItem('app-language');
        }

        if (savedLanguage === 'en' || savedLanguage === 'de') {
          setLanguage(savedLanguage);
        } else {
          // Auto-detect device language
          const locales = Localization.getLocales();
          const deviceLang = locales[0]?.languageCode || 'en';
          setLanguage(deviceLang === 'de' ? 'de' : 'en');
        }

        // Load theme preference
        let savedTheme: string | null = null;
        if (Platform.OS === 'web') {
          savedTheme = localStorage.getItem('app-theme'); // platform-safe
        } else {
          savedTheme = await AsyncStorage.getItem('app-theme');
        }

        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeMode(savedTheme as ThemeMode);
        }

        // Load operation preference
        let savedOperation: string | null = null;
        if (Platform.OS === 'web') {
          savedOperation = localStorage.getItem('app-operation'); // platform-safe
        } else {
          savedOperation = await AsyncStorage.getItem('app-operation');
        }

        if (savedOperation === 'ADDITION' || savedOperation === 'MULTIPLICATION') {
          setGameState((prev) => ({ ...prev, operation: savedOperation as Operation }));
        }

        // Load total solved tasks
        let savedTotalTasks: string | null = null;
        if (Platform.OS === 'web') {
          savedTotalTasks = localStorage.getItem('app-total-tasks'); // platform-safe
        } else {
          savedTotalTasks = await AsyncStorage.getItem('app-total-tasks');
        }

        if (savedTotalTasks) {
          const totalTasks = parseInt(savedTotalTasks, 10);
          if (!isNaN(totalTasks)) {
            setGameState((prev) => ({ ...prev, totalSolvedTasks: totalTasks }));
          }
        }

        // Detect system dark mode (only on web)
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
          const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)'); // platform-safe
          setSystemDarkMode(darkModeQuery.matches);

          // Listen for changes
          const handler = (e: MediaQueryListEvent) => setSystemDarkMode(e.matches);
          darkModeQuery.addEventListener('change', handler);
          return () => darkModeQuery.removeEventListener('change', handler);
        }
      } catch (error) {
        // Fallback to English
        setLanguage('en');
      }
    };
    loadPreferences();
    generateQuestion();
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    const saveLanguage = async () => {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('app-language', language); // platform-safe
        } else {
          await AsyncStorage.setItem('app-language', language);
        }
      } catch (error) {
        // Ignore storage errors
      }
    };
    saveLanguage();
  }, [language]);

  // Save theme preference when it changes
  useEffect(() => {
    const saveTheme = async () => {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('app-theme', themeMode); // platform-safe
        } else {
          await AsyncStorage.setItem('app-theme', themeMode);
        }
      } catch (error) {
        // Ignore storage errors
      }
    };
    saveTheme();
  }, [themeMode]);

  // Save operation preference when it changes
  useEffect(() => {
    const saveOperation = async () => {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('app-operation', gameState.operation); // platform-safe
        } else {
          await AsyncStorage.setItem('app-operation', gameState.operation);
        }
      } catch (error) {
        // Ignore storage errors
      }
    };
    saveOperation();
  }, [gameState.operation]);

  // Save total solved tasks when it changes
  useEffect(() => {
    const saveTotalTasks = async () => {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('app-total-tasks', gameState.totalSolvedTasks.toString()); // platform-safe
        } else {
          await AsyncStorage.setItem('app-total-tasks', gameState.totalSolvedTasks.toString());
        }
      } catch (error) {
        // Ignore storage errors
      }
    };
    saveTotalTasks();
  }, [gameState.totalSolvedTasks]);

  const generateQuestion = (mode: GameMode = gameState.gameMode) => {
    const newNum1 = Math.floor(Math.random() * 10) + 1;
    const newNum2 = Math.floor(Math.random() * 10) + 1;
    let newQuestionPart = 2;

    switch (mode) {
      case GameMode.NORMAL:
        newQuestionPart = 2;
        break;
      case GameMode.FIRST_MISSING:
        newQuestionPart = 0;
        break;
      case GameMode.SECOND_MISSING:
        newQuestionPart = 1;
        break;
      case GameMode.MIXED:
        newQuestionPart = Math.floor(Math.random() * 3);
        break;
    }

    setGameState((prev) => ({
      ...prev,
      num1: newNum1,
      num2: newNum2,
      userAnswer: '',
      questionPart: newQuestionPart,
      lastAnswerCorrect: null,
      isAnswerChecked: false,
      selectedChoice: null,
    }));
  };

  const onUserInput = (input: string) => {
    if (!gameState.isAnswerChecked) {
      setGameState((prev) => ({
        ...prev,
        userAnswer: input,
        lastAnswerCorrect: null,
      }));
    }
  };

  const changeGameMode = (newMode: GameMode) => {
    setGameState((prev) => ({
      ...prev,
      gameMode: newMode,
      currentTask: 1,
      score: 0,
      showResult: false,
    }));
    setTimeout(() => generateQuestion(newMode), 0);
  };

  const changeOperation = (newOperation: Operation) => {
    setGameState((prev) => ({
      ...prev,
      operation: newOperation,
      currentTask: 1,
      score: 0,
      showResult: false,
    }));
    setTimeout(() => generateQuestion(), 0);
  };

  const changeAnswerMode = (newMode: AnswerMode) => {
    setGameState((prev) => ({
      ...prev,
      answerMode: newMode,
      currentTask: 1,
      score: 0,
      showResult: false,
      userAnswer: '',
      selectedChoice: null,
    }));
    setTimeout(() => generateQuestion(), 0);
  };

  const checkAnswer = () => {
    // Validate that user has provided an answer
    const hasInput = gameState.answerMode === AnswerMode.INPUT 
      ? gameState.userAnswer !== '' 
      : gameState.selectedChoice !== null;
    
    if (!hasInput) return;

    let correctAnswer = 0;
    const result = gameState.operation === Operation.ADDITION
      ? gameState.num1 + gameState.num2
      : gameState.num1 * gameState.num2;

    switch (gameState.questionPart) {
      case 0:
        correctAnswer = gameState.num1;
        break;
      case 1:
        correctAnswer = gameState.num2;
        break;
      default:
        correctAnswer = result;
    }

    let isCorrect = false;
    if (gameState.answerMode === AnswerMode.INPUT) {
      isCorrect = parseInt(gameState.userAnswer) === correctAnswer;
    } else {
      isCorrect = gameState.selectedChoice === correctAnswer;
    }

    const newScore = isCorrect ? gameState.score + 1 : gameState.score;

    setGameState((prev) => ({
      ...prev,
      lastAnswerCorrect: isCorrect,
      score: newScore,
      isAnswerChecked: true,
    }));
  };

  const nextQuestion = () => {
    if (gameState.currentTask < gameState.totalTasks) {
      const newTotalSolvedTasks = gameState.totalSolvedTasks + 1;
      setGameState((prev) => ({
        ...prev,
        currentTask: prev.currentTask + 1,
        totalSolvedTasks: newTotalSolvedTasks,
      }));

      // Show motivation message after every 10 tasks
      if (newTotalSolvedTasks > 0 && newTotalSolvedTasks % 10 === 0) {
        setShowMotivation(true);
      }

      setTimeout(() => generateQuestion(), 0);
    } else {
      setGameState((prev) => ({ ...prev, showResult: true }));
    }
  };

  const restartGame = () => {
    setGameState((prev) => ({
      ...prev,
      score: 0,
      currentTask: 1,
      showResult: false,
    }));
    setTimeout(() => generateQuestion(), 0);
  };

  const handleNumberClick = (num: number) => {
    let currentAnswer = gameState.userAnswer;
    if (num === -1) {
      currentAnswer = currentAnswer.slice(0, -1);
    } else if (num === -2) {
      currentAnswer = '';
    } else {
      currentAnswer += num.toString();
    }
    onUserInput(currentAnswer);
  };

  const handleChoiceClick = (value: number) => {
    if (!gameState.isAnswerChecked) {
      setGameState((prev) => ({
        ...prev,
        selectedChoice: value,
        lastAnswerCorrect: null,
      }));
    }
  };

  const getCorrectAnswer = () => {
    const result = gameState.operation === Operation.ADDITION
      ? gameState.num1 + gameState.num2
      : gameState.num1 * gameState.num2;

    switch (gameState.questionPart) {
      case 0:
        return gameState.num1;
      case 1:
        return gameState.num2;
      default:
        return result;
    }
  };

  const generateMultipleChoices = () => {
    const correctAnswer = getCorrectAnswer();
    const choices = [correctAnswer];
    
    // Generate two wrong answers
    let attempts = 0;
    while (choices.length < 3 && attempts < MAX_CHOICE_GENERATION_ATTEMPTS) {
      attempts++;
      let wrongAnswer;
      if (Math.random() < 0.5) {
        // Nearby wrong answer (but not the correct answer)
        // Generate offset range: -4 to 3 (inclusive), then adjust to exclude 0
        const offset = Math.floor(Math.random() * 8) - 4; // Generates -4, -3, -2, -1, 0, 1, 2, 3
        const adjustedOffset = offset >= 0 ? offset + 1 : offset; // Result: -4 to -1, 1 to 4 (excludes 0)
        wrongAnswer = correctAnswer + adjustedOffset;
      } else {
        // Random wrong answer
        wrongAnswer = Math.floor(Math.random() * MAX_RANDOM_ANSWER) + 1;
      }
      
      if (wrongAnswer > 0 && wrongAnswer !== correctAnswer && !choices.includes(wrongAnswer)) {
        choices.push(wrongAnswer);
      }
    }
    
    // Ensure we always have 3 choices - fallback if needed
    if (choices.length < 3) {
      const fallbacks = [correctAnswer + 1, correctAnswer + 2, correctAnswer - 1, correctAnswer - 2];
      for (const fallback of fallbacks) {
        if (fallback > 0 && fallback !== correctAnswer && !choices.includes(fallback)) {
          choices.push(fallback);
          if (choices.length === 3) break;
        }
      }
    }
    
    // Fisher-Yates shuffle
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    
    return choices;
  };

  const generateNumberSequence = () => {
    const sequence: number[] = [];
    
    // Determine the base number for the sequence
    let base;
    if (gameState.questionPart === 0) {
      base = gameState.num2;
    } else if (gameState.questionPart === 1) {
      base = gameState.num1;
    } else {
      // For result, use one of the factors
      base = gameState.num1;
    }
    
    // Generate sequence: base, 2*base, 3*base, ...
    for (let i = 1; i <= 10; i++) {
      sequence.push(base * i);
    }
    
    return sequence;
  };

  const getCardColor = () => {
    if (gameState.lastAnswerCorrect === true) return colors.cardCorrect;
    if (gameState.lastAnswerCorrect === false) return colors.cardIncorrect;
    return colors.card;
  };

  const operatorSymbol = gameState.operation === Operation.ADDITION ? '+' : '×';

  // Memoize choices and sequence to avoid recalculating on every render
  const multipleChoices = useMemo(() => {
    if (gameState.answerMode === AnswerMode.MULTIPLE_CHOICE) {
      return generateMultipleChoices();
    }
    return [];
  }, [gameState.num1, gameState.num2, gameState.questionPart, gameState.operation, gameState.answerMode]);

  const numberSequence = useMemo(() => {
    if (gameState.answerMode === AnswerMode.NUMBER_SEQUENCE) {
      return generateNumberSequence();
    }
    return [];
  }, [gameState.num1, gameState.num2, gameState.questionPart, gameState.operation, gameState.answerMode]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerScore, { color: colors.text }]}>
          {t.task}: {gameState.currentTask}/{gameState.totalTasks}
        </Text>
        <Text style={[styles.headerScore, { color: colors.text }]}>
          {t.points}: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{gameState.score}</Text>
        </Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.settingsButton}
          aria-label="Settings"
        >
          <Text style={styles.settingsButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Menu */}
      {menuVisible && (
        <>
          <TouchableOpacity
            style={[styles.settingsOverlay, { backgroundColor: colors.settingsOverlay }]}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <View style={[styles.settingsMenu, { backgroundColor: colors.settingsMenu }]}>
            <TouchableOpacity
              style={styles.settingsMenuCloseButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={[styles.settingsMenuCloseButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>

            {/* App Name */}
            <Text style={[styles.appName, { color: colors.text }]}>1x1 Trainer</Text>

            {/* Appearance Settings - Light/Dark/System */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.appearance}</Text>
              <View style={styles.themeToggle}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    themeMode === 'light' && styles.themeButtonActive,
                  ]}
                  onPress={() => setThemeMode('light')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      themeMode === 'light' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.light}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    themeMode === 'dark' && styles.themeButtonActive,
                  ]}
                  onPress={() => setThemeMode('dark')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      themeMode === 'dark' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.dark}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    themeMode === 'system' && styles.themeButtonActive,
                  ]}
                  onPress={() => setThemeMode('system')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      themeMode === 'system' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.system}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsDivider} />

            {/* Language Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.language}</Text>
              <View style={styles.themeToggle}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    language === 'en' && styles.themeButtonActive,
                  ]}
                  onPress={() => setLanguage('en')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      language === 'en' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.english}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    language === 'de' && styles.themeButtonActive,
                  ]}
                  onPress={() => setLanguage('de')}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      language === 'de' && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.german}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsDivider} />

            {/* Operation Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.operation}</Text>
              <View style={styles.themeToggle}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    gameState.operation === Operation.ADDITION && styles.themeButtonActive,
                  ]}
                  onPress={() => changeOperation(Operation.ADDITION)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      gameState.operation === Operation.ADDITION && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.addition}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    gameState.operation === Operation.MULTIPLICATION && styles.themeButtonActive,
                  ]}
                  onPress={() => changeOperation(Operation.MULTIPLICATION)}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      gameState.operation === Operation.MULTIPLICATION && styles.themeButtonTextActive,
                    ]}
                  >
                    {t.multiplication}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsDivider} />

            {/* Game Mode Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.gameMode}</Text>
              <View style={styles.gameModeGrid}>
                <TouchableOpacity
                  style={[
                    styles.gameModeSettingsButton,
                    gameState.gameMode === GameMode.NORMAL && styles.gameModeSettingsButtonActive,
                  ]}
                  onPress={() => changeGameMode(GameMode.NORMAL)}
                >
                  <Text
                    style={[
                      styles.gameModeSettingsButtonText,
                      gameState.gameMode === GameMode.NORMAL && styles.gameModeSettingsButtonTextActive,
                    ]}
                  >
                    {t.normalMode}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gameModeSettingsButton,
                    gameState.gameMode === GameMode.FIRST_MISSING && styles.gameModeSettingsButtonActive,
                  ]}
                  onPress={() => changeGameMode(GameMode.FIRST_MISSING)}
                >
                  <Text
                    style={[
                      styles.gameModeSettingsButtonText,
                      gameState.gameMode === GameMode.FIRST_MISSING && styles.gameModeSettingsButtonTextActive,
                    ]}
                  >
                    {t.firstMissing}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gameModeSettingsButton,
                    gameState.gameMode === GameMode.SECOND_MISSING && styles.gameModeSettingsButtonActive,
                  ]}
                  onPress={() => changeGameMode(GameMode.SECOND_MISSING)}
                >
                  <Text
                    style={[
                      styles.gameModeSettingsButtonText,
                      gameState.gameMode === GameMode.SECOND_MISSING && styles.gameModeSettingsButtonTextActive,
                    ]}
                  >
                    {t.secondMissing}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gameModeSettingsButton,
                    gameState.gameMode === GameMode.MIXED && styles.gameModeSettingsButtonActive,
                  ]}
                  onPress={() => changeGameMode(GameMode.MIXED)}
                >
                  <Text
                    style={[
                      styles.gameModeSettingsButtonText,
                      gameState.gameMode === GameMode.MIXED && styles.gameModeSettingsButtonTextActive,
                    ]}
                  >
                    {t.mixedMode}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsDivider} />

            {/* Answer Mode Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.answerMode}</Text>
              <View style={styles.gameModeGrid}>
                <TouchableOpacity
                  style={[
                    styles.gameModeSettingsButton,
                    gameState.answerMode === AnswerMode.INPUT && styles.gameModeSettingsButtonActive,
                  ]}
                  onPress={() => changeAnswerMode(AnswerMode.INPUT)}
                >
                  <Text
                    style={[
                      styles.gameModeSettingsButtonText,
                      gameState.answerMode === AnswerMode.INPUT && styles.gameModeSettingsButtonTextActive,
                    ]}
                  >
                    {t.inputMode}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gameModeSettingsButton,
                    gameState.answerMode === AnswerMode.MULTIPLE_CHOICE && styles.gameModeSettingsButtonActive,
                  ]}
                  onPress={() => changeAnswerMode(AnswerMode.MULTIPLE_CHOICE)}
                >
                  <Text
                    style={[
                      styles.gameModeSettingsButtonText,
                      gameState.answerMode === AnswerMode.MULTIPLE_CHOICE && styles.gameModeSettingsButtonTextActive,
                    ]}
                  >
                    {t.multipleChoiceMode}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.gameModeSettingsButton,
                    gameState.answerMode === AnswerMode.NUMBER_SEQUENCE && styles.gameModeSettingsButtonActive,
                  ]}
                  onPress={() => changeAnswerMode(AnswerMode.NUMBER_SEQUENCE)}
                >
                  <Text
                    style={[
                      styles.gameModeSettingsButtonText,
                      gameState.answerMode === AnswerMode.NUMBER_SEQUENCE && styles.gameModeSettingsButtonTextActive,
                    ]}
                  >
                    {t.numberSequenceMode}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingsDivider} />

            {/* Feedback and Support in One Row */}
            <View style={[styles.settingsSection, styles.settingsSectionRow]}>
              <TouchableOpacity
                style={styles.settingsMenuLinkFlex}
                onPress={() => {
                  Linking.openURL('mailto:devsven@posteo.de?subject=1x1 Trainer Feedback');
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.settingsMenuLinkText}>{t.feedback}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsMenuLinkFlex}
                onPress={() => {
                  Linking.openURL('https://ko-fi.com/devsven');
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.settingsMenuLinkText}>{t.support}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsDivider} />

            {/* About */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.about}</Text>
              <Text style={[styles.settingsAboutText, { color: colors.textSecondary }]}>{t.version} {APP_VERSION}</Text>
              <Text style={[styles.settingsAboutText, { color: colors.textSecondary }]}>{t.license}</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.contentArea}>
        <View style={[styles.questionCard, { backgroundColor: getCardColor() }]}>
          <View style={styles.questionRow}>
            {/* First number or answer box */}
            {gameState.questionPart === 0 ? (
              gameState.answerMode === AnswerMode.INPUT ? (
                <View style={[styles.answerBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.answerText, { color: colors.text }, gameState.userAnswer === '' && styles.answerPlaceholder]}>
                    {gameState.userAnswer || '?'}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.questionText, { color: colors.text }]}>?</Text>
              )
            ) : (
              <Text style={[styles.questionText, { color: colors.text }]}>
                {gameState.num1}
              </Text>
            )}

            {/* Operator */}
            <Text style={[styles.questionText, { color: colors.text }]}> {operatorSymbol} </Text>

            {/* Second number or answer box */}
            {gameState.questionPart === 1 ? (
              gameState.answerMode === AnswerMode.INPUT ? (
                <View style={[styles.answerBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.answerText, { color: colors.text }, gameState.userAnswer === '' && styles.answerPlaceholder]}>
                    {gameState.userAnswer || '?'}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.questionText, { color: colors.text }]}>?</Text>
              )
            ) : (
              <Text style={[styles.questionText, { color: colors.text }]}>
                {gameState.num2}
              </Text>
            )}

            {/* Equals sign */}
            <Text style={[styles.questionText, { color: colors.text }]}> = </Text>

            {/* Result or answer box */}
            {gameState.questionPart === 2 ? (
              gameState.answerMode === AnswerMode.INPUT ? (
                <View style={[styles.answerBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.answerText, { color: colors.text }, gameState.userAnswer === '' && styles.answerPlaceholder]}>
                    {gameState.userAnswer || '?'}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.questionText, { color: colors.text }]}>?</Text>
              )
            ) : (
              <Text style={[styles.questionText, { color: colors.text }]}>
                {gameState.operation === Operation.ADDITION
                  ? gameState.num1 + gameState.num2
                  : gameState.num1 * gameState.num2}
              </Text>
            )}
          </View>

          {/* Answer Input Area */}
          <View style={styles.answerArea}>
            {gameState.answerMode === AnswerMode.INPUT && (
              <Numpad
                onNumberClick={handleNumberClick}
                onCheck={gameState.isAnswerChecked ? nextQuestion : checkAnswer}
                userAnswer={gameState.userAnswer}
                isAnswerChecked={gameState.isAnswerChecked}
              />
            )}

            {gameState.answerMode === AnswerMode.MULTIPLE_CHOICE && (
              <View style={styles.choicesContainer}>
                {multipleChoices.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.choiceButton,
                      gameState.selectedChoice === choice && styles.choiceButtonSelected,
                      gameState.isAnswerChecked && choice === getCorrectAnswer() && styles.choiceButtonCorrect,
                      gameState.isAnswerChecked && gameState.selectedChoice === choice && choice !== getCorrectAnswer() && styles.choiceButtonIncorrect,
                    ]}
                    onPress={() => handleChoiceClick(choice)}
                    disabled={gameState.isAnswerChecked}
                  >
                    <Text style={[
                      styles.choiceButtonText,
                      gameState.selectedChoice === choice && styles.choiceButtonTextSelected,
                    ]}>
                      {choice}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    (gameState.selectedChoice === null && !gameState.isAnswerChecked) && styles.checkButtonDisabled,
                  ]}
                  onPress={gameState.isAnswerChecked ? nextQuestion : checkAnswer}
                  disabled={gameState.selectedChoice === null && !gameState.isAnswerChecked}
                >
                  <Text style={styles.checkButtonText}>
                    {gameState.isAnswerChecked ? t.nextQuestion : t.check}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {gameState.answerMode === AnswerMode.NUMBER_SEQUENCE && (
              <View style={styles.sequenceContainer}>
                <ScrollView style={styles.sequenceScroll}>
                  {numberSequence.map((num, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.sequenceButton,
                        gameState.selectedChoice === num && styles.sequenceButtonSelected,
                        gameState.isAnswerChecked && num === getCorrectAnswer() && styles.sequenceButtonCorrect,
                        gameState.isAnswerChecked && gameState.selectedChoice === num && num !== getCorrectAnswer() && styles.sequenceButtonIncorrect,
                      ]}
                      onPress={() => handleChoiceClick(num)}
                      disabled={gameState.isAnswerChecked}
                    >
                      <Text style={[
                        styles.sequenceButtonText,
                        gameState.selectedChoice === num && styles.sequenceButtonTextSelected,
                      ]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    (gameState.selectedChoice === null && !gameState.isAnswerChecked) && styles.checkButtonDisabled,
                  ]}
                  onPress={gameState.isAnswerChecked ? nextQuestion : checkAnswer}
                  disabled={gameState.selectedChoice === null && !gameState.isAnswerChecked}
                >
                  <Text style={styles.checkButtonText}>
                    {gameState.isAnswerChecked ? t.nextQuestion : t.check}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <Modal visible={gameState.showResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.settingsMenu }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.great}</Text>
            <Text style={[styles.modalText, { color: colors.text }]}>
              {t.youSolved} {gameState.score} {t.of} {gameState.totalTasks} {t.tasksCorrectly}.
            </Text>
            <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
              <Text style={styles.restartButtonText}>{t.playAgain}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Motivation Modal */}
      <Modal visible={showMotivation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.settingsMenu }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.motivationTitle}</Text>
            <Text style={[styles.modalText, { color: colors.text }]}>
              {t.motivationMessage}
            </Text>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={() => setShowMotivation(false)}
            >
              <Text style={styles.restartButtonText}>{t.motivationButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Numpad({
  onNumberClick,
  onCheck,
  userAnswer,
  isAnswerChecked
}: {
  onNumberClick: (num: number) => void;
  onCheck: () => void;
  userAnswer: string;
  isAnswerChecked: boolean;
}) {
  return (
    <View style={styles.numpad}>
      <View style={styles.numpadRow}>
        <NumpadButton text="1" onPress={() => onNumberClick(1)} />
        <NumpadButton text="2" onPress={() => onNumberClick(2)} />
        <NumpadButton text="3" onPress={() => onNumberClick(3)} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="4" onPress={() => onNumberClick(4)} />
        <NumpadButton text="5" onPress={() => onNumberClick(5)} />
        <NumpadButton text="6" onPress={() => onNumberClick(6)} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="7" onPress={() => onNumberClick(7)} />
        <NumpadButton text="8" onPress={() => onNumberClick(8)} />
        <NumpadButton text="9" onPress={() => onNumberClick(9)} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="←" onPress={() => onNumberClick(-1)} isSpecial />
        <NumpadButton text="0" onPress={() => onNumberClick(0)} />
        <TouchableOpacity
          style={[
            styles.numpadButtonCheck,
            userAnswer === '' && !isAnswerChecked && styles.numpadButtonCheckDisabled,
          ]}
          onPress={onCheck}
          disabled={userAnswer === '' && !isAnswerChecked}
        >
          <Text style={styles.numpadButtonCheckText}>
            {isAnswerChecked ? '→' : '✓'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NumpadButton({
  text,
  onPress,
  isSpecial = false,
}: {
  text: string;
  onPress: () => void;
  isSpecial?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.numpadButton, isSpecial && styles.numpadButtonSpecial]}
      onPress={onPress}
    >
      <Text style={styles.numpadButtonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerScore: {
    fontSize: 18,
    color: '#000',
  },
  settingsButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#6200EE',
  },
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  settingsMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    minWidth: 200,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
    overflow: 'hidden',
  },
  settingsMenuCloseButton: {
    padding: 12,
    alignItems: 'flex-end',
  },
  settingsMenuCloseButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  settingsMenuLink: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingsMenuLinkFlex: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingsMenuLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsSectionRow: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  themeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: '#6200EE',
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  themeButtonTextActive: {
    color: '#fff',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  settingsAboutText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 4,
  },
  gameModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gameModeSettingsButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  gameModeSettingsButtonActive: {
    backgroundColor: '#6200EE',
  },
  gameModeSettingsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  gameModeSettingsButtonTextActive: {
    color: '#fff',
  },
  questionCard: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  answerBox: {
    width: 120,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerText: {
    fontSize: 24,
  },
  answerPlaceholder: {
    color: '#999',
  },
  answerArea: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  numpad: {
    width: '100%',
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  numpadButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  numpadButtonSpecial: {
    backgroundColor: '#F5F5F5',
  },
  numpadButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  numpadButtonCheck: {
    flex: 1,
    height: 60,
    backgroundColor: '#03DAC6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00BFA5',
  },
  numpadButtonCheckDisabled: {
    backgroundColor: '#B0BEC5',
    borderColor: '#90A4AE',
  },
  numpadButtonCheckText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  choicesContainer: {
    width: '100%',
    gap: 12,
  },
  choiceButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  choiceButtonSelected: {
    backgroundColor: '#BBDEFB',
    borderColor: '#2196F3',
  },
  choiceButtonCorrect: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },
  choiceButtonIncorrect: {
    backgroundColor: '#FFCDD2',
    borderColor: '#F44336',
  },
  choiceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  choiceButtonTextSelected: {
    color: '#1976D2',
  },
  checkButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#03DAC6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  checkButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sequenceContainer: {
    width: '100%',
    flex: 1,
  },
  sequenceScroll: {
    flex: 1,
    marginBottom: 12,
  },
  sequenceButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  sequenceButtonSelected: {
    backgroundColor: '#BBDEFB',
    borderColor: '#2196F3',
  },
  sequenceButtonCorrect: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },
  sequenceButtonIncorrect: {
    backgroundColor: '#FFCDD2',
    borderColor: '#F44336',
  },
  sequenceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  sequenceButtonTextSelected: {
    color: '#1976D2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
