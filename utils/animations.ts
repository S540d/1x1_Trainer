/**
 * Animation constants and helpers for 1x1 Trainer
 */

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
  SKELETON: 1200,
} as const;

export const SPRING_CONFIG = {
  BOUNCE: { damping: 10, stiffness: 200 },
  GENTLE: { damping: 20, stiffness: 150 },
  PRESS: { damping: 15, stiffness: 300 },
} as const;
