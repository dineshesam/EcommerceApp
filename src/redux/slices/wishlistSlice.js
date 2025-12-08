import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name:"wishlist",
  initialState:[],
  reducers:{
    setWishlist:(state,action)=>action.payload,   // store full product list
    addWishlist:(state,action)=>[...state,action.payload],
    removeWishlist:(state,action)=>state.filter(p => p.id !== action.payload)
  }
});

export const { setWishlist, addWishlist, removeWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
