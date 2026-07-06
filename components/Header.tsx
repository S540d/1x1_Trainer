import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { ThemeColors, DifficultyMode, ChallengeState } from '../types/game';
import { CHALLENGE_MAX_LIVES } from '../utils/constants';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';

interface HeaderProps {
  colors: ThemeColors;
  difficultyMode: DifficultyMode;
  challengeState?: ChallengeState;
  score: number;
  currentTask: number;
  totalTasks: number;
  currentStreak?: number;
  onShowMenu: () => void;
  t: {
    level: string;
    task: string;
    points: string;
    streakInfoTitle: string;
    streakInfoBody: string;
  };
}

export function Header({
  colors,
  difficultyMode,
  challengeState,
  score,
  currentTask,
  totalTasks,
  currentStreak,
  onShowMenu,
  t,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      {difficultyMode === DifficultyMode.CHALLENGE && challengeState ? (
        <>
          <Text style={[styles.headerScore, { color: colors.text }]}>
            {Array.from({ length: challengeState.lives }, () => '❤️').join('')}
            {Array.from({ length: CHALLENGE_MAX_LIVES - challengeState.lives }, () => '🤍').join(
              ''
            )}
          </Text>
          <Text style={[styles.headerScore, { color: colors.text }]}>
            {t.level} {challengeState.level}
          </Text>
          <Badge value={score} variant="default" animated />
        </>
      ) : (
        <ProgressBar
          current={currentTask - 1}
          total={totalTasks}
          gradientColors={colors.gradientPrimary}
        />
      )}
      {!!currentStreak && currentStreak > 0 && (
        <TouchableOpacity
          onPress={() => Alert.alert(t.streakInfoTitle, `${currentStreak} ${t.streakInfoBody}`)}
          activeOpacity={0.7}
          style={styles.streakBadge}
          accessibilityRole="button"
          accessibilityLabel={`${t.streakInfoTitle}: ${currentStreak}`}
        >
          <Text style={styles.streakText}>🔥 {currentStreak}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onShowMenu} style={styles.settingsButton} aria-label="Settings">
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
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(249,212,35,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
});
