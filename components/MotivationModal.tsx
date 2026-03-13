import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ThemeColors } from '../types/game';

interface MotivationModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  score: number;
  t: {
    motivationTitleLowScore: string;
    motivationTitleMediumScore: string;
    motivationTitleHighScore: string;
    motivationMessageLowScore: string;
    motivationMessageMediumScore: string;
    motivationMessageHighScore: string;
    motivationButton: string;
  };
}

export function MotivationModal({ visible, onClose, colors, score, t }: MotivationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.settingsMenu }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {score <= 3
              ? t.motivationTitleLowScore
              : score <= 6
              ? t.motivationTitleMediumScore
              : t.motivationTitleHighScore}
          </Text>
          <Text style={[styles.modalText, { color: colors.text }]}>
            {score <= 3
              ? t.motivationMessageLowScore
              : score <= 6
              ? t.motivationMessageMediumScore
              : t.motivationMessageHighScore}
          </Text>
          <TouchableOpacity
            style={styles.restartButton}
            onPress={onClose}
          >
            <Text style={styles.restartButtonText}>{t.motivationButton}</Text>
          </TouchableOpacity>
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
});
