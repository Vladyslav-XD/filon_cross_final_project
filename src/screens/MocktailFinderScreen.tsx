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
import { fetchMocktails, fillInDetails } from '../api/recipes';
import { CHARACTER_FILTERS, INGREDIENT_FILTERS, recipeHasIngredient } from '../constants/filters';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

// "All" and "My Recipes" are pseudo-categories; the rest are real drink tags.
const CATEGORIES = ['All', 'My Recipes', ...CHARACTER_FILTERS];
const INGREDIENTS = INGREDIENT_FILTERS.map(f => f.label);

export const MocktailFinderScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fillingIn, setFillingIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(5);

  const navigation = useNavigation<StackNavigationProp<any>>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const customRecipes = useSelector((state: RootState) => state.myRecipes.recipes);

  const loadRecipes = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMocktails()
      .then(result => {
        if (cancelled) return;
        setRecipes(result);
        setLoading(false);
        // The list endpoint has no ingredients or tags. Fetch them once (cached on
        // the device afterwards) and let cards fill in as batches arrive.
        if (result.some(r => !r.tags)) {
          setFillingIn(true);
          fillInDetails(result, update => {
            if (!cancelled) setRecipes(update);
          }).finally(() => {
            if (!cancelled) setFillingIn(false);
          });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't load recipes. Check your internet connection and try again.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancel = loadRecipes();
    return cancel;
  }, [loadRecipes]);

  useEffect(() => {
    setDisplayLimit(5);
  }, [searchQuery, activeCategory, activeIngredients]);

  const toggleIngredient = useCallback((ing: string) => {
    setActiveIngredients(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  }, []);

  const allAvailableRecipes = useMemo(
    () => [...[...customRecipes].reverse(), ...recipes],
    [customRecipes, recipes]
  );

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allAvailableRecipes.filter(recipe => {
      // Search matches the name or any ingredient ("ginger" finds Masala Chai).
      if (query) {
        const inTitle = recipe.title.toLowerCase().includes(query);
        const inIngredients = (recipe.ingredients || []).some(line => line.toLowerCase().includes(query));
        if (!inTitle && !inIngredients) return false;
      }

      if (activeCategory === 'My Recipes') {
        if (!customRecipes.some(cr => cr.id === recipe.id)) return false;
      } else if (activeCategory !== 'All') {
        // Real tags only. A drink whose details have not arrived yet has no tags
        // and is simply not shown until they do.
        if (!recipe.tags || !recipe.tags.includes(activeCategory as any)) return false;
      }

      if (activeIngredients.length > 0) {
        if (!activeIngredients.some(label => recipeHasIngredient(recipe, label))) return false;
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
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>
            {fillingIn ? 'Loading drink details…' : 'No recipes match these filters.'}
          </Text>
        )}
      </View>
    </>
  ), [searchQuery, activeCategory, activeIngredients, filteredRecipes.length, loading, fillingIn, error, colors, toggleIngredient, handleClearIngredients, handleNavigateRandom]);

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
          <Text style={[styles.loadingText, { color: colors.title }]}>Loading recipes…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.title }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.activeBadgeBG }]}
            onPress={() => loadRecipes()}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.retryBtnText}>Try again</Text>
          </TouchableOpacity>
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
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: spacing.l,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
