import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  AccessibilityInfo,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Local imports
import { translations } from './i18n/translations';
import { useTheme } from './hooks/useTheme';
import { usePreferences } from './hooks/usePreferences';
import { useGameLogic } from './hooks/useGameLogic';
import { PersonalizeModal } from './components/PersonalizeModal';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Header } from './components/Header';
import { SettingsMenu } from './components/SettingsMenu';
import { GameCard } from './components/GameCard';
import { ResultModal } from './components/ResultModal';
import { MotivationModal } from './components/MotivationModal';
import { AboutModal } from './components/AboutModal';
import { ANIMATION_DURATIONS } from './utils/animations';

export default function App() {
  const [menuRendered, setMenuRendered] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [personalizeVisible, setPersonalizeVisible] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationScore, setMotivationScore] = useState(0);

  // Reduced motion preference
  const reduceMotion = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.current = enabled;
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      reduceMotion.current = enabled;
    });
    return () => sub.remove();
  }, []);

  // Animation values
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardShakeX = useRef(new Animated.Value(0)).current;
  const menuTranslateY = useRef(new Animated.Value(-300)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;

  // Use custom hooks
  const preferences = usePreferences();
  const theme = useTheme(preferences.themeMode);
  const game = useGameLogic({
    initialOperation: preferences.operation,
    initialOperations: preferences.operations,
    initialTotalSolvedTasks: preferences.totalSolvedTasks,
    onTotalSolvedTasksChange: preferences.setTotalSolvedTasks,
    onMotivationShow: (score: number) => {
      setMotivationScore(score);
      setShowMotivation(true);
    },
    numberRange: preferences.numberRange,
    challengeHighScore: preferences.challengeHighScore,
    onChallengeHighScoreChange: preferences.setChallengeHighScore,
  });

  const t = translations[preferences.language];
  const { colors, isDarkMode } = theme;
  const { height: screenHeight } = useWindowDimensions();

  // Animated styles
  const cardAnimatedStyle = {
    transform: [
      { scale: cardScale },
      { translateX: cardShakeX },
    ],
  };

  const menuAnimatedStyle = {
    transform: [{ translateY: menuTranslateY }],
    opacity: menuOpacity,
  };

  const showMenu = () => {
    setMenuRendered(true);
    if (reduceMotion.current) {
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
    if (reduceMotion.current) {
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
      document.body.style.backgroundColor = isDarkMode ? '#0F1419' : '#F0F4FF';
    }
  }, [isDarkMode]);

  // Card feedback animation (skipped when reduce motion is enabled)
  useEffect(() => {
    if (!game.gameState.isAnswerChecked || reduceMotion.current) return;
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

  // Generate first question on mount
  useEffect(() => {
    if (preferences.isLoaded) {
      game.generateQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.isLoaded]);

  // Sync operation changes to preferences
  useEffect(() => {
    if (preferences.isLoaded && !preferences.operations.includes(game.gameState.operation)) {
      const newOps = Array.from(game.gameState.selectedOperations);
      preferences.setOperations(newOps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gameState.selectedOperations]);

  if (!preferences.isLoaded) {
    return <SkeletonLoader colors={colors} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <Header
        colors={colors}
        difficultyMode={game.gameState.difficultyMode}
        challengeState={game.gameState.challengeState}
        score={game.gameState.score}
        currentTask={game.gameState.currentTask}
        totalTasks={game.gameState.totalTasks}
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
        reduceMotion={reduceMotion}
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
        totalTasks={game.gameState.totalTasks}
        onRestart={game.restartGame}
        onContinue={game.continueGame}
        t={t}
      />

      <MotivationModal
        visible={showMotivation}
        onClose={() => setShowMotivation(false)}
        colors={colors}
        score={motivationScore}
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
      />

      <AboutModal
        visible={aboutVisible}
        onClose={() => setAboutVisible(false)}
        colors={colors}
        t={t}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
