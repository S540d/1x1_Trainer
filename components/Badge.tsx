import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { SPRING_CONFIG } from '../utils/animations';

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
  const scale = useSharedValue(1);
  const prevValue = React.useRef(value);

  useEffect(() => {
    if (animated && prevValue.current !== value) {
      scale.value = withSequence(
        withSpring(1.25, SPRING_CONFIG.BOUNCE),
        withTiming(1.0, { duration: 150 })
      );
    }
    prevValue.current = value;
  }, [value, animated, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgColor = VARIANT_COLORS[variant];

  return (
    <Animated.View style={[styles.badge, { backgroundColor: bgColor }, animatedStyle]}>
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
