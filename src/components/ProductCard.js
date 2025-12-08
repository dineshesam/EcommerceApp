
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductCard({ product, onAddToCart, onAddToWishlist }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>₹{product.price}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={onAddToCart}>
          <Text style={styles.btnText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={onAddToWishlist}>
          <Text style={styles.btnText}>Wishlist</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 12, backgroundColor: '#fff', marginBottom: 12, elevation: 2 },
  image: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', color: '#000' },
  price: { marginTop: 4, color: '#0a84ff', fontWeight: '700' }, // default blue
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, backgroundColor: '#0a84ff', padding: 10, borderRadius: 8, alignItems: 'center' },
  secondary: { backgroundColor: '#222' },
  btnText: { color: '#fff', fontWeight: '600' }
});
