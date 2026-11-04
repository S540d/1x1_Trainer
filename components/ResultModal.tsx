import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { ThemeColors, DifficultyMode, ChallengeState, RowMasteryStatus } from '../types/game';
import { modalStyles } from '../styles/modalStyles';
import { Button } from './Button';
import { HomeIcon } from './HomeIcon';
import { DESIGN_TOKENS } from '../utils/constants';

const STATUS_EMOJI: Record<RowMasteryStatus, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
};

interface LernreiseResult {
  row: number;
  status: RowMasteryStatus | null;
}

interface ResultModalProps {
  visible: boolean;
  colors: ThemeColors;
  difficultyMode: DifficultyMode;
  challengeState?: ChallengeState;
  score: number;
  lernreiseResult?: LernreiseResult | null;
  onRestart: () => void;
  onContinue: () => void;
  onGoHome: () => void;
  t: {
    challengeOver: string;
    newHighScore: string;
    challengeResult: string;
    highScore: string;
    tryAgain: string;
    motivationTitleLowScore: string;
    motivationMessageLowScore: string;
    motivationTitleMediumScore: string;
    motivationMessageMediumScore: string;
    motivationTitleHighScore: string;
    motivationMessageHighScore: string;
    newRound: string;
    continueGame: string;
    lernreiseRowLabel: string;
    lernreiseResultGold: string;
    lernreiseResultSilver: string;
    lernreiseResultBronze: string;
    lernreiseResultRetry: string;
    lernreiseBackToMap: string;
    backToHome: string;
  };
}

export function ResultModal({
  visible,
  colors,
  difficultyMode,
  challengeState,
  score,
  lernreiseResult,
  onRestart,
  onContinue,
  onGoHome,
  t,
}: ResultModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, { backgroundColor: colors.settingsMenu }]}>
          {difficultyMode === DifficultyMode.CHALLENGE && challengeState ? (
            <>
              <Text style={[modalStyles.title, { color: colors.text }]}>{t.challengeOver}</Text>
              {challengeState.isNewHighScore && (
                <Text style={[styles.newHighScoreText, { color: '#F59E0B' }]}>
                  {t.newHighScore}
                </Text>
              )}
              <Text style={[modalStyles.text, { color: colors.text }]}>
                {t.challengeResult
                  .replace('{level}', String(challengeState.level))
                  .replace('{score}', String(score))}
              </Text>
              {challengeState.highScore > 0 && (
                <Text style={[styles.highScoreText, { color: colors.textSecondary }]}>
                  {t.highScore}: {challengeState.highScore}
                </Text>
              )}
              <Button
                label={t.tryAgain}
                onPress={onRestart}
                variant="primary"
                fullWidth
                colors={colors}
              />
            </>
          ) : (
            <>
              {lernreiseResult ? (
                <>
                  <Text style={styles.lernreiseEmoji}>
                    {lernreiseResult.status ? STATUS_EMOJI[lernreiseResult.status] : '💪'}
                  </Text>
                  <Text style={[modalStyles.title, { color: colors.text }]}>
                    {t.lernreiseRowLabel.replace('{row}', String(lernreiseResult.row))}
                  </Text>
                  <Text style={[modalStyles.text, { color: colors.text }]}>
                    {lernreiseResult.status === 'gold'
                      ? t.lernreiseResultGold
                      : lernreiseResult.status === 'silver'
                        ? t.lernreiseResultSilver
                        : lernreiseResult.status === 'bronze'
                          ? t.lernreiseResultBronze
                          : t.lernreiseResultRetry}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[modalStyles.title, { color: colors.text }]}>
                    {score <= 3
                      ? t.motivationTitleLowScore
                      : score <= 6
                        ? t.motivationTitleMediumScore
                        : t.motivationTitleHighScore}
                  </Text>
                  <Text style={[modalStyles.text, { color: colors.text }]}>
                    {score <= 3
                      ? t.motivationMessageLowScore
                      : score <= 6
                        ? t.motivationMessageMediumScore
                        : t.motivationMessageHighScore}
                  </Text>
                </>
              )}
              <View style={styles.modalButtonRow}>
                <View style={styles.modalButtonWrap}>
                  <Button
                    label={lernreiseResult ? t.tryAgain : t.newRound}
                    onPress={onRestart}
                    variant="primary"
                    fullWidth
                    colors={colors}
                  />
                </View>
                <View style={styles.modalButtonWrap}>
                  <Button
                    label={lernreiseResult ? t.lernreiseBackToMap : t.continueGame}
                    onPress={onContinue}
                    variant="secondary"
                    fullWidth
                    colors={colors}
                  />
                </View>
              </View>
            </>
          )}
          <TouchableOpacity onPress={onGoHome} style={styles.homeLink} accessibilityRole="button">
            <HomeIcon color={colors.textSecondary} size={18} />
            <Text style={[styles.homeLinkText, { color: colors.textSecondary }]}>
              {t.backToHome}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalButtonRow: {
    flexDirection: 'row',
    gap: DESIGN_TOKENS.SPACING_MD,
    width: '100%',
  },
  modalButtonWrap: {
    flex: 1,
  },
  newHighScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: DESIGN_TOKENS.SPACING_SM,
  },
  highScoreText: {
    fontSize: 14,
    marginBottom: DESIGN_TOKENS.SPACING_LG,
  },
  homeLink: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'flex-end',
    gap: DESIGN_TOKENS.SPACING_SM,
    marginTop: DESIGN_TOKENS.SPACING_MD,
    paddingVertical: DESIGN_TOKENS.SPACING_SM,
  },
  homeLinkText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: -2,
    textDecorationLine: 'underline',
  },
  lernreiseEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.SPACING_XS,
  },
});
