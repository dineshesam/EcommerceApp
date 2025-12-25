
import React, { useEffect, useMemo, useState } from "react";
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
  const { items, loading } = useSelector((state) => state.products);
  const { t } = useTranslation();

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

  useEffect(() => {
    dispatch(fetchProducts(1)); // page 1
  }, [dispatch]);

  /* 🧩 CATEGORIES */
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

  /* ⭐ RECOMMENDED */
  const recommendedItems = useMemo(() => items.slice(0, 6), [items]);

  /* 🔍 FILTER + SORT */
  const finalItems = useMemo(() => {
    let data = items.filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      return matchSearch && matchCategory;
    });

    switch (sortBy) {
      case "price_low":
        data.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        data.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "name":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break; // relevance
    }

    return data;
  }, [items, search, selectedCategory, sortBy]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.primaryBg }]}>
        <ActivityIndicator size="large" color={colors.brandAccent} />
      </View>
    );
  }

  return (
    <FlatList
      key={`grid-${NUM_COLUMNS}`}
      data={finalItems}
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
          {/* 🔍 SEARCH */}
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
            placeholder={t("shop.searchProducts")}
            onSubmitEditing={() => {
              // analytics or refinement hook
            }}
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
                    onPress={() => setSelectedCategory(item)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    {label}
                  </Text>
                );
              }}
              ListFooterComponent={
                <Text
                  onPress={() => setSelectedCategory("all")}
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
                    onPress={() => setSortBy(item.key)}
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

          {/* ⭐ RECOMMENDED */}
          {!search && (
            <>
              <Text style={styles.sectionTitle}>{t("shop.recommendedForYou")}</Text>
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
    />
  );
}

/* ---------------- STYLES ---------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      padding: 10,
      backgroundColor: colors.primaryBg,
      paddingBottom:55
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
