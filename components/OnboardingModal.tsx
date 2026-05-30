import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '../types/game';
import { modalStyles } from '../styles/modalStyles';
import { DESIGN_TOKENS } from '../utils/constants';
import { prefersReducedMotion } from '../utils/animations';

interface OnboardingModalProps {
  visible: boolean;
  onFinish: () => void;
  colors: ThemeColors;
  t: {
    onboardingWelcomeTitle: string;
    onboardingWelcomeBody: string;
    onboardingDemoTitle: string;
    onboardingDemoTooltip: string;
    onboardingSettingsTitle: string;
    onboardingSettingsBody: string;
    onboardingReadyTitle: string;
    onboardingReadyBody: string;
    onboardingDemoRetry: string;
    onboardingSettingsLabel: string;
    onboardingNext: string;
    onboardingStart: string;
    onboardingSkip: string;
  };
}

const DEMO_CHOICES = [5, 6, 8];
const DEMO_CORRECT = 6;
const TOTAL_STEPS = 4;

export function OnboardingModal({ visible, onFinish, colors, t }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [demoAnswer, setDemoAnswer] = useState<number | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const demoCorrect = demoAnswer === DEMO_CORRECT;
  const demoWrong = demoAnswer !== null && demoAnswer !== DEMO_CORRECT;

  const handleClose = () => {
    setStep(0);
    setDemoAnswer(null);
    onFinish();
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      handleClose();
    }
  };

  const handleDemoChoice = (choice: number) => {
    if (demoAnswer !== null) return;
    setDemoAnswer(choice);
    if (choice !== DEMO_CORRECT) {
      if (prefersReducedMotion()) {
        setDemoAnswer(null);
        return;
      }
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => setDemoAnswer(null));
    }
  };

  const canProceedStep1 = step !== 1 || demoCorrect;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.content, styles.container, { backgroundColor: colors.settingsMenu }]}>

          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step && styles.dotActive,
                  { backgroundColor: i === step ? colors.gradientPrimary[0] : colors.border },
                ]}
              />
            ))}
          </View>

          {/* Step content */}
          {step === 0 && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>🎉</Text>
              <Text style={[styles.title, { color: colors.text }]}>{t.onboardingWelcomeTitle}</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>{t.onboardingWelcomeBody}</Text>
            </View>
          )}

          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={[styles.title, { color: colors.text }]}>{t.onboardingDemoTitle}</Text>
              <Animated.View style={[styles.demoCard, { backgroundColor: colors.card, transform: [{ translateX: shakeAnim }] }]}>
                <Text style={[styles.demoEquation, { color: colors.text, fontFamily: DESIGN_TOKENS.FONT_NUMBER }]}>
                  2 × 3 = ?
                </Text>
              </Animated.View>
              <Text style={[styles.tooltip, { color: colors.textSecondary }]}>
                ↑ {t.onboardingDemoTooltip}
              </Text>
              <View style={styles.choicesRow}>
                {DEMO_CHOICES.map(choice => {
                  const isSelected = demoAnswer === choice;
                  const isCorrectChoice = choice === DEMO_CORRECT;
                  let bg = colors.buttonInactive;
                  let border = colors.border;
                  let textColor = colors.text;
                  if (isSelected && isCorrectChoice) {
                    bg = '#ECFDF5';
                    border = '#43e97b';
                    textColor = '#059669';
                  } else if (isSelected && !isCorrectChoice) {
                    bg = '#FFF1F2';
                    border = '#f857a6';
                    textColor = '#be123c';
                  }
                  return (
                    <TouchableOpacity
                      key={choice}
                      style={[styles.choiceButton, { backgroundColor: bg, borderColor: border }]}
                      onPress={() => handleDemoChoice(choice)}
                      disabled={demoAnswer !== null}
                    >
                      <Text style={[styles.choiceText, { color: textColor, fontFamily: DESIGN_TOKENS.FONT_NUMBER }]}>
                        {choice}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {demoCorrect && (
                <Text style={styles.feedbackCorrect}>✓</Text>
              )}
              {demoWrong && (
                <Text style={[styles.body, { color: colors.textSecondary }]}>
                  {t.onboardingDemoRetry}
                </Text>
              )}
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>⚙️</Text>
              <Text style={[styles.title, { color: colors.text }]}>{t.onboardingSettingsTitle}</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>{t.onboardingSettingsBody}</Text>
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.menuHint}
              >
                <Text style={styles.menuHintText}>☰</Text>
              </LinearGradient>
              <Text style={[styles.tooltip, { color: colors.textSecondary }]}>{t.onboardingSettingsLabel}</Text>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.emoji}>🚀</Text>
              <Text style={[styles.title, { color: colors.text }]}>{t.onboardingReadyTitle}</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>{t.onboardingReadyBody}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.skipButton} onPress={handleClose}>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>{t.onboardingSkip}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, !canProceedStep1 && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!canProceedStep1}
            >
              <LinearGradient
                colors={canProceedStep1 ? colors.gradientPrimary : ['#ccc', '#ccc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {step === TOTAL_STEPS - 1 ? t.onboardingStart : t.onboardingNext}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '88%',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  stepContent: {
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
    lineHeight: 20,
  },
  tooltip: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    textAlign: 'center',
  },
  demoCard: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  demoEquation: {
    fontSize: 32,
  },
  choicesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  choiceButton: {
    width: 64,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceText: {
    fontSize: 22,
  },
  feedbackCorrect: {
    fontSize: 32,
    color: '#059669',
  },
  menuHint: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  menuHintText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  nextButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
});
