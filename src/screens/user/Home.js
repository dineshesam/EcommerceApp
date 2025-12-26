
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/slices/productSlice";
import ProductCard from "../../components/ProductCard";
import CategoriesRow from "../../components/CategoriesRow";
import useDynamicStyles from "../../hooks/useDynamicStyles";
import SearchBar from "../../components/SearchBar";
import { useTranslation } from "react-i18next";

export default function Home({ navigation }) {
  const dispatch = useDispatch();
  const { items, total = 0, loading } = useSelector((state) => state.products);
  const { t } = useTranslation();

  // local UI/filter state (server will use these)
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  // UI toggles (Flipkart-like collapsible bars)
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // theme
  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const NUM_COLUMNS = 2;

  // keep track of the current page locally
  const currentPageRef = useRef(1);
  // simple debounce for typing
  const debounceRef = useRef(null);

  // ⏱️ Initial load → page 1, limit 16
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

  /* 🧩 CATEGORIES (derived from loaded items; can swap to server facets later) */
  const categories = useMemo(() => {
    const cats = items.map((p) => p.category).filter(Boolean);
    return ["all", ...new Set(cats)];
  }, [items]);

  /* 🔽 SORT OPTIONS (localized labels) */
  const sortOptions = [
    { key: "relevance", label: t("shop.sort.relevance") },
    { key: "price_low", label: t("shop.sort.priceLow") },
    { key: "price_high", label: t("shop.sort.priceHigh") },
    { key: "newest", label: t("shop.sort.newest") },
    { key: "name", label: t("shop.sort.nameAZ") },
  ];

  /* ⭐ RECOMMENDED (you can keep this UX: show when not searching) */
  const recommendedItems = useMemo(() => items.slice(0, 6), [items]);

  // 🔎 Debounced search → reset page to 1 and replace items
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      currentPageRef.current = 1;
      dispatch(
        fetchProducts({
          page: 1,
          limit: 16,
          q: search,
          category: selectedCategory,
          sort: sortBy,
          append: false,
        })
      );
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // re-run when any filter changes
  }, [search, selectedCategory, sortBy, dispatch]);

  // 🧪 Category change (from chips)
  const onSelectCategory = (next) => {
    setSelectedCategory(next);
    // debounce effect above will refetch page 1
  };

  // 🔁 Sort change (from chips)
  const onSelectSort = (nextSort) => {
    setSortBy(nextSort);
    // debounce effect above will refetch page 1
  };

  // 🚚 Infinite scroll: fetch next page when near bottom
  const hasMore = items.length < Number(total || 0); // guard
  const loadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = currentPageRef.current + 1;
    currentPageRef.current = nextPage;
    dispatch(
      fetchProducts({
        page: nextPage,
        limit: 16,
        q: search,
        category: selectedCategory,
        sort: sortBy,
        append: true, // append subsequent pages
      })
    );
  };

  // initial skeleton
  if (loading && items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.primaryBg }]}>
        <ActivityIndicator size="large" color={colors.brandAccent} />
      </View>
    );
  }

  return (
    <FlatList
      key={`grid-${NUM_COLUMNS}`}
      data={items} // ✅ render server-returned items directly
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
      ListHeaderComponent={
        <>
          {/* 🔎 SEARCH */}
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
            placeholder={t("shop.searchProducts")}
            onSubmitEditing={() => {
              // immediate fetch on Enter
              currentPageRef.current = 1;
              dispatch(
                fetchProducts({
                  page: 1,
                  limit: 16,
                  q: search,
                  category: selectedCategory,
                  sort: sortBy,
                  append: false,
                })
              );
            }}
            isLoading={loading} // optional spinner in the bar if you implemented it
          />

          {/* 🔘 Top Control Bar (Flipkart-like) */}
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

          {/* 🧩 FILTER (Category chips) — collapsible */}
          {showFilters && (
            <FlatList
              data={categories}
              horizontal
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
              contentContainerStyle={{ paddingVertical: 2 }}
              renderItem={({ item }) => {
                const active = item === selectedCategory;
                const label = item === "all" ? t("shop.all") : item.toUpperCase();
                return (
                  <Text
                    onPress={() => onSelectCategory(item)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    {label}
                  </Text>
                );
              }}
              ListFooterComponent={
                <Text
                  onPress={() => onSelectCategory("all")}
                  style={[styles.chip, styles.clearChip]}
                >
                  {t("common.clear")}
                </Text>
              }
            />
          )}

          {/* 🔽 SORT — collapsible */}
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
              <Text style={styles.sectionTitle}>
                {t("shop.recommendedForYou")}
              </Text>
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

      // 🚚 Infinite scroll hooks
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
      width: 200,
      height: 200,
      marginRight: 10,
      paddingLeft: 2,
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
