import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors, Language, ThemeMode, ThemeName } from '../types/game';
import { translations } from '../i18n/translations';
import { THEMES, DESIGN_TOKENS } from '../utils/constants';
import { Chip } from './Chip';

interface PersonalizeModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  language: Language;
  onLanguageChange: (language: Language) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  themeName: ThemeName;
  onThemeNameChange: (name: ThemeName) => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
  soundVolume: number;
  onSoundVolumeChange: (volume: number) => void;
}

export function PersonalizeModal({
  visible,
  onClose,
  colors,
  language,
  onLanguageChange,
  themeMode,
  onThemeModeChange,
  themeName,
  onThemeNameChange,
  soundEnabled,
  onSoundEnabledChange,
  soundVolume,
  onSoundVolumeChange,
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
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.settingsMenuHeader}
        >
          <Text style={styles.settingsMenuTitle}>{t.personalize}</Text>
          <TouchableOpacity style={styles.settingsMenuCloseButton} onPress={onClose}>
            <Text style={styles.settingsMenuCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView bounces={false} style={styles.settingsScroll}>
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

          <View style={[styles.settingsDivider, { backgroundColor: colors.border }]} />

          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
              {t.colorTheme}
            </Text>
            <View style={styles.themeGrid}>
              {(Object.keys(THEMES) as ThemeName[]).map((name) => {
                const themeData = THEMES[name];
                const isActive = themeName === name;
                const swatchBorderColor = themeData.LIGHT.GRADIENT_PRIMARY[0];
                return (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.themeSwatchWrapper,
                      isActive && { borderColor: swatchBorderColor },
                    ]}
                    onPress={() => onThemeNameChange(name)}
                    activeOpacity={0.75}
                  >
                    <LinearGradient
                      colors={themeData.LIGHT.GRADIENT_PRIMARY}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.themeSwatch}
                    />
                    <Text style={[styles.themeLabel, { color: colors.text }]}>
                      {themeData.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.settingsDivider, { backgroundColor: colors.border }]} />

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

          <View style={[styles.settingsDivider, { backgroundColor: colors.border }]} />

          <View style={styles.settingsSection}>
            <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
              {t.sounds}
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label={t.soundsOn}
                active={soundEnabled}
                onPress={() => onSoundEnabledChange(true)}
                colors={colors}
              />
              <Chip
                label={t.soundsOff}
                active={!soundEnabled}
                onPress={() => onSoundEnabledChange(false)}
                colors={colors}
              />
            </View>
          </View>

          {soundEnabled && (
            <>
              <View style={[styles.settingsDivider, { backgroundColor: colors.border }]} />
              <View style={styles.settingsSection}>
                <Text style={[styles.settingsSectionTitle, { color: colors.textSecondary }]}>
                  {t.soundVolume}
                </Text>
                <View style={styles.chipRow}>
                  {([25, 50, 75, 100] as const).map((v) => (
                    <Chip
                      key={v}
                      label={`${v}%`}
                      active={soundVolume === v}
                      onPress={() => onSoundVolumeChange(v)}
                      colors={colors}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
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
    bottom: 20,
    borderRadius: DESIGN_TOKENS.NUMPAD_BORDER_RADIUS,
    elevation: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    zIndex: 1000,
    overflow: 'hidden',
  },
  settingsScroll: {
    flexShrink: 1,
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
    fontFamily: DESIGN_TOKENS.FONT_UI,
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
    marginVertical: 2,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeSwatchWrapper: {
    alignItems: 'center',
    gap: 4,
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeSwatch: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  themeLabel: {
    fontSize: 10,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    maxWidth: 52,
  },
});
