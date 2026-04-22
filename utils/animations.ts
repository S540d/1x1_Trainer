import { AccessibilityInfo, Platform } from 'react-native';

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
  SKELETON: 1200,
} as const;

// Default true: never animate before the system preference is known.
let _reducedMotion = true;
let _subscription: { remove(): void } | null = null;

/**
 * Initializes reduced-motion tracking. Call once from App startup and use the
 * returned cleanup function in the unmount effect. Replaces any previous
 * subscription so it is safe to call multiple times (e.g. fast refresh).
 */
export function initReducedMotionListener(): () => void {
  AccessibilityInfo.isReduceMotionEnabled().then((value) => {
    _reducedMotion = value;
  });

  _subscription?.remove();
  _subscription = null;

  if (Platform.OS !== 'web') {
    _subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      _reducedMotion = value;
    });
  }

  return () => {
    _subscription?.remove();
    _subscription = null;
  };
}

/** Returns true when the user has requested reduced motion. */
export function prefersReducedMotion(): boolean {
  return _reducedMotion;
}
