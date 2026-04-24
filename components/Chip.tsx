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
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { borderColor: colors.border },
        active && styles.chipActive,
        disabled && { opacity: 0.6 },
        size === 'sm' && styles.chipSm,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.chipText,
          { color: colors.text },
          active && styles.chipTextActive,
          size === 'sm' && styles.chipTextSm,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const ACTIVE_COLOR = DESIGN_TOKENS.GRADIENT_PRIMARY[0]; // #667eea

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    borderWidth: 2,
    borderColor: '#dde3ff',
    backgroundColor: '#f7f8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: ACTIVE_COLOR,
    borderColor: ACTIVE_COLOR,
  },
  chipSm: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  chipText: {
    fontSize: 14,
    fontFamily: DESIGN_TOKENS.FONT_UI,
    color: '#2d2b55',
  },
  chipTextActive: {
    color: '#fff',
    fontFamily: DESIGN_TOKENS.FONT_UI,
  },
  chipTextSm: {
    fontSize: 12,
  },
});
