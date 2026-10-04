import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemeColors } from '../types/game';
import { DESIGN_TOKENS } from '../utils/constants';

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
  progress: Animated.Value;
}) {
  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.card, colors.border],
  });

  return <Animated.View style={[styles.block, style, { backgroundColor }]} />;
}

export function SkeletonLoader({ colors }: SkeletonLoaderProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
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
    paddingHorizontal: DESIGN_TOKENS.SPACING_LG,
    paddingVertical: DESIGN_TOKENS.SPACING_LG,
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
    borderRadius: DESIGN_TOKENS.RADIUS_LG,
  },
  contentArea: {
    flex: 1,
    padding: DESIGN_TOKENS.SPACING_LG,
  },
  questionCard: {
    borderRadius: DESIGN_TOKENS.RADIUS_LG,
    height: 180,
    marginBottom: DESIGN_TOKENS.SPACING_LG,
  },
  numpad: {
    gap: DESIGN_TOKENS.SPACING_SM,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: DESIGN_TOKENS.SPACING_SM,
  },
  numpadButton: {
    flex: 1,
    height: 56,
    borderRadius: DESIGN_TOKENS.RADIUS_MD,
  },
  block: {
    borderRadius: DESIGN_TOKENS.RADIUS_SM,
  },
});
