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
  practiceMode: string;
  simpleModeInfo: string;
  creativeModeInfo: string;
  practiceModeInfo: string;
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
  aboutDescription: string;
  version: string;
  copyright: string;
  license: string;
  contact: string;
  // Game UI
  task: string;
  points: string;
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
  // Results Modal / Motivation Message (shown after every block of 10 tasks)
  motivationTitleLowScore: string;
  motivationMessageLowScore: string;
  motivationTitleMediumScore: string;
  motivationMessageMediumScore: string;
  motivationTitleHighScore: string;
  motivationMessageHighScore: string;
  // Challenge Mode
  challenge: string;
  challengeInfo: string;
  level: string;
  lives: string;
  highScore: string;
  challengeOver: string;
  challengeResult: string;
  newHighScore: string;
  tryAgain: string;
  settings: string;
  ok: string;
  // Parent Dashboard
  parentDashboard: string;
  parentDashboardMenu: string;
  parentDashboardSubtitle: string;
  parentNoData: string;
  parentSessions: string;
  parentAvgError: string;
  parentToday: string;
  parentYesterday: string;
  parentCorrect: string;
  parentErrors: string;
  parentCurrentStreak: string;
  parentLongestStreak: string;
  parentStreakDays: string;
  streakWarningTitle: string;
  streakWarningMessage: string;
  streakWarningButton: string;
  roundsInfoTitle: string;
  roundsInfoBody: string;
  parentWeakTasks: string;
  parentWeakTasksEmpty: string;
  chartSessions: string;
  chartErrorRate: string;
  parentEmptyTitle: string;
  parentWeeklyReview: string;
  parentWeeklySessions: string;
  parentWeeklyVsLastWeek: string;
  parentWeeklyMinutes: string;
  parentWeeklyMinutesUnit: string;
  parentRowAccuracy: string;
  parentWeeklyRecommendation: string;
  parentRecommendationText: string;
  parentRecommendationEmpty: string;
  parentResetLernreise: string;
  parentResetLernreiseConfirm: string;
  parentResetLernreiseDone: string;
  colorTheme: string;
  // Sounds
  sounds: string;
  soundsOn: string;
  soundsOff: string;
  soundVolume: string;
  // Badges
  badges: string;
  badgesMenu: string;
  badgesSubtitle: string;
  badgeLocked: string;
  badgeUnlockedOn: string;
  badgeCategoryStreak: string;
  badgeCategoryPerformance: string;
  badgeCategoryChallenge: string;
  badgeCategoryExplorer: string;
  badgeStreak3Name: string;
  badgeStreak7Name: string;
  badgeStreak30Name: string;
  badgePerfect1Name: string;
  badgePerfect5Name: string;
  badgeAllOpsName: string;
  badgeChallengeLevel3Name: string;
  badgeChallengeLevel6Name: string;
  badgeChallengeNoErrorsName: string;
  badgeRange100Name: string;
  badgeCreativeModeName: string;
  badgeStreak3Desc: string;
  badgeStreak7Desc: string;
  badgeStreak30Desc: string;
  badgePerfect1Desc: string;
  badgePerfect5Desc: string;
  badgeAllOpsDesc: string;
  badgeChallengeLevel3Desc: string;
  badgeChallengeLevel6Desc: string;
  badgeChallengeNoErrorsDesc: string;
  badgeRange100Desc: string;
  badgeCreativeModeDesc: string;
  badgeNewUnlocked: string;
  // Profiles
  profiles: string;
  profilesMenu: string;
  profilesSubtitle: string;
  addProfile: string;
  createProfile: string;
  profileNamePlaceholder: string;
  saveProfile: string;
  cancel: string;
  deleteProfile: string;
  deleteProfileConfirm: string;
  maxProfilesReached: string;
  profileActive: string;
  // Onboarding
  onboardingWelcomeTitle: string;
  onboardingWelcomeBody: string;
  onboardingDemoTitle: string;
  onboardingDemoTooltip: string;
  onboardingSettingsTitle: string;
  onboardingSettingsBody: string;
  onboardingReadyTitle: string;
  onboardingReadyBody: string;
  onboardingDemoRetry: string;
  onboardingSettingsLabel: string;
  onboardingNext: string;
  onboardingStart: string;
  onboardingSkip: string;
  resetOnboarding: string;
  // Lernreise / Reihen-Meisterschaft
  lernreiseMenu: string;
  lernreiseTitle: string;
  lernreiseSubtitle: string;
  lernreiseRowLabel: string;
  lernreiseResultScore: string;
  lernreiseResultGold: string;
  lernreiseResultSilver: string;
  lernreiseResultBronze: string;
  lernreiseResultRetry: string;
  lernreiseBackToMap: string;
  lernreiseIntroTitle: string;
  lernreiseIntroBody: string;
  lernreiseIntroPracticeHint: string;
  lernreiseIntroStart: string;
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
    practiceMode: 'Practice',
    simpleModeInfo: 'Enter the result via keypad',
    creativeModeInfo: 'Random input methods and question types',
    practiceModeInfo: 'Practicing your difficult tasks right now!',
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
    aboutDescription: 'A math trainer for children with multiple game modes.',
    version: 'Version',
    copyright: '© 2025 S540d',
    license: 'License: MIT',
    contact: 'Contact: devsven@posteo.de',
    // Game UI
    task: 'Task',
    points: 'Points',
    // Game Modes
    normalMode: 'Normal Tasks',
    firstMissing: 'First Number Missing',
    secondMissing: 'Second Number Missing',
    mixedMode: 'Mixed',
    // Buttons
    check: 'Check',
    nextQuestion: 'Next →',
    playAgain: 'Play Again',
    newRound: 'New Round',
    continueGame: 'Continue',
    // Results Modal / Motivation Message (shown after every block of 10 tasks)
    motivationTitleLowScore: 'Keep Going!',
    motivationMessageLowScore: "Don't give up! Practice makes perfect. Let's try again!",
    motivationTitleMediumScore: 'Almost There!',
    motivationMessageMediumScore:
      "You're doing well! Just a bit more practice and you'll master it!",
    motivationTitleHighScore: 'Great!',
    motivationMessageHighScore:
      "Excellent work! You have already solved 10 tasks. Let's try another round!",
    // Challenge Mode
    challenge: 'Challenge',
    challengeInfo: 'Endless mode: answer until 3 mistakes. Difficulty increases!',
    level: 'Level',
    lives: 'Lives',
    highScore: 'High Score',
    challengeOver: 'Challenge Over!',
    challengeResult: 'You reached level {level} with {score} correct answers.',
    newHighScore: 'New High Score!',
    tryAgain: 'Try Again',
    settings: 'Settings',
    ok: 'OK',
    // Parent Dashboard
    parentDashboard: 'Parent Dashboard',
    parentDashboardMenu: 'Parent Dashboard',
    parentDashboardSubtitle: 'Last 4 weeks · tap ✕ to close',
    parentNoData: 'No sessions recorded yet. Play a few rounds first!',
    parentSessions: 'Sessions (4 weeks)',
    parentAvgError: 'Avg. Error Rate',
    parentToday: 'Today',
    parentYesterday: 'Yesterday',
    parentCorrect: 'Correct',
    parentErrors: 'Errors',
    parentCurrentStreak: 'Current Streak',
    parentLongestStreak: 'Longest Streak',
    parentStreakDays: 'Days',
    streakWarningTitle: "Don't break your streak!",
    streakWarningMessage: 'Play a quick round today to keep your {days}-day streak going!',
    streakWarningButton: "Let's go!",
    roundsInfoTitle: 'Rounds today',
    roundsInfoBody: 'rounds completed today. Keep it up!',
    parentWeakTasks: 'Weak Areas (Top 5)',
    parentWeakTasksEmpty: 'No weak areas identified yet.',
    chartSessions: 'Sessions · 14 days',
    chartErrorRate: 'Error rate · 14 days',
    parentEmptyTitle: "Let's get started!",
    parentWeeklyReview: 'Weekly Review',
    parentWeeklySessions: 'Sessions this week',
    parentWeeklyVsLastWeek: 'vs. last week',
    parentWeeklyMinutes: 'Practice time this week',
    parentWeeklyMinutesUnit: 'min',
    parentRowAccuracy: 'Accuracy by times table',
    parentWeeklyRecommendation: "This week's practice tip",
    parentRecommendationText: 'Practice the {row} times table (error rate {rate}%)',
    parentRecommendationEmpty: 'No weak spot found — keep it up!',
    parentResetLernreise: 'Reset Learning Journey',
    parentResetLernreiseConfirm:
      'This will reset all earned Bronze/Silver/Gold badges and locked progress on the Learning Journey map.',
    parentResetLernreiseDone: 'Learning Journey has been reset.',
    colorTheme: 'COLOR THEME',
    sounds: 'SOUNDS',
    soundsOn: 'On',
    soundsOff: 'Off',
    soundVolume: 'VOLUME',
    // Badges
    badges: 'Achievements',
    badgesMenu: 'Achievements',
    badgesSubtitle: 'Collect badges by reaching milestones',
    badgeLocked: 'Locked',
    badgeUnlockedOn: 'Unlocked',
    badgeCategoryStreak: 'Streaks',
    badgeCategoryPerformance: 'Performance',
    badgeCategoryChallenge: 'Challenge',
    badgeCategoryExplorer: 'Explorer',
    badgeStreak3Name: 'On Fire!',
    badgeStreak7Name: 'Hot Streak',
    badgeStreak30Name: 'Unstoppable',
    badgePerfect1Name: 'Perfectionist',
    badgePerfect5Name: 'Star Player',
    badgeAllOpsName: 'All-Rounder',
    badgeChallengeLevel3Name: 'Rising Star',
    badgeChallengeLevel6Name: 'Champion',
    badgeChallengeNoErrorsName: 'Flawless',
    badgeRange100Name: 'Big Numbers',
    badgeCreativeModeName: 'Creative Mind',
    badgeStreak3Desc: 'Played 3 days in a row',
    badgeStreak7Desc: 'Played 7 days in a row',
    badgeStreak30Desc: 'Played 30 days in a row',
    badgePerfect1Desc: 'First perfect round (10/10)',
    badgePerfect5Desc: '5 perfect rounds',
    badgeAllOpsDesc: 'Perfect round with all 4 operations',
    badgeChallengeLevel3Desc: 'Reached Challenge Level 3',
    badgeChallengeLevel6Desc: 'Reached Challenge Level 6',
    badgeChallengeNoErrorsDesc: 'Reached level 3 in a challenge with all lives intact',
    badgeRange100Desc: 'Played with numbers up to 100',
    badgeCreativeModeDesc: 'Played in Creative Mode',
    badgeNewUnlocked: 'New badge unlocked!',
    // Onboarding
    onboardingWelcomeTitle: 'Welcome to 1×1 Trainer!',
    onboardingWelcomeBody:
      'Practice multiplication, division, addition and subtraction — fun and easy!',
    onboardingDemoTitle: 'Try it out!',
    onboardingDemoTooltip: 'Enter your answer here',
    onboardingSettingsTitle: 'Everything Adjustable',
    onboardingSettingsBody:
      'Tap the menu button to change the operation, difficulty and number range.',
    onboardingReadyTitle: "You're ready!",
    onboardingReadyBody: 'Have fun practicing!',
    onboardingDemoRetry: 'Not quite — try again!',
    onboardingSettingsLabel: '↑ Settings',
    onboardingNext: 'Next',
    onboardingStart: 'Start',
    onboardingSkip: 'Skip',
    resetOnboarding: 'Restart tutorial',
    // Lernreise / Times-Table Mastery
    lernreiseMenu: 'Learning Journey',
    lernreiseTitle: 'Learning Journey',
    lernreiseSubtitle: 'Master every times table — Bronze, Silver, Gold',
    lernreiseRowLabel: '{row} Times Table',
    lernreiseResultScore: '{score}/10 correct',
    lernreiseResultGold: 'Gold! Perfectly mastered!',
    lernreiseResultSilver: 'Silver! Great job!',
    lernreiseResultBronze: 'Bronze! Well done!',
    lernreiseResultRetry: 'Not quite yet — give it another try!',
    lernreiseBackToMap: 'Back to Learning Journey',
    lernreiseIntroTitle: 'Welcome to your Learning Journey!',
    lernreiseIntroBody:
      'Work through the times tables one by one, from 1 to 12. Pass a table’s test to unlock the next one and earn Bronze, Silver, or Gold.',
    lernreiseIntroPracticeHint:
      'Tip: use Practice Mode afterwards to automatically drill the tasks you find tricky.',
    lernreiseIntroStart: "Let's go!",
    // Profiles
    profiles: 'Profiles',
    profilesMenu: 'Profiles',
    profilesSubtitle: 'Tap to switch active profile',
    addProfile: 'Add Profile',
    createProfile: 'New Profile',
    profileNamePlaceholder: "Child's name",
    saveProfile: 'Save',
    cancel: 'Cancel',
    deleteProfile: 'Delete Profile',
    deleteProfileConfirm: 'This will permanently delete all data for this profile.',
    maxProfilesReached: 'Maximum of 6 profiles reached',
    profileActive: 'Active',
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
    practiceMode: 'Übung',
    simpleModeInfo: 'Das Ergebnis wird über die Tastatur eingegeben',
    creativeModeInfo: 'Zufällige Eingabemethoden und Fragetypen',
    practiceModeInfo: 'Du übst gerade deine schwierigen Aufgaben!',
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
    aboutDescription: 'Ein Rechentrainer für Kinder mit verschiedenen Spielmodi.',
    version: 'Version',
    copyright: '© 2025 S540d',
    license: 'Lizenz: MIT',
    contact: 'Kontakt: devsven@posteo.de',
    // Game UI
    task: 'Aufgabe',
    points: 'Punkte',
    // Game Modes
    normalMode: 'Normale Aufgaben',
    firstMissing: 'Erste Zahl fehlt',
    secondMissing: 'Zweite Zahl fehlt',
    mixedMode: 'Gemischt',
    // Buttons
    check: 'Prüfen',
    nextQuestion: 'Weiter →',
    playAgain: 'Nochmal spielen',
    newRound: 'Neue Runde',
    continueGame: 'Fortsetzen',
    // Results Modal / Motivation Message (erscheint nach jedem Block von 10 Aufgaben)
    motivationTitleLowScore: 'Weiter so!',
    motivationMessageLowScore: 'Schade, versuche es nochmal!',
    motivationTitleMediumScore: 'Fast geschafft!',
    motivationMessageMediumScore:
      'Du machst das schon gut! Noch ein bisschen üben und du schaffst es!',
    motivationTitleHighScore: 'Super!',
    motivationMessageHighScore:
      'Toll gemacht! Du hast schon 10 Aufgaben gerechnet. Lass uns noch eine Runde versuchen!',
    // Challenge Mode
    challenge: 'Herausforderung',
    challengeInfo: 'Endlosmodus: rechne bis 3 Fehler. Es wird immer schwieriger!',
    level: 'Stufe',
    lives: 'Leben',
    highScore: 'Rekord',
    challengeOver: 'Herausforderung vorbei!',
    challengeResult: 'Du hast Stufe {level} erreicht mit {score} richtigen Antworten.',
    newHighScore: 'Neuer Rekord!',
    tryAgain: 'Nochmal',
    settings: 'Einstellungen',
    ok: 'OK',
    // Parent Dashboard
    parentDashboard: 'Eltern-Dashboard',
    parentDashboardMenu: 'Eltern-Dashboard',
    parentDashboardSubtitle: 'Letzte 4 Wochen · ✕ zum Schließen',
    parentNoData: 'Noch keine Einheiten gespeichert. Spielt zuerst ein paar Runden!',
    parentSessions: 'Einheiten (4 Wochen)',
    parentAvgError: 'Ø Fehlerquote',
    parentToday: 'Heute',
    parentYesterday: 'Gestern',
    parentCorrect: 'Richtig',
    parentErrors: 'Fehler',
    parentCurrentStreak: 'Aktuelle Serie',
    parentLongestStreak: 'Längste Serie',
    parentStreakDays: 'Tage',
    streakWarningTitle: 'Brich deine Serie nicht!',
    streakWarningMessage: 'Spiel heute eine Runde, um deine {days}-Tage-Serie zu halten!',
    streakWarningButton: "Los geht's!",
    roundsInfoTitle: 'Durchläufe heute',
    roundsInfoBody: 'Durchläufe heute abgeschlossen. Weiter so!',
    parentWeakTasks: 'Schwachstellen (Top 5)',
    parentWeakTasksEmpty: 'Noch keine Schwächen erkannt.',
    chartSessions: 'Einheiten · 14 Tage',
    chartErrorRate: 'Fehlerquote · 14 Tage',
    parentEmptyTitle: "Los geht's!",
    parentWeeklyReview: 'Wochenrückblick',
    parentWeeklySessions: 'Einheiten diese Woche',
    parentWeeklyVsLastWeek: 'vs. letzte Woche',
    parentWeeklyMinutes: 'Übungszeit diese Woche',
    parentWeeklyMinutesUnit: 'Min',
    parentRowAccuracy: 'Genauigkeit pro Malreihe',
    parentWeeklyRecommendation: 'Übungsempfehlung der Woche',
    parentRecommendationText: 'Die {row}er-Reihe üben (Fehlerquote {rate}%)',
    parentRecommendationEmpty: 'Keine Schwachstelle erkannt – weiter so!',
    parentResetLernreise: 'Lernreise zurücksetzen',
    parentResetLernreiseConfirm:
      'Damit werden alle erreichten Bronze/Silber/Gold-Abzeichen und der Freischalt-Fortschritt der Lernreise-Landkarte zurückgesetzt.',
    parentResetLernreiseDone: 'Die Lernreise wurde zurückgesetzt.',
    colorTheme: 'FARBTHEMA',
    sounds: 'TÖNE',
    soundsOn: 'An',
    soundsOff: 'Aus',
    soundVolume: 'LAUTSTÄRKE',
    // Badges
    badges: 'Abzeichen',
    badgesMenu: 'Abzeichen',
    badgesSubtitle: 'Sammle Abzeichen durch Meilensteine',
    badgeLocked: 'Gesperrt',
    badgeUnlockedOn: 'Freigeschaltet',
    badgeCategoryStreak: 'Serien',
    badgeCategoryPerformance: 'Leistung',
    badgeCategoryChallenge: 'Herausforderung',
    badgeCategoryExplorer: 'Entdecker',
    badgeStreak3Name: 'Auf Kurs!',
    badgeStreak7Name: 'Heiße Serie',
    badgeStreak30Name: 'Unaufhaltsam',
    badgePerfect1Name: 'Perfektionist',
    badgePerfect5Name: 'Superstar',
    badgeAllOpsName: 'Allrounder',
    badgeChallengeLevel3Name: 'Aufsteiger',
    badgeChallengeLevel6Name: 'Champion',
    badgeChallengeNoErrorsName: 'Fehlerlos',
    badgeRange100Name: 'Große Zahlen',
    badgeCreativeModeName: 'Kreativkopf',
    badgeStreak3Desc: '3 Tage in Folge gespielt',
    badgeStreak7Desc: '7 Tage in Folge gespielt',
    badgeStreak30Desc: '30 Tage in Folge gespielt',
    badgePerfect1Desc: 'Erste perfekte Runde (10/10)',
    badgePerfect5Desc: '5 perfekte Runden',
    badgeAllOpsDesc: 'Perfekte Runde mit allen 4 Rechenarten',
    badgeChallengeLevel3Desc: 'Herausforderung Stufe 3 erreicht',
    badgeChallengeLevel6Desc: 'Herausforderung Stufe 6 erreicht',
    badgeChallengeNoErrorsDesc: 'Level 3 in einer Challenge mit allen Leben erreicht',
    badgeRange100Desc: 'Mit Zahlen bis 100 gespielt',
    badgeCreativeModeDesc: 'Im Kreativmodus gespielt',
    badgeNewUnlocked: 'Neues Abzeichen freigeschaltet!',
    // Onboarding
    onboardingWelcomeTitle: 'Willkommen beim 1×1 Trainer!',
    onboardingWelcomeBody:
      'Übe Multiplikation, Division, Addition und Subtraktion – Spaß und einfach!',
    onboardingDemoTitle: 'Probiere es aus!',
    onboardingDemoTooltip: 'Gib deine Antwort hier ein',
    onboardingSettingsTitle: 'Alles einstellbar',
    onboardingSettingsBody:
      'Tippe auf den Menü-Button, um Rechenart, Schwierigkeit und Zahlenbereich zu ändern.',
    onboardingReadyTitle: 'Du bist bereit!',
    onboardingReadyBody: 'Viel Spaß beim Üben!',
    onboardingDemoRetry: 'Nicht ganz – tippe nochmal!',
    onboardingSettingsLabel: '↑ Einstellungen',
    onboardingNext: 'Weiter',
    onboardingStart: 'Loslegen',
    onboardingSkip: 'Überspringen',
    resetOnboarding: 'Tutorial zurücksetzen',
    // Lernreise / Reihen-Meisterschaft
    lernreiseMenu: 'Lernreise',
    lernreiseTitle: 'Lernreise',
    lernreiseSubtitle: 'Meistere jede Malreihe – Bronze, Silber, Gold',
    lernreiseRowLabel: '{row}er-Reihe',
    lernreiseResultScore: '{score}/10 richtig',
    lernreiseResultGold: 'Gold! Perfekt gemeistert!',
    lernreiseResultSilver: 'Silber! Toll gemacht!',
    lernreiseResultBronze: 'Bronze! Gut gemacht!',
    lernreiseResultRetry: 'Noch nicht ganz – versuch es nochmal!',
    lernreiseBackToMap: 'Zurück zur Lernreise',
    lernreiseIntroTitle: 'Willkommen zu deiner Lernreise!',
    lernreiseIntroBody:
      'Arbeite dich Malreihe für Malreihe von 1 bis 12 vor. Bestehe den Test einer Reihe, um die nächste freizuschalten und Bronze, Silber oder Gold zu verdienen.',
    lernreiseIntroPracticeHint:
      'Tipp: Nutze danach den Übungsmodus, um automatisch die Aufgaben zu festigen, die dir noch schwerfallen.',
    lernreiseIntroStart: "Los geht's!",
    // Profiles
    profiles: 'Profile',
    profilesMenu: 'Profile',
    profilesSubtitle: 'Tippe zum Profilwechsel',
    addProfile: 'Profil hinzufügen',
    createProfile: 'Neues Profil',
    profileNamePlaceholder: 'Name des Kindes',
    saveProfile: 'Speichern',
    cancel: 'Abbrechen',
    deleteProfile: 'Profil löschen',
    deleteProfileConfirm: 'Damit werden alle Daten dieses Profils dauerhaft gelöscht.',
    maxProfilesReached: 'Maximal 6 Profile möglich',
    profileActive: 'Aktiv',
  },
};
