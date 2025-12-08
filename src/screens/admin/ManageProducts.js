
import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { api } from '../../api/client';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const load = async () => {
    const res = await api.getProducts();
    setProducts(res);
  };

  useEffect(() => { load(); }, []);

  const addProduct = async () => {
    if (!title || !price) return Alert.alert('Enter title and price');
    await api.createProduct({ title, price: Number(price), image: 'https://via.placeholder.com/150', stock: 0 });
    setTitle('');
    setPrice('');
    load();
  };

  const deleteProduct = async (id) => {
    await api.deleteProduct(id);
    load();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.h}>Add Product</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" value={price} onChangeText={setPrice} />
      <TouchableOpacity style={styles.btn} onPress={addProduct}>
        <Text style={styles.btnText}>Add</Text>
      </TouchableOpacity>

      <Text style={[styles.h, { marginTop: 16 }]}>Products</Text>
      <FlatList
        data={products}
        keyExtractor={p => String(p.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ flex: 1 }}>{item.title} - ₹{item.price}</Text>
            <TouchableOpacity onPress={() => deleteProduct(item.id)}>
              <Text style={{ color: 'red' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 8 },
  btn: { backgroundColor: '#0a84ff', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' }
});
