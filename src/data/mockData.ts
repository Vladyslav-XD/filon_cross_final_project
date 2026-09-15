import type { DrinkTag } from '../utils/drinkTags';

export interface Recipe {
  id: string;
  title: string;
  /** Card subtitle: derived tags for database drinks, the user's short description for their own. */
  subtitle: string;
  /** https URL (database drink) or "recipe-photo:<file>" (photo attached to a user recipe, see utils/recipePhotos). */
  imageUrl: string;
  isFavorite: boolean;
  /** "measure ingredient" lines in recipe order. */
  ingredients?: string[];
  instructions?: string;
  duration?: string;
  /** Legacy single category of user recipes created before tags existed. */
  category?: string;
  /** Character tags (see utils/drinkTags). Derived for database drinks, chosen for user recipes. */
  tags?: DrinkTag[];
}
