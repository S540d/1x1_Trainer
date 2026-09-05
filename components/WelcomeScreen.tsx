import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { ThemeColors } from '../types/game';
import { DESIGN_TOKENS } from '../utils/constants';

interface WelcomeScreenProps {
  colors: ThemeColors;
  onSelectLernreise: () => void;
  onSelectRowPick: () => void;
  onSelectChallenge: () => void;
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
  t,
}: WelcomeScreenProps) {
  const activeColor = colors.gradientPrimary[0];

  const tiles = [
    {
      emoji: '🗺️',
      title: t.welcomeLernreiseTitle,
      body: t.welcomeLernreiseBody,
      onPress: onSelectLernreise,
    },
    {
      emoji: '🔢',
      title: t.welcomeRowPickTitle,
      body: t.welcomeRowPickBody,
      onPress: onSelectRowPick,
    },
    {
      emoji: '🏆',
      title: t.welcomeChallengeTitle,
      body: t.welcomeChallengeBody,
      onPress: onSelectChallenge,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t.welcomeTitle}</Text>
      <View style={styles.tilesColumn}>
        {tiles.map((tile) => (
          <TouchableOpacity
            key={tile.title}
            style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={tile.onPress}
          >
            <Text style={styles.tileEmoji}>{tile.emoji}</Text>
            <Text style={[styles.tileTitle, { color: activeColor }]}>{tile.title}</Text>
            <Text style={[styles.tileBody, { color: colors.textSecondary }]}>{tile.body}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.settingsHint, { color: colors.textSecondary }]}>
        {t.welcomeSettingsHint}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    marginBottom: 24,
  },
  tilesColumn: {
    width: '100%',
    maxWidth: 420,
    gap: 16,
  },
  tile: {
    borderRadius: DESIGN_TOKENS.NUMPAD_BORDER_RADIUS,
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tileEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  tileTitle: {
    fontSize: 16,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginBottom: 4,
    textAlign: 'center',
  },
  tileBody: {
    fontSize: 13,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    lineHeight: 18,
  },
  settingsHint: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
    maxWidth: 420,
  },
});
