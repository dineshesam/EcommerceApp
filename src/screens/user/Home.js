import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/slices/productSlice";
import ProductCard from "../../components/ProductCard";
import CategoriesRow from "../../components/CategoriesRow";

export default function Home({navigation}) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.products);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    dispatch(fetchProducts(1)); // page 1
  }, []);

  /* 🧩 CATEGORIES */
  const categories = useMemo(() => {
    const cats = items.map(p => p.category).filter(Boolean);
    return ["all", ...new Set(cats)];
  }, [items]);

  /* 🔽 SORT OPTIONS */
  const sortOptions = [
    { key: "relevance", label: "Relevance" },
    { key: "price_low", label: "Price ↑" },
    { key: "price_high", label: "Price ↓" },
    { key: "newest", label: "Newest" },
    { key: "name", label: "Name A–Z" }
  ];

  /* ⭐ RECOMMENDED */
  const recommendedItems = useMemo(() => items.slice(0, 6), [items]);

  /* 🔍 FILTER + SORT */
  const finalItems = useMemo(() => {
    let data = items.filter(p => {
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
        data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={finalItems}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <ProductCard product={item} />}
      numColumns={1}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {/* 🔍 SEARCH */}
          <TextInput
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          

<CategoriesRow onNavigate={(categoryId) => navigation.navigate('Category', { categoryId })} />



          {/* 🧩 CATEGORY CHIPS */}
          <FlatList
            data={categories}
            horizontal
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
            renderItem={({ item }) => {
              const active = item === selectedCategory;
              return (
                <Text
                  onPress={() => setSelectedCategory(item)}
                  style={[
                    styles.chip,
                    active && styles.chipActive
                  ]}
                >
                  {item.toUpperCase()}
                </Text>
              );
            }}
          />

          {/* 🔽 SORT CHIPS */}
          <FlatList
            data={sortOptions}
            horizontal
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
            renderItem={({ item }) => {
              const active = item.key === sortBy;
              return (
                <Text
                  onPress={() => setSortBy(item.key)}
                  style={[
                    styles.sortChip,
                    active && styles.sortChipActive
                  ]}
                >
                  {item.label}
                </Text>
              );
            }}
          />

          {/* ⭐ RECOMMENDED */}
          {!search && (
            <>
              <Text style={styles.sectionTitle}>Recommended for you</Text>
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
          <Text style={styles.sectionTitle}>All Products</Text>
        </>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No products found</Text>
      }
    />
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  searchInput: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10
  },
recommendedItem: {
  width: 250,
  marginRight: 30,
  paddingLeft: 2
},
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    marginRight: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#333"
  },
  chipActive: {
    backgroundColor: "#007bff",
    color: "#fff"
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    backgroundColor: "#fff"
  },
  sortChipActive: {
    backgroundColor: "#000",
    color: "#fff",
    borderColor: "#000"
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666"
  }
});
