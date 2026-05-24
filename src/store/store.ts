import { configureStore } from '@reduxjs/toolkit';
import myRecipesReducer from './myRecipesSlice';

export const store = configureStore({
  reducer: {
    myRecipes: myRecipesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
