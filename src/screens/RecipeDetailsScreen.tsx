import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RouteProp, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { spacing } from '../theme/spacing';
import { Recipe } from '../data/mockData';
import { HeartIcon, ShareIcon, ArrowLeftIcon } from '../components/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../context/FavoritesContext';
import { RecipeDetails } from '../api/api';
import { fetchDetailsCached } from '../api/detailsCache';
import { useTheme } from '../context/ThemeContext';
import { shareRecipe, splitInstructions } from '../utils/recipeText';
import { tagsToSubtitle } from '../utils/drinkTags';
import { resolveImageUri } from '../utils/recipePhotos';

type ParamList = {
  RecipeDetails: {
    recipe: Recipe;
  };
};

export const RecipeDetailsScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'RecipeDetails'>>();
  const navigation = useNavigation();
  const { recipe } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(recipe.id);
  
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [details, setDetails] = useState<RecipeDetails | null>(null);
  // A recipe that already carries ingredients renders at once, no spinner frame.
  const [loading, setLoading] = useState<boolean>(!recipe.ingredients);
  const [error, setError] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(380);

  const imageOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      imageOpacity.setValue(0);
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [imageOpacity])
  );

  const loadDetails = useCallback(() => {
    // The screen instance can be reused for another recipe (e.g. opened from the
    // Favourites tab while this screen is already on top), so start from a clean slate.
    setDetails(null);
    setError(null);
    // Anything that already carries ingredients (a user recipe, or a drink whose
    // details were merged from the cache) needs no request.
    if (recipe.ingredients) {
      setLoading(false);
      return () => {};
    }
    let cancelled = false;
    setLoading(true);
    fetchDetailsCached(recipe.id)
      .then(data => {
        if (cancelled) return;
        setDetails(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't load this recipe. Check your connection and try again.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recipe.id, recipe.ingredients]);

  useEffect(() => loadDetails(), [loadDetails]);

  const ingredientsToDisplay = details?.ingredients || recipe.ingredients || [];
  const stepsToDisplay = splitInstructions(details?.instructions || recipe.instructions);
  const tags = details?.tags || recipe.tags || [];
  // Database drinks carry the tag line as their subtitle; showing it twice (text + chips) is noise.
  const description = recipe.subtitle && recipe.subtitle !== tagsToSubtitle(tags) ? recipe.subtitle : '';

  const handleShare = () =>
    shareRecipe({
      title: recipe.title,
      ingredients: ingredientsToDisplay,
      instructions: details?.instructions || recipe.instructions,
      imageUrl: recipe.imageUrl,
    });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={{ position: 'relative' }}>
          <Animated.Image source={{ uri: resolveImageUri(recipe.imageUrl) }} style={[styles.image, { opacity: imageOpacity }]} />
          <View style={{ position: 'absolute', top: insets.top + spacing.s, left: spacing.l, right: spacing.l, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
             <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }} onPress={() => navigation.goBack()}>
               <ArrowLeftIcon size={24} color={colors.title} />
             </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingHorizontal: 12 }}>
          <View style={[{ backgroundColor: colors.surface, padding: spacing.l, borderRadius: 16, marginTop: -40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.title }]}>{recipe.title}</Text>
              {!!description && (
                <Text style={[styles.subtitle, { color: colors.subtitle }]}>{description}</Text>
              )}
            </View>
            {tags.length > 0 && (
              <View style={styles.tagRow}>
                {tags.map(tag => (
                  <View key={tag} style={[styles.infoBadge, { backgroundColor: `${colors.activeBadgeBG}15` }]}>
                    <Text style={[styles.infoText, { color: colors.activeBadgeBG }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        bounces={false} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + spacing.l, paddingHorizontal: spacing.l, paddingBottom: 100 }}
      >

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.activeBadgeBG} />
            <Text style={[styles.loadingText, { color: colors.title }]}>Loading recipe…</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.errorText, { color: colors.title }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.activeBadgeBG }]}
              onPress={() => loadDetails()}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.title }]}>Ingredients</Text>
              <View style={styles.ingredientsList}>
                {ingredientsToDisplay.map((ing, idx) => (
                  <View key={idx} style={styles.ingredientItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={[styles.ingredientBullet, { color: colors.activeBadgeBG }]}>•</Text>
                      <Text style={[styles.ingredientText, { color: colors.title }]}>{ing}</Text>
                    </View>
                  </View>
                ))}
                {ingredientsToDisplay.length === 0 && (
                  <Text style={[styles.instructionsText, { color: colors.subtitle }]}>No ingredients found.</Text>
                )}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.title }]}>Preparation Steps</Text>
              <View style={styles.stepsList}>
                {stepsToDisplay.length === 0 && (
                  <Text style={[styles.instructionsText, { color: colors.subtitle }]}>No steps written for this recipe.</Text>
                )}
                {stepsToDisplay.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={[styles.stepBadge, { backgroundColor: colors.activeBadgeBG }]}>
                      <Text style={styles.stepNumber}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.categoryTitle }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={[styles.addFavoriteBtn, { backgroundColor: colors.activeBadgeBG }]} onPress={() => toggleFavorite(recipe)} activeOpacity={0.8}>
              <HeartIcon size={20} color={'#ffffff'} focused={isFav} />
              <Text style={styles.addFavoriteBtnText}>
                {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.surface, borderColor: colors.badgeBorder }]} onPress={handleShare} activeOpacity={0.8}>
              <ShareIcon size={20} color={colors.title} />
              <Text style={[styles.shareBtnText, { color: colors.title }]}>Share Recipe</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: spacing.l,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  titleContainer: {
    flex: 1,
    paddingRight: spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.m,
    gap: spacing.s,
  },
  infoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  infoText: {
    fontWeight: '500',
  },
  card: {
    borderRadius: 14,
    padding: spacing.l,
    marginBottom: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.l,
  },
  ingredientsList: {
    marginBottom: spacing.l,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ingredientBullet: {
    fontSize: 20,
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 16,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  stepsList: {
    flexDirection: 'column',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: spacing.m,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    marginTop: 2,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  addFavoriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: spacing.m,
  },
  addFavoriteBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: spacing.s,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.xxl,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
  },
  errorText: {
    textAlign: 'center',
    marginTop: spacing.m,
    fontSize: 15,
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
});
