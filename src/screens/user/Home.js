
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/slices/productSlice";
import ProductCard from "../../components/ProductCard";
import CategoriesRow from "../../components/CategoriesRow";
import useDynamicStyles from "../../hooks/useDynamicStyles";
import SearchBar from "../../components/SearchBar";
import { useTranslation } from "react-i18next";

/** Unbiased Fisher–Yates shuffle on a copy (call with slice()) */
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Home({ navigation }) {
  const dispatch = useDispatch();
  const { items, total = 0, loading } = useSelector((state) => state.products);
  const { t } = useTranslation();

  // 🔎 local UI/filter state
  const [search, setSearch] = useState("");
  // 👉 Multi-select categories; "all" means no filter
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [sortBy, setSortBy] = useState("relevance");

  // UI toggles
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // Pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🔁 Recommended re-randomization control
  const [recommendNonce, setRecommendNonce] = useState(0);

  // theme
  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const NUM_COLUMNS = 2;

  // pagination references
  const currentPageRef = useRef(1);
  const debounceRef = useRef(null);

  // ⏱️ Initial load
  useEffect(() => {
    currentPageRef.current = 1;
    dispatch(
      fetchProducts({
        page: 1,
        limit: 16,
        q: "",
        category: "all",
        sort: "relevance",
        append: false,
      })
    );
  }, [dispatch]);

  /* 🧩 Derive categories from loaded items */
  const categories = useMemo(() => {
    const cats = items.map((p) => p.category).filter(Boolean);
    return ["all", ...new Set(cats)];
  }, [items]);

  /* 🔽 Sort options */
  const sortOptions = [
    { key: "relevance", label: t("shop.sort.relevance") },
    { key: "price_low", label: t("shop.sort.priceLow") },
    { key: "price_high", label: t("shop.sort.priceHigh") },
    { key: "newest", label: t("shop.sort.newest") },
    { key: "name", label: t("shop.sort.nameAZ") },
  ];

  // 👉 Helper: compute server param for categories (comma-separated)
  const effectiveCategoriesParam = useMemo(() => {
    if (selectedCategories.includes("all")) return "all";
    // If no selection somehow, default to "all"
    return selectedCategories.length ? selectedCategories.join(",") : "all";
  }, [selectedCategories]);

  // 🔎 Debounced fetch on changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      currentPageRef.current = 1;
      dispatch(
        fetchProducts({
          page: 1,
          limit: 16,
          q: search,
          category: effectiveCategoriesParam, // 👈 use multi-select
          sort: sortBy,
          append: false,
        })
      );
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, selectedCategories, effectiveCategoriesParam, sortBy, dispatch]);

  // 🧪 Multi-select category toggle
  const onToggleCategory = (cat) => {
    setSelectedCategories((prev) => {
      if (cat === "all") return ["all"]; // Tap "all" -> exclusively select "all"
      const next = prev.filter((c) => c !== "all"); // Remove "all" if present
      if (next.includes(cat)) {
        const removed = next.filter((c) => c !== cat); // Toggle off
        return removed.length === 0 ? ["all"] : removed;
      } else {
        return [...next, cat]; // Toggle on
      }
    });
  };

  // 🔁 Sort change (single-select)
  const onSelectSort = (nextSort) => setSortBy(nextSort);

  // ✨ Clear actions
  const clearFilters = () => setSelectedCategories(["all"]);
  const clearSort = () => setSortBy("relevance");

  // 🚚 Infinite scroll
  const hasMore = items.length < Number(total || 0);
  const loadMore = () => {
    if (loading || isRefreshing || !hasMore) return;
    const nextPage = currentPageRef.current + 1;
    currentPageRef.current = nextPage;
    dispatch(
      fetchProducts({
        page: nextPage,
        limit: 16,
        q: search,
        category: effectiveCategoriesParam, // 👈 multi-select param
        sort: sortBy,
        append: true,
      })
    );
  };

  // 🔄 Pull-to-refresh
  const onRefresh = async () => {
    try {
      setIsRefreshing(true);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      currentPageRef.current = 1;
      await dispatch(
        fetchProducts({
          page: 1,
          limit: 16,
          q: search,
          category: effectiveCategoriesParam, // 👈 multi-select param
          sort: sortBy,
          append: false,
        })
      );
      // ✅ reshuffle Recommended after refresh completes
      setRecommendNonce((n) => n + 1);
    } finally {
      setIsRefreshing(false);
    }
  };

  /* ⭐ RECOMMENDED — shuffled every time nonce changes (or items change) */
  const recommendedItems = useMemo(() => {
    const copy = items.slice(); // work on a copy to avoid mutating Redux array
    shuffleInPlace(copy);
    return copy.slice(0, 6);
  }, [items, recommendNonce]);

  // ✅ When search becomes empty (Recommended visible), re-randomize
  useEffect(() => {
    if (!search) setRecommendNonce((n) => n + 1);
  }, [search, selectedCategories, sortBy]);

  // initial skeleton
  if (loading && items.length === 0 && !isRefreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.primaryBg }]}>
        <ActivityIndicator size="large" color={colors.brandAccent} />
      </View>
    );
  }

  return (
    <FlatList
      key={`grid-${NUM_COLUMNS}`}
      data={items}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.gridItem}>
          <ProductCard product={item} />
        </View>
      )}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[colors.brandAccent]}
          tintColor={colors.brandAccent}
          progressBackgroundColor={colors.inputBg}
        />
      }
      ListHeaderComponent={
        <>
          {/* 🔎 SEARCH */}
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
            placeholder={t("shop.searchProducts")}
            onSubmitEditing={() => {
              currentPageRef.current = 1;
              dispatch(
                fetchProducts({
                  page: 1,
                  limit: 16,
                  q: search,
                  category: effectiveCategoriesParam, // 👈 multi-select param
                  sort: sortBy,
                  append: false,
                })
              );
            }}
            isLoading={loading}
          />

          {/* 🔘 Top Control Bar */}
          <View style={styles.controlBar}>
            <TouchableOpacity
              style={styles.controlBtn}
              activeOpacity={0.85}
              onPress={() => {
                setShowFilters((prev) => !prev);
                if (!showFilters) setShowSort(false);
              }}
            >
              <Text style={styles.controlBtnText}>
                {showFilters ? `${t("shop.filter")} ▴` : `${t("shop.filter")} ▾`}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.controlBtn}
              activeOpacity={0.85}
              onPress={() => {
                setShowSort((prev) => !prev);
                if (!showSort) setShowFilters(false);
              }}
            >
              <Text style={styles.controlBtnText}>
                {showSort ? `${t("shop.sortBy")} ▴` : `${t("shop.sortBy")} ▾`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 🧩 FILTERS (Multi-select chips) — collapsible */}
          {showFilters && (
            <FlatList
              data={categories}
              horizontal
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
              contentContainerStyle={{ paddingVertical: 2 }}
              renderItem={({ item }) => {
                const isActive =
                  item === "all"
                    ? selectedCategories.includes("all")
                    : selectedCategories.includes(item);
                const label = item === "all" ? t("shop.all") : item.toUpperCase();
                return (
                  <Text
                    onPress={() => onToggleCategory(item)}
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    {label}
                  </Text>
                );
              }}
              ListFooterComponent={
                <Text onPress={clearFilters} style={[styles.chip, styles.clearChip]}>
                  {t("common.clear")}
                </Text>
              }
            />
          )}

          {/* 🔽 SORT — single-select + Clear */}
          {showSort && (
            <FlatList
              data={sortOptions}
              horizontal
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
              contentContainerStyle={{ paddingVertical: 2 }}
              renderItem={({ item }) => {
                const active = item.key === sortBy;
                return (
                  <Text
                    onPress={() => onSelectSort(item.key)}
                    style={[styles.sortChip, active && styles.sortChipActive]}
                  >
                    {item.label}
                  </Text>
                );
              }}
              ListFooterComponent={
                <Text onPress={clearSort} style={[styles.sortChip, styles.clearChip]}>
                  {t("common.clear")}
                </Text>
              }
            />
          )}

          {/* 🧭 CATEGORY NAV */}
          <CategoriesRow
            onNavigate={(categoryId) =>
              navigation.navigate("Category", { categoryId })
            }
          />

          {/* ⭐ RECOMMENDED (only when not searching) */}
          {!search && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sectionTitle}>
                  {t("shop.recommendedForYou")}
                </Text>
                {/* <TouchableOpacity
                  onPress={() => setRecommendNonce((n) => n + 1)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: colors.brandAccent, fontWeight: "700" }}>
                    {t("common.refresh")}
                  </Text>
                </TouchableOpacity> */}
              </View>

              <FlatList
                data={recommendedItems}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginRight: 40 }}
                renderItem={({ item }) => (
                  <View style={styles.recommendedItem}>
                    <ProductCard product={item} />
                  </View>
                )}
              />
            </>
          )}

          {/* 📦 ALL PRODUCTS */}
          <Text style={styles.sectionTitle}>{t("shop.allProducts")}</Text>
        </>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>{t("shop.noProductsFound")}</Text>
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loading && items.length > 0 ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator size="small" color={colors.brandAccent} />
          </View>
        ) : null
      }
    />
  );
}

