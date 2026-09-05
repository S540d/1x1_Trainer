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
import { ThemeColors } from '../types/game';
import { CONTACT_EMAIL, DESIGN_TOKENS } from '../utils/constants';

interface SettingsMenuProps {
  colors: ThemeColors;
  screenHeight: number;
  menuAnimatedStyle: {
    transform: { translateY: Animated.Value }[];
    opacity: Animated.Value;
  };
  // Actions
  onHideMenu: () => void;
  onOpenPersonalize: () => void;
  onOpenAbout: () => void;
  onOpenParentDashboard: () => void;
  onResetOnboarding: () => void;
  onOpenBadges: () => void;
  onOpenProfiles: () => void;
  onOpenLernreise: () => void;
  onOpenTaskSettings: () => void;
  // Translations
  t: {
    personalize: string;
    parentDashboard: string;
    parentDashboardMenu: string;
    badgesMenu: string;
    profilesMenu: string;
    lernreiseMenu: string;
    taskSettingsMenu: string;
    feedback: string;
    support: string;
    about: string;
    settings: string;
    resetOnboarding: string;
  };
}

export function SettingsMenu({
  colors,
  screenHeight,
  menuAnimatedStyle,
  onHideMenu,
  onOpenPersonalize,
  onOpenAbout,
  onOpenParentDashboard,
  onResetOnboarding,
  onOpenBadges,
  onOpenProfiles,
  onOpenLernreise,
  onOpenTaskSettings,
  t,
}: SettingsMenuProps) {
  const buttonBg = colors.buttonInactive;
  const buttonBorder = colors.border;
  const buttonText = colors.buttonInactiveText;
  const activeColor = colors.gradientPrimary[0];

  return (
    <>
      <TouchableOpacity
        style={[styles.settingsOverlay, { backgroundColor: colors.settingsOverlay }]}
        activeOpacity={1}
        onPress={onHideMenu}
      />
      <Animated.View
        style={[
          styles.settingsMenu,
          { maxHeight: screenHeight - 80, backgroundColor: colors.settingsMenu },
          menuAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.settingsMenuHeader}
        >
          <Text style={styles.settingsMenuTitle}>{t.settings}</Text>
          <TouchableOpacity style={styles.settingsMenuCloseButton} onPress={onHideMenu}>
            <Text style={styles.settingsMenuCloseButtonText}>✕</Text>
          </TouchableOpacity>
        </LinearGradient>
        <ScrollView bounces={false}>
          {/* Top Buttons */}
          <View style={styles.settingsSection}>
            <View style={styles.topButtonsGrid}>
              <TouchableOpacity
                style={[styles.topButton, { backgroundColor: buttonBg, borderColor: buttonBorder }]}
                onPress={() => {
                  onOpenPersonalize();
                  onHideMenu();
                }}
              >
                <Text style={[styles.topButtonText, { color: buttonText }]}>{t.personalize}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topButton, { backgroundColor: buttonBg, borderColor: buttonBorder }]}
                onPress={() => {
                  onOpenParentDashboard();
                  onHideMenu();
                }}
              >
                <Text style={[styles.topButtonText, { color: buttonText }]}>
                  {t.parentDashboardMenu}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topButton, { backgroundColor: buttonBg, borderColor: buttonBorder }]}
                onPress={() => {
                  onOpenBadges();
                  onHideMenu();
                }}
              >
                <Text style={[styles.topButtonText, { color: buttonText }]}>{t.badgesMenu}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topButton, { backgroundColor: buttonBg, borderColor: buttonBorder }]}
                onPress={onOpenProfiles}
              >
                <Text style={[styles.topButtonText, { color: buttonText }]}>{t.profilesMenu}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topButton, { backgroundColor: buttonBg, borderColor: buttonBorder }]}
                onPress={() => {
                  onOpenLernreise();
                  onHideMenu();
                }}
              >
                <Text style={[styles.topButtonText, { color: buttonText }]}>{t.lernreiseMenu}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.topButton,
                  { backgroundColor: activeColor, borderColor: activeColor },
                ]}
                onPress={() => {
                  onOpenTaskSettings();
                  onHideMenu();
                }}
              >
                <Text style={[styles.topButtonText, styles.topButtonTextActive]}>
                  {t.taskSettingsMenu}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingsDivider} />

          {/* Feedback, Support and About in One Row */}
          <View style={[styles.settingsSection, styles.settingsSectionRow]}>
            <TouchableOpacity
              style={styles.settingsMenuLinkFlex}
              onPress={() => {
                Linking.openURL(
                  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('1x1 Trainer Feedback')}`
                ).catch(() => {});
                onHideMenu();
              }}
            >
              <Text style={[styles.settingsMenuLinkText, { color: activeColor }]}>
                {t.feedback}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsMenuLinkFlex}
              onPress={() => {
                Linking.openURL('https://ko-fi.com/devsven').catch(() => {});
                onHideMenu();
              }}
            >
              <Text style={[styles.settingsMenuLinkText, { color: activeColor }]}>{t.support}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsMenuLinkFlex} onPress={onOpenAbout}>
              <Text style={[styles.settingsMenuLinkText, { color: activeColor }]}>{t.about}</Text>
            </TouchableOpacity>
          </View>

          {/* Reset Onboarding */}
          <TouchableOpacity
            style={[styles.settingsSection, styles.resetOnboardingButton]}
            onPress={() => {
              onResetOnboarding();
              onHideMenu();
            }}
          >
            <Text style={styles.resetOnboardingText}>{t.resetOnboarding}</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 999,
  },
  settingsMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    borderRadius: DESIGN_TOKENS.NUMPAD_BORDER_RADIUS,
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
  },
  topButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    borderWidth: 2,
    alignItems: 'center',
  },
  topButtonText: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  topButtonTextActive: {
    color: '#fff',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsSectionRow: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(102,126,234,0.1)',
    marginVertical: 2,
  },
  resetOnboardingButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(102,126,234,0.1)',
  },
  resetOnboardingText: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: 'rgba(102,126,234,0.6)',
  },
});
