import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllProducts } from "../../api/productApi";

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (page = 1) => {
    const data = await getAllProducts(page);
    return data; // returns items + total
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: { items: [], total: null, loading: false, page: 1 },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.meta.arg; // current page
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state) => { state.loading = false });
  }
});

export default productSlice.reducer;
