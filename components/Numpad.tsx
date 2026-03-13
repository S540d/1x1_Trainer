import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';
import { ThemeColors } from '../types/game';

interface NumpadProps {
  onNumberClick: (num: number) => void;
  onCheck: () => void;
  userAnswer: string;
  isAnswerChecked: boolean;
  colors: ThemeColors;
  reduceMotion: React.MutableRefObject<boolean>;
}

export function Numpad({
  onNumberClick,
  onCheck,
  userAnswer,
  isAnswerChecked,
  colors,
  reduceMotion,
}: NumpadProps) {
  return (
    <View style={styles.numpad}>
      <View style={styles.numpadRow}>
        <NumpadButton text="1" onPress={() => onNumberClick(1)} colors={colors} reduceMotion={reduceMotion} />
        <NumpadButton text="2" onPress={() => onNumberClick(2)} colors={colors} reduceMotion={reduceMotion} />
        <NumpadButton text="3" onPress={() => onNumberClick(3)} colors={colors} reduceMotion={reduceMotion} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="4" onPress={() => onNumberClick(4)} colors={colors} reduceMotion={reduceMotion} />
        <NumpadButton text="5" onPress={() => onNumberClick(5)} colors={colors} reduceMotion={reduceMotion} />
        <NumpadButton text="6" onPress={() => onNumberClick(6)} colors={colors} reduceMotion={reduceMotion} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="7" onPress={() => onNumberClick(7)} colors={colors} reduceMotion={reduceMotion} />
        <NumpadButton text="8" onPress={() => onNumberClick(8)} colors={colors} reduceMotion={reduceMotion} />
        <NumpadButton text="9" onPress={() => onNumberClick(9)} colors={colors} reduceMotion={reduceMotion} />
      </View>
      <View style={styles.numpadRow}>
        <NumpadButton text="←" onPress={() => onNumberClick(-1)} isSpecial colors={colors} reduceMotion={reduceMotion} />
        <NumpadButton text="0" onPress={() => onNumberClick(0)} colors={colors} reduceMotion={reduceMotion} />
        <TouchableOpacity
          style={[
            styles.numpadButtonCheck,
            userAnswer === '' && !isAnswerChecked && styles.numpadButtonCheckDisabled,
          ]}
          onPress={onCheck}
          disabled={userAnswer === '' && !isAnswerChecked}
        >
          <Text style={styles.numpadButtonCheckText}>
            {isAnswerChecked ? '→' : '✓'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NumpadButton({
  text,
  onPress,
  isSpecial = false,
  colors,
  reduceMotion,
}: {
  text: string;
  onPress: () => void;
  isSpecial?: boolean;
  colors: ThemeColors;
  reduceMotion: React.MutableRefObject<boolean>;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!reduceMotion.current) {
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion.current) {
      Animated.spring(scale, { toValue: 1.0, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
    }
  };

  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.numpadButton,
          { borderColor: isSpecial ? colors.textSecondary : colors.border },
          isSpecial && styles.numpadButtonSpecial,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.numpadButtonText, { color: colors.text }]}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  numpad: {
    width: '100%',
  },
  numpadRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 60,
    gap: 8,
    marginBottom: 8,
  },
  numpadButton: {
    flex: 1,
    height: 60,
    backgroundColor: 'transparent',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  numpadButtonSpecial: {
    backgroundColor: 'transparent',
  },
  numpadButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  numpadButtonCheck: {
    flex: 1,
    height: 60,
    backgroundColor: '#10B981',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  numpadButtonCheckDisabled: {
    backgroundColor: '#94A3B8',
  },
  numpadButtonCheckText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});
