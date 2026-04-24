import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const STARS: Array<{ topPct: number; leftPct: number; size: number; opacity: number }> = [
  { topPct: 8,  leftPct: 5,  size: 22, opacity: 0.18 },
  { topPct: 15, leftPct: 88, size: 18, opacity: 0.20 },
  { topPct: 35, leftPct: 92, size: 14, opacity: 0.15 },
  { topPct: 55, leftPct: 3,  size: 16, opacity: 0.17 },
  { topPct: 70, leftPct: 80, size: 20, opacity: 0.20 },
  { topPct: 82, leftPct: 12, size: 13, opacity: 0.15 },
  { topPct: 90, leftPct: 60, size: 17, opacity: 0.18 },
];

export function FloatingStars() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STARS.map((s, i) => (
        <Text
          key={i}
          style={{
            position: 'absolute',
            top: `${s.topPct}%` as `${number}%`,
            left: `${s.leftPct}%` as `${number}%`,
            fontSize: s.size,
            opacity: s.opacity,
            color: '#764ba2',
          }}
        >
          ★
        </Text>
      ))}
    </View>
  );
}
