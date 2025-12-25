
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
import useDynamicStyles from '../../hooks/useDynamicStyles';

/**
 * Static brand labels/images per category (3 per category).
 * For local assets: we pass require-number directly (no URI string).
 */
const BRANDS_BY_CATEGORY = {
  mobiles: [
    { id: 'apple',   name: 'Apple',   image: Images.applelogo },
    { id: 'samsung', name: 'Samsung', image: Images.samsunglogo },
    { id: 'realme',  name: 'Realme',  image: Images.realmelogo },
  ],
  laptops: [
    { id: 'dell',   name: 'Dell',   image: Images.dell_logo },
    { id: 'lenovo', name: 'Lenovo', image: Images.lenovologo },
    { id: 'hp',     name: 'HP',     image: Images.hp_logo },
  ],
  audio: [
    { id: 'boat', name: 'boAt', image: Images.boat_logo },
    { id: 'jbl',  name: 'JBL',  image: Images.jbl_logo },
    { id: 'sony', name: 'Sony', image: Images.sony_logo },
  ],
  smartwatches: [
    { id: 'apple',   name: 'Apple',   image: Images.applelogo },
    { id: 'noise',   name: 'Noise',   image: Images.noise_logo },
    { id: 'samsung', name: 'Samsung', image: Images.samsunglogo },
  ],
  camera: [
    { id: 'sony',   name: 'Sony',   image: Images.sony_logo },
    { id: 'canon',  name: 'Canon',  image: Images.canon_logo },
    { id: 'nikon',  name: 'Nikon',  image: Images.nikon_logo },
  ],
};

export default function CategoryScreen({ route }) {
  const { categoryId } = route.params; // e.g., 'mobiles', 'laptops', 'audio'
  const { items, loading, error } = useSelector((state) => state.products);

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  // Top brands (static labels) for this category
  const brands = useMemo(() => BRANDS_BY_CATEGORY[categoryId] || [], [categoryId]);

  // Default selection: first brand if available; or 'all'
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.name || 'all');

  // Only products for this category
  const categoryItems = useMemo(
    () => items.filter((p) => (p.category || '').toLowerCase() === categoryId.toLowerCase()),
    [items, categoryId]
  );

  // Filter by selected brand
  const filteredItems = useMemo(() => {
    if (selectedBrand === 'all') return categoryItems;
    return categoryItems.filter(
      (p) => (p.brand || '').toLowerCase() === selectedBrand.toLowerCase()
    );
  }, [categoryItems, selectedBrand]);

  // Helper to render brand item (with safe placeholder for "All")
  const renderBrand = ({ item }) => {
    const isAll = item.id === 'all' || item.name === 'All';
    const active =
      selectedBrand === 'all'
        ? isAll
        : item.name === selectedBrand || item.id === selectedBrand;

    return (
      <Pressable
        onPress={() => setSelectedBrand(isAll ? 'all' : item.name)}
        style={({ pressed }) => [styles.brandItem, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel={item.name}
      >
        {isAll ? (
          <View style={[styles.brandImage, styles.brandImagePlaceholder, active && styles.brandImageActive]} />
        ) : (
          <Image
            source={item.image}
            style={[styles.brandImage, active && styles.brandImageActive]}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.brandLabel, active && styles.brandLabelActive]}>
          {isAll ? 'All' : item.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Title */}
      <Text style={styles.title}>
        {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}
      </Text>

      {/* Static brand row (round pics) */}
      <View style={styles.brandRowWrapper}>
        <FlatList
          data={[{ id: 'all', name: 'All' }, ...brands]}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandRow}
          renderItem={renderBrand}
          ListEmptyComponent={<Text style={styles.empty}>No brands</Text>}
        />
      </View>

      {/* Header: count + selected brand */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          {selectedBrand === 'all' ? 'Products' : `Products · ${selectedBrand}`}
        </Text>
        <Text style={styles.count}>
          {filteredItems.length} available
        </Text>
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
        renderItem={({ item }) =><View style={{ margin:10, width:300,height:280}}> <ProductCard product={item} /></View>}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
      />
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const createStyles = (colors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.primaryBg },
    container: { paddingHorizontal: 10, paddingBottom: 56 },

    title: {
      fontSize: 22,
      fontWeight: '700',
      marginTop: 8,
      marginHorizontal: 12,
      color: colors.primaryText,
    },

    brandRowWrapper: {
      backgroundColor: colors.sectionBackground,
      borderBottomColor: colors.divider,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingVertical: 8,
    },
    brandRow: { paddingHorizontal: 8 },

    brandItem: { alignItems: 'center', marginRight: 14 },

    brandImage: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.tabBackground, // pill surface
      borderWidth: 0,
      borderColor: 'transparent',
    },
    // Placeholder circle for "All"
    brandImagePlaceholder: {
      // keeps same size; uses tabBackground already
    },
    brandImageActive: {
      borderWidth: 2,
      borderColor: colors.brandAccent,
    },

    brandLabel: {
      marginTop: 6,
      fontSize: 12,
      color: colors.primaryText,
      fontWeight: '500',
    },
    brandLabelActive: { color: colors.brandAccent, fontWeight: '700' },

    headerRow: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.primaryText },

    count: { color: colors.secondaryText },

    subtle: { color: colors.secondaryText, marginHorizontal: 12, marginBottom: 8 },
    empty: { textAlign: 'center', color: colors.secondaryText, marginTop: 14 },
    error: { color: colors.error, marginHorizontal: 12, marginBottom: 8 },
  });
