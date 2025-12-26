
// screens/Category/CategoryScreen.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from '../../components/ProductCard';
import Images from '../../assets/images';
import useDynamicStyles from '../../hooks/useDynamicStyles';
import {
  fetchCategoryProducts,
  resetCategoryProducts,
} from '../../redux/slices/categorySlice';

/** Static brand assets … (same as your current map) */
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
  const { categoryId } = route.params; // e.g., 'mobiles'
  const dispatch = useDispatch();

  // ✅ Use the new category slice
  const { items, total = 0, loading, error } = useSelector(
    (state) => state.categoryProducts
  );

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  // Brands per category
  const brands = useMemo(() => BRANDS_BY_CATEGORY[categoryId] || [], [categoryId]);
  const [selectedBrand, setSelectedBrand] = useState(brands[0]?.name || 'all');

  const currentPageRef = useRef(1);
  const canLoadMoreRef = useRef(true);

  // 🔹 Fetch page 1 whenever category or brand changes
  useEffect(() => {
    currentPageRef.current = 1;

    const brandParam = selectedBrand === 'all' ? undefined : selectedBrand;

    // Replace list for new filter
    dispatch(resetCategoryProducts());

    dispatch(
      fetchCategoryProducts({
        category: categoryId,
        brand: brandParam,
        q: "",
        sort: "relevance",
        page: 1,
        limit: 16,
        append: false,
      })
    );
  }, [dispatch, categoryId, selectedBrand]);

  // 🚚 Infinite scroll (append)
  const hasMore = items.length < Number(total || 0);
  const loadMore = useCallback(() => {
    if (loading || !hasMore || !canLoadMoreRef.current) return;
    canLoadMoreRef.current = false;

    const nextPage = currentPageRef.current + 1;
    currentPageRef.current = nextPage;

    const brandParam = selectedBrand === 'all' ? undefined : selectedBrand;

    dispatch(
      fetchCategoryProducts({
        category: categoryId,
        brand: brandParam,
        q: "",
        sort: "relevance",
        page: nextPage,
        limit: 16,
        append: true,
      })
    ).finally(() => {
      setTimeout(() => {
        canLoadMoreRef.current = true;
      }, 250);
    });
  }, [dispatch, categoryId, selectedBrand, hasMore, loading]);

  // Brand chip renderer (memoized)
  const renderBrand = useCallback(
    ({ item }) => {
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
            <View
              style={[
                styles.brandImage,
                styles.brandImagePlaceholder,
                active && styles.brandImageActive,
              ]}
            />
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
    },
    [selectedBrand, styles]
  );

  // Product renderers (memoized)
  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ margin: 10, width: 300, height: 280 }}>
        <ProductCard product={item} />
      </View>
    ),
    []
  );
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Title */}
      <Text style={styles.title}>
        {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}
      </Text>

      {/* Brand row */}
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

      {/* Header: total count for (category + brand) */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          {selectedBrand === 'all' ? 'Products' : `Products · ${selectedBrand}`}
        </Text>
        <Text style={styles.count}>{total} available</Text>
      </View>

      {/* Loading / Error */}
      {loading && items.length === 0 ? (
        <Text style={styles.subtle}>Loading…</Text>
      ) : error ? (
        <Text style={styles.error}>Failed to load products: {String(error)}</Text>
      ) : null}

      {/* Product list */}
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews={true}
        ListFooterComponent={
          loading && items.length > 0 ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator size="small" color={colors.brandAccent} />
            </View>
          ) : null
        }
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
      backgroundColor: colors.tabBackground,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    brandImagePlaceholder: {},
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
