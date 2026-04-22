import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native';
import { ThemeColors, DifficultyMode, ChallengeState } from '../types/game';
import { modalStyles } from '../styles/modalStyles';
import { Button } from './Button';

interface ResultModalProps {
  visible: boolean;
  colors: ThemeColors;
  difficultyMode: DifficultyMode;
  challengeState?: ChallengeState;
  score: number;
  totalTasks: number;
  onRestart: () => void;
  onContinue: () => void;
  t: {
    challengeOver: string;
    newHighScore: string;
    challengeResult: string;
    highScore: string;
    tryAgain: string;
    great: string;
    youSolved: string;
    of: string;
    tasksCorrectly: string;
    newRound: string;
    continueGame: string;
  };
}

export function ResultModal({
  visible,
  colors,
  difficultyMode,
  challengeState,
  score,
  totalTasks,
  onRestart,
  onContinue,
  t,
}: ResultModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, { backgroundColor: colors.settingsMenu }]}>
          {difficultyMode === DifficultyMode.CHALLENGE && challengeState ? (
            <>
              <Text style={[modalStyles.title, { color: colors.text }]}>{t.challengeOver}</Text>
              {challengeState.isNewHighScore && (
                <Text style={[styles.newHighScoreText, { color: '#F59E0B' }]}>{t.newHighScore}</Text>
              )}
              <Text style={[modalStyles.text, { color: colors.text }]}>
                {t.challengeResult
                  .replace('{level}', String(challengeState.level))
                  .replace('{score}', String(score))}
              </Text>
              {challengeState.highScore > 0 && (
                <Text style={[styles.highScoreText, { color: colors.textSecondary }]}>
                  {t.highScore}: {challengeState.highScore}
                </Text>
              )}
              <Button label={t.tryAgain} onPress={onRestart} variant="primary" fullWidth colors={colors} />
            </>
          ) : (
            <>
              <Text style={[modalStyles.title, { color: colors.text }]}>{t.great}</Text>
              <Text style={[modalStyles.text, { color: colors.text }]}>
                {t.youSolved} {score} {t.of} {totalTasks} {t.tasksCorrectly}.
              </Text>
              <View style={styles.modalButtonRow}>
                <View style={styles.modalButtonWrap}>
                  <Button label={t.newRound} onPress={onRestart} variant="primary" fullWidth colors={colors} />
                </View>
                <View style={styles.modalButtonWrap}>
                  <Button label={t.continueGame} onPress={onContinue} variant="secondary" fullWidth colors={colors} />
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonWrap: {
    flex: 1,
  },
  newHighScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  highScoreText: {
    fontSize: 14,
    marginBottom: 16,
  },
});
