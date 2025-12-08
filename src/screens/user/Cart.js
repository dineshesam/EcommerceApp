
import React, { useCallback, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { storage } from '../../utils/storage';
import EmptyState from '../../components/EmptyState';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const u = await storage.getUser();
      setUser(u);
      const res = await api.getCart(u.id);
      // Optional: sort by id for stable rendering
      setItems(res.sort((a, b) => Number(a.id) - Number(b.id)));
    } catch (e) {
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const inc = async (item) => {
    try {
      await api.updateCartItem(item.id, { qty: Number(item.qty) + 1 });
      await load();
    } catch (e) {
      Alert.alert('Error', 'Could not update cart');
    }
  };

  const dec = async (item) => {
    try {
      const newQty = Math.max(1, Number(item.qty) - 1);
      await api.updateCartItem(item.id, { qty: newQty });
      await load();
    } catch (e) {
      Alert.alert('Error', 'Could not update cart');
    }
  };

  const remove = async (item) => {
    try {
      await api.removeCartItem(item.id);
      await load();
    } catch (e) {
      Alert.alert('Error', 'Could not remove item');
    }
  };

  if (!loading && !items.length) {
    return <EmptyState title="Cart is empty" subtitle="Add products to cart from Home" />;
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10 }}>
            <Text style={{ color: '#000' }}>Product ID: {item.productId}</Text>
            <Text style={{ color: '#000' }}>Qty: {item.qty}</Text>

            <View style={{ flexDirection: 'row', columnGap: 12, marginTop: 8 }}>
              <TouchableOpacity onPress={() => inc(item)}>
                <Text style={{ color: '#0a84ff' }}>+ Add one</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => dec(item)}>
                <Text style={{ color: '#0a84ff' }}>- Remove one</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => remove(item)}>
                <Text style={{ color: '#ff3b30' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
