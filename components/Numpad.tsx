import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DESIGN_TOKENS } from '../utils/constants';
import { prefersReducedMotion } from '../utils/animations';

interface NumpadProps {
  onNumberClick: (num: number) => void;
  onCheck: () => void;
  userAnswer: string;
  isAnswerChecked: boolean;
  checkLabel: string;
  nextLabel: string;
  encouragement: string;
}

export function Numpad({
  onNumberClick,
  onCheck,
  userAnswer,
  isAnswerChecked,
  checkLabel,
  nextLabel,
  encouragement,
}: NumpadProps) {
  const canCheck = userAnswer !== '' || isAnswerChecked;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (canCheck && !prefersReducedMotion()) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => { pulseLoop.current?.stop(); };
  }, [canCheck, pulseAnim, pulseLoop]);

  return (
    <View style={styles.card}>
      <View style={styles.numpad}>
        <View style={styles.numpadRow}>
          <NumpadButton text="1" onPress={() => onNumberClick(1)} />
          <NumpadButton text="2" onPress={() => onNumberClick(2)} />
          <NumpadButton text="3" onPress={() => onNumberClick(3)} />
        </View>
        <View style={styles.numpadRow}>
          <NumpadButton text="4" onPress={() => onNumberClick(4)} />
          <NumpadButton text="5" onPress={() => onNumberClick(5)} />
          <NumpadButton text="6" onPress={() => onNumberClick(6)} />
        </View>
        <View style={styles.numpadRow}>
          <NumpadButton text="7" onPress={() => onNumberClick(7)} />
          <NumpadButton text="8" onPress={() => onNumberClick(8)} />
          <NumpadButton text="9" onPress={() => onNumberClick(9)} />
        </View>
        <View style={styles.numpadRow}>
          <NumpadButton
            text="⌫"
            onPress={() => onNumberClick(-1)}
            isBackspace
          />
          <NumpadButton text="0" onPress={() => onNumberClick(0)} />
          <Animated.View style={[{ flex: 1 }, { transform: [{ scale: pulseAnim }] }]}>
            {canCheck ? (
              <TouchableOpacity onPress={onCheck} activeOpacity={0.85} style={{ flex: 1 }}>
                <LinearGradient
                  colors={DESIGN_TOKENS.GRADIENT_PRIMARY}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.checkButton}
                >
                  <Text style={styles.checkButtonText}>
                    {isAnswerChecked ? nextLabel : checkLabel}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={[styles.checkButton, styles.checkButtonDisabled]}>
                <Text style={styles.checkButtonText}>{checkLabel}</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
      <Text style={styles.motivationText}>{encouragement}</Text>
    </View>
  );
}

function NumpadButton({
  text,
  onPress,
  isBackspace = false,
}: {
  text: string;
  onPress: () => void;
  isBackspace?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!prefersReducedMotion()) {
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
    }
  };

  const handlePressOut = () => {
    if (!prefersReducedMotion()) {
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
          isBackspace && styles.numpadButtonBackspace,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.numpadButtonText, isBackspace && styles.numpadButtonBackspaceText]}>
          {text}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DESIGN_TOKENS.NUMPAD_CARD_BG,
    borderRadius: DESIGN_TOKENS.NUMPAD_BORDER_RADIUS,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    gap: 8,
  },
  numpad: {
    width: '100%',
    gap: 8,
  },
  numpadRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 60,
    gap: 8,
  },
  numpadButton: {
    flex: 1,
    height: 60,
    backgroundColor: DESIGN_TOKENS.NUMPAD_BUTTON_BG,
    borderRadius: DESIGN_TOKENS.NUMPAD_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadButtonBackspace: {
    backgroundColor: DESIGN_TOKENS.NUMPAD_BACKSPACE_BG,
  },
  numpadButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  numpadButtonBackspaceText: {
    color: DESIGN_TOKENS.NUMPAD_ICON_COLOR,
  },
  checkButton: {
    flex: 1,
    height: 60,
    borderRadius: DESIGN_TOKENS.NUMPAD_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  motivationText: {
    textAlign: 'center',
    fontSize: 14,
    color: DESIGN_TOKENS.NUMPAD_ICON_COLOR,
    fontWeight: 'bold',
    paddingTop: 4,
  },
});
