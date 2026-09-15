import { ALL_TAGS, DrinkTag } from '../utils/drinkTags';

/**
 * Character chips on the home screen. Every chip is a real tag from
 * utils/drinkTags — the same words that appear in card subtitles.
 * "Sweet" is left out: two thirds of the drinks have it, so it filters nothing.
 */
export const CHARACTER_FILTERS: DrinkTag[] = ALL_TAGS.filter(t => t !== 'Sweet');

/**
 * "What do you have at hand" chips. Each matches an ingredient line
 * ("1 cup Apple juice") or the drink name. Chosen from what the database
 * actually contains — every chip returns at least a few drinks.
 */
export const INGREDIENT_FILTERS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'Orange', pattern: /orange/i },
  { label: 'Lemon', pattern: /lemon/i },
  { label: 'Lime', pattern: /\blime/i },
  { label: 'Apple', pattern: /\bapple/i },
  { label: 'Pineapple', pattern: /pineapple/i },
  { label: 'Banana', pattern: /banana/i },
  { label: 'Berries', pattern: /berr/i },
  { label: 'Ginger', pattern: /ginger(?! ale| beer|ale)/i },
  { label: 'Mint', pattern: /\bmint/i },
  { label: 'Milk', pattern: /milk/i },
  { label: 'Yoghurt', pattern: /yog(h)?urt/i },
];

export function recipeHasIngredient(
  recipe: { title: string; ingredients?: string[] },
  label: string
): boolean {
  const filter = INGREDIENT_FILTERS.find(f => f.label === label);
  if (!filter) return false;
  if (filter.pattern.test(recipe.title)) return true;
  return (recipe.ingredients || []).some(line => filter.pattern.test(line));
}
