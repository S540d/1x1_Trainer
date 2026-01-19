import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { ThemeColors } from '../types/game';
import { translations } from '../i18n/translations';
import { Operation, DifficultyMode, Language, NumberRange } from '../types/game';

interface PersonalizeModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  operation: Operation;
  onOperationChange: (operation: Operation) => void;
  difficultyMode: DifficultyMode;
  onDifficultyModeChange: (mode: DifficultyMode) => void;
  numberRange: NumberRange;
  onNumberRangeChange: (range: NumberRange) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

/**
 * Personalize Modal for game mode configuration
 * Allows users to set operation, difficulty mode, and language
 * Similar to CustomizeModal in EnergyPriceGermany
 */
export function PersonalizeModal({
  visible,
  onClose,
  colors,
  operation,
  onOperationChange,
  difficultyMode,
  onDifficultyModeChange,
  numberRange,
  onNumberRangeChange,
  language,
  onLanguageChange,
}: PersonalizeModalProps) {
  const t = translations[language];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <>
        {/* Overlay */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Panel */}
        <ScrollView style={[styles.menu, { backgroundColor: colors.settingsMenu }]}>
        {/* Header with Close Button */}
        <View style={[styles.menuHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>
            {t.personalize}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Operation Section */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
            {t.operation}
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.button,
                { borderColor: colors.border },
                operation === Operation.ADDITION && styles.buttonActive,
              ]}
              onPress={() => onOperationChange(Operation.ADDITION)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.text },
                  operation === Operation.ADDITION && styles.buttonTextActive,
                ]}
              >
                {t.addition}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { borderColor: colors.border },
                operation === Operation.MULTIPLICATION && styles.buttonActive,
              ]}
              onPress={() => onOperationChange(Operation.MULTIPLICATION)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.text },
                  operation === Operation.MULTIPLICATION && styles.buttonTextActive,
                ]}
              >
                {t.multiplication}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {/* Difficulty Mode Section */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
            {t.difficultyMode}
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.button,
                { borderColor: colors.border },
                difficultyMode === DifficultyMode.SIMPLE && styles.buttonActive,
              ]}
              onPress={() => onDifficultyModeChange(DifficultyMode.SIMPLE)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.text },
                  difficultyMode === DifficultyMode.SIMPLE && styles.buttonTextActive,
                ]}
              >
                {t.simpleMode}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { borderColor: colors.border },
                difficultyMode === DifficultyMode.CREATIVE && styles.buttonActive,
              ]}
              onPress={() => onDifficultyModeChange(DifficultyMode.CREATIVE)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.text },
                  difficultyMode === DifficultyMode.CREATIVE && styles.buttonTextActive,
                ]}
              >
                {t.creativeMode}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.modeInfo, { color: colors.textSecondary }]}>
            {difficultyMode === DifficultyMode.SIMPLE ? t.simpleModeInfo : t.creativeModeInfo}
          </Text>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {/* Number Range Section */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
            {t.numberRange}
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.button,
                { borderColor: colors.border },
                numberRange === NumberRange.SMALL && styles.buttonActive,
              ]}
              onPress={() => onNumberRangeChange(NumberRange.SMALL)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.text },
                  numberRange === NumberRange.SMALL && styles.buttonTextActive,
                ]}
              >
                {t.upTo20}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { borderColor: colors.border },
                numberRange === NumberRange.LARGE && styles.buttonActive,
              ]}
              onPress={() => onNumberRangeChange(NumberRange.LARGE)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.text },
                  numberRange === NumberRange.LARGE && styles.buttonTextActive,
                ]}
              >
                {t.upTo100}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Language Section */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
            {t.language}
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.button,
                { borderColor: colors.border },
                language === 'en' && styles.buttonActive,
              ]}
              onPress={() => onLanguageChange('en')}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.text },
                  language === 'en' && styles.buttonTextActive,
                ]}
              >
                {t.english}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { borderColor: colors.border },
                language === 'de' && styles.buttonActive,
              ]}
              onPress={() => onLanguageChange('de')}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.text },
                  language === 'de' && styles.buttonTextActive,
                ]}
              >
                {t.german}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 8,
    width: 320,
    maxHeight: '85%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    padding: 16,
    gap: 16,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '300',
  },
  settingsSection: {
    gap: 8,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  buttonActive: {
    borderWidth: 2.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextActive: {
    fontWeight: '700',
  },
  modeInfo: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
});
