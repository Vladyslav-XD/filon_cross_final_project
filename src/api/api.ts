import { Recipe } from '../data/mockData';
import { COCKTAILDB_BASE_URL } from './config';

export const API_URL = `${COCKTAILDB_BASE_URL}/filter.php?a=Non_Alcoholic`;
export const API_DETAILS_URL = `${COCKTAILDB_BASE_URL}/lookup.php?i=`;

const REQUEST_TIMEOUT_MS = 15000;

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export const fetchMocktails = async (): Promise<Recipe[]> => {
  const data = await fetchJson(API_URL);
  const drinks: any[] = Array.isArray(data?.drinks) ? data.drinks : [];

  return drinks.map((item: any) => ({
    id: String(item.idDrink),
    title: item.strDrink,
    subtitle: 'Non-alcoholic mocktail',
    imageUrl: item.strDrinkThumb,
    isFavorite: false,
  }));
};

export const fetchMocktailDetails = async (id: string): Promise<Partial<Recipe>> => {
  const data = await fetchJson(`${API_DETAILS_URL}${encodeURIComponent(id)}`);
  if (!Array.isArray(data?.drinks) || data.drinks.length === 0) {
    return {};
  }
  const drink = data.drinks[0];
  const ingredients: string[] = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== '') {
      const item = measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim();
      ingredients.push(item);
    }
  }

  return {
    instructions: drink.strInstructions,
    ingredients,
  };
};
