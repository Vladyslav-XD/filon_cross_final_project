import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '../data/mockData';

export interface MyRecipesState {
  recipes: Recipe[];
}

const initialState: MyRecipesState = {
  recipes: [],
};

export const myRecipesSlice = createSlice({
  name: 'myRecipes',
  initialState,
  reducers: {
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipes.push(action.payload);
    },
    removeRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload);
    },
  },
});

export const { addRecipe, removeRecipe } = myRecipesSlice.actions;

export default myRecipesSlice.reducer;
