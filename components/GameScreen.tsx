/**
 * GameScreen
 * The playing screen: header, settings slide panel, game card and result
 * modal. Extracted from App.tsx (Issue #357, Punkt 1) — pure presentation,
 * all state still lives in App.tsx and arrives via props.
 */

import React from 'react';
import { Animated } from 'react-native';
import { Header } from './Header';
import { SettingsMenu } from './SettingsMenu';
import { GameCard } from './GameCard';
import { ResultModal } from './ResultModal';
import { useGameLogic } from '../hooks/useGameLogic';
import { RowMasteryStatus, ThemeColors } from '../types/game';
import { TranslationStrings } from '../i18n/translations';

type Game = ReturnType<typeof useGameLogic>;

export interface SettingsMenuActions {
  onOpenPersonalize: () => void;
  onOpenAbout: () => void;
  onOpenParentDashboard: () => void;
  onResetOnboarding: () => void;
  onOpenBadges: () => void;
  onOpenProfiles: () => void;
  onOpenLernreise: () => void;
  onOpenTaskSettings: () => void;
}

interface GameScreenProps {
  colors: ThemeColors;
  t: TranslationStrings;
  game: Game;
  roundsToday: number;
  screenHeight: number;
  cardAnimatedStyle: {
    transform: ({ scale: Animated.Value } | { translateX: Animated.Value })[];
  };
  menuRendered: boolean;
  menuAnimatedStyle: {
    transform: { translateY: Animated.Value }[];
    opacity: Animated.Value;
  };
  onShowMenu: () => void;
  onHideMenu: () => void;
  menuActions: SettingsMenuActions;
  lernreiseResult: { row: number; status: RowMasteryStatus | null } | null;
  onResultRestart: () => void;
  onResultContinue: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  colors,
  t,
  game,
  roundsToday,
  screenHeight,
  cardAnimatedStyle,
  menuRendered,
  menuAnimatedStyle,
  onShowMenu,
  onHideMenu,
  menuActions,
  lernreiseResult,
  onResultRestart,
  onResultContinue,
}) => (
  <>
    <Header
      colors={colors}
      difficultyMode={game.gameState.difficultyMode}
      challengeState={game.gameState.challengeState}
      score={game.gameState.score}
      answerHistory={game.gameState.answerHistory}
      roundsToday={roundsToday}
      onShowMenu={onShowMenu}
      t={t}
    />

    {menuRendered && (
      <SettingsMenu
        colors={colors}
        screenHeight={screenHeight}
        menuAnimatedStyle={menuAnimatedStyle}
        onHideMenu={onHideMenu}
        {...menuActions}
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
      lernreiseResult={lernreiseResult}
      onRestart={onResultRestart}
      onContinue={onResultContinue}
      t={t}
    />
  </>
);
