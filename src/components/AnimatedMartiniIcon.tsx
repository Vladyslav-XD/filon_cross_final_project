import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BubbleConfig {
  id: number;
  path: string;
  duration: number;
  delay: number;
  transY: number;
  transX: number;
  startY: number;
  baseTransX: number;
  baseScale: number;
}

const BUBBLES: BubbleConfig[] = [
  {
    id: 1,
    path: "M45.1879 42.7637C45.1879 43.3989 44.6649 43.9132 44.0188 43.9132C43.3731 43.9132 42.8496 43.3989 42.8496 42.7637C42.8496 42.1285 43.3731 41.6143 44.0188 41.6143C44.6649 41.6143 45.1879 42.1285 45.1879 42.7637Z",
    duration: 4000,
    delay: 0,
    transY: -40,
    transX: 6,
    startY: -1,
    baseTransX: -2,
    baseScale: 1.0,
  },
  {
    id: 2,
    path: "M38.8462 38.7699C38.8462 39.2712 38.433 39.6774 37.9235 39.6774C37.4136 39.6774 37 39.2712 37 38.7699C37 38.2685 37.4136 37.8623 37.9235 37.8623C38.433 37.8623 38.8462 38.2685 38.8462 38.7699Z",
    duration: 4500,
    delay: 600,
    transY: -45,
    transX: -7,
    startY: 3,
    baseTransX: 1,
    baseScale: 1.3,
  },
  {
    id: 3,
    path: "M42.028 31.3883C42.028 31.9789 41.541 32.4573 40.9408 32.4573C40.3401 32.4573 39.8535 31.9789 39.8535 31.3883C39.8535 30.7986 40.3401 30.3193 40.9408 30.3193C41.541 30.3193 42.028 30.7986 42.028 31.3883Z",
    duration: 3800,
    delay: 1000,
    transY: -35,
    transX: 5,
    startY: 10,
    baseTransX: -1,
    baseScale: 0.7,
  },
  {
    id: 4,
    path: "M51.1591 29.1495C51.1591 29.7842 50.6356 30.2993 49.9899 30.2993C49.3442 30.2993 48.8203 29.7842 48.8203 29.1495C48.8203 28.5147 49.3442 28 49.9899 28C50.6356 28 51.1591 28.5147 51.1591 29.1495Z",
    duration: 4800,
    delay: 1500,
    transY: -42,
    transX: -6,
    startY: 12,
    baseTransX: -6,
    baseScale: 0.9,
  }
];

const MAIN_PATH = "M51.1278 46.0696C51.4618 45.7577 51.4756 45.239 51.1586 44.9107C50.8413 44.5823 50.3137 44.5688 49.9795 44.8804L48.0175 46.7116C46.5608 48.0714 44.5497 48.7258 42.5633 48.4302C42.0431 48.3528 41.5353 48.2133 41.0522 48.0011C39.915 47.5018 38.981 46.6576 37.8292 46.1894C37.1378 45.9083 36.4021 45.7577 35.6575 45.721L32.6974 37.4827C32.5632 37.1089 32.1462 36.9131 31.7666 37.0451C31.3867 37.177 31.1872 37.5867 31.3214 37.9605L35.65 50.0252L33.5929 45.8987C32.7894 46.0747 32.0126 46.3703 31.3088 46.7647L31.3074 46.7655C30.9826 46.9495 30.5734 46.9014 30.3015 46.6477L28.408 44.8804C28.074 44.5688 27.5464 44.5823 27.2291 44.9107C26.9121 45.239 26.9256 45.7577 27.2599 46.0696L38.36 56.4298V74.6905C38.36 74.7162 38.3387 74.7377 38.3126 74.7383C35.6451 74.8208 33.6058 75.2709 33.6058 75.8136C33.6058 76.4151 36.1075 76.9025 39.194 76.9025C42.2802 76.9025 44.7819 76.4151 44.7819 75.8136C44.7819 75.2709 42.7426 74.8208 40.0751 74.7383C40.049 74.7377 40.0277 74.7162 40.0277 74.6905V56.4298L51.1278 46.0696Z";

const BubbleView = ({ config, color, scaleRatio }: { config: BubbleConfig; color: string; scaleRatio: number }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: config.duration,
        delay: config.delay,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        progress.setValue(0);
        Animated.loop(
          Animated.timing(progress, {
            toValue: 1,
            duration: config.duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ).start();
      });
    };
    startAnimation();
  }, [config]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [config.startY * scaleRatio, (config.startY + config.transY) * scaleRatio],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [config.baseTransX * scaleRatio, (config.baseTransX + config.transX) * scaleRatio],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [1, 0.7, 0.3, 0],
  });

  return (
    <Animated.View style={{ position: 'absolute', opacity, transform: [{ translateY }, { translateX }, { scale: config.baseScale }] }}>
      <Svg width={24 * scaleRatio} height={48 * scaleRatio} viewBox="27 28 25 49">
        <Path d={config.path} fill={color} />
      </Svg>
    </Animated.View>
  );
};

interface AnimatedMartiniIconProps {
  size?: number;
  color?: string;
  disablePulsing?: boolean;
}

export const AnimatedMartiniIcon = ({ size = 24, color = '#FFFFFF', disablePulsing = false }: AnimatedMartiniIconProps) => {
  const logoScale = useRef(new Animated.Value(0.98)).current;
  const scaleRatio = size / 24;

  useEffect(() => {
    if (disablePulsing) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.04,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.98,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [disablePulsing]);

  return (
    <Animated.View
      style={{
        width: 24 * scaleRatio,
        height: 48 * scaleRatio,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: logoScale }],
      }}
    >
      <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Svg width={24 * scaleRatio} height={48 * scaleRatio} viewBox="27 28 25 49">
          <Path d={MAIN_PATH} fill={color} />
        </Svg>
      </View>

      {BUBBLES.map((b) => (
        <BubbleView key={b.id} config={b} color={color} scaleRatio={scaleRatio} />
      ))}
    </Animated.View>
  );
};
