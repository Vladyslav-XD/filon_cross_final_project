import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * A short dark fade over the top of a hero photo. The status bar is always light
 * on these screens, and a pale drink photo (milk, lemonade, ice) swallowed it.
 * Cheaper and steadier than measuring image brightness to switch the bar style.
 */
export const PhotoScrim = () => {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 56 }}
      pointerEvents="none"
    />
  );
};
