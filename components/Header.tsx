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
  answerHistory: (boolean | null)[];
  roundsToday?: number;
  onShowMenu: () => void;
  t: {
    level: string;
    task: string;
    points: string;
    roundsInfoTitle: string;
    roundsInfoBody: string;
  };
}

export function Header({
  colors,
  difficultyMode,
  challengeState,
  score,
  answerHistory,
  roundsToday,
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
        <ProgressBar history={answerHistory} />
      )}
      {!!roundsToday && roundsToday > 0 && (
        <TouchableOpacity
          onPress={() => Alert.alert(t.roundsInfoTitle, `${roundsToday} ${t.roundsInfoBody}`)}
          activeOpacity={0.7}
          style={[styles.roundsBadge, { backgroundColor: colors.buttonInactive }]}
          accessibilityRole="button"
          accessibilityLabel={`${t.roundsInfoTitle}: ${roundsToday}`}
        >
          <Text style={[styles.roundsText, { color: colors.buttonInactiveText }]}>
            {roundsToday}
          </Text>
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
  roundsBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
