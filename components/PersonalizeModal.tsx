import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ThemeColors, Language, ThemeMode } from '../types/game';
import { translations } from '../i18n/translations';
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

      <View style={[styles.settingsMenu, { backgroundColor: colors.settingsMenu }]}>
        <View style={[styles.settingsMenuHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingsMenuTitle, { color: colors.text }]}>
            {t.personalize}
          </Text>
          <TouchableOpacity style={styles.settingsMenuCloseButton} onPress={onClose}>
            <Text style={[styles.settingsMenuCloseButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
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
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  settingsMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
    overflow: 'hidden',
  },
  settingsMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingsMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsMenuCloseButton: {
    padding: 12,
    alignItems: 'flex-end',
  },
  settingsMenuCloseButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 4,
  },
});
