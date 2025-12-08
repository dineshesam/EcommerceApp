
import { endpoints } from './endpoints';

const jsonHeaders = { 'Content-Type': 'application/json' };

// Normalize to numbers to avoid "1" vs 1 mismatches in json-server queries
const toNum = (v) => Number(v);

export const api = {
  async login(email, password) {
    const url = `${endpoints.users}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Login request failed');
    const users = await res.json();
    if (users.length) return users[0];
    throw new Error('Invalid credentials');
  },

  async getProducts() {
    const res = await fetch(endpoints.products);
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
  },

  // ---------- Wishlist ----------
  async addToWishlist(userId, productId) {
    const uid = toNum(userId);
    const pid = toNum(productId);

    // Prevent duplicates: check if it already exists
    const check = await fetch(`${endpoints.wishlist}?userId=${uid}&productId=${pid}`);
    const existing = await check.json();
    if (existing.length) return existing[0];

    const res = await fetch(endpoints.wishlist, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ userId: uid, productId: pid })
    });
    if (!res.ok) throw new Error('Failed to add to wishlist');
    return res.json();
  },

  async getWishlist(userId) {
    const uid = toNum(userId);
    const res = await fetch(`${endpoints.wishlist}?userId=${uid}`);
    if (!res.ok) throw new Error('Failed to load wishlist');
    return res.json();
  },

  async removeFromWishlist(id) {
    const res = await fetch(`${endpoints.wishlist}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove from wishlist');
    return true;
  },

  // ---------- Cart ----------
  async getCart(userId) {
    const uid = toNum(userId);
    const res = await fetch(`${endpoints.cart}?userId=${uid}`);
    if (!res.ok) throw new Error('Failed to load cart');
    return res.json();
  },

  // Upsert: if (userId, productId) exists → PATCH qty; else POST
  async addToCart(userId, productId, qty = 1) {
    const uid = toNum(userId);
    const pid = toNum(productId);
    const q = toNum(qty);

    // 1) Check existing cart line
    const res = await fetch(`${endpoints.cart}?userId=${uid}&productId=${pid}`);
    const rows = await res.json();

    if (rows.length) {
      const row = rows[0];
      const patchRes = await fetch(`${endpoints.cart}/${row.id}`, {
        method: 'PATCH',
        headers: jsonHeaders,
        body: JSON.stringify({ qty: toNum(row.qty) + q })
      });
      if (!patchRes.ok) throw new Error('Failed to update cart qty');
      return patchRes.json();
    }

    // 2) Create new line
    const postRes = await fetch(endpoints.cart, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ userId: uid, productId: pid, qty: q })
    });
    if (!postRes.ok) throw new Error('Failed to add to cart');
    return postRes.json();
  },

  async updateCartItem(id, payload) {
    const res = await fetch(`${endpoints.cart}/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update cart item');
    return res.json();
  },

  async removeCartItem(id) {
    const res = await fetch(`${endpoints.cart}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove cart item');
    return true;
  },

  // ---------- Admin ----------
  async createProduct(product) {
    const res = await fetch(endpoints.products, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  async updateProduct(id, product) {
    const res = await fetch(`${endpoints.products}/${id}`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${endpoints.products}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    return true;
  }
};
