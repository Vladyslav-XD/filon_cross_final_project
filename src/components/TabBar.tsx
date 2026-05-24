import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HomeIcon, HeartIcon, ShuffleIcon } from './icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export type TabType = 'Home' | 'Favourites' | 'Random';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  const getIconColor = (tab: TabType) => activeTab === tab ? colors.activeBadgeBG : colors.mainBtn;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('Home')} activeOpacity={0.8}>
        <HomeIcon size={24} color={getIconColor('Home')} />
        <Text style={[styles.label, activeTab === 'Home' && styles.activeLabel]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('Favourites')} activeOpacity={0.8}>
        <HeartIcon size={24} color={getIconColor('Favourites')} focused={activeTab === 'Favourites'} />
        <Text style={[styles.label, activeTab === 'Favourites' && styles.activeLabel]}>Favourites</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('Random')} activeOpacity={0.8}>
        <ShuffleIcon size={24} color={getIconColor('Random')} />
        <Text style={[styles.label, activeTab === 'Random' && styles.activeLabel]}>Random</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.badgeBG,
    borderTopWidth: 1,
    borderTopColor: colors.badgeBorder,
    paddingVertical: spacing.s,
    paddingBottom: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s,
  },
  label: {
    fontSize: 12,
    color: colors.mainBtn,
    marginTop: 4,
    fontWeight: '500',
  },
  activeLabel: {
    color: colors.activeBadgeBG,
  },
});
