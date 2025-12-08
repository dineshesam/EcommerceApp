
import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Alert } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { api } from '../../api/client';
import { storage } from '../../utils/storage';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setRefreshing(true);
      const [p, u] = await Promise.all([
        api.getProducts(),
        storage.getUser()
      ]);
      setProducts(p);
      setUser(u);
    } catch (e) {
      Alert.alert('Error', 'Failed to load products or user');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addToCart = async (productId) => {
    if (!user?.id) return Alert.alert('Not logged in', 'Please log in to add items to cart');
    try {
      await api.addToCart(user.id, productId, 1);
      // Optional feedback:
      // Alert.alert('Cart updated', 'Item added to cart');
    } catch (e) {
      Alert.alert('Error', 'Could not add to cart');
    }
  };

  const addToWishlist = async (productId) => {
    if (!user?.id) return Alert.alert('Not logged in', 'Please log in to add items to wishlist');
    try {
      await api.addToWishlist(user.id, productId);
      // Optional feedback:
      // Alert.alert('Wishlist updated', 'Item added to wishlist');
    } catch (e) {
      Alert.alert('Error', 'Could not add to wishlist');
    }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={products}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onAddToCart={() => addToCart(item.id)}
            onAddToWishlist={() => addToWishlist(item.id)}
          />
        )}
      />
    </View>
  );
}
