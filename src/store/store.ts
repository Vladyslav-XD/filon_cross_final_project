import { configureStore } from '@reduxjs/toolkit';
import myRecipesReducer, { hydrateRecipes } from './myRecipesSlice';
import { loadJson, saveJson, STORAGE_KEYS } from '../storage/storage';
import { Recipe } from '../data/mockData';

export const store = configureStore({
  reducer: {
    myRecipes: myRecipesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Reads persisted user recipes into the store. Resolves when done (never rejects). */
export async function hydrateStore(): Promise<void> {
  const saved = await loadJson<Recipe[]>(STORAGE_KEYS.myRecipes, []);
  store.dispatch(hydrateRecipes(Array.isArray(saved) ? saved : []));
}

// Persist user recipes whenever they change (after hydration, so an empty
// initial state never overwrites what is already on disk).
let lastPersisted: Recipe[] | null = null;
store.subscribe(() => {
  const { recipes, hydrated } = store.getState().myRecipes;
  if (!hydrated || recipes === lastPersisted) return;
  lastPersisted = recipes;
  saveJson(STORAGE_KEYS.myRecipes, recipes);
});
