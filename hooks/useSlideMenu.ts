/**
 * useSlideMenu Hook
 * Owns the settings-menu slide panel: mount flag + slide/fade animation.
 * Extracted from App.tsx (Issue #357, Punkt 1) — behaviour unchanged,
 * including the reduced-motion shortcut that skips the animation entirely.
 */

import { useRef, useState } from 'react';
import { Animated } from 'react-native';
import { ANIMATION_DURATIONS, prefersReducedMotion } from '../utils/animations';

const HIDDEN_OFFSET_Y = -300;

export function useSlideMenu() {
  const [rendered, setRendered] = useState(false);
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET_Y)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animatedStyle = {
    transform: [{ translateY }],
    opacity,
  };

  const show = () => {
    setRendered(true);
    if (prefersReducedMotion()) {
      translateY.setValue(0);
      opacity.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.FAST,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hide = () => {
    if (prefersReducedMotion()) {
      translateY.setValue(HIDDEN_OFFSET_Y);
      opacity.setValue(0);
      setRendered(false);
      return;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: HIDDEN_OFFSET_Y,
        duration: ANIMATION_DURATIONS.NORMAL,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATIONS.NORMAL,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  };

  return { rendered, animatedStyle, show, hide };
}
