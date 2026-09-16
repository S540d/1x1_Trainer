import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
              <Text style={styles.tileTitle}>{tile.title}</Text>
              <Text style={styles.tileBody}>{tile.body}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.settingsHint, { backgroundColor: colors.card }]}>
        <Text style={styles.settingsHintEmoji}>💡</Text>
        <Text style={[styles.settingsHintText, { color: colors.textSecondary }]}>
          {t.welcomeSettingsHint}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'center',
  },
  wave: {
    fontSize: 40,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    marginBottom: 24,
  },
  tilesColumn: {
    width: '100%',
    maxWidth: 420,
    gap: 18,
  },
  tile: {
    borderRadius: 32,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  tileEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  tileTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    fontFamily: DESIGN_TOKENS.FONT_UI,
    marginBottom: 4,
    textAlign: 'center',
    color: '#ffffff',
  },
  tileBody: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    lineHeight: 19,
    color: '#ffffff',
    opacity: 0.92,
  },
  settingsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 24,
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
