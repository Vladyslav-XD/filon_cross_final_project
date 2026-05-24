import { Recipe } from '../data/mockData';

export const API_URL = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic';
export const API_DETAILS_URL = 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=';

export const fetchMocktails = async (): Promise<Recipe[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    return data.drinks.map((item: any) => ({
      id: item.idDrink,
      title: item.strDrink,
      subtitle: 'Non-alcoholic Mocktail',
      imageUrl: item.strDrinkThumb,
      isFavorite: false,
    }));
  } catch (error) {
    console.error('Помилка під час отримання даних:', error);
    throw error;
  }
};

export const fetchMocktailDetails = async (id: string): Promise<Partial<Recipe>> => {
  try {
    const response = await fetch(`${API_DETAILS_URL}${id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (!data.drinks) {
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
      ingredients: ingredients,
    };
  } catch (error) {
    console.error('Помилка під час отримання деталей:', error);
    throw error;
  }
};
