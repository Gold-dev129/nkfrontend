import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  wishlist: {
    products: []
  },
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    wishlistStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setWishlist: (state, action) => {
      state.loading = false;
      state.wishlist = action.payload;
      state.error = null;
    },
    wishlistFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearWishlistState: (state) => {
      state.wishlist = { products: [] };
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  wishlistStart,
  setWishlist,
  wishlistFailure,
  clearWishlistState
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
