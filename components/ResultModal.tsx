import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ThemeColors, DifficultyMode, ChallengeState } from '../types/game';
import { modalStyles } from '../styles/modalStyles';

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
              <TouchableOpacity style={modalStyles.primaryButton} onPress={onRestart}>
                <Text style={modalStyles.primaryButtonText}>{t.tryAgain}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[modalStyles.title, { color: colors.text }]}>{t.great}</Text>
              <Text style={[modalStyles.text, { color: colors.text }]}>
                {t.youSolved} {score} {t.of} {totalTasks} {t.tasksCorrectly}.
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalButton} onPress={onRestart}>
                  <Text style={modalStyles.primaryButtonText}>{t.newRound}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={onContinue}>
                  <Text style={modalStyles.primaryButtonText}>{t.continueGame}</Text>
                </TouchableOpacity>
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
  modalButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
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
