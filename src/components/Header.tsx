import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/typography';
import { MoonIcon, SunIcon } from './icons';
import { AnimatedMartiniIcon } from './AnimatedMartiniIcon';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  const { theme, toggleTheme, colors } = useTheme();

  const gradientColors = theme === 'light'
    ? ['#00BBA7', '#0092B8'] as const
    : ['#00786F', '#005F78'] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerBackground}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ marginRight: 8, marginTop: -22 }}>
                <AnimatedMartiniIcon size={24} color="#FFFFFF" disablePulsing />
              </View>
              <Text style={[styles.headerTitle, { color: '#FFFFFF', marginBottom: 0, marginTop: 4 }]}>{title}</Text>
            </View>
            {!!subtitle && (
              <Text style={[styles.headerSubtitle, { color: '#FFFFFF' }]}>{subtitle}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme} accessibilityRole="button" accessibilityLabel={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
            {theme === 'light' ? <MoonIcon size={20} color="#FFFFFF" /> : <SunIcon size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    overflow: 'hidden',
    paddingBottom: spacing.l,
  },
  headerContent: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  headerTitle: {
    // Brand wordmark in Sora. Weight lives in the font file itself, so no fontWeight here —
    // on iOS a fontWeight with a custom family can silently fall back to the system font.
    fontFamily: fonts.brand,
    fontSize: 28,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  themeToggle: {
    padding: spacing.s,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  themeToggleText: {
    fontSize: 24,
  },
});
