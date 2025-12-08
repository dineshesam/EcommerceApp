
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { api } from '../../api/client';
import { storage } from '../../utils/storage';
import EmptyState from '../../components/EmptyState';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);

  const load = async () => {
    const u = await storage.getUser();
    setUser(u);
    const res = await api.getWishlist(u.id);
    setItems(res);
  };

  useEffect(() => { load(); }, []);

  if (!items.length) return <EmptyState title="No wishlist items" subtitle="Add products to wishlist from Home" />;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10 }}>
            <Text>Product ID: {item.productId}</Text>
            <TouchableOpacity onPress={() => api.removeFromWishlist(item.id)}>
              <Text style={{ color: 'red', marginTop: 6 }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
