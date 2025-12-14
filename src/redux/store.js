import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import productReducer from "./slices/productSlice";
import checkoutReducer from "./slices/checkoutSlice";

export const store = configureStore({
  reducer: {
  checkout: checkoutReducer,
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productReducer,
  },
});
