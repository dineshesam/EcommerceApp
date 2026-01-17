
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
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from '../../components/ProductCard';
import Images from '../../assets/images';
import useDynamicStyles from '../../hooks/useDynamicStyles';
import {
  fetchCategoryProducts,
  resetCategoryProducts,
} from '../../redux/slices/categorySlice';

/** Static brand assets */
const BRANDS_BY_CATEGORY = {
  mobiles: [
    { id: 'apple', name: 'Apple', image: Images.applelogo },
    { id: 'samsung', name: 'Samsung', image: Images.samsunglogo },
    { id: 'realme', name: 'Realme', image: Images.realmelogo },
  ],
  laptops: [
    { id: 'dell', name: 'Dell', image: Images.dell_logo },
    { id: 'lenovo', name: 'Lenovo', image: Images.lenovologo },
    { id: 'hp', name: 'HP', image: Images.hp_logo },
  ],
  audio: [
    { id: 'boat', name: 'boAt', image: Images.boat_logo },
    { id: 'jbl', name: 'JBL', image: Images.jbl_logo },
    { id: 'sony', name: 'Sony', image: Images.sony_logo },
  ],
  smartwatches: [
    { id: 'apple', name: 'Apple', image: Images.applelogo },
    { id: 'noise', name: 'Noise', image: Images.noise_logo },
    { id: 'samsung', name: 'Samsung', image: Images.samsunglogo },
  ],
  camera: [
    { id: 'sony', name: 'Sony', image: Images.sony_logo },
    { id: 'canon', name: 'Canon', image: Images.canon_logo },
    { id: 'nikon', name: 'Nikon', image: Images.nikon_logo },
  ],
};

