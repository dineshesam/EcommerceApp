
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addCart } from "../../redux/slices/cartSlice"; // same action as ProductCard
import { addWishlist, removeWishlist } from "../../redux/slices/wishlistSlice";
import { addToWishlistServer, removeFromWishlistServer } from "../../api/wishlistApi";
import { addToCartServer } from "../../api/cartApi";
import makeImageUrl from "../../utils/makeImageUrl";
import useDynamicStyles from "../../hooks/useDynamicStyles";
import { FlatList, Dimensions } from "react-native";
import { useState } from "react";

export default function ProductDetails() {
  const route = useRoute();
  const product = route.params.product;

  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist);

  // ✅ Fixed: avoid referencing `liveStock` inside the selector; fall back to product.stock
  const liveStock = useSelector(state => {
    const p = state.products.items.find(item => item.id === product.id);
    if (typeof p?.stock === "number") return p.stock;
    if (typeof product?.stock === "number") return product.stock;
    return 0;
  });

  // const image = makeImageUrl(product?.images?.[0]);
  const images = (product?.images || []).map(img => makeImageUrl(img));
  const [activeIndex, setActiveIndex] = useState(0);

  const { width } = Dimensions.get("window");
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const [wishLoading, setWishLoading] = React.useState(false);
  const [cartLoading, setCartLoading] = React.useState(false);

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  const handleWishlist = async () => {
    if (wishLoading) return;
    setWishLoading(true);
    try {
      if (isWishlisted) {
        // Optimistic remove
        dispatch(removeWishlist(product.id));
        await removeFromWishlistServer(product.id);
      } else {
        // Optimistic add
        dispatch(addWishlist(product));
        await addToWishlistServer(product.id);
      }
    } catch (err) {
      // Rollback
      if (isWishlisted) {
        dispatch(addWishlist(product));
      } else {
        dispatch(removeWishlist(product.id));
      }
      console.log("Wishlist Sync Error (Details):", err?.message || err);
    } finally {
      setWishLoading(false);
    }
  };

  const handleAddCart = async () => {
    if (cartLoading || liveStock <= 0) return;
    setCartLoading(true);
    try {
      // Optimistic UI
      dispatch(addCart({ productId: product.id, qty: 1, product }));
      // Backend sync
      await addToCartServer(product.id);
    } catch (err) {
      console.log("Cart Sync Error (Details):", err?.message || err);
      // Optional rollback:
      // dispatch(removeFromCart(product.id));
    } finally {
      setCartLoading(false);
    }
  };

  const isOut = liveStock <= 0;

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      {/* <Image source={{ uri: image }} style={styles.mainImage} />
       */}
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[styles.mainImage, { width }]}
          />
        )}
      />
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.activeDot
            ]}
          />
        ))}
      </View>


      {/* Wishlist pill (emoji stays as-is; container adapts to theme) */}
      <TouchableOpacity style={styles.wishBtn} onPress={handleWishlist} disabled={wishLoading}>
        <Text style={styles.wishIcon}>
          {wishLoading ? "⏳" : isWishlisted ? "❤️" : "🤍"}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₹ {Number(product.price).toLocaleString("en-IN")}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.meta}>{product.category}</Text>

        <Text style={styles.label}>Stock</Text>
        <Text style={[styles.meta, isOut ? styles.outStock : styles.inStock]}>
          {isOut ? "Out of Stock" : `In Stock (${liveStock})`}
        </Text>

        {/* Add to Cart */}
        <TouchableOpacity
          style={[styles.cartBtn, isOut && styles.cartBtnDisabled]}
          onPress={handleAddCart}
          disabled={cartLoading || isOut}
        >
          <Text style={[styles.cartText, isOut && { color: colors.disabledButtonText }]}>
            {cartLoading ? "Adding..." : "Add to Cart 🛒"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ================== Styles ==================== */
const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBg },
    mainImage: { width: "100%", height: 300, resizeMode: "cover" },

    // Wishlist pill – uses input surface; shadow adapts to theme
    wishBtn: {
      position: "absolute",
      top: 20,
      right: 15,
      backgroundColor: colors.inputBg,
      borderRadius: 30,
      padding: 6,
      elevation: 5,
      zIndex: 10,
      ...(Platform.OS === "ios"
        ? {
          shadowColor: colors.shadow,
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        }
        : {}),
    },
    wishIcon: { fontSize: 25 },

    content: { padding: 15 },

    // Texts
    title: { fontSize: 22, fontWeight: "700", color: colors.primaryText, marginBottom: 6 },
    price: { fontSize: 20, fontWeight: "800", color: colors.priceText, marginBottom: 12 },

    label: { fontSize: 15, fontWeight: "700", marginTop: 12, color: colors.primaryText },
    description: { fontSize: 14, color: colors.secondaryText, marginTop: 4 },
    meta: { fontSize: 14, color: colors.secondaryText, marginTop: 4 },

    // Stock states use semantic inventory tokens
    inStock: { color: colors.inventoryInStock, fontWeight: "700" },
    outStock: { color: colors.inventoryOutOfStock, fontWeight: "700" },

    // CTA
    cartBtn: {
      backgroundColor: colors.ctaButtonBg,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 20,
    },
    cartBtnDisabled: {
      backgroundColor: colors.disabledButtonBg,
    },
    cartText: { color: colors.ctaButtonText, fontSize: 16, fontWeight: "700", textAlign: "center" },
    dotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 8
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#ccc",
      marginHorizontal: 4
    },
    activeDot: {
      backgroundColor: "#007bff",
      width: 10,
      height: 10
    }

  });
