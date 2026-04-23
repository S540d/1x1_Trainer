import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors, DifficultyMode, ChallengeState } from '../types/game';
import { CHALLENGE_MAX_LIVES, DESIGN_TOKENS } from '../utils/constants';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';

interface HeaderProps {
  colors: ThemeColors;
  difficultyMode: DifficultyMode;
  challengeState?: ChallengeState;
  score: number;
  currentTask: number;
  totalTasks: number;
  onShowMenu: () => void;
  t: {
    level: string;
    task: string;
    points: string;
  };
}

export function Header({
  colors,
  difficultyMode,
  challengeState,
  score,
  currentTask,
  totalTasks,
  onShowMenu,
  t,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      {difficultyMode === DifficultyMode.CHALLENGE && challengeState ? (
        <>
          <Text style={[styles.headerScore, { color: colors.text }]}>
            {Array.from({ length: challengeState.lives }, () => '❤️').join('')}
            {Array.from({ length: CHALLENGE_MAX_LIVES - challengeState.lives }, () => '🤍').join('')}
          </Text>
          <Text style={[styles.headerScore, { color: colors.text }]}>
            {t.level} {challengeState.level}
          </Text>
          <Badge value={score} variant="default" animated />
        </>
      ) : (
        <>
          <View style={styles.progressContainer}>
            <ProgressBar current={currentTask - 1} total={totalTasks} />
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              {currentTask}/{totalTasks}
            </Text>
          </View>
          <LinearGradient
            colors={DESIGN_TOKENS.GRADIENT_GOLD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scoreBadge}
          >
            <Text style={styles.scoreBadgeText}>⭐ {score}</Text>
          </LinearGradient>
        </>
      )}
      <TouchableOpacity
        onPress={onShowMenu}
        style={styles.settingsButton}
        aria-label="Settings"
      >
        <Text style={[styles.settingsButtonText, { color: colors.text }]}>⋮</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerScore: {
    fontSize: 18,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    minWidth: 36,
    textAlign: 'right',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
    fontWeight: 'normal',
  },
});
