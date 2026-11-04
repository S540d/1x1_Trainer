import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '../types/game';
import { DESIGN_TOKENS } from '../utils/constants';

interface WelcomeScreenProps {
  colors: ThemeColors;
  onSelectLernreise: () => void;
  onSelectRowPick: () => void;
  onSelectChallenge: () => void;
  onOpenTaskSettings: () => void;
  onShowMenu: () => void;
  t: {
    welcomeTitle: string;
    welcomeLernreiseTitle: string;
    welcomeLernreiseBody: string;
    welcomeRowPickTitle: string;
    welcomeRowPickBody: string;
    welcomeChallengeTitle: string;
    welcomeChallengeBody: string;
    welcomeSettingsHint: string;
  };
}

export function WelcomeScreen({
  colors,
  onSelectLernreise,
  onSelectRowPick,
  onSelectChallenge,
  onOpenTaskSettings,
  onShowMenu,
  t,
}: WelcomeScreenProps) {
  const tiles = [
    {
      emoji: '🗺️',
      title: t.welcomeLernreiseTitle,
      body: t.welcomeLernreiseBody,
      onPress: onSelectLernreise,
      gradient: DESIGN_TOKENS.GRADIENT_PRIMARY,
    },
    {
      emoji: '💪',
      title: t.welcomeRowPickTitle,
      body: t.welcomeRowPickBody,
      onPress: onSelectRowPick,
      gradient: DESIGN_TOKENS.GRADIENT_CORRECT,
    },
    {
      emoji: '🏆',
      title: t.welcomeChallengeTitle,
      body: t.welcomeChallengeBody,
      onPress: onSelectChallenge,
      gradient: DESIGN_TOKENS.GRADIENT_GOLD,
    },
  ];

  // Tiles put the emoji beside the text and the content scrolls, so the
  // hint below the tiles stays reachable on small phones (Issue #428).
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={onShowMenu} style={styles.menuButton} aria-label="Settings">
        <Text style={[styles.menuButtonText, { color: colors.text }]}>⋮</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.wave}>👋</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t.welcomeTitle}</Text>
        <View style={styles.tilesColumn}>
          {tiles.map((tile) => (
            <TouchableOpacity key={tile.title} onPress={tile.onPress} activeOpacity={0.85}>
              <LinearGradient
                colors={tile.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tile}
              >
                <Text style={styles.tileEmoji}>{tile.emoji}</Text>
                <View style={styles.tileText}>
                  <Text style={styles.tileTitle}>{tile.title}</Text>
                  <Text style={styles.tileBody}>{tile.body}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={onOpenTaskSettings}
          activeOpacity={0.7}
          accessibilityRole="button"
          style={[styles.settingsHint, { backgroundColor: colors.card }]}
        >
          <Text style={styles.settingsHintEmoji}>💡</Text>
          <Text style={[styles.settingsHintText, { color: colors.textSecondary }]}>
            {t.welcomeSettingsHint}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: DESIGN_TOKENS.SPACING_MD,
    right: DESIGN_TOKENS.SPACING_LG,
    padding: DESIGN_TOKENS.SPACING_SM,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'normal',
  },
  content: {
    paddingHorizontal: DESIGN_TOKENS.SPACING_XL,
    paddingVertical: DESIGN_TOKENS.SPACING_XL,
    alignItems: 'center',
  },
  wave: {
    fontSize: 36,
    marginBottom: DESIGN_TOKENS.SPACING_XS,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.SPACING_XL,
  },
  tilesColumn: {
    width: '100%',
    maxWidth: 420,
    gap: DESIGN_TOKENS.SPACING_MD,
  },
  tile: {
    borderRadius: DESIGN_TOKENS.RADIUS_XL,
    paddingVertical: DESIGN_TOKENS.SPACING_LG,
    paddingHorizontal: DESIGN_TOKENS.SPACING_LG,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.SPACING_MD,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  tileEmoji: {
    fontSize: 36,
  },
  tileText: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginBottom: 2,
    color: '#ffffff',
  },
  tileBody: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    lineHeight: 19,
    color: '#ffffff',
    opacity: 0.92,
  },
  settingsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN_TOKENS.SPACING_SM,
    borderRadius: 20,
    paddingVertical: DESIGN_TOKENS.SPACING_MD,
    paddingHorizontal: DESIGN_TOKENS.SPACING_LG,
    marginTop: DESIGN_TOKENS.SPACING_XL,
    width: '100%',
    maxWidth: 420,
  },
  settingsHintEmoji: {
    fontSize: 18,
  },
  settingsHintText: {
    flex: 1,
    fontSize: 13,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    lineHeight: 18,
  },
});
