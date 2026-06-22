import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: {
    items: []
  },
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setCart: (state, action) => {
      state.loading = false;
      state.cart = action.payload;
      state.error = null;
    },
    cartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCartState: (state) => {
      state.cart = { items: [] };
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  cartStart,
  setCart,
  cartFailure,
  clearCartState
} = cartSlice.actions;

export default cartSlice.reducer;
