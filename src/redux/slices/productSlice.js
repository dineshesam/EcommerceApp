
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { searchProducts } from "../../api/productApi";

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (args = {}, { signal }) => {
    const {
      q = "",
      category = "all",
      brand,                // ✅ optional
      sort = "relevance",
      page = 1,
      limit = 16,
      append = false,
    } = args;

    // Pass brand only if provided
    const data = await searchProducts({ q, category, brand, sort, page, limit, signal });
    return { data, args };
  }
);

const initialState = {
  items: [],
  total: 0,
  loading: false,
  page: 1,
  q: "",
  category: "all",
  brand: undefined,        // ✅ optional in state
  sort: "relevance",
  limit: 16,
  hasMore: true,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // These setters are used by Home
    setQuery(state, action) {
      state.q = action.payload ?? "";
      state.page = 1;
    },
    setCategory(state, action) {
      state.category = action.payload ?? "all";
      state.page = 1;
    },
    setSort(state, action) {
      state.sort = action.payload ?? "relevance";
      state.page = 1;
    },
    // Category screen can use this if you want to store brand globally
    setBrand(state, action) {
      state.brand = action.payload || undefined; // undefined when 'all'
      state.page = 1;
    },
    resetProducts(state) {
      state.items = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { data, args } = action.payload;
        const append = Boolean(args.append);

        state.page  = data.page || args.page || 1;
        state.limit = data.limit || args.limit || state.limit;
        state.total = typeof data.total === "number" ? data.total : state.total;

        // Keep latest filters in state (useful if screens read them)
        state.q       = args.q ?? state.q;
        state.category= args.category ?? state.category;
        state.brand   = args.brand ?? state.brand;
        state.sort    = args.sort ?? state.sort;

        if (append) {
          state.items = [...state.items, ...(data.items || [])];
        } else {
          state.items = data.items || [];
        }

        const loaded = state.items.length;
        state.hasMore = typeof state.total === "number" ? loaded < state.total : true;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to fetch";
      });
  },
});

export const { setQuery, setCategory, setSort, setBrand, resetProducts } = productSlice.actions;
export default productSlice.reducer;
