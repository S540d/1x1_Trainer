import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ThemeColors, Operation, DifficultyMode, NumberRange } from '../types/game';
import { modalStyles } from '../styles/modalStyles';
import { DESIGN_TOKENS } from '../utils/constants';

interface TaskSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  difficultyMode: DifficultyMode;
  selectedOperations: Set<Operation>;
  numberRange: NumberRange;
  weakTaskCount?: number;
  onToggleOperation: (op: Operation) => void;
  onChangeDifficultyMode: (mode: DifficultyMode) => void;
  onSetNumberRange: (range: NumberRange) => void;
  t: {
    taskSettingsTitle: string;
    operation: string;
    addition: string;
    subtraction: string;
    multiplication: string;
    division: string;
    difficultyMode: string;
    simpleMode: string;
    creativeMode: string;
    practiceMode: string;
    challenge: string;
    simpleModeInfo: string;
    creativeModeInfo: string;
    practiceModeInfo: string;
    challengeInfo: string;
    numberRange: string;
    upTo10: string;
    upTo20: string;
    upTo50: string;
    upTo100: string;
  };
}

export function TaskSettingsModal({
  visible,
  onClose,
  colors,
  difficultyMode,
  selectedOperations,
  numberRange,
  weakTaskCount,
  onToggleOperation,
  onChangeDifficultyMode,
  onSetNumberRange,
  t,
}: TaskSettingsModalProps) {
  const buttonBg = colors.buttonInactive;
  const buttonBorder = colors.border;
  const buttonText = colors.buttonInactiveText;
  const sectionTitle = colors.textSecondary;
  const modeInfo = colors.textSecondary;
  const activeColor = colors.gradientPrimary[0];
  const activeStyle = { backgroundColor: activeColor, borderColor: activeColor };
  const isChallenge = difficultyMode === DifficultyMode.CHALLENGE;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.settingsMenu }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t.taskSettingsTitle}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Operation Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: sectionTitle }]}>{t.operation}</Text>
              <View style={styles.grid}>
                {(
                  [
                    { op: Operation.ADDITION, symbol: '+', label: t.addition },
                    { op: Operation.SUBTRACTION, symbol: '−', label: t.subtraction },
                    { op: Operation.MULTIPLICATION, symbol: '×', label: t.multiplication },
                    { op: Operation.DIVISION, symbol: '÷', label: t.division },
                  ] as const
                ).map(({ op, symbol, label }) => {
                  const isActive = isChallenge || selectedOperations.has(op);
                  return (
                    <TouchableOpacity
                      key={op}
                      style={[
                        styles.gridButton,
                        { backgroundColor: buttonBg, borderColor: buttonBorder },
                        isActive && activeStyle,
                        isChallenge && { opacity: 0.6 },
                      ]}
                      onPress={() => onToggleOperation(op)}
                      disabled={isChallenge}
                    >
                      <Text
                        style={[
                          styles.gridButtonText,
                          { color: buttonText },
                          isActive && styles.gridButtonTextActive,
                        ]}
                      >
                        {symbol} {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Difficulty Mode Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: sectionTitle }]}>{t.difficultyMode}</Text>
              <View style={styles.grid}>
                {(
                  [
                    { mode: DifficultyMode.SIMPLE, label: t.simpleMode },
                    { mode: DifficultyMode.CREATIVE, label: t.creativeMode },
                    { mode: DifficultyMode.CHALLENGE, label: t.challenge },
                    {
                      mode: DifficultyMode.PRACTICE,
                      label:
                        t.practiceMode +
                        (weakTaskCount !== undefined && weakTaskCount > 0
                          ? ` (${weakTaskCount})`
                          : ''),
                    },
                  ] as const
                ).map(({ mode, label }) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.gridButton,
                      { backgroundColor: buttonBg, borderColor: buttonBorder },
                      difficultyMode === mode && activeStyle,
                    ]}
                    onPress={() => onChangeDifficultyMode(mode)}
                  >
                    <Text
                      style={[
                        styles.gridButtonText,
                        { color: buttonText },
                        difficultyMode === mode && styles.gridButtonTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.modeInfo, { color: modeInfo }]}>
                {difficultyMode === DifficultyMode.SIMPLE
                  ? t.simpleModeInfo
                  : difficultyMode === DifficultyMode.CREATIVE
                    ? t.creativeModeInfo
                    : difficultyMode === DifficultyMode.PRACTICE
                      ? t.practiceModeInfo
                      : t.challengeInfo}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Number Range Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: sectionTitle }]}>{t.numberRange}</Text>
              <View style={styles.grid}>
                {(
                  [
                    { range: NumberRange.RANGE_10, label: t.upTo10 },
                    { range: NumberRange.RANGE_20, label: t.upTo20 },
                    { range: NumberRange.RANGE_50, label: t.upTo50 },
                    { range: NumberRange.RANGE_100, label: t.upTo100 },
                  ] as const
                ).map(({ range, label }) => {
                  const isActive = isChallenge
                    ? range === NumberRange.RANGE_100
                    : numberRange === range;
                  return (
                    <TouchableOpacity
                      key={range}
                      style={[
                        styles.gridButton,
                        { backgroundColor: buttonBg, borderColor: buttonBorder },
                        isActive && activeStyle,
                        isChallenge && { opacity: 0.6 },
                      ]}
                      onPress={() => onSetNumberRange(range)}
                      disabled={isChallenge}
                    >
                      <Text
                        style={[
                          styles.gridButtonText,
                          { color: buttonText },
                          isActive && styles.gridButtonTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    width: '92%',
    maxWidth: 440,
    maxHeight: '88%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  closeButton: {
    padding: 6,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  scroll: {
    maxHeight: 440,
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.08,
  },
  modeInfo: {
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(102,126,234,0.1)',
    marginVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    borderWidth: 2,
    alignItems: 'center',
  },
  gridButtonText: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  gridButtonTextActive: {
    color: '#fff',
  },
});
