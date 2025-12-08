import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name:"cart",
  initialState:[],
  reducers:{
    setCart:(state,action)=>action.payload,   // FULL cart sync
    addCart:(state,action)=>[...state,action.payload],
    updateQty:(state,action)=>{
      return state.map(item =>
        item.productId === action.payload.productId
          ? { ...item, qty: action.payload.qty }
          : item
      );
    },
    removeCart:(state,action)=>state.filter(item => item.productId !== action.payload),
    clearCart:()=>[]
  }
});

export const { setCart, addCart, updateQty, removeCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
