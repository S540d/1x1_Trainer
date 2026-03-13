import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Animated,
} from 'react-native';
import { ThemeColors, Operation, DifficultyMode, NumberRange } from '../types/game';
import { CONTACT_EMAIL } from '../utils/constants';

interface SettingsMenuProps {
  colors: ThemeColors;
  screenHeight: number;
  menuAnimatedStyle: {
    transform: { translateY: Animated.Value }[];
    opacity: Animated.Value;
  };
  // Game state
  difficultyMode: DifficultyMode;
  selectedOperations: Set<Operation>;
  numberRange: NumberRange;
  // Actions
  onToggleOperation: (op: Operation) => void;
  onChangeDifficultyMode: (mode: DifficultyMode) => void;
  onSetNumberRange: (range: NumberRange) => void;
  onHideMenu: () => void;
  onOpenPersonalize: () => void;
  onOpenAbout: () => void;
  // Translations
  t: {
    operation: string;
    addition: string;
    subtraction: string;
    multiplication: string;
    division: string;
    difficultyMode: string;
    simpleMode: string;
    creativeMode: string;
    challenge: string;
    simpleModeInfo: string;
    creativeModeInfo: string;
    challengeInfo: string;
    numberRange: string;
    upTo10: string;
    upTo20: string;
    upTo50: string;
    upTo100: string;
    personalize: string;
    feedback: string;
    support: string;
    about: string;
  };
}

