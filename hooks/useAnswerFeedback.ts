/**
 * useAnswerFeedback Hook
 * Bundles the audio/visual reactions to game events: answer sounds, the
 * badge-unlock and challenge level-up sounds, and the card scale/shake
 * animation. Extracted from App.tsx (Issue #357, Punkt 1) — behaviour and
 * timings unchanged, including the reduced-motion skip.
 */

import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { SoundEvent } from './useSounds';
import { prefersReducedMotion } from '../utils/animations';

interface UseAnswerFeedbackParams {
  isAnswerChecked: boolean;
  lastAnswerCorrect: boolean | null;
  newlyUnlockedCount: number;
  challengeLevel: number | undefined;
  playSound: (event: SoundEvent) => void;
}

export function useAnswerFeedback({
  isAnswerChecked,
  lastAnswerCorrect,
  newlyUnlockedCount,
  challengeLevel,
  playSound,
}: UseAnswerFeedbackParams) {
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardShakeX = useRef(new Animated.Value(0)).current;

  // Badge unlock sound
  const prevNewlyUnlockedLen = useRef(0);
  useEffect(() => {
    if (newlyUnlockedCount > prevNewlyUnlockedLen.current) {
      playSound('badge_unlock');
    }
    prevNewlyUnlockedLen.current = newlyUnlockedCount;
  }, [newlyUnlockedCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Challenge level-up sound
  const prevChallengeLevel = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (
      challengeLevel !== undefined &&
      prevChallengeLevel.current !== undefined &&
      challengeLevel > prevChallengeLevel.current
    ) {
      playSound('level_up');
    }
    prevChallengeLevel.current = challengeLevel;
  }, [challengeLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sound feedback on answer check
  useEffect(() => {
    if (!isAnswerChecked) return;
    if (lastAnswerCorrect === true) {
      playSound('correct');
    } else if (lastAnswerCorrect === false) {
      playSound('incorrect');
    }
  }, [isAnswerChecked, lastAnswerCorrect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Card animation (skipped when reduce motion is enabled)
  useEffect(() => {
    if (!isAnswerChecked || prefersReducedMotion()) return;
    if (lastAnswerCorrect === true) {
      Animated.sequence([
        Animated.spring(cardScale, {
          toValue: 1.04,
          useNativeDriver: true,
          speed: 30,
          bounciness: 10,
        }),
        Animated.spring(cardScale, {
          toValue: 1.0,
          useNativeDriver: true,
          speed: 30,
          bounciness: 6,
        }),
      ]).start();
    } else if (lastAnswerCorrect === false) {
      Animated.sequence([
        Animated.timing(cardShakeX, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(cardShakeX, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(cardShakeX, { toValue: -5, duration: 60, useNativeDriver: true }),
        Animated.timing(cardShakeX, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(cardShakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [isAnswerChecked, lastAnswerCorrect]); // eslint-disable-line react-hooks/exhaustive-deps

  const cardAnimatedStyle = {
    transform: [{ scale: cardScale }, { translateX: cardShakeX }],
  };

  return { cardAnimatedStyle };
}
