import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { addRecipe } from '../store/myRecipesSlice';
import { Badge } from '../components/Badge';
import { Header } from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { AddRecipeIcon, XIcon } from '../components/icons';
import { SCREENS } from '../constants/screens';

const CATEGORIES = ['Citrus', 'Berry', 'Mint', 'Tropical', 'Sparkling'];

interface Ingredient {
  name: string;
  amount: string;
}

export const AddRecipeScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [imageUrl, setImageUrl] = useState('');

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a Recipe Name.');
      return;
    }
    const validIngredients = ingredients.filter(i => i.name.trim() !== '');
    if (validIngredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient.');
      return;
    }

    const validSteps = steps.filter(s => s.trim() !== '');
    
    const newRecipe = {
      id: Date.now().toString(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      category: category,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
      isFavorite: false,
      ingredients: validIngredients.map(i => `${i.amount} ${i.name}`.trim()),
      instructions: validSteps.join('. '),
      duration: '5 min',
    };

    dispatch(addRecipe(newRecipe));
    Alert.alert('Success', 'Recipe saved successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setTitle('');
          setSubtitle('');
          setCategory(CATEGORIES[0]);
          setIngredients([{ name: '', amount: '' }]);
          setSteps(['']);
          setImageUrl('');
          navigation.navigate(SCREENS.HOME_TAB);
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Add Recipe"
      />
      
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Recipe Name *</Text>
          <TextInput
            style={[styles.input, { color: colors.title, borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
            placeholder="Tropical Sunrise"
            placeholderTextColor={colors.subtitle}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Short Description</Text>
          <TextInput
            style={[styles.input, { color: colors.title, borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
            placeholder="e.g. A refreshing tropical drink"
            placeholderTextColor={colors.subtitle}
            value={subtitle}
            onChangeText={setSubtitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesWrapper}>
            {CATEGORIES.map(cat => (
              <Badge
                key={cat}
                label={cat}
                active={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Ingredients *</Text>
          {ingredients.map((ing, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.ingredientNameInput, { color: colors.title, borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                placeholder="Ingredient"
                placeholderTextColor={colors.subtitle}
                value={ing.name}
                onChangeText={(val) => handleIngredientChange(index, 'name', val)}
              />
              <TextInput
                style={[styles.input, styles.ingredientAmountInput, { color: colors.title, borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                placeholder="Amount"
                placeholderTextColor={colors.subtitle}
                value={ing.amount}
                onChangeText={(val) => handleIngredientChange(index, 'amount', val)}
              />
              <TouchableOpacity
                style={[styles.removeButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                onPress={() => handleRemoveIngredient(index)}
              >
                <XIcon size={16} color={colors.title} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
            onPress={handleAddIngredient}
          >
            <AddRecipeIcon size={18} color={colors.title} />
            <Text style={[styles.addButtonText, { color: colors.title }]}>Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Preparation Steps</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepCircle, { backgroundColor: colors.activeBadgeBG }]}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.stepInput, { color: colors.title, borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                placeholder={`Step ${index + 1}`}
                placeholderTextColor={colors.subtitle}
                value={step}
                onChangeText={(val) => handleStepChange(index, val)}
                multiline
              />
              <TouchableOpacity
                style={[styles.removeButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface, marginLeft: spacing.s, marginTop: 2 }]}
                onPress={() => handleRemoveStep(index)}
              >
                <XIcon size={16} color={colors.title} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
            onPress={handleAddStep}
          >
            <AddRecipeIcon size={18} color={colors.title} />
            <Text style={[styles.addButtonText, { color: colors.title }]}>Add Step</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Image URL (Optional)</Text>
          <TextInput
            style={[styles.input, { color: colors.title, borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.subtitle}
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.activeBadgeBG }]}
          onPress={handleSaveRecipe}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Recipe</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  inputGroup: {
    marginBottom: spacing.l,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesWrapper: {
    flexDirection: 'row',
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: spacing.s,
    alignItems: 'center',
  },
  ingredientNameInput: {
    flex: 2,
    marginRight: spacing.s,
  },
  ingredientAmountInput: {
    flex: 1,
    marginRight: spacing.s,
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: spacing.xs,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: spacing.s,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.s,
    alignItems: 'flex-start',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    marginTop: 8,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepInput: {
    flex: 1,
    minHeight: 48,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.xl,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
