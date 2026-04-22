import { AccessibilityInfo, Platform } from 'react-native';

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
  SKELETON: 1200,
} as const;

let _reducedMotion = false;

// Read the current system preference once and subscribe to changes.
AccessibilityInfo.isReduceMotionEnabled().then((value) => {
  _reducedMotion = value;
});
if (Platform.OS !== 'web') {
  AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
    _reducedMotion = value;
  });
}

/** Returns true when the user has requested reduced motion. */
export function prefersReducedMotion(): boolean {
  return _reducedMotion;
}
