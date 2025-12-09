import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: [],
  reducers: {
    setCart: (state, action) => action.payload,

    /** 🟢 FIXED — ADD SHOULD MERGE, NOT DUPLICATE */
    addCart: (state, action) => {
      const { productId, product } = action.payload;
      const existing = state.find(i => i.productId === productId);

      if (existing) {
        existing.qty += 1;             // increase instead of duplicate
      } else {
        state.push({ productId, product, qty: 1 });
      }
    },

    updateQty: (state, action) => {
      const item = state.find(i => i.productId === action.payload.productId);
      if (item) item.qty = action.payload.qty;
    },

    removeCart: (state, action) => 
      state.filter(i => i.productId !== action.payload),

    clearCart: () => []
  }
});

export const { setCart, addCart, updateQty, removeCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
