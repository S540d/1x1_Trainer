import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BADGE_DEFINITIONS, DESIGN_TOKENS } from '../utils/constants';
import { ANIMATION_DURATIONS, prefersReducedMotion } from '../utils/animations';

interface BadgeUnlockToastProps {
  badgeIds: string[];
  onDone: () => void;
  badgeNewUnlockedLabel: string;
}

const DISPLAY_DURATION = 2400;

export function BadgeUnlockToast({ badgeIds, onDone, badgeNewUnlockedLabel }: BadgeUnlockToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (badgeIds.length === 0) return;

    // Always reset to initial hidden state so repeated toasts animate correctly
    opacity.setValue(0);
    translateY.setValue(40);

    const reduced = prefersReducedMotion();

    if (reduced) {
      opacity.setValue(1);
      translateY.setValue(0);
      const t = setTimeout(onDone, DISPLAY_DURATION);
      return () => clearTimeout(t);
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.NORMAL,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION_DURATIONS.NORMAL,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 30,
          duration: ANIMATION_DURATIONS.NORMAL,
          useNativeDriver: true,
        }),
      ]).start(() => onDone());
    }, DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, [badgeIds, onDone, opacity, translateY]);

  if (badgeIds.length === 0) return null;

  const first = BADGE_DEFINITIONS.find(b => b.id === badgeIds[0]);
  const icon = first?.icon ?? '🏅';
  const extra = badgeIds.length > 1 ? ` +${badgeIds.length - 1}` : '';

  return (
    <Animated.View
      style={[styles.toast, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{badgeNewUnlockedLabel}</Text>
        {extra ? <Text style={styles.extra}>{extra}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: DESIGN_TOKENS.GRADIENT_PRIMARY[1],
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 16,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    zIndex: 2000,
  },
  icon: {
    fontSize: 28,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#fff',
  },
  extra: {
    fontSize: 12,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: 'rgba(255,255,255,0.75)',
  },
});
