import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors, Language, ThemeMode } from '../types/game';
import { translations } from '../i18n/translations';
import { DESIGN_TOKENS } from '../utils/constants';
import { Chip } from './Chip';

interface PersonalizeModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  language: Language;
  onLanguageChange: (language: Language) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
}

export function PersonalizeModal({
  visible,
  onClose,
  colors,
  language,
  onLanguageChange,
  themeMode,
  onThemeModeChange,
}: PersonalizeModalProps) {
  const t = translations[language];

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        style={[styles.settingsOverlay, { backgroundColor: colors.settingsOverlay }]}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.settingsMenu}>
        <LinearGradient
          colors={DESIGN_TOKENS.GRADIENT_PRIMARY}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.settingsMenuHeader}
        >
          <Text style={styles.settingsMenuTitle}>{t.personalize}</Text>
          <TouchableOpacity style={styles.settingsMenuCloseButton} onPress={onClose}>
            <Text style={styles.settingsMenuCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>
            {t.appearance}
          </Text>
          <View style={styles.chipRow}>
            <Chip
              label={t.light}
              active={themeMode === 'light'}
              onPress={() => onThemeModeChange('light')}
              colors={colors}
            />
            <Chip
              label={t.dark}
              active={themeMode === 'dark'}
              onPress={() => onThemeModeChange('dark')}
              colors={colors}
            />
            <Chip
              label={t.system}
              active={themeMode === 'system'}
              onPress={() => onThemeModeChange('system')}
              colors={colors}
            />
          </View>
        </View>

        <View style={styles.settingsDivider} />

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>
            {t.language}
          </Text>
          <View style={styles.chipRow}>
            <Chip
              label={t.english}
              active={language === 'en'}
              onPress={() => onLanguageChange('en')}
              colors={colors}
            />
            <Chip
              label={t.german}
              active={language === 'de'}
              onPress={() => onLanguageChange('de')}
              colors={colors}
            />
          </View>
        </View>
      </View>
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
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsSectionTitle: {
    fontSize: 11,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#9b8ecf',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.08,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(102,126,234,0.1)',
    marginVertical: 2,
  },
});
