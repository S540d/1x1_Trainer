import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { ThemeColors } from '../types/game';
import { modalStyles } from '../styles/modalStyles';
import { DESIGN_TOKENS } from '../utils/constants';

interface LernreiseIntroModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  t: {
    lernreiseIntroTitle: string;
    lernreiseIntroBody: string;
    lernreiseIntroPracticeHint: string;
    lernreiseIntroStart: string;
  };
}

export function LernreiseIntroModal({ visible, onClose, colors, t }: LernreiseIntroModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View
          style={[modalStyles.content, styles.container, { backgroundColor: colors.settingsMenu }]}
        >
          <Text style={styles.emoji}>🗺️</Text>
          <Text style={[styles.title, { color: colors.text }]}>{t.lernreiseIntroTitle}</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{t.lernreiseIntroBody}</Text>
          <View style={[styles.hintCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              💡 {t.lernreiseIntroPracticeHint}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.gradientPrimary[0] }]}
            onPress={onClose}
          >
            <Text style={styles.startButtonText}>{t.lernreiseIntroStart}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '88%',
    maxWidth: 420,
    paddingHorizontal: DESIGN_TOKENS.SPACING_XXL,
    paddingTop: DESIGN_TOKENS.SPACING_XXL,
    paddingBottom: DESIGN_TOKENS.SPACING_XL,
    alignItems: 'center',
    gap: DESIGN_TOKENS.SPACING_MD,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    lineHeight: 20,
  },
  hintCard: {
    borderRadius: DESIGN_TOKENS.RADIUS_LG,
    padding: 14,
    width: '100%',
  },
  hintText: {
    fontSize: 13,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    lineHeight: 18,
  },
  startButton: {
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    paddingVertical: DESIGN_TOKENS.SPACING_MD,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: DESIGN_TOKENS.SPACING_XS,
    width: '100%',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
});