/* ---------------- STYLES ---------------- */
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      padding: 10,
      backgroundColor: colors.primaryBg,
      paddingBottom: 55,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    row: {
      justifyContent: "space-between",
    },
    gridItem: {
      flex: 1,
      marginBottom: 12,
      marginHorizontal: 4,
    },
    /** Flipkart-like top control bar */
    controlBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    controlBtn: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 4,
    },
    controlBtnText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primaryText,
    },
    divider: {
      width: 1,
      height: "100%",
      backgroundColor: colors.inputBorder,
      marginHorizontal: 8,
    },
    /** Section titles use primaryText */
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginVertical: 10,
      color: colors.primaryText,
    },
    recommendedItem: {
      width: 195,
      height: 220,
      marginRight: 8,
      paddingLeft: 1,
    },
    /** Category chips mapped to tab background & brand accent */
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.tabBackground,
      marginRight: 8,
      fontSize: 13,
      fontWeight: "600",
      color: colors.secondaryText,
    },
    chipActive: {
      backgroundColor: colors.brandAccent,
      color: colors.ctaButtonText,
    },
    clearChip: {
      backgroundColor: colors.inputBg,
      color: colors.primaryText,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    /** Sort chips mapped to input chrome; active uses CTA */
    sortChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      marginRight: 8,
      fontSize: 13,
      fontWeight: "600",
      color: colors.primaryText,
      backgroundColor: colors.inputBg,
    },
    sortChipActive: {
      backgroundColor: colors.ctaButtonBg,
      color: colors.ctaButtonText,
      borderColor: colors.ctaButtonBg,
    },
    /** Empty state uses secondary text */
    empty: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 16,
      color: colors.secondaryText,
    },
  });
