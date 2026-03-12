import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ThemeColors } from '../types/game';
import { SPRING_CONFIG } from '../utils/animations';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  colors: ThemeColors;
}

const VARIANT_BG: Record<ButtonVariant, string> = {
  primary: '#10B981',
  secondary: 'transparent',
  danger: '#EF4444',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  colors,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, SPRING_CONFIG.PRESS);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, SPRING_CONFIG.GENTLE);
  };

  const bg = disabled ? colors.buttonInactive : VARIANT_BG[variant];
  const isOutline = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: bg },
          isOutline && { borderWidth: 1.5, borderColor: colors.border },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: disabled ? colors.buttonInactiveText : '#FFFFFF' },
            isOutline && { color: colors.text },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
