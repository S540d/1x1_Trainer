import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../types/game';

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

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipSm: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipTextSm: {
    fontSize: 12,
  },
});
