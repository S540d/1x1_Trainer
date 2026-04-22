import React from 'react';
import {
  Text,
  View,
  Modal,
} from 'react-native';
import { ThemeColors } from '../types/game';
import { modalStyles } from '../styles/modalStyles';
import { Button } from './Button';

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
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, { backgroundColor: colors.settingsMenu }]}>
          <Text style={[modalStyles.title, { color: colors.text }]}>
            {score <= 3
              ? t.motivationTitleLowScore
              : score <= 6
              ? t.motivationTitleMediumScore
              : t.motivationTitleHighScore}
          </Text>
          <Text style={[modalStyles.text, { color: colors.text }]}>
            {score <= 3
              ? t.motivationMessageLowScore
              : score <= 6
              ? t.motivationMessageMediumScore
              : t.motivationMessageHighScore}
          </Text>
          <Button label={t.motivationButton} onPress={onClose} variant="primary" fullWidth colors={colors} />
        </View>
      </View>
    </Modal>
  );
}
