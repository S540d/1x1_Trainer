import React, { useRef } from 'react';
import { Text, StyleSheet, Pressable, Animated } from 'react-native';
import { ThemeColors } from '../types/game';
import { prefersReducedMotion } from '../utils/animations';

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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (prefersReducedMotion()) return;
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (prefersReducedMotion()) return;
    Animated.spring(scale, {
      toValue: 1.0,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const bg = disabled ? colors.buttonInactive : VARIANT_BG[variant];
  const isOutline = variant === 'secondary';

  const labelStyle = [
    styles.label,
    { color: disabled ? colors.buttonInactiveText : '#FFFFFF' },
    isOutline && !disabled && { color: colors.text },
  ];

  const viewStyle = [
    styles.button,
    { backgroundColor: bg },
    isOutline && { borderWidth: 1.5, borderColor: colors.border },
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
  ];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[...viewStyle, { transform: [{ scale }] }]}>
        <Text style={labelStyle}>{label}</Text>
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
