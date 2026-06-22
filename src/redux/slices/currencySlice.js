import { createSlice } from '@reduxjs/toolkit';

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    currentCurrency: 'NGN',
    exchangeRate: 1500
  },
  reducers: {
    setCurrency: (state, action) => {
      state.currentCurrency = action.payload;
    },
    setExchangeRate: (state, action) => {
      state.exchangeRate = action.payload;
    }
  }
});

export const { setCurrency, setExchangeRate } = currencySlice.actions;
export default currencySlice.reducer;
