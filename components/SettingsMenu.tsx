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
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors, Operation, DifficultyMode, NumberRange } from '../types/game';
import { CONTACT_EMAIL, DESIGN_TOKENS } from '../utils/constants';

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
    settings: string;
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
      <Animated.View style={[styles.settingsMenu, { maxHeight: screenHeight - 80 }, menuAnimatedStyle]}>
        <LinearGradient
          colors={DESIGN_TOKENS.GRADIENT_PRIMARY}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.settingsMenuHeader}
        >
          <Text style={styles.settingsMenuTitle}>{t.settings}</Text>
          <TouchableOpacity
            style={styles.settingsMenuCloseButton}
            onPress={onHideMenu}
          >
            <Text style={styles.settingsMenuCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </LinearGradient>
        <ScrollView bounces={false}>

        {/* Personalize Button */}
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.personalizeButton}
            onPress={onOpenPersonalize}
          >
            <Text style={styles.personalizeButtonText}>{t.personalize}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsDivider} />

        {/* Operation Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>{t.operation}</Text>
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
                    isActive && styles.operationButtonActive,
                    isChallenge && { opacity: 0.6 },
                  ]}
                  onPress={() => onToggleOperation(op)}
                  disabled={isChallenge}
                >
                  <Text style={[styles.operationButtonText, isActive && styles.operationButtonTextActive]}>
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
          <Text style={styles.settingsSectionTitle}>{t.difficultyMode}</Text>
          <View style={styles.themeToggle}>
            <TouchableOpacity
              style={[styles.themeButton, difficultyMode === DifficultyMode.SIMPLE && styles.themeButtonActive]}
              onPress={() => onChangeDifficultyMode(DifficultyMode.SIMPLE)}
            >
              <Text style={[styles.themeButtonText, difficultyMode === DifficultyMode.SIMPLE && styles.themeButtonTextActive]}>
                {t.simpleMode}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeButton, difficultyMode === DifficultyMode.CREATIVE && styles.themeButtonActive]}
              onPress={() => onChangeDifficultyMode(DifficultyMode.CREATIVE)}
            >
              <Text style={[styles.themeButtonText, difficultyMode === DifficultyMode.CREATIVE && styles.themeButtonTextActive]}>
                {t.creativeMode}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeButton, difficultyMode === DifficultyMode.CHALLENGE && styles.themeButtonActive]}
              onPress={() => {
                onChangeDifficultyMode(DifficultyMode.CHALLENGE);
                onHideMenu();
              }}
            >
              <Text style={[styles.themeButtonText, difficultyMode === DifficultyMode.CHALLENGE && styles.themeButtonTextActive]}>
                {t.challenge}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.settingsModeInfo}>
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
          <Text style={styles.settingsSectionTitle}>{t.numberRange}</Text>
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
                    isActive && styles.rangeButtonActive,
                    isChallengeMode && { opacity: 0.6 },
                  ]}
                  onPress={() => onSetNumberRange(range)}
                  disabled={isChallengeMode}
                >
                  <Text style={[styles.rangeButtonText, isActive && styles.rangeButtonTextActive]}>
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
              Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('1x1 Trainer Feedback')}`).catch(() => {});
              onHideMenu();
            }}
          >
            <Text style={styles.settingsMenuLinkText}>{t.feedback}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsMenuLinkFlex}
            onPress={() => {
              Linking.openURL('https://ko-fi.com/devsven').catch(() => {});
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

const ACTIVE_COLOR = DESIGN_TOKENS.GRADIENT_PRIMARY[0]; // #667eea

const styles = StyleSheet.create({
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 999,
  },
  settingsMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    borderRadius: DESIGN_TOKENS.NUMPAD_BORDER_RADIUS,
    backgroundColor: '#fff',
    elevation: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    zIndex: 1000,
    overflow: 'hidden',
  },
  settingsMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  settingsMenuTitle: {
    fontSize: 18,
    fontFamily: DESIGN_TOKENS.FONT_NUMBER,
    color: '#fff',
    letterSpacing: 0.3,
  },
  settingsMenuCloseButton: {
    padding: 8,
    alignItems: 'flex-end',
  },
  settingsMenuCloseButtonText: {
    fontSize: 18,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#fff',
  },
  settingsMenuLinkFlex: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(102,126,234,0.12)',
  },
  settingsMenuLinkText: {
    fontSize: 13,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: ACTIVE_COLOR,
  },
  personalizeButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: ACTIVE_COLOR,
    alignItems: 'center',
  },
  personalizeButtonText: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: ACTIVE_COLOR,
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
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#9b8ecf',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.08,
  },
  settingsModeInfo: {
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#9b8ecf',
    marginTop: 8,
    fontStyle: 'italic',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(102,126,234,0.1)',
    marginVertical: 2,
  },
  themeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    backgroundColor: '#f7f8ff',
    borderWidth: 2,
    borderColor: '#dde3ff',
    alignItems: 'center',
  },
  themeButtonActive: {
    backgroundColor: ACTIVE_COLOR,
    borderColor: ACTIVE_COLOR,
  },
  themeButtonText: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#2d2b55',
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
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    backgroundColor: '#f7f8ff',
    borderWidth: 2,
    borderColor: '#dde3ff',
    alignItems: 'center',
  },
  operationButtonActive: {
    backgroundColor: ACTIVE_COLOR,
    borderColor: ACTIVE_COLOR,
  },
  operationButtonText: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#2d2b55',
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
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    backgroundColor: '#f7f8ff',
    borderWidth: 2,
    borderColor: '#dde3ff',
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: ACTIVE_COLOR,
    borderColor: ACTIVE_COLOR,
  },
  rangeButtonText: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#2d2b55',
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
});
