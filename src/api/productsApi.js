
// src/api/productsApi.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 10000,
});

export async function fetchProducts() {
  const res = await api.get('/products');
  return res.data.sort((a, b) => a.id - b.id);
}
