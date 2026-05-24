import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, Share } from 'react-native';
import { ShuffleIcon, HeartIcon, ShareIcon, ArrowLeftIcon } from '../components/icons';
import { useNavigation } from '@react-navigation/native';
import { Badge } from '../components/Badge';
import { spacing } from '../theme/spacing';
import { fetchMocktails, fetchMocktailDetails } from '../api/api';
import { Recipe } from '../data/mockData';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const WINDOW_WIDTH = Dimensions.get('window').width;

export const RandomScreen = () => {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [details, setDetails] = useState<Partial<Recipe> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<Recipe[]>([]);
  const [headerHeight, setHeaderHeight] = useState(460);
  const navigation = useNavigation<any>();
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const customRecipes = useSelector((state: RootState) => state.myRecipes.recipes);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const recipes = await fetchMocktails();
      const combined = [...recipes, ...customRecipes];
      setAllRecipes(combined);
      if (combined.length > 0) {
        pickRandomRecipe(combined);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const pickRandomRecipe = async (recipesArray = allRecipes) => {
    if (recipesArray.length === 0) return;
    setLoading(true);
    const randomIndex = Math.floor(Math.random() * recipesArray.length);
    const randomRecipe = recipesArray[randomIndex];
    
    if (currentRecipe) {
      setHistory(prev => [...prev, currentRecipe]);
    }
    setCurrentRecipe(randomRecipe);
    
    if (randomRecipe.ingredients && randomRecipe.instructions) {
      setDetails({
        ingredients: randomRecipe.ingredients,
        instructions: randomRecipe.instructions,
      });
      setLoading(false);
      return;
    }

    try {
      const recipeDetails = await fetchMocktailDetails(randomRecipe.id);
      setDetails(recipeDetails);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevRecipe = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentRecipe(prevRecipe);
      
      if (prevRecipe.ingredients && prevRecipe.instructions) {
        setDetails({
          ingredients: prevRecipe.ingredients,
          instructions: prevRecipe.instructions,
        });
        setLoading(false);
      } else {
        setLoading(true);
        fetchMocktailDetails(prevRecipe.id).then(res => {
          setDetails(res);
          setLoading(false);
        }).catch(err => {
          console.error(err);
          setLoading(false);
        });
      }
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const parseInstructions = (instructions: string) => {
    if (!instructions) return [];
    return instructions
      .split('.')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + '.');
  };

  if (loading && !currentRecipe) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.activeBadgeBG} />
      </View>
    );
  }

  if (!currentRecipe) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.title }]}>No recipes found.</Text>
      </View>
    );
  }

  const isFav = isFavorite(currentRecipe.id);
  const ingredientsToDisplay = details?.ingredients || [];
  const stepsToDisplay = parseInstructions(details?.instructions || '');

  const handleShare = async () => {
    try {
      const message = `Check out this mocktail recipe: ${currentRecipe.title}!\n\nIngredients: \n${ingredientsToDisplay.join(', ')}\n\nInstructions: \n${details?.instructions || ''}\n\nImage: ${currentRecipe.imageUrl}`;
      await Share.share({
        message,
        title: currentRecipe.title,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentRecipe.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={{ position: 'absolute', top: 50, left: spacing.l, right: spacing.l, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity style={[styles.shuffleButton, { backgroundColor: colors.surface }]} activeOpacity={0.8} onPress={handleBack}>
              <ArrowLeftIcon size={24} color={colors.title} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shuffleButton, { backgroundColor: colors.activeBadgeBG }]} activeOpacity={0.8} onPress={() => pickRandomRecipe()}>
              <ShuffleIcon size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingHorizontal: 12 }}>
          <View style={[styles.card, styles.titleCard, { backgroundColor: colors.surface, marginTop: -40, marginBottom: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 }]}>
            <Text style={[styles.recipeTitle, { color: colors.title }]}>{currentRecipe.title}</Text>
            <Text style={[styles.recipeSubtitle, { color: colors.subtitle }]}>{currentRecipe.subtitle}</Text>
            <View style={styles.badgeWrapper}>
              <View style={[{ backgroundColor: `${colors.activeBadgeBG}15`, paddingHorizontal: spacing.m, paddingVertical: 6, borderRadius: 16 }]}>
                <Text style={[{ color: colors.activeBadgeBG, fontWeight: '500' }]}>Random Pick</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + spacing.l }]}
      >
        <View style={{ paddingHorizontal: spacing.l }}>
          {loading ? (
             <View style={[styles.card, { alignItems: 'center', paddingVertical: spacing.xxl, backgroundColor: colors.surface }]}>
               <ActivityIndicator size="large" color={colors.activeBadgeBG} />
             </View>
          ) : (
            <>
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardSectionTitle, { color: colors.title }]}>Ingredients</Text>
                {ingredientsToDisplay.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bulletDot, { backgroundColor: colors.activeBadgeBG }]} />
                    <Text style={[styles.listText, { color: colors.title }]}>{item}</Text>
                  </View>
                ))}
                {ingredientsToDisplay.length === 0 && (
                  <Text style={[styles.listText, { color: colors.subtitle }]}>No ingredients listed.</Text>
                )}
              </View>
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardSectionTitle, { color: colors.title }]}>Preparation Steps</Text>
                {stepsToDisplay.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={[styles.stepNumberCircle, { backgroundColor: colors.activeBadgeBG }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.listText, { color: colors.title }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.activeBadgeBG }]} activeOpacity={0.8} onPress={() => toggleFavorite(currentRecipe)}>
              <HeartIcon size={20} color="#ffffff" focused={isFav} />
              <Text style={styles.primaryButtonText}>
                {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.badgeBorder }]} activeOpacity={0.8} onPress={handleShare}>
              <ShareIcon size={20} color={colors.title} />
              <Text style={[styles.secondaryButtonText, { color: colors.title }]}>Share Recipe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    width: WINDOW_WIDTH,
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  safeAreaContext: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'flex-end',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  shuffleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  contentWrap: {
    marginTop: -40,
    paddingHorizontal: spacing.l,
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
  titleCard: {
    alignItems: 'flex-start',
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeSubtitle: {
    fontSize: 15,
    marginBottom: spacing.m,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
  },
  cardSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.m,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.m,
    marginLeft: spacing.xs,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: spacing.l,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  listText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  actionRow: {
    marginTop: spacing.s,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
  secondaryButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
});