export default function CategoryScreen({ route }) {
  const { categoryId } = route.params; // e.g., 'mobiles'
  const dispatch = useDispatch();

  const { items, total = 0, loading, error } = useSelector(
    (state) => state.categoryProducts
  );

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  // Brands for this category
  const brands = useMemo(() => BRANDS_BY_CATEGORY[categoryId] || [], [categoryId]);

  /** ✅ FIX: default to 'all' (not first brand) and use brand ID consistently */
  const [selectedBrandId, setSelectedBrandId] = useState('all');

  /** ✅ Sorting (single-select) */
  const [sortBy, setSortBy] = useState('relevance');
  const sortOptions = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'price_low', label: 'Price · Low to High' },
    { key: 'price_high', label: 'Price · High to Low' },
    { key: 'newest', label: 'Newest' },
    { key: 'name', label: 'Name A–Z' },
  ];

  // Reset on category change (from Home)
  useEffect(() => {
    setSelectedBrandId('all');
    setSortBy('relevance'); // optional
  }, [categoryId]);

  const currentPageRef = useRef(1);
  const canLoadMoreRef = useRef(true);

  // 🔹 Fetch page 1 whenever category / brand / sort changes
  useEffect(() => {
    currentPageRef.current = 1;
    const brandParam = selectedBrandId === 'all' ? undefined : selectedBrandId;

    dispatch(resetCategoryProducts());
    dispatch(
      fetchCategoryProducts({
        category: categoryId,
        brand: brandParam,
        q: '',
        sort: sortBy, // ✅ use sort
        page: 1,
        limit: 16,
        append: false,
      })
    );
  }, [dispatch, categoryId, selectedBrandId, sortBy]);

  // 🚚 Infinite scroll (append)
  const hasMore = items.length < Number(total || 0);
  const loadMore = useCallback(() => {
    if (loading || !hasMore || !canLoadMoreRef.current) return;
    canLoadMoreRef.current = false;

    const nextPage = currentPageRef.current + 1;
    currentPageRef.current = nextPage;

    const brandParam = selectedBrandId === 'all' ? undefined : selectedBrandId;

    dispatch(
      fetchCategoryProducts({
        category: categoryId,
        brand: brandParam,
        q: '',
        sort: sortBy, // ✅ use sort
        page: nextPage,
        limit: 16,
        append: true,
      })
    ).finally(() => {
      setTimeout(() => {
        canLoadMoreRef.current = true;
      }, 250);
    });
  }, [dispatch, categoryId, selectedBrandId, sortBy, hasMore, loading]);

  // Brand chip
  const BrandChip = useCallback(
    ({ brand }) => {
      const active = selectedBrandId === brand.id;
      return (
        <Pressable
          onPress={() => setSelectedBrandId(brand.id)}
          style={({ pressed }) => [styles.brandItem, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel={brand.name}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Image
            source={brand.id === 'all' ? Images.all_logo : brand.image}
            style={[styles.brandImage, active && styles.brandImageActive]}
            resizeMode="contain"
          />
          <Text style={[styles.brandLabel, active && styles.brandLabelActive]}>
            {brand.name}
          </Text>
        </Pressable>
      );
    },
    [selectedBrandId, styles]
  );

  // Product renderers
  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ margin: 10, width: 300, height: 280 }}>
        <ProductCard product={item} />
      </View>
    ),
    []
  );
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  /** 🧱 Header (Title + Brands + Sort) in a single, stable container */
  const ListHeader = useMemo(() => {
    const selectedBrandName =
      selectedBrandId === 'all'
        ? 'All'
        : brands.find((b) => b.id === selectedBrandId)?.name || selectedBrandId;

    return (
      <View>
        {/* Title */}
        <Text style={styles.title}>
          {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}
        </Text>

        {/* Brand row (horizontal, fixed height container to prevent jumping) */}
        <View style={styles.brandRowWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandRow}
          >
            {/* All first */}
            <BrandChip brand={{ id: 'all', name: 'All', image: Images.all_logo }} />
            {/* Then available brands */}
            {brands.map((b) => (
              <BrandChip key={b.id} brand={b} />
            ))}
          </ScrollView>
        </View>

        {/* Header row (count) */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>
            {selectedBrandId === 'all' ? 'Products' : `Products · ${selectedBrandName}`}
          </Text>
          <Text style={styles.count}>{total} available</Text>
        </View>

        {/* Sort bar (horizontal, stable height) */}
        <View style={styles.sortBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortRow}
          >
            {sortOptions.map((opt) => {
              const active = opt.key === sortBy;
              return (
                <Text
                  key={opt.key}
                  onPress={() => setSortBy(opt.key)}
                  style={[styles.sortChip, active && styles.sortChipActive]}
                >
                  {opt.label}
                </Text>
              );
            })}
            <Text
              onPress={() => setSortBy('relevance')}
              style={[styles.sortChip, styles.clearChip]}
            >
              Clear
            </Text>
          </ScrollView>
        </View>
      </View>
    );
  }, [categoryId, brands, BrandChip, selectedBrandId, sortBy, total, styles]);

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          loading ? null : <Text style={styles.empty}>No products found</Text>
        }
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
      {/* Optional: make the whole header sticky (commented) */}
      {/* stickyHeaderIndices={[0]} */}
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

    /** BRAND ROW **/
    brandRowWrapper: {
      backgroundColor: colors.sectionBackground,
      borderBottomColor: colors.divider,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingVertical: 8,
      // Stable height prevents list reflow (tune as needed)
      minHeight: 96,
      justifyContent: 'center',
    },
    brandRow: { paddingHorizontal: 8 },
    brandItem: { alignItems: 'center', marginRight: 14 },
    brandImage: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'white',
      borderWidth: 0,
      borderColor: 'transparent',
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

    /** HEADER COUNT **/
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

    /** SORT BAR **/
    sortBarWrapper: {
      backgroundColor: colors.primaryBg,
      borderBottomColor: colors.divider,
      borderBottomWidth: StyleSheet.hairlineWidth,
      // Stable height so chips don't wrap / reflow
      minHeight: 48,
      paddingVertical: 6,
    },
    sortRow: { paddingHorizontal: 12, alignItems: 'center' },
    sortChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      marginRight: 8,
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryText,
      backgroundColor: colors.inputBg,
      // Prevent wrapping/shrinking
      flexShrink: 0,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    sortChipActive: {
      backgroundColor: colors.ctaButtonBg,
      color: colors.ctaButtonText,
      borderColor: colors.ctaButtonBg,
    },
    clearChip: {
      backgroundColor: colors.inputBg,
      color: colors.primaryText,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },

    subtle: { color: colors.secondaryText, marginHorizontal: 12, marginBottom: 8 },
    empty: { textAlign: 'center', color: colors.secondaryText, marginTop: 14 },
    error: { color: colors.error, marginHorizontal: 12, marginBottom: 8 },
  });
