
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import ProductCard from '../../components/ProductCard';
import Images from '../../assets/images';

/**
 * Static brand labels/images per category (3 per category as you requested).
 * Swap placeholder URIs with local assets via `require()` if you prefer.
 */
const BRANDS_BY_CATEGORY = {
  mobiles: [
    { id: 'apple',   name: 'Apple',   imageUri: Images.applelogo },
    { id: 'samsung', name: 'Samsung', imageUri: Images.samsunglogo },
    { id: 'realme',  name: 'Realme',  imageUri: Images.realmelogo },
  ],
  laptops: [
    { id: 'dell',   name: 'Dell',   imageUri: Images.dell_logo },
    { id: 'lenovo', name: 'Lenovo', imageUri: Images.lenovologo },
    { id: 'hp',     name: 'HP',     imageUri: Images.hp_logo },
  ],
  audio: [
    { id: 'boat', name: 'boAt', imageUri: Images.boat_logo },
    { id: 'jbl',  name: 'JBL',  imageUri: Images.jbl_logo },
    { id: 'sony', name: 'Sony', imageUri: Images.sony_logo },
  ],
  smartwatches: [
    { id: 'apple',   name: 'Apple',   imageUri: Images.applelogo},
    { id: 'noise',   name: 'Noise',   imageUri: Images.noise_logo },
    { id: 'samsung', name: 'Samsung', imageUri: Images.samsunglogo },
  ],
  camera: [
    { id: 'sony',   name: 'Sony',   imageUri: Images.sony_logo },
    { id: 'canon',     name: 'canon',     imageUri: Images.canon_logo },
    { id: 'nikon',name: 'nikon',imageUri: Images.nikon_logo },
  ],
};

export default function CategoryScreen({ route }) {
  const { categoryId } = route.params; // e.g., 'mobiles', 'laptops', 'audio'
  const { items, loading, error } = useSelector((state) => state.products);

  // Top brands (static labels) for this category
  const brands = useMemo(() => BRANDS_BY_CATEGORY[categoryId] || [], [categoryId]);

  // Default selection: first brand if available; or 'all' to show everything in the category
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.name || 'all');

  // Only products for this category
  const categoryItems = useMemo(
    () => items.filter((p) => (p.category || '').toLowerCase() === categoryId.toLowerCase()),
    [items, categoryId]
  );

  // Filter by selected brand (if not 'all')
  const filteredItems = useMemo(() => {
    if (selectedBrand === 'all') return categoryItems;
    return categoryItems.filter(
      (p) => (p.brand || '').toLowerCase() === selectedBrand.toLowerCase()
    );
  }, [categoryItems, selectedBrand]);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Title */}
      <Text style={styles.title}>
        {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}
      </Text>

      {/* Static brand row (round pics) */}
      <View style={styles.brandRowWrapper}>
        <FlatList
          data={[{ id: 'all', name: 'All', imageUri: '' }, ...brands]}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandRow}
          renderItem={({ item }) => {
            const active = item.name === selectedBrand || item.id === selectedBrand;
            return (
              <Pressable
                onPress={() => setSelectedBrand(item.name === 'All' ? 'all' : item.name)}
                style={({ pressed }) => [styles.brandItem, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel={item.name}
              >
                <Image
                  source={item.imageUri }
                  style={[styles.brandImage, active && styles.brandImageActive]}
                />
                <Text style={[styles.brandLabel, active && styles.brandLabelActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No brands</Text>}
        />
      </View>

      {/* Header: count + selected brand */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          {selectedBrand === 'all' ? 'Products' : `Products · ${selectedBrand}`}
        </Text>
        <Text style={styles.count}>available products   {filteredItems.length}</Text>
      </View>

      {/* Loading / Error */}
      {loading && !items.length ? (
        <Text style={styles.subtle}>Loading…</Text>
      ) : error ? (
        <Text style={styles.error}>Failed to load products: {String(error)}</Text>
      ) : null}

      {/* Product list (vertical like Home) */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
      />
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  container: { paddingHorizontal: 10, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 8, marginHorizontal: 12 },
  brandRowWrapper: {
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  brandRow: { paddingHorizontal: 8 },
  brandItem: { alignItems: 'center', marginRight: 14 },
  brandImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E7EB', // placeholder background
  },
  brandImageActive: { borderWidth: 2, borderColor: '#0A84FF' },
  brandLabel: { marginTop: 6, fontSize: 12, color: '#333', fontWeight: '500' },
  brandLabelActive: { color: '#0A84FF', fontWeight: '700' },
  headerRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  count: { color: '#6B7280' ,marginRight:150},
  subtle: { color: '#6B7280', marginHorizontal: 12, marginBottom: 8 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 14 },
  error: { color: '#DC2626', marginHorizontal: 12, marginBottom: 8 },
});
