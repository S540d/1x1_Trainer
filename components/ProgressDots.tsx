import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DESIGN_TOKENS } from '../utils/constants';

interface ProgressDotsProps {
  current: number;
  total: number;
}

export function ProgressDots({ current, total }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              done ? styles.dotDone : styles.dotPending,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    borderRadius: 10,
  },
  dotDone: {
    width: 10,
    height: 10,
    backgroundColor: DESIGN_TOKENS.DOT_ACTIVE_COLOR,
  },
  dotPending: {
    width: 7,
    height: 7,
    backgroundColor: DESIGN_TOKENS.DOT_INACTIVE_COLOR,
  },
});
