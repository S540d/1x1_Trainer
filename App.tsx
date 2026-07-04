import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Animated,
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';

// Local imports
import { translations } from './i18n/translations';
import { STORAGE_KEYS } from './utils/constants';
import { useTheme } from './hooks/useTheme';
import { usePreferences } from './hooks/usePreferences';
import { useGameLogic } from './hooks/useGameLogic';
import { PersonalizeModal } from './components/PersonalizeModal';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Header } from './components/Header';
import { SettingsMenu } from './components/SettingsMenu';
import { GameCard } from './components/GameCard';
import { ResultModal } from './components/ResultModal';
import { AboutModal } from './components/AboutModal';
import { ParentDashboard } from './components/ParentDashboard';
import { OnboardingModal } from './components/OnboardingModal';
import { BadgesModal } from './components/BadgesModal';
import { BadgeUnlockToast } from './components/BadgeUnlockToast';
import { FloatingStars } from './components/FloatingStars';
import { ProfilePickerModal } from './components/ProfilePickerModal';
import {
  saveSessionRecord,
  getStreakData,
  updateStreakAfterSession,
  getYesterdayDateString,
  recordTaskResult,
  getTaskStats,
  getWeakTasks,
  getOnboardingDone,
  setOnboardingDone,
  resetOnboarding,
  getStorageItem,
  migrateToProfiles,
  getProfiles,
  setActiveProfileId,
} from './utils/storage';
import { useSounds } from './hooks/useSounds';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import {
  AnswerMode,
  ChildProfile,
  SessionRecord,
  StreakData,
  TaskStat,
  Operation,
} from './types/game';
import { useBadges } from './hooks/useBadges';
import {
  ANIMATION_DURATIONS,
  initReducedMotionListener,
  prefersReducedMotion,
} from './utils/animations';

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  const [menuRendered, setMenuRendered] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [personalizeVisible, setPersonalizeVisible] = useState(false);
  const [parentDashboardVisible, setParentDashboardVisible] = useState(false);
  const [badgesVisible, setBadgesVisible] = useState(false);
  const [profilePickerVisible, setProfilePickerVisible] = useState(false);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastPlayedDate: '',
    longestStreak: 0,
  });
  const [streakWarningVisible, setStreakWarningVisible] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [taskStats, setTaskStats] = useState<TaskStat[]>([]);

  // Profile state
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  // Ref so callbacks always see the current profileId without stale closures
  const activeProfileIdRef = useRef<string | undefined>(undefined);
  activeProfileIdRef.current = activeProfile?.id;

  const weakTaskCount = useMemo(() => getWeakTasks(taskStats, 3, 0.3).length, [taskStats]);

  // Reduced motion preference — centralized in utils/animations.ts
  useEffect(() => {
    return initReducedMotionListener();
  }, []);

  // Migrate global storage → profile-keyed storage on first launch; idempotent after that
  useEffect(() => {
    migrateToProfiles().then(async (defaultProfile) => {
      const allProfiles = await getProfiles();
      setProfiles(allProfiles);
      setActiveProfile(defaultProfile);
    });
  }, []);

  useEffect(() => {
    if (!activeProfile) return;
    getTaskStats(activeProfile.id).then(setTaskStats);
  }, [activeProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animation values
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardShakeX = useRef(new Animated.Value(0)).current;
  const menuTranslateY = useRef(new Animated.Value(-300)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;

  // Use custom hooks
  const preferences = usePreferences(activeProfile?.id);
  const theme = useTheme(preferences.themeMode, preferences.themeName);
  const sounds = useSounds(preferences.soundEnabled, preferences.soundVolume);
  const badgeSystem = useBadges(activeProfile?.id);
  const game = useGameLogic({
    initialOperation: preferences.operation,
    initialOperations: preferences.operations,
    initialTotalSolvedTasks: preferences.totalSolvedTasks,
    onTotalSolvedTasksChange: preferences.setTotalSolvedTasks,
    onSessionComplete: (record: SessionRecord) => {
      if (record.correctTasks === record.totalTasks) {
        sounds.playSound('perfect');
      }
      const pid = activeProfileIdRef.current;
      saveSessionRecord(record, pid)
        .then(async () => {
          const updatedStreak = await updateStreakAfterSession(pid);
          setStreakData(updatedStreak);
          await badgeSystem.checkAndUnlock(record);
        })
        .catch((err) => console.error('Session save / badge unlock failed:', err));
    },
    taskStats,
    onTaskResult: (num1: number, num2: number, operation: Operation, isCorrect: boolean) => {
      setTaskStats((prev) => {
        const idx = prev.findIndex(
          (s) => s.num1 === num1 && s.num2 === num2 && s.operation === operation
        );
        if (idx >= 0) {
          const updated = { ...prev[idx] };
          if (isCorrect) updated.correctCount++;
          else updated.errorCount++;
          updated.lastSeen = new Date().toISOString();
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [
          ...prev,
          {
            num1,
            num2,
            operation,
            correctCount: isCorrect ? 1 : 0,
            errorCount: isCorrect ? 0 : 1,
            lastSeen: new Date().toISOString(),
          },
        ];
      });
      recordTaskResult(num1, num2, operation, isCorrect, activeProfileIdRef.current);
    },
    numberRange: preferences.numberRange,
    challengeHighScore: preferences.challengeHighScore,
    onChallengeHighScoreChange: preferences.setChallengeHighScore,
  });

  // Physical keyboard on web (#258) — inactive while any overlay is open
  const overlayOpen =
    menuRendered ||
    aboutVisible ||
    personalizeVisible ||
    parentDashboardVisible ||
    badgesVisible ||
    profilePickerVisible ||
    streakWarningVisible ||
    onboardingVisible ||
    game.gameState.showResult;
  useKeyboardInput({
    enabled: !overlayOpen,
    onDigit: (digit) => {
      if (game.gameState.answerMode === AnswerMode.INPUT) {
        game.handleNumberClick(digit);
      }
    },
    onBackspace: () => {
      if (game.gameState.answerMode === AnswerMode.INPUT) {
        game.handleNumberClick(-1);
      }
    },
    onClear: () => {
      if (game.gameState.answerMode === AnswerMode.INPUT) {
        game.handleNumberClick(-2);
      }
    },
    onSubmit: () => {
      if (game.gameState.isAnswerChecked) {
        game.nextQuestion();
      } else {
        game.checkAnswer();
      }
    },
  });

  const t = translations[preferences.language];
  const { colors, isDarkMode } = theme;
  const { height: screenHeight } = useWindowDimensions();

  // Animated styles
  const cardAnimatedStyle = {
    transform: [{ scale: cardScale }, { translateX: cardShakeX }],
  };

  const menuAnimatedStyle = {
    transform: [{ translateY: menuTranslateY }],
    opacity: menuOpacity,
  };

  const showMenu = () => {
    setMenuRendered(true);
    if (prefersReducedMotion()) {
      menuTranslateY.setValue(0);
      menuOpacity.setValue(1);
    } else {
      Animated.parallel([
        Animated.spring(menuTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 30,
          bounciness: 6,
        }),
        Animated.timing(menuOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.FAST,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const hideMenu = () => {
    if (prefersReducedMotion()) {
      menuTranslateY.setValue(-300);
      menuOpacity.setValue(0);
      setMenuRendered(false);
    } else {
      Animated.parallel([
        Animated.timing(menuTranslateY, {
          toValue: -300,
          duration: ANIMATION_DURATIONS.NORMAL,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATIONS.NORMAL,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMenuRendered(false);
      });
    }
  };

  // Set body background color dynamically on web
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = colors.background;
    }
  }, [colors.background]);

  // Badge unlock sound
  const prevNewlyUnlockedLen = useRef(0);
  useEffect(() => {
    if (badgeSystem.newlyUnlocked.length > prevNewlyUnlockedLen.current) {
      sounds.playSound('badge_unlock');
    }
    prevNewlyUnlockedLen.current = badgeSystem.newlyUnlocked.length;
  }, [badgeSystem.newlyUnlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  // Challenge level-up sound
  const prevChallengeLevel = useRef<number | undefined>(undefined);
  useEffect(() => {
    const level = game.gameState.challengeState?.level;
    if (
      level !== undefined &&
      prevChallengeLevel.current !== undefined &&
      level > prevChallengeLevel.current
    ) {
      sounds.playSound('level_up');
    }
    prevChallengeLevel.current = level;
  }, [game.gameState.challengeState?.level]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load streak data and show warning when appropriate
  useEffect(() => {
    if (!activeProfile) return;
    getStreakData(activeProfile.id).then((data) => {
      setStreakData(data);
      const now = new Date();
      const isEvening = now.getHours() >= 20;
      // Warn only while the streak is actually still savable: last play was
      // exactly yesterday. For older dates the streak is already broken and
      // the warning would promise something the user can no longer save (#255).
      const streakStillSavable =
        data.currentStreak > 0 && data.lastPlayedDate === getYesterdayDateString();
      if (isEvening && streakStillSavable) {
        setStreakWarningVisible(true);
      }
    });
  }, [activeProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sound + card feedback on answer check
  useEffect(() => {
    if (!game.gameState.isAnswerChecked) return;
    if (game.gameState.lastAnswerCorrect === true) {
      sounds.playSound('correct');
    } else if (game.gameState.lastAnswerCorrect === false) {
      sounds.playSound('incorrect');
    }
  }, [game.gameState.isAnswerChecked, game.gameState.lastAnswerCorrect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Card animation (skipped when reduce motion is enabled)
  useEffect(() => {
    if (!game.gameState.isAnswerChecked || prefersReducedMotion()) return;
    if (game.gameState.lastAnswerCorrect === true) {
      Animated.sequence([
        Animated.spring(cardScale, {
          toValue: 1.04,
          useNativeDriver: true,
          speed: 30,
          bounciness: 10,
        }),
        Animated.spring(cardScale, {
          toValue: 1.0,
          useNativeDriver: true,
          speed: 30,
          bounciness: 6,
        }),
      ]).start();
    } else if (game.gameState.lastAnswerCorrect === false) {
      Animated.sequence([
        Animated.timing(cardShakeX, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(cardShakeX, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(cardShakeX, { toValue: -5, duration: 60, useNativeDriver: true }),
        Animated.timing(cardShakeX, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(cardShakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [game.gameState.isAnswerChecked, game.gameState.lastAnswerCorrect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show onboarding for new users; silently skip for existing users (migration)
  useEffect(() => {
    if (!preferences.isLoaded) return;
    (async () => {
      const shown = await getOnboardingDone();
      if (shown) return;
      const rawValue = await getStorageItem(STORAGE_KEYS.ONBOARDING_DONE);
      if (rawValue === 'pending') {
        // Explicit reset → always show onboarding
        setOnboardingVisible(true);
        return;
      }
      // rawValue is null → first launch: migrate existing users silently
      const existingLanguage = await getStorageItem(STORAGE_KEYS.LANGUAGE);
      if (existingLanguage) {
        await setOnboardingDone();
      } else {
        setOnboardingVisible(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.isLoaded]);

  // Generate first question on mount
  useEffect(() => {
    if (preferences.isLoaded) {
      game.generateQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.isLoaded]);

  // Sync operation changes to preferences.
  // Deliberately NOT keyed on preferences.isLoaded: on the load commit the game
  // still holds the pre-load defaults, and saving those would clobber the stored
  // selection before useGameLogic adopts it.
  useEffect(() => {
    if (!preferences.isLoaded) return;
    const newOps = Array.from(game.gameState.selectedOperations);
    const unchanged =
      newOps.length === preferences.operations.length &&
      newOps.every((op) => preferences.operations.includes(op));
    if (!unchanged) {
      preferences.setOperations(newOps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gameState.selectedOperations]);

  if (!preferences.isLoaded || !fontsLoaded) {
    return <SkeletonLoader colors={colors} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <FloatingStars />

      <Header
        colors={colors}
        difficultyMode={game.gameState.difficultyMode}
        challengeState={game.gameState.challengeState}
        score={game.gameState.score}
        currentTask={game.gameState.currentTask}
        totalTasks={game.gameState.totalTasks}
        currentStreak={streakData.currentStreak}
        onShowMenu={showMenu}
        t={t}
      />

      {menuRendered && (
        <SettingsMenu
          colors={colors}
          screenHeight={screenHeight}
          menuAnimatedStyle={menuAnimatedStyle}
          difficultyMode={game.gameState.difficultyMode}
          selectedOperations={game.gameState.selectedOperations}
          numberRange={preferences.numberRange}
          weakTaskCount={weakTaskCount}
          onToggleOperation={game.toggleOperation}
          onChangeDifficultyMode={game.changeDifficultyMode}
          onSetNumberRange={preferences.setNumberRange}
          onHideMenu={hideMenu}
          onOpenPersonalize={() => {
            setPersonalizeVisible(true);
            hideMenu();
          }}
          onOpenAbout={() => {
            setAboutVisible(true);
            hideMenu();
          }}
          onOpenParentDashboard={() => setParentDashboardVisible(true)}
          onResetOnboarding={async () => {
            await resetOnboarding();
            setOnboardingVisible(true);
          }}
          onOpenBadges={() => setBadgesVisible(true)}
          onOpenProfiles={() => {
            setProfilePickerVisible(true);
            hideMenu();
          }}
          t={t}
        />
      )}

      <GameCard
        gameState={game.gameState}
        colors={colors}
        cardAnimatedStyle={cardAnimatedStyle}
        operatorSymbol={game.operatorSymbol}
        multipleChoices={game.multipleChoices}
        numberSequence={game.numberSequence}
        getCorrectAnswer={game.getCorrectAnswer}
        onNumberClick={game.handleNumberClick}
        onChoiceClick={game.handleChoiceClick}
        onCheck={game.checkAnswer}
        onNext={game.nextQuestion}
        t={t}
      />

      <ResultModal
        visible={game.gameState.showResult}
        colors={colors}
        difficultyMode={game.gameState.difficultyMode}
        challengeState={game.gameState.challengeState}
        score={game.gameState.score}
        onRestart={game.restartGame}
        onContinue={game.continueGame}
        t={t}
      />

      <PersonalizeModal
        visible={personalizeVisible}
        onClose={() => setPersonalizeVisible(false)}
        colors={colors}
        language={preferences.language}
        onLanguageChange={preferences.setLanguage}
        themeMode={theme.themeMode}
        onThemeModeChange={preferences.setThemeMode}
        themeName={preferences.themeName}
        onThemeNameChange={preferences.setThemeName}
        soundEnabled={preferences.soundEnabled}
        onSoundEnabledChange={preferences.setSoundEnabled}
        soundVolume={preferences.soundVolume}
        onSoundVolumeChange={preferences.setSoundVolume}
      />

      <AboutModal
        visible={aboutVisible}
        onClose={() => setAboutVisible(false)}
        colors={colors}
        t={t}
      />

      <ParentDashboard
        visible={parentDashboardVisible}
        onClose={() => setParentDashboardVisible(false)}
        colors={colors}
        t={t}
      />

      <ProfilePickerModal
        visible={profilePickerVisible}
        onClose={() => setProfilePickerVisible(false)}
        profiles={profiles}
        activeProfileId={activeProfile?.id}
        onSwitchProfile={async (profile) => {
          setActiveProfile(profile);
          await setActiveProfileId(profile.id);
          setProfilePickerVisible(false);
        }}
        onProfilesChange={(updated) => {
          setProfiles(updated);
          // If active profile was deleted, switch to first remaining
          if (activeProfile && !updated.find((p) => p.id === activeProfile.id)) {
            if (updated.length > 0) {
              setActiveProfile(updated[0]);
              setActiveProfileId(updated[0].id);
            }
          }
        }}
        colors={colors}
        t={t}
      />

      <Modal
        visible={streakWarningVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStreakWarningVisible(false)}
      >
        <View style={styles.streakOverlay}>
          <View style={[styles.streakWarningCard, { backgroundColor: colors.settingsMenu }]}>
            <Text style={styles.streakWarningEmoji}>🔥</Text>
            <Text style={[styles.streakWarningTitle, { color: colors.text }]}>
              {t.streakWarningTitle}
            </Text>
            <Text style={[styles.streakWarningMessage, { color: colors.textSecondary }]}>
              {t.streakWarningMessage.replace('{days}', String(streakData.currentStreak))}
            </Text>
            <TouchableOpacity
              style={styles.streakWarningButton}
              onPress={() => setStreakWarningVisible(false)}
            >
              <Text style={styles.streakWarningButtonText}>{t.streakWarningButton}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <OnboardingModal
        visible={onboardingVisible}
        onFinish={async () => {
          await setOnboardingDone();
          setOnboardingVisible(false);
        }}
        colors={colors}
        t={t}
      />

      <BadgesModal
        visible={badgesVisible}
        onClose={() => setBadgesVisible(false)}
        colors={colors}
        badges={badgeSystem.badges}
        language={preferences.language}
        t={t}
      />

      <BadgeUnlockToast
        badgeIds={badgeSystem.newlyUnlocked}
        onDone={badgeSystem.clearNewlyUnlocked}
        badgeNewUnlockedLabel={t.badgeNewUnlocked}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  streakOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakWarningCard: {
    borderRadius: 24,
    padding: 28,
    width: '80%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  streakWarningEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  streakWarningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  streakWarningMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  streakWarningButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  streakWarningButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
