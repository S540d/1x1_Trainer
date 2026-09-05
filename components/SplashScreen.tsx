import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors, Language } from '../types/game';
import { translations } from '../i18n/translations';
import { APP_NAME, APP_VERSION } from '../utils/constants';
import { ANIMATION_DURATIONS, prefersReducedMotion } from '../utils/animations';

interface SplashScreenProps {
  onFinish: () => void;
  colors: ThemeColors;
  language: Language;
}

// Time to keep the splash visible in the sequence, before starting the fade-out.
const HOLD_DURATION = 500;
// Time to keep the splash visible when reduced motion skips the animated sequence,
// so the branding is still briefly readable instead of vanishing instantly.
const REDUCED_MOTION_HOLD_DURATION = 400;

export function AppSplashScreen({ onFinish, colors, language }: SplashScreenProps) {
  const t = translations[language];

  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(12)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (prefersReducedMotion()) {
      iconScale.setValue(1);
      iconOpacity.setValue(1);
      titleOpacity.setValue(1);
      titleTranslateY.setValue(0);
      loadingOpacity.setValue(1);
      containerOpacity.setValue(1);
      const t1 = setTimeout(() => {
        if (!cancelled) onFinish();
      }, REDUCED_MOTION_HOLD_DURATION);
      timers.push(t1);
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    }

    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 10,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.SLOW,
        useNativeDriver: true,
      }),
    ]).start();

    const titleTimer = setTimeout(() => {
      if (cancelled) return;
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.NORMAL,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: ANIMATION_DURATIONS.NORMAL,
          useNativeDriver: true,
        }),
      ]).start();
    }, ANIMATION_DURATIONS.SLOW * 0.5);
    timers.push(titleTimer);

    const loadingTimer = setTimeout(
      () => {
        if (cancelled) return;
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.NORMAL,
          useNativeDriver: true,
        }).start();
      },
      ANIMATION_DURATIONS.SLOW * 0.5 + ANIMATION_DURATIONS.NORMAL * 0.5
    );
    timers.push(loadingTimer);

    const fadeOutDelay =
      ANIMATION_DURATIONS.SLOW * 0.5 + ANIMATION_DURATIONS.NORMAL + HOLD_DURATION;
    const fadeOutTimer = setTimeout(() => {
      if (cancelled) return;
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATIONS.NORMAL,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) onFinish();
      });
    }, fadeOutDelay);
    timers.push(fadeOutTimer);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: colors.background, opacity: containerOpacity }]}
    >
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Animated.View style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}>
          <Image
            source={require('../assets/splash-icon.png')}
            style={styles.icon}
            accessibilityIgnoresInvertColors
          />
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] },
          ]}
        >
          {APP_NAME}
        </Animated.Text>

        <Animated.Text style={[styles.loading, { opacity: loadingOpacity }]}>
          {t.splashLoading}
        </Animated.Text>
      </View>

      <Text style={styles.version}>v{APP_VERSION}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 140,
    height: 140,
    borderRadius: 28,
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loading: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  version: {
    position: 'absolute',
    bottom: 28,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});
