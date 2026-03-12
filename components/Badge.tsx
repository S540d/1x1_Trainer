import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error';

interface BadgeProps {
  value: string | number;
  variant?: BadgeVariant;
  animated?: boolean;
}

const VARIANT_COLORS: Record<BadgeVariant, string> = {
  default: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

export function Badge({ value, variant = 'default', animated = false }: BadgeProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (animated && prevValue.current !== value) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.25,
          useNativeDriver: true,
          speed: 30,
          bounciness: 10,
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevValue.current = value;
  }, [value, animated, scale]);

  const bgColor = VARIANT_COLORS[variant];

  return (
    <Animated.View style={[styles.badge, { backgroundColor: bgColor, transform: [{ scale }] }]}>
      <Text style={styles.text}>{value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
