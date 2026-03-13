import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ThemeColors, DifficultyMode, ChallengeState } from '../types/game';

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
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.settingsMenu }]}>
          {difficultyMode === DifficultyMode.CHALLENGE && challengeState ? (
            <>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t.challengeOver}</Text>
              {challengeState.isNewHighScore && (
                <Text style={[styles.newHighScoreText, { color: '#F59E0B' }]}>{t.newHighScore}</Text>
              )}
              <Text style={[styles.modalText, { color: colors.text }]}>
                {t.challengeResult
                  .replace('{level}', String(challengeState.level))
                  .replace('{score}', String(score))}
              </Text>
              {challengeState.highScore > 0 && (
                <Text style={[styles.highScoreText, { color: colors.textSecondary }]}>
                  {t.highScore}: {challengeState.highScore}
                </Text>
              )}
              <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
                <Text style={styles.restartButtonText}>{t.tryAgain}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t.great}</Text>
              <Text style={[styles.modalText, { color: colors.text }]}>
                {t.youSolved} {score} {t.of} {totalTasks} {t.tasksCorrectly}.
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalButton} onPress={onRestart}>
                  <Text style={styles.modalButtonText}>{t.newRound}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={onContinue}>
                  <Text style={styles.modalButtonText}>{t.continueGame}</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
