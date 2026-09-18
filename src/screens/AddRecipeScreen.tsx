import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, ActionSheetIOS } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { addRecipe, updateRecipe } from '../store/myRecipesSlice';
import { Badge } from '../components/Badge';
import { Header } from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';
import { AddRecipeIcon, XIcon } from '../components/icons';
import { SCREENS } from '../constants/screens';
import { ALL_TAGS, DrinkTag, tagsToSubtitle } from '../utils/drinkTags';
import { pickRecipePhoto, takeRecipePhoto, persistRecipePhoto, deleteRecipePhoto, isRecipePhoto, resolveImageUri } from '../utils/recipePhotos';
import { splitInstructions } from '../utils/recipeText';
import { useFavorites } from '../context/FavoritesContext';
import { Recipe } from '../data/mockData';

/** Shown when the user adds no photo of their own. */
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop';
const MAX_TAGS = 3;

interface Ingredient {
  name: string;
  amount: string;
}

/** `stored` is a photo already in app storage (editing); `new` is a fresh pick, not copied yet. */
type Photo = { kind: 'stored'; ref: string } | { kind: 'new'; uri: string } | null;

type ParamList = {
  EditRecipe: { recipe?: Recipe } | undefined;
};

export const AddRecipeScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'EditRecipe'>>();
  const { updateFavorite } = useFavorites();
  /** Set when the screen was pushed from a recipe; the Add Recipe tab leaves it undefined. */
  const editing = route.params?.recipe;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [subtitle, setSubtitle] = useState(editing?.subtitle ?? '');
  const [tags, setTags] = useState<DrinkTag[]>((editing?.tags as DrinkTag[]) ?? []);
  // A saved ingredient is one line ("50 ml lime juice"); splitting it back into amount and
  // name would only guess wrong, so the whole line goes into the name field.
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    editing?.ingredients?.length
      ? editing.ingredients.map(line => ({ name: line, amount: '' }))
      : [{ name: '', amount: '' }]
  );
  const [steps, setSteps] = useState<string[]>(() => {
    const saved = splitInstructions(editing?.instructions);
    return saved.length ? saved : [''];
  });
  /** Only the user's own photo counts; the stock fallback image is not one. */
  const [photo, setPhoto] = useState<Photo>(
    editing && isRecipePhoto(editing.imageUrl) ? { kind: 'stored', ref: editing.imageUrl } : null
  );
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);

  const photoPreviewUri = photo ? (photo.kind === 'stored' ? resolveImageUri(photo.ref) : photo.uri) : null;

  const toggleTag = (tag: DrinkTag) => {
    setTags(prev => {
      if (prev.includes(tag)) return prev.filter(t => t !== tag);
      if (prev.length >= MAX_TAGS) return prev; // silently ignore a fourth pick
      return [...prev, tag];
    });
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients(prev => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
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

  const runPicker = async (open: () => Promise<string | null>, failureTitle: string) => {
    if (picking) return; // a second tap while the picker is opening would orphan the first call
    setPicking(true);
    try {
      const uri = await open();
      if (uri) setPhoto({ kind: 'new', uri });
    } catch {
      Alert.alert(failureTitle, 'Please try again.');
    } finally {
      setPicking(false);
    }
  };

  const handleAddPhoto = () => {
    if (picking) return;
    if (Platform.OS !== 'ios') {
      // Android has no action sheet here; the library is the only path this build needs.
      runPicker(pickRecipePhoto, "Couldn't open your photos");
      return;
    }
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['Take Photo', 'Choose from Library', 'Cancel'], cancelButtonIndex: 2 },
      index => {
        if (index === 0) runPicker(takeRecipePhoto, "Couldn't open the camera");
        if (index === 1) runPicker(pickRecipePhoto, "Couldn't open your photos");
      }
    );
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setTags([]);
    setIngredients([{ name: '', amount: '' }]);
    setSteps(['']);
    setPhoto(null);
  };

  const handleSaveRecipe = async () => {
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
    // Editing keeps the id, so the photo file name stays the same too.
    const id = editing ? editing.id : Date.now().toString();

    setSaving(true);
    let imageUrl = DEFAULT_IMAGE_URL;
    if (photo?.kind === 'stored') {
      imageUrl = photo.ref;
    } else if (photo?.kind === 'new') {
      try {
        imageUrl = await persistRecipePhoto(photo.uri, id);
      } catch {
        setSaving(false);
        Alert.alert("Couldn't save the photo", 'The recipe was not saved. Please try again.');
        return;
      }
    } else if (editing && isRecipePhoto(editing.imageUrl)) {
      // The photo was removed in the form: drop the file, fall back to the stock image.
      await deleteRecipePhoto(editing.imageUrl);
    }

    const newRecipe = {
      id,
      title: title.trim(),
      subtitle: subtitle.trim() || tagsToSubtitle(tags),
      tags,
      imageUrl,
      isFavorite: editing?.isFavorite ?? false,
      ingredients: validIngredients.map(i => `${i.amount} ${i.name}`.trim()),
      // Each step ends with its own punctuation, so the recipe screen splits the text back into the same steps.
      instructions: validSteps.map(s => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`)).join(' '),
      duration: editing?.duration ?? '5 min',
    };

    if (editing) {
      dispatch(updateRecipe(newRecipe));
      // A favourited copy would otherwise keep showing the old name and photo.
      updateFavorite(newRecipe);
      setSaving(false);
      // Straight back to the recipe, which reads the fresh version from the store.
      navigation.goBack();
      return;
    }

    dispatch(addRecipe(newRecipe));
    setSaving(false);
    Alert.alert('Success', 'Recipe saved successfully!', [
      {
        text: 'OK',
        onPress: () => {
          resetForm();
          // Land on the list itself, not on whatever recipe was last open in the Home tab.
          navigation.navigate(SCREENS.HOME_TAB, { screen: SCREENS.MOCKTAIL_FINDER });
        }
      }
    ]);
  };

  const fieldStyle = { color: colors.title, borderColor: colors.badgeBorder, backgroundColor: colors.surface };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={editing ? 'Edit Recipe' : 'Add Recipe'}
        onBack={editing ? () => navigation.goBack() : undefined}
      />

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Photo (Optional)</Text>
          {photoPreviewUri ? (
            <View>
              <Image source={{ uri: photoPreviewUri }} style={[styles.photoPreview, { borderColor: colors.badgeBorder }]} />
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                  onPress={handleAddPhoto}
                  accessibilityRole="button"
                >
                  <Text style={[styles.photoActionText, { color: colors.title }]}>Change photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                  onPress={() => setPhoto(null)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.photoActionText, { color: colors.title }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
              onPress={handleAddPhoto}
              accessibilityRole="button"
              accessibilityLabel="Add a photo: take one or choose from your library"
            >
              <AddRecipeIcon size={18} color={colors.title} />
              <Text style={[styles.addButtonText, { color: colors.title }]}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Recipe Name *</Text>
          <TextInput
            style={[styles.input, fieldStyle]}
            placeholder="Tropical Sunrise"
            placeholderTextColor={colors.subtitle}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Short Description</Text>
          <TextInput
            style={[styles.input, fieldStyle]}
            placeholder="e.g. A refreshing tropical drink"
            placeholderTextColor={colors.subtitle}
            value={subtitle}
            onChangeText={setSubtitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>
            Character <Text style={[styles.labelHint, { color: colors.subtitle }]}>(up to {MAX_TAGS})</Text>
          </Text>
          {/* Wrapped, not scrolled: every option visible, nothing clipped at the edge. */}
          <View style={styles.wrapList}>
            {ALL_TAGS.map(tag => (
              <Badge
                key={tag}
                label={tag}
                active={tags.includes(tag)}
                onPress={() => toggleTag(tag)}
              />
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.title }]}>Ingredients *</Text>
          {ingredients.map((ing, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.ingredientNameInput, fieldStyle]}
                placeholder="Ingredient"
                placeholderTextColor={colors.subtitle}
                value={ing.name}
                onChangeText={(val) => handleIngredientChange(index, 'name', val)}
              />
              <TextInput
                style={[styles.input, styles.ingredientAmountInput, fieldStyle]}
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
                style={[styles.input, styles.stepInput, fieldStyle]}
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

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.activeBadgeBG, opacity: saving ? 0.6 : 1 }]}
          onPress={handleSaveRecipe}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Recipe'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
      </KeyboardAvoidingView>
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
    // no hardcoded background: the screen container paints colors.background (light or dark)
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
  labelHint: {
    fontWeight: '400',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  wrapList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#0B0F14',
  },
  photoActions: {
    flexDirection: 'row',
    marginTop: spacing.s,
  },
  photoActionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: spacing.s,
  },
  photoActionText: {
    fontSize: 15,
    fontWeight: '500',
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
