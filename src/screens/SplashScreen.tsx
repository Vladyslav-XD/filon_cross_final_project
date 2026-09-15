import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedMartiniIcon } from '../components/AnimatedMartiniIcon';

interface SplashScreenProps {
  /** when true the splash fades out (after MIN_VISIBLE_MS) and calls onFinish */
  ready: boolean;
  onFinish: () => void;
}

/**
 * Keep the brand moment short: the native splash has already been shown before this.
 * The motion below is timed so that a full gradient sweep and several logo pulses
 * are visible within MIN_VISIBLE_MS — slower cycles read as a static screen.
 */
const MIN_VISIBLE_MS = 2200;
const FADE_OUT_MS = 400;
const LOGO_IN_MS = 500;
const GRADIENT_SWEEP_MS = 1300; // one direction; a full there-and-back pass ≈ 2.6 s
const LOGO_PULSE_MS = 800; // one direction; full breath ≈ 1.6 s

export const SplashScreen = ({ ready, onFinish }: SplashScreenProps) => {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const gradientOpacity = useRef(new Animated.Value(0.35)).current;
  const gradientTranslateX = useRef(new Animated.Value(-width * 0.5)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: LOGO_IN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: LOGO_IN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Light sheen: brightens while it travels right, dims on the way back.
    const sheen = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(gradientOpacity, {
            toValue: 0.85,
            duration: GRADIENT_SWEEP_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(gradientTranslateX, {
            toValue: 0,
            duration: GRADIENT_SWEEP_MS,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(gradientOpacity, {
            toValue: 0.35,
            duration: GRADIENT_SWEEP_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(gradientTranslateX, {
            toValue: -width * 0.5,
            duration: GRADIENT_SWEEP_MS,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    sheen.start();
    return () => sheen.stop();
  }, []);

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(t);
  }, []);

  const finished = useRef(false);
  useEffect(() => {
    if (!ready || !minTimeElapsed || finished.current) return;
    finished.current = true;
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished: done }) => {
      if (done) onFinish();
    });
  }, [ready, minTimeElapsed, screenOpacity, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <LinearGradient
        colors={['#00BBA7', '#0092B8', '#007A9A'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View 
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: width * 1.5,
          opacity: gradientOpacity,
          transform: [{ translateX: gradientTranslateX }],
        }}
      >
        <LinearGradient
          colors={['#4DF0E0', '#00C8F2', '#00E8C6'] as const}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.8 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <AnimatedMartiniIcon size={100} color="#FFFFFF" pulseDuration={LOGO_PULSE_MS} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
