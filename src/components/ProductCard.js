
import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function ProductCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(item)} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.row}>
          <Icon name="shape-outline" size={16} color="#7F8C8D" />
          <Text style={styles.category}>  {item.category}</Text>
        </View>
        <Text style={styles.price}>₹{(item.price * 83).toFixed(0)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ProductCard);

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 12, marginHorizontal: 12, marginVertical: 8, elevation: 2 },
  image: { width: 84, height: 84 },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', color: '#2C3E50' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  category: { color: '#7F8C8D', fontSize: 13 },
  price: { marginTop: 8, fontSize: 16, color: '#2E86DE', fontWeight: '700' },
});
