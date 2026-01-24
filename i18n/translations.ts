/**
 * Translation strings for 1x1 Trainer
 * Supports: English (en), German (de)
 */

import { Language } from '../types/game';

export interface TranslationStrings {
  // Settings Menu
  appearance: string;
  light: string;
  dark: string;
  system: string;
  language: string;
  english: string;
  german: string;
  difficultyMode: string;
  simpleMode: string;
  creativeMode: string;
  simpleModeInfo: string;
  creativeModeInfo: string;
  gameMode: string;
  operation: string;
  addition: string;
  subtraction: string;
  multiplication: string;
  division: string;
  answerMode: string;
  inputMode: string;
  multipleChoiceMode: string;
  numberSequenceMode: string;
  personalize: string;
  numberRange: string;
  upTo10: string;
  upTo20: string;
  upTo50: string;
  upTo100: string;
  feedback: string;
  support: string;
  about: string;
  version: string;
  copyright: string;
  license: string;
  // Game UI
  task: string;
  points: string;
  of: string;
  // Game Modes
  normalMode: string;
  firstMissing: string;
  secondMissing: string;
  mixedMode: string;
  // Buttons
  check: string;
  nextQuestion: string;
  playAgain: string;
  newRound: string;
  continueGame: string;
  // Results Modal
  great: string;
  youSolved: string;
  tasksCorrectly: string;
  // Motivation Message
  motivationTitleLowScore: string;
  motivationMessageLowScore: string;
  motivationTitleMediumScore: string;
  motivationMessageMediumScore: string;
  motivationTitleHighScore: string;
  motivationMessageHighScore: string;
  motivationButton: string;
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    // Settings Menu
    appearance: 'APPEARANCE',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'LANGUAGE',
    english: 'English',
    german: 'Deutsch',
    difficultyMode: 'DIFFICULTY',
    simpleMode: 'Simple',
    creativeMode: 'Creative',
    simpleModeInfo: 'Enter the result via keypad',
    creativeModeInfo: 'Random input methods and question types',
    gameMode: 'GAME MODE',
    operation: 'OPERATION',
    addition: 'Addition',
    subtraction: 'Subtraction',
    multiplication: 'Multiplication',
    division: 'Division',
    answerMode: 'ANSWER MODE',
    inputMode: 'Number Input',
    multipleChoiceMode: 'Multiple Choice',
    numberSequenceMode: 'Number Sequence',
    personalize: 'Personalize',
    numberRange: 'NUMBER RANGE',
    upTo10: '1-10',
    upTo20: '1-20',
    upTo50: '1-50',
    upTo100: '1-100',
    feedback: 'Send Feedback',
    support: 'Support me',
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
    newRound: 'New Round',
    continueGame: 'Continue',
    // Results Modal
    great: 'Great!',
    youSolved: 'You solved',
    tasksCorrectly: 'tasks correctly',
    // Motivation Message
    motivationTitleLowScore: 'Keep Going!',
    motivationMessageLowScore: 'Don\'t give up! Practice makes perfect. Let\'s try again!',
    motivationTitleMediumScore: 'Almost There!',
    motivationMessageMediumScore: 'You\'re doing well! Just a bit more practice and you\'ll master it!',
    motivationTitleHighScore: 'Great!',
    motivationMessageHighScore: 'Excellent work! You have already solved 10 tasks. Let\'s try another round!',
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
    difficultyMode: 'SCHWIERIGKEIT',
    simpleMode: 'Einfach',
    creativeMode: 'Kreativ',
    simpleModeInfo: 'Das Ergebnis wird über die Tastatur eingegeben',
    creativeModeInfo: 'Zufällige Eingabemethoden und Fragetypen',
    gameMode: 'SPIELMODUS',
    operation: 'RECHENART',
    addition: 'Addition',
    subtraction: 'Subtraktion',
    multiplication: 'Multiplikation',
    division: 'Division',
    answerMode: 'ANTWORTMODUS',
    inputMode: 'Zahleneingabe',
    multipleChoiceMode: 'Auswahl',
    numberSequenceMode: 'Zahlenreihe',
    personalize: 'Personalisieren',
    numberRange: 'ZAHLENBEREICH',
    upTo10: '1-10',
    upTo20: '1-20',
    upTo50: '1-50',
    upTo100: '1-100',
    feedback: 'Feedback senden',
    support: 'Support me',
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
    newRound: 'Neue Runde',
    continueGame: 'Fortsetzen',
    // Results Modal
    great: 'Super!',
    youSolved: 'Du hast',
    tasksCorrectly: 'Aufgaben richtig gelöst',
    // Motivation Message
    motivationTitleLowScore: 'Weiter so!',
    motivationMessageLowScore: 'Schade, versuche es nochmal!',
    motivationTitleMediumScore: 'Fast geschafft!',
    motivationMessageMediumScore: 'Du machst das schon gut! Noch ein bisschen üben und du schaffst es!',
    motivationTitleHighScore: 'Super!',
    motivationMessageHighScore: 'Toll gemacht! Du hast schon 10 Aufgaben gerechnet. Lass uns noch eine Runde versuchen!',
    motivationButton: 'Weiter',
  },
};
