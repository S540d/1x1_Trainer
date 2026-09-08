import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, SafeAreaView, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Local imports
import { translations } from './i18n/translations';
import { STORAGE_KEYS } from './utils/constants';
import { useTheme } from './hooks/useTheme';
import { usePreferences } from './hooks/usePreferences';
import { useModals } from './hooks/useModals';
import { useProfileData } from './hooks/useProfileData';
import { useAppGame } from './hooks/useAppGame';
import { useSlideMenu } from './hooks/useSlideMenu';
import { useAnswerFeedback } from './hooks/useAnswerFeedback';
import { SkeletonLoader } from './components/SkeletonLoader';
import { AppSplashScreen } from './components/SplashScreen';
import { FloatingStars } from './components/FloatingStars';
import { GameScreen } from './components/GameScreen';
import { ModalHost } from './components/ModalHost';
import { WelcomeScreen } from './components/WelcomeScreen';
import {
  getWeakTasks,
  getOnboardingDone,
  setOnboardingDone,
  resetOnboarding,
  getLernreiseIntroDone,
  setLernreiseIntroDone,
  getStorageItem,
} from './utils/storage';
import { useSounds } from './hooks/useSounds';
import { useGameKeyboard } from './hooks/useGameKeyboard';
import { DifficultyMode } from './types/game';
import { useBadges } from './hooks/useBadges';
import { initReducedMotionListener } from './utils/animations';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  const modals = useModals();
  const menu = useSlideMenu();
  const profileData = useProfileData({
    onMultipleProfilesFound: modals.openProfilePickerForced,
    onStreakAtRisk: () => modals.open('streakWarning'),
  });
  const { activeProfile, activeProfileIdRef, taskStats, setTaskStats } = profileData;

  const weakTaskCount = useMemo(() => getWeakTasks(taskStats, 3, 0.3).length, [taskStats]);

  // Reduced motion preference — centralized in utils/animations.ts
  useEffect(() => {
    return initReducedMotionListener();
  }, []);

  // Use custom hooks
  const preferences = usePreferences(activeProfile?.id);
  const theme = useTheme(preferences.themeMode, preferences.themeName);
  const sounds = useSounds(preferences.soundEnabled, preferences.soundVolume);
  const badgeSystem = useBadges(activeProfile?.id);
  const { game, lernreiseResult, setLernreiseResult } = useAppGame({
    preferences,
    badgeSystem,
    playSound: sounds.playSound,
    taskStats,
    setTaskStats,
    setStreakData: profileData.setStreakData,
    setRoundsToday: profileData.setRoundsToday,
    activeProfileIdRef,
  });

  const { cardAnimatedStyle } = useAnswerFeedback({
    isAnswerChecked: game.gameState.isAnswerChecked,
    lastAnswerCorrect: game.gameState.lastAnswerCorrect,
    newlyUnlockedCount: badgeSystem.newlyUnlocked.length,
    challengeLevel: game.gameState.challengeState?.level,
    playSound: sounds.playSound,
  });

  // Physical keyboard on web (#258) — inactive while any overlay is open
  const overlayOpen = menu.rendered || modals.activeModal !== null || game.gameState.showResult;
  useGameKeyboard(game, !overlayOpen);

  const t = translations[preferences.language];
  const { colors, isDarkMode } = theme;
  const { height: screenHeight } = useWindowDimensions();

  // Set body background color dynamically on web
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = colors.background;
    }
  }, [colors.background]);

  // Show onboarding for new users; silently skip for existing users (migration).
  // Waits for the forced profile picker to resolve first, so onboarding always
  // refers to the profile the user actually picked.
  useEffect(() => {
    if (!preferences.isLoaded || modals.profilePickerForced) return;
    (async () => {
      const shown = await getOnboardingDone();
      if (shown) return;
      const rawValue = await getStorageItem(STORAGE_KEYS.ONBOARDING_DONE);
      if (rawValue === 'pending') {
        // Explicit reset → always show onboarding
        modals.open('onboarding');
        return;
      }
      // rawValue is null → first launch: migrate existing users silently
      const existingLanguage = await getStorageItem(STORAGE_KEYS.LANGUAGE);
      if (existingLanguage) {
        await setOnboardingDone();
      } else {
        modals.open('onboarding');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.isLoaded, modals.profilePickerForced]);

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

  if (!splashFinished) {
    return (
      <AppSplashScreen
        colors={colors}
        language={preferences.language}
        onFinish={() => {
          SplashScreen.hideAsync().catch(() => {});
          setSplashFinished(true);
        }}
      />
    );
  }

  if (!preferences.isLoaded) {
    return <SkeletonLoader colors={colors} />;
  }

  const openLernreise = async () => {
    const introDone = await getLernreiseIntroDone(activeProfileIdRef.current);
    modals.open(introDone ? 'lernreise' : 'lernreiseIntro');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <FloatingStars />

      {showWelcomeScreen ? (
        <WelcomeScreen
          colors={colors}
          onSelectLernreise={() => {
            setShowWelcomeScreen(false);
            openLernreise();
          }}
          onSelectRowPick={() => {
            setShowWelcomeScreen(false);
            game.changeDifficultyMode(DifficultyMode.PRACTICE);
          }}
          onSelectChallenge={() => {
            setShowWelcomeScreen(false);
            game.changeDifficultyMode(DifficultyMode.CHALLENGE);
          }}
          t={t}
        />
      ) : (
        <GameScreen
          colors={colors}
          t={t}
          game={game}
          roundsToday={profileData.roundsToday}
          screenHeight={screenHeight}
          cardAnimatedStyle={cardAnimatedStyle}
          menuRendered={menu.rendered}
          menuAnimatedStyle={menu.animatedStyle}
          onShowMenu={menu.show}
          onHideMenu={menu.hide}
          menuActions={{
            onOpenPersonalize: () => {
              modals.open('personalize');
              menu.hide();
            },
            onOpenAbout: () => {
              modals.open('about');
              menu.hide();
            },
            onOpenParentDashboard: () => modals.open('parentDashboard'),
            onResetOnboarding: async () => {
              await resetOnboarding();
              modals.open('onboarding');
            },
            onOpenBadges: () => modals.open('badges'),
            onOpenProfiles: () => {
              modals.open('profilePicker');
              menu.hide();
            },
            onOpenLernreise: openLernreise,
            onOpenTaskSettings: () => modals.open('taskSettings'),
          }}
          lernreiseResult={lernreiseResult}
          onResultRestart={() => {
            if (lernreiseResult) {
              const row = lernreiseResult.row;
              setLernreiseResult(null);
              game.startLernreiseRound(row);
            } else {
              setLernreiseResult(null);
              game.restartGame();
            }
          }}
          onResultContinue={() => {
            if (lernreiseResult) {
              setLernreiseResult(null);
              game.closeResult();
              modals.open('lernreise');
            } else {
              setLernreiseResult(null);
              game.continueGame();
            }
          }}
        />
      )}

      <ModalHost
        modals={modals}
        preferences={preferences}
        theme={theme}
        game={game}
        badgeSystem={badgeSystem}
        colors={colors}
        t={t}
        profiles={profileData.profiles}
        activeProfile={activeProfile}
        weakTaskCount={weakTaskCount}
        currentStreak={profileData.streakData.currentStreak}
        onSwitchProfile={async (profile) => {
          await profileData.switchProfile(profile);
          modals.closeProfilePicker();
        }}
        onProfilesChange={profileData.applyProfilesChange}
        onOnboardingFinish={async () => {
          await setOnboardingDone();
          modals.close('onboarding');
        }}
        onLernreiseIntroClose={async () => {
          await setLernreiseIntroDone(activeProfileIdRef.current);
          modals.open('lernreise');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
