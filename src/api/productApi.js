
// api/productApi.js
import api from "./axiosConfig";

/**
 * Server-side search/filter/sort/pagination
 * Supports: q, category, brand, sort, min, max, page, limit
 */
export const searchProducts = async ({
  q = "",
  category = "all",
  brand,                 // optional
  sort = "relevance",
  min,
  max,
  page = 1,
  limit = 16,
  signal,
} = {}) => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));

  if (q?.trim()) params.append("q", q.trim());
  if (category && category !== "all") params.append("category", category);
  if (brand) params.append("brand", brand);
  if (typeof min !== "undefined") params.append("min", String(min));
  if (typeof max !== "undefined") params.append("max", String(max));
  if (sort && sort !== "relevance") params.append("sort", sort);

  // ✅ Make sure this resolves to /api/products in final URL
  // Option A (explicit): 
  const res = await api.get(`/products?${params.toString()}`, { signal });

  // Option B (if baseURL = '/api'): 
  // const res = await api.get(`/products?${params.toString()}`, { signal });

  return res.data; // { items, total, page, limit }
};
