import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
}

interface ShoppingListState {
  items: ShoppingListItem[];
}

const initialState: ShoppingListState = {
  items: [],
};

export const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
  },
});

export const { addItem, removeItem, updateQuantity } = shoppingListSlice.actions;

export default shoppingListSlice.reducer;
