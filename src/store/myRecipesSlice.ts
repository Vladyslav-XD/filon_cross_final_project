import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '../data/mockData';

export interface MyRecipesState {
  recipes: Recipe[];
  /** true once recipes have been read from device storage */
  hydrated: boolean;
}

const initialState: MyRecipesState = {
  recipes: [],
  hydrated: false,
};

export const myRecipesSlice = createSlice({
  name: 'myRecipes',
  initialState,
  reducers: {
    hydrateRecipes: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
      state.hydrated = true;
    },
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipes.push(action.payload);
    },
    /** Replaces an edited recipe in place, keeping its id and its position in the list. */
    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const index = state.recipes.findIndex(recipe => recipe.id === action.payload.id);
      if (index !== -1) state.recipes[index] = action.payload;
    },
    removeRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload);
    },
  },
});

export const { hydrateRecipes, addRecipe, updateRecipe, removeRecipe } = myRecipesSlice.actions;

export default myRecipesSlice.reducer;
