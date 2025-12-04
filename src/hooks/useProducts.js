
import { useCallback, useEffect, useState } from 'react';
import { fetchProducts } from '../api/productsApi';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      setError(e.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      setError(e.message || 'Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { products, loading, error, refresh, refreshing, reload: load };
}
