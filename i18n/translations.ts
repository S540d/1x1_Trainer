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
  motivationTitle: string;
  motivationMessage: string;
  motivationTitleLowScore: string;
  motivationMessageLowScore: string;
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
    motivationTitle: 'Great Progress!',
    motivationMessage: 'You have already solved 10 tasks. Let\'s try another round!',
    motivationTitleLowScore: 'Keep Going!',
    motivationMessageLowScore: 'Don\'t give up! Practice makes perfect. Let\'s try again!',
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
    motivationTitle: 'Toll gemacht!',
    motivationMessage: 'Du hast schon 10 Aufgaben gerechnet. Lass uns noch eine Runde versuchen!',
    motivationTitleLowScore: 'Weiter so!',
    motivationMessageLowScore: 'Nicht aufgeben! Übung macht den Meister. Versuchen wir es nochmal!',
    motivationButton: 'Weiter',
  },
};
