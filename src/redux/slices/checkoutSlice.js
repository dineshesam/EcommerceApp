
// redux/slices/checkoutSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  couponCode: "",
  subtotal: 0,
  discount: 0,
  finalTotal: 0,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCheckoutTotals(state, action) {
      const { couponCode = "", subtotal = 0, discount = 0, finalTotal = 0 } = action.payload || {};
      state.couponCode = couponCode;
      state.subtotal = Number(subtotal) || 0;
      state.discount = Number(discount) || 0;
      state.finalTotal = Number(finalTotal) || 0;
    },
    clearCheckoutTotals(state) {
      state.couponCode = "";
      state.subtotal = 0;
      state.discount = 0;
      state.finalTotal = 0;
    },
  },
});

export const { setCheckoutTotals, clearCheckoutTotals } = checkoutSlice.actions;
export default checkoutSlice.reducer;
