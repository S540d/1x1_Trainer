import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
  history: (boolean | null)[];
}

const CORRECT_COLOR = '#10B981';
const INCORRECT_COLOR = '#EF4444';
const NEUTRAL_COLOR = '#E2E8F0';

export function ProgressBar({ history }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      {history.map((result, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              backgroundColor:
                result === true
                  ? CORRECT_COLOR
                  : result === false
                    ? INCORRECT_COLOR
                    : NEUTRAL_COLOR,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    flexDirection: 'row',
    height: 10,
    gap: 3,
  },
  segment: {
    flex: 1,
    height: '100%',
    borderRadius: 3,
  },
});
