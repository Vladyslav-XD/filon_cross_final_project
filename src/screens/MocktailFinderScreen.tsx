import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { SearchBar } from '../components/SearchBar';
import { RecipeCard } from '../components/RecipeCard';
import { ShuffleIcon } from '../components/icons';
import { spacing } from '../theme/spacing';
import { Recipe } from '../data/mockData';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SCREENS } from '../constants/screens';
import { fetchMocktails } from '../api/api';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const CATEGORIES = ['All', 'My Recipes', 'Refreshing', 'Fruity', 'Sparkling', 'Citrus', 'Sweet', 'Sour', 'Herbal', 'Spicy'];
const INGREDIENTS = ['Mint', 'Lime', 'Berry', 'Citrus', 'Ginger', 'Cucumber', 'Tropical'];

export const MocktailFinderScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(5);

  const navigation = useNavigation<StackNavigationProp<any>>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const customRecipes = useSelector((state: RootState) => state.myRecipes.recipes);

  useEffect(() => {
    fetchMocktails()
      .then(result => {
        setRecipes(result);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка:', err);
        setError('Не вдалося завантажити дані. Перевірте підключення до мережі.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setDisplayLimit(5);
  }, [searchQuery, activeCategory, activeIngredients]);

  const toggleIngredient = useCallback((ing: string) => {
    setActiveIngredients(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  }, []);

  const getCategoryKeywords = (cat: string) => {
    switch (cat) {
      case 'Refreshing': return ['mint', 'cooler', 'water', 'ice', 'slush'];
      case 'Fruity': return ['apple', 'peach', 'fruit', 'mango', 'banana', 'melon', 'punch', 'berry', 'cherry'];
      case 'Sparkling': return ['sparkling', 'soda', 'fizz', 'tonic'];
      case 'Citrus': return ['lemon', 'lime', 'orange', 'citrus', 'grapefruit'];
      case 'Sweet': return ['chocolate', 'vanilla', 'sweet', 'sugar', 'syrup', 'candy'];
      case 'Sour': return ['sour', 'lemon', 'lime'];
      case 'Herbal': return ['mint', 'basil', 'rosemary', 'tea'];
      case 'Spicy': return ['ginger', 'spice', 'pepper'];
      default: return [];
    }
  };

  const allAvailableRecipes = useMemo(
    () => [...[...customRecipes].reverse(), ...recipes],
    [customRecipes, recipes]
  );

  const filteredRecipes = useMemo(() => {
    return allAvailableRecipes.filter(recipe => {
      const titleLower = recipe.title.toLowerCase();

      if (searchQuery && !titleLower.includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (activeCategory === 'My Recipes') {
        const isCustom = customRecipes.some(cr => cr.id === recipe.id);
        if (!isCustom) return false;
      } else if (activeCategory !== 'All') {
        const keywords = getCategoryKeywords(activeCategory);
        const matchesKeyword = keywords.some(kw => titleLower.includes(kw));

        const charSum = recipe.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const assignedCat = CATEGORIES[(charSum % (CATEGORIES.length - 1)) + 1];

        if (!matchesKeyword && assignedCat !== activeCategory && recipe.category !== activeCategory) {
          return false;
        }
      }

      if (activeIngredients.length > 0) {
        const matchesAnyIng = activeIngredients.some(ing => titleLower.includes(ing.toLowerCase()));
        const charSum2 = recipe.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 2;
        const assignedIng = INGREDIENTS[charSum2 % INGREDIENTS.length];

        if (!matchesAnyIng && !activeIngredients.includes(assignedIng)) {
          return false;
        }
      }

      return true;
    });
  }, [allAvailableRecipes, searchQuery, activeCategory, activeIngredients, customRecipes]);

  const handleClearIngredients = useCallback(() => setActiveIngredients([]), []);
  const handleNavigateRandom = useCallback(() => navigation.navigate(SCREENS.RANDOM_TAB), [navigation]);
  const handleLoadMore = useCallback(() => setDisplayLimit(prev => prev + 5), []);

  const renderHeader = useCallback(() => (
    <>
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.categoryTitle }]}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.categoryTitle }]}>Filter by Ingredients</Text>
        <View style={styles.wrapList}>
          <Badge
            label="All"
            active={activeIngredients.length === 0}
            onPress={handleClearIngredients}
          />
          {INGREDIENTS.map((ing) => (
            <Badge
              key={ing}
              label={ing}
              active={activeIngredients.includes(ing)}
              onPress={() => toggleIngredient(ing)}
            />
          ))}
        </View>
      </View>
      <View style={[styles.section, { paddingBottom: spacing.s }]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.categoryTitle, marginBottom: 0, paddingHorizontal: 0 }]}>Featured Recipes</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', backgroundColor: colors.activeBadgeBG, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
              onPress={handleNavigateRandom}
            >
              <ShuffleIcon size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', marginLeft: 8, fontWeight: '600', fontSize: 14 }}>Surprise recipe</Text>
            </TouchableOpacity>
          </View>
        </View>
        {filteredRecipes.length === 0 && !loading && !error && (
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>Не знайдено жодного рецепту.</Text>
        )}
      </View>
    </>
  ), [searchQuery, activeCategory, activeIngredients, filteredRecipes.length, loading, error, colors, toggleIngredient, handleClearIngredients, handleNavigateRandom]);

  const renderFooter = useCallback(() => {
    if (filteredRecipes.length > displayLimit) {
      return (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.browseMoreBtn, { backgroundColor: colors.surface, borderColor: colors.badgeBorder }]}
            activeOpacity={0.8}
            onPress={handleLoadMore}
          >
            <Text style={[styles.browseMoreText, { color: colors.title }]}>Browse more</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [filteredRecipes.length, displayLimit, colors, handleLoadMore]);

  const renderItem = useCallback(({ item }: { item: Recipe }) => (
    <View style={styles.recipeListItem}>
      <RecipeCard
        title={item.title}
        subtitle={item.subtitle}
        imageUrl={item.imageUrl}
        isFavorite={isFavorite(item.id)}
        onFavoritePress={() => toggleFavorite(item)}
        onPress={() => navigation.navigate(SCREENS.RECIPE_DETAILS, { recipe: item })}
      />
    </View>
  ), [isFavorite, toggleFavorite, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Mocktail Finder"
        subtitle=""
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.activeBadgeBG} />
          <Text style={[styles.loadingText, { color: colors.title }]}>Завантаження...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes.slice(0, displayLimit)}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={renderFooter()}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchWrapper: {
    paddingHorizontal: spacing.l,
    marginTop: spacing.m,
  },
  section: {
    marginTop: spacing.l,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: spacing.l,
    marginBottom: spacing.s,
  },
  totalCountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: spacing.l,
  },
  wrapList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.l,
  },
  recipeListItem: {
    paddingHorizontal: spacing.l,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  emptyText: {
    paddingHorizontal: spacing.l,
    fontSize: 15,
    marginTop: spacing.s,
  },
  footerContainer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  browseMoreBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  browseMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
