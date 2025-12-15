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
  gameMode: string;
  operation: string;
  addition: string;
  multiplication: string;
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
  // Results Modal
  great: string;
  youSolved: string;
  tasksCorrectly: string;
  // Motivation Message
  motivationTitle: string;
  motivationMessage: string;
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
