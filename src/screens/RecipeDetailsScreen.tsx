import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { RouteProp, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { spacing } from '../theme/spacing';
import { Recipe } from '../data/mockData';
import { HeartIcon, ShareIcon, ArrowLeftIcon } from '../components/icons';
import { SafeAreaView } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { fetchMocktailDetails } from '../api/api';
import { useTheme } from '../context/ThemeContext';

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

  const [details, setDetails] = useState<Partial<Recipe> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    if (recipe.ingredients && recipe.instructions) {
      setLoading(false);
      return;
    }

    fetchMocktailDetails(recipe.id)
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Не вдалося завантажити деталі рецепту.');
        setLoading(false);
      });
  }, [recipe.id]);

  const ingredientsToDisplay = details?.ingredients || recipe.ingredients || [];
  const instructionsToDisplay = details?.instructions || recipe.instructions || 'No instructions available.';

  const parseInstructions = (instructions: string) => {
    return instructions
      .split('.')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + '.');
  };

  const handleShare = async () => {
    try {
      const message = `Check out this mocktail recipe: ${recipe.title}!\n\nIngredients: \n${ingredientsToDisplay.join(', ')}\n\nInstructions: \n${instructionsToDisplay}\n\nImage: ${recipe.imageUrl}`;
      await Share.share({
        message,
        title: recipe.title,
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
        <View style={{ position: 'relative' }}>
          <Animated.Image source={{ uri: recipe.imageUrl }} style={[styles.image, { opacity: imageOpacity }]} />
          <View style={{ position: 'absolute', top: 50, left: spacing.l, right: spacing.l, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
             <TouchableOpacity style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }} onPress={() => navigation.goBack()}>
               <ArrowLeftIcon size={24} color={colors.title} />
             </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingHorizontal: 12 }}>
          <View style={[{ backgroundColor: colors.surface, padding: spacing.l, borderRadius: 16, marginTop: -40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.title }]}>{recipe.title}</Text>
              <Text style={[styles.subtitle, { color: colors.subtitle }]}>{recipe.subtitle}</Text>
            </View>
            <View style={[styles.infoBadge, { backgroundColor: `${colors.activeBadgeBG}15`, marginBottom: 0, marginTop: spacing.m, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 }]}>
              <Text style={[styles.infoText, { color: colors.activeBadgeBG }]}>{recipe.category || 'Herbal'}</Text>
            </View>
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
            <Text style={[styles.loadingText, { color: colors.title }]}>Завантаження деталей...</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{error}</Text>
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
                {parseInstructions(instructionsToDisplay).map((step, idx) => (
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
  infoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 8,
    marginBottom: spacing.l,
  },
  infoText: {
    fontWeight: '600',
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
    color: 'red',
    textAlign: 'center',
    marginTop: spacing.m,
  },
});
