import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { HeartPulseIcon } from '../components/icons';
import { RecipeCard } from '../components/RecipeCard';
import { spacing } from '../theme/spacing';
import { Header } from '../components/Header';
import { SCREENS } from '../constants/screens';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

export const FavouritesScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { favorites, toggleFavorite } = useFavorites();
  const savedRecipes = favorites;
  const { colors } = useTheme();

  const onDiscoverPress = () => {
    navigation.navigate(SCREENS.HOME_TAB);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Favourites"
      />

      {savedRecipes.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <Text style={[styles.listCount, { color: colors.subtitle }]}>{savedRecipes.length} recipes saved</Text>
          {savedRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              subtitle={recipe.subtitle}
              imageUrl={recipe.imageUrl}
              isFavorite={true}
              onFavoritePress={() => toggleFavorite(recipe)}
              onPress={() => navigation.navigate(SCREENS.HOME_TAB, { 
                screen: SCREENS.RECIPE_DETAILS, 
                params: { recipe } 
              })}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.iconBG }]}>
            <HeartPulseIcon size={32} color={colors.mainBtn} />
          </View>
          <Text style={[styles.title, { color: colors.title }]}>No favourites yet</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>
            Start exploring and save your favorite{'\n'}mocktail recipes!
          </Text>

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.activeBadgeBG, shadowColor: colors.activeBadgeBG }]} onPress={onDiscoverPress} activeOpacity={0.8}>
            <Text style={[styles.buttonText, { color: colors.text }]}>Discover Recipes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  listContent: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: 100,
  },
  listCount: {
    fontSize: 14,
    marginBottom: spacing.m,
    marginLeft: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

