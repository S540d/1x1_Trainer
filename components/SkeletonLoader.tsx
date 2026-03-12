import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { ThemeColors } from '../types/game';
import { ANIMATION_DURATIONS } from '../utils/animations';

interface SkeletonLoaderProps {
  colors: ThemeColors;
}

function SkeletonBlock({
  style,
  colors,
  progress,
}: {
  style?: object;
  colors: ThemeColors;
  progress: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.card, colors.border]
    ),
  }));

  return <Animated.View style={[styles.block, style, animatedStyle]} />;
}

export function SkeletonLoader({ colors }: SkeletonLoaderProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: ANIMATION_DURATIONS.SKELETON }),
      -1,
      true
    );
  }, [progress]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header skeleton */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <SkeletonBlock colors={colors} progress={progress} style={styles.headerChip} />
        <SkeletonBlock colors={colors} progress={progress} style={styles.headerChip} />
        <SkeletonBlock colors={colors} progress={progress} style={styles.headerIcon} />
      </View>

      {/* Question card skeleton */}
      <View style={styles.contentArea}>
        <SkeletonBlock colors={colors} progress={progress} style={styles.questionCard} />

        {/* Numpad skeleton */}
        <View style={styles.numpad}>
          {[0, 1, 2, 3].map((row) => (
            <View key={row} style={styles.numpadRow}>
              {[0, 1, 2].map((col) => (
                <SkeletonBlock
                  key={col}
                  colors={colors}
                  progress={progress}
                  style={styles.numpadButton}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerChip: {
    width: 80,
    height: 20,
    borderRadius: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    borderRadius: 16,
    height: 180,
    marginBottom: 16,
  },
  numpad: {
    gap: 8,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  numpadButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
  },
  block: {
    borderRadius: 8,
  },
});
