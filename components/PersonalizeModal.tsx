import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ThemeColors, Language, ThemeMode } from '../types/game';
import { translations } from '../i18n/translations';

interface PersonalizeModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  language: Language;
  onLanguageChange: (language: Language) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
}

/**
 * Personalize Modal for personal preferences
 * Separate modal similar to EnergyPriceGermany's CustomizeModal
 * Contains: Language and Appearance (Theme)
 */
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
      {/* Overlay */}
      <TouchableOpacity
        style={[styles.settingsOverlay, { backgroundColor: colors.settingsOverlay }]}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Modal Panel */}
      <View style={[styles.settingsMenu, { backgroundColor: colors.settingsMenu }]}>
        {/* Header */}
        <View style={[styles.settingsMenuHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingsMenuTitle, { color: colors.text }]}>
            {t.personalize}
          </Text>
          <TouchableOpacity
            style={styles.settingsMenuCloseButton}
            onPress={onClose}
          >
            <Text style={[styles.settingsMenuCloseButtonText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
            {t.appearance}
          </Text>
          <View style={styles.themeToggle}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.border },
                themeMode === 'light' && styles.themeButtonActive,
              ]}
              onPress={() => onThemeModeChange('light')}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  { color: colors.text },
                  themeMode === 'light' && styles.themeButtonTextActive,
                ]}
              >
                {t.light}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.border },
                themeMode === 'dark' && styles.themeButtonActive,
              ]}
              onPress={() => onThemeModeChange('dark')}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  { color: colors.text },
                  themeMode === 'dark' && styles.themeButtonTextActive,
                ]}
              >
                {t.dark}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.border },
                themeMode === 'system' && styles.themeButtonActive,
              ]}
              onPress={() => onThemeModeChange('system')}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  { color: colors.text },
                  themeMode === 'system' && styles.themeButtonTextActive,
                ]}
              >
                {t.system}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingsDivider} />

        {/* Language Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
            {t.language}
          </Text>
          <View style={styles.themeToggle}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.border },
                language === 'en' && styles.themeButtonActive,
              ]}
              onPress={() => onLanguageChange('en')}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  { color: colors.text },
                  language === 'en' && styles.themeButtonTextActive,
                ]}
              >
                {t.english}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { borderColor: colors.border },
                language === 'de' && styles.themeButtonActive,
              ]}
              onPress={() => onLanguageChange('de')}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  { color: colors.text },
                  language === 'de' && styles.themeButtonTextActive,
                ]}
              >
                {t.german}
              </Text>
            </TouchableOpacity>
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
    minWidth: 200,
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
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
  },
  themeButtonTextActive: {
    color: '#fff',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
});
