/**
 * StreakWarningModal
 * Evening reminder shown when a still-savable streak has not been played today.
 * Extracted 1:1 from the inline modal in App.tsx (Issue #357, Punkt 1).
 */

import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../types/game';
import { TranslationStrings } from '../i18n/translations';

interface StreakWarningModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  currentStreak: number;
  t: TranslationStrings;
}

export const StreakWarningModal: React.FC<StreakWarningModalProps> = ({
  visible,
  onClose,
  colors,
  currentStreak,
  t,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={[styles.card, { backgroundColor: colors.settingsMenu }]}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t.streakWarningTitle}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {t.streakWarningMessage.replace('{days}', String(currentStreak))}
        </Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>{t.streakWarningButton}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 28,
    width: '80%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
