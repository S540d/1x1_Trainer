import React from 'react';
import { StyleSheet, View } from 'react-native';

interface HomeIconProps {
  color: string;
  size?: number;
}

/**
 * Schematic outline house built from plain views (no icon library in the
 * project). The roof is the top-left corner of a square rotated by 45°.
 * Issue #428.
 */
export function HomeIcon({ color, size = 22 }: HomeIconProps) {
  const stroke = Math.max(2, Math.round(size / 11));
  const roof = size * 0.62;
  return (
    <View style={{ width: size, height: size }} accessible={false}>
      <View
        style={[
          styles.roof,
          {
            width: roof,
            height: roof,
            top: size * 0.33,
            left: (size - roof) / 2,
            borderTopWidth: stroke,
            borderLeftWidth: stroke,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.body,
          {
            width: size * 0.7,
            height: size * 0.45,
            left: size * 0.15,
            borderWidth: stroke,
            borderTopWidth: 0,
            borderColor: color,
          },
        ]}
      >
        <View
          style={{
            width: size * 0.2,
            height: size * 0.24,
            borderWidth: stroke,
            borderBottomWidth: 0,
            borderColor: color,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  roof: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  body: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
