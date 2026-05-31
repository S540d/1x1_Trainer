import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../types/game';
import { DESIGN_TOKENS } from '../utils/constants';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ThemeColors;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Chip({ label, active, onPress, colors, disabled = false, size = 'md' }: ChipProps) {
  const activeColor = colors.gradientPrimary[0];
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: colors.buttonInactive, borderColor: colors.border },
        active && { backgroundColor: activeColor, borderColor: activeColor },
        disabled && { opacity: 0.6 },
        size === 'sm' && styles.chipSm,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.chipText,
          { color: colors.buttonInactiveText },
          active && styles.chipTextActive,
          size === 'sm' && styles.chipTextSm,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    borderWidth: 2,
    borderColor: '#dde3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSm: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  chipText: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  chipTextActive: {
    color: '#fff',
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  chipTextSm: {
    fontSize: 12,
  },
});