export function SettingsMenu({
  colors,
  screenHeight,
  menuAnimatedStyle,
  difficultyMode,
  selectedOperations,
  numberRange,
  onToggleOperation,
  onChangeDifficultyMode,
  onSetNumberRange,
  onHideMenu,
  onOpenPersonalize,
  onOpenAbout,
  t,
}: SettingsMenuProps) {
  return (
    <>
      <TouchableOpacity
        style={[styles.settingsOverlay, { backgroundColor: colors.settingsOverlay }]}
        activeOpacity={1}
        onPress={onHideMenu}
      />
      <Animated.View style={[styles.settingsMenu, { backgroundColor: colors.settingsMenu, maxHeight: screenHeight - 80 }, menuAnimatedStyle]}>
        <View style={[styles.settingsMenuHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingsMenuTitle, { color: colors.text }]}>Settings</Text>
          <TouchableOpacity
            style={styles.settingsMenuCloseButton}
            onPress={onHideMenu}
          >
            <Text style={[styles.settingsMenuCloseButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView bounces={false}>

        {/* Personalize Button */}
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={[styles.personalizeButton, { borderColor: colors.border }]}
            onPress={onOpenPersonalize}
          >
            <Text style={[styles.personalizeButtonText, { color: colors.text }]}>{t.personalize}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsDivider} />

        {/* Operation Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.operation}</Text>
          <View style={styles.operationGrid}>
            {([
              { op: Operation.ADDITION, symbol: '+', label: t.addition },
              { op: Operation.SUBTRACTION, symbol: '−', label: t.subtraction },
              { op: Operation.MULTIPLICATION, symbol: '×', label: t.multiplication },
              { op: Operation.DIVISION, symbol: '÷', label: t.division },
            ] as const).map(({ op, symbol, label }) => {
              const isChallenge = difficultyMode === DifficultyMode.CHALLENGE;
              const isActive = isChallenge || selectedOperations.has(op);
              return (
                <TouchableOpacity
                  key={op}
                  style={[
                    styles.operationButton,
                    { borderColor: colors.border },
                    isActive && styles.operationButtonActive,
                    isChallenge && { opacity: 0.6 },
                  ]}
                  onPress={() => onToggleOperation(op)}
                  disabled={isChallenge}
                >
                  <Text
                    style={[
                      styles.operationButtonText,
                      { color: colors.text },
                      isActive && styles.operationButtonTextActive,
                    ]}
                  >
                    {symbol} {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.settingsDivider} />

        {/* Difficulty Mode Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.difficultyMode}</Text>
          <View style={styles.themeToggle}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.border },
                difficultyMode === DifficultyMode.SIMPLE && styles.themeButtonActive,
              ]}
              onPress={() => onChangeDifficultyMode(DifficultyMode.SIMPLE)}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  { color: colors.text },
                  difficultyMode === DifficultyMode.SIMPLE && styles.themeButtonTextActive,
                ]}
              >
                {t.simpleMode}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.border },
                difficultyMode === DifficultyMode.CREATIVE && styles.themeButtonActive,
              ]}
              onPress={() => onChangeDifficultyMode(DifficultyMode.CREATIVE)}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  { color: colors.text },
                  difficultyMode === DifficultyMode.CREATIVE && styles.themeButtonTextActive,
                ]}
              >
                {t.creativeMode}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.border },
                difficultyMode === DifficultyMode.CHALLENGE && styles.themeButtonActive,
              ]}
              onPress={() => {
                onChangeDifficultyMode(DifficultyMode.CHALLENGE);
                onHideMenu();
              }}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  { color: colors.text },
                  difficultyMode === DifficultyMode.CHALLENGE && styles.themeButtonTextActive,
                ]}
              >
                {t.challenge}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.settingsModeInfo, { color: colors.textSecondary }]}>
            {difficultyMode === DifficultyMode.SIMPLE
              ? t.simpleModeInfo
              : difficultyMode === DifficultyMode.CREATIVE
              ? t.creativeModeInfo
              : t.challengeInfo}
          </Text>
        </View>

        <View style={styles.settingsDivider} />

        {/* Number Range Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>{t.numberRange}</Text>
          <View style={styles.numberRangeGrid}>
            {([
              { range: NumberRange.RANGE_10, label: t.upTo10 },
              { range: NumberRange.RANGE_20, label: t.upTo20 },
              { range: NumberRange.RANGE_50, label: t.upTo50 },
              { range: NumberRange.RANGE_100, label: t.upTo100 },
            ] as const).map(({ range, label }) => {
              const isChallengeMode = difficultyMode === DifficultyMode.CHALLENGE;
              const isActive = isChallengeMode ? range === NumberRange.RANGE_100 : numberRange === range;
              return (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.rangeButton,
                    { borderColor: colors.border },
                    isActive && styles.rangeButtonActive,
                    isChallengeMode && { opacity: 0.6 },
                  ]}
                  onPress={() => onSetNumberRange(range)}
                  disabled={isChallengeMode}
                >
                  <Text
                    style={[
                      styles.rangeButtonText,
                      { color: colors.text },
                      isActive && styles.rangeButtonTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.settingsDivider} />

        {/* Feedback, Support and About in One Row */}
        <View style={[styles.settingsSection, styles.settingsSectionRow]}>
          <TouchableOpacity
            style={styles.settingsMenuLinkFlex}
            onPress={() => {
              Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=1x1 Trainer Feedback`);
              onHideMenu();
            }}
          >
            <Text style={styles.settingsMenuLinkText}>{t.feedback}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsMenuLinkFlex}
            onPress={() => {
              Linking.openURL('https://ko-fi.com/devsven');
              onHideMenu();
            }}
          >
            <Text style={styles.settingsMenuLinkText}>{t.support}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsMenuLinkFlex}
            onPress={onOpenAbout}
          >
            <Text style={styles.settingsMenuLinkText}>{t.about}</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  settingsMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
    overflow: 'hidden',
  },
  settingsMenuHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingsMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingsMenuCloseButton: {
    padding: 12,
    alignItems: 'flex-end',
  },
  settingsMenuCloseButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  settingsMenuLinkFlex: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingsMenuLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  personalizeButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    alignItems: 'center',
  },
  personalizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsSectionRow: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingsModeInfo: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 4,
  },
  themeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  themeButtonTextActive: {
    color: '#fff',
  },
  operationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  operationButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    alignItems: 'center',
  },
  operationButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  operationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  operationButtonTextActive: {
    color: '#fff',
  },
  numberRangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rangeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  rangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
});
