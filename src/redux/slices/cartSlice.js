import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const exists = state.find(i => i.id === item.id);

      if (!exists) {
        state.push({ ...item, quantity: 1 });
      } else {
        exists.quantity += 1;
      }
    },

    removeFromCart: (state, action) => {
      return state.filter(item => item.id !== action.payload);
    },

    decreaseQty: (state, action) => {
      const product = state.find(i => i.id === action.payload);
      if (product && product.quantity > 1) product.quantity -= 1;
      else return state.filter(i => i.id !== action.payload);
    },

    clearCart: () => []
  }
});

export const { addToCart, removeFromCart, decreaseQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
