
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import { useProducts } from '../hooks/useProducts';

export default function ProductListScreen() {
  const { products, loading, error, reload, refresh, refreshing } = useProducts();
  const [sortBy, setSortBy] = useState('none');

  const sorted = useMemo(() => {
    if (sortBy === 'none') return products;
    const arr = [...products];
    if (sortBy === 'price') arr.sort((a, b) => a.price - b.price);
    if (sortBy === 'title') arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  }, [products, sortBy]);

  const renderItem = ({ item }) => (
    <ProductCard item={item} onPress={() => { /* navigation later */ }} />
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Products</Text>
        <Text style={styles.sort} onPress={() => {
          setSortBy(prev => (prev === 'none' ? 'price' : prev === 'price' ? 'title' : 'none'));
        }}>
          Sort: {sortBy}
        </Text>
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onRefresh={refresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No products available.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 22, fontWeight: '700', color: '#2C3E50' },
  sort: { fontSize: 14, color: '#2E86DE' },
  listContent: { paddingBottom: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: '#7F8C8D' },
});
