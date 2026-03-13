import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { ThemeColors, DifficultyMode, ChallengeState } from '../types/game';
import { CHALLENGE_MAX_LIVES } from '../utils/constants';

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
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {difficultyMode === DifficultyMode.CHALLENGE && challengeState ? (
        <>
          <Text style={[styles.headerScore, { color: colors.text }]}>
            {Array.from({ length: challengeState.lives }, () => '\u2764\uFE0F').join('')}
            {Array.from({ length: CHALLENGE_MAX_LIVES - challengeState.lives }, () => '\uD83E\uDD0D').join('')}
          </Text>
          <Text style={[styles.headerScore, { color: colors.text }]}>
            {t.level} {challengeState.level}
          </Text>
          <Text style={[styles.headerScore, { color: colors.text }]}>
            <Text style={{ fontWeight: 'bold' }}>{score}</Text>
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.headerScore, { color: colors.text }]}>
            {t.task}: {currentTask}/{totalTasks}
          </Text>
          <Text style={[styles.headerScore, { color: colors.text }]}>
            {t.points}: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{score}</Text>
          </Text>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    fontWeight: '500',
    color: '#4F46E5',
  },
});
