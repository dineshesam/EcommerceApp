
// redux/slices/categorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { searchProducts } from "../../api/productApi";

/**
 * Category-specific fetch (kept separate from Home).
 * Args: { category, brand?, q?, sort?, page?, limit?, append? }
 */
export const fetchCategoryProducts = createAsyncThunk(
  "category/fetch",
  async (args = {}, { signal }) => {
    const {
      category,            // required for this slice
      brand,               // optional
      q = "",              // we typically keep empty here
      sort = "relevance",
      page = 1,
      limit = 16,
      append = false,
    } = args;

    if (!category) {
      throw new Error("fetchCategoryProducts: 'category' is required");
    }

    const data = await searchProducts({ q, category, brand, sort, page, limit, signal });
    return { data, args };
  }
);

const initialState = {
  items: [],
  total: 0,
  loading: false,
  page: 1,
  category: null,
  brand: undefined,
  q: "",
  sort: "relevance",
  limit: 16,
  hasMore: true,
  error: null,
};

const categorySlice = createSlice({
  name: "categoryProducts",
  initialState,
  reducers: {
    setCategoryBrand(state, action) {
      const { category, brand } = action.payload || {};
      state.category = category ?? state.category;
      state.brand = brand ?? undefined; // undefined when 'all'
      state.page = 1;
    },
    resetCategoryProducts(state) {
      state.items = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    setCategorySort(state, action) {
      state.sort = action.payload ?? "relevance";
      state.page = 1;
    },
    setCategoryQuery(state, action) {
      state.q = action.payload ?? "";
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        const { data, args } = action.payload;
        const append = Boolean(args.append);

        state.page   = data.page || args.page || 1;
        state.limit  = data.limit || args.limit || state.limit;
        state.total  = typeof data.total === "number" ? data.total : state.total;

        // Persist the active filters for this slice
        state.category = args.category ?? state.category;
        state.brand    = args.brand ?? state.brand;
        state.q        = args.q ?? state.q;
        state.sort     = args.sort ?? state.sort;

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
      .addCase(fetchCategoryProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Failed to fetch category products";
      });
  },
});

export const {
  setCategoryBrand,
  resetCategoryProducts,
  setCategorySort,
  setCategoryQuery,
} = categorySlice.actions;

export default categorySlice.reducer;
