
// screens/product/ProductDetails.jsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addCart } from "../../redux/slices/cartSlice"; // same action as ProductCard
import { addWishlist, removeWishlist } from "../../redux/slices/wishlistSlice";
import { addToWishlistServer, removeFromWishlistServer } from "../../api/wishlistApi";
import { addToCartServer } from "../../api/cartApi";
import makeImageUrl from "../../utils/makeImageUrl";

export default function ProductDetails() {
  const route = useRoute();
  const product = route.params.product;

  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist);

  const image = makeImageUrl(product?.images?.[0]);
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const [wishLoading, setWishLoading] = React.useState(false);
  const [cartLoading, setCartLoading] = React.useState(false);

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
    if (cartLoading || product.stock <= 0) return;
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

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <Image source={{ uri: image }} style={styles.mainImage} />

      {/* Wishlist ❤️ */}
      <TouchableOpacity style={styles.wishBtn} onPress={handleWishlist} disabled={wishLoading}>
        <Text style={styles.wishIcon}>{wishLoading ? "⏳" : isWishlisted ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₹ {Number(product.price).toLocaleString("en-IN")}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.meta}>{product.category}</Text>

        <Text style={styles.label}>Stock</Text>
        <Text style={[styles.meta, product.stock > 0 ? styles.inStock : styles.outStock]}>
          {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
        </Text>

        {/* Add to Cart */}
        <TouchableOpacity
          style={[styles.cartBtn, product.stock <= 0 && { opacity: 0.6 }]}
          onPress={handleAddCart}
          disabled={cartLoading || product.stock <= 0}
        >
          <Text style={styles.cartText}>{cartLoading ? "Adding..." : "Add to Cart 🛒"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ================== Styles ==================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mainImage: { width: "100%", height: 300, resizeMode: "cover" },

  wishBtn: {
    position: "absolute",
    top: 20,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 6,
    elevation: 5,
    zIndex: 10 // ensure tap above Image on Android
  },
  wishIcon: { fontSize: 25 },

  content: { padding: 15 },

  title: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 6 },
  price: { fontSize: 20, fontWeight: "800", color: "#0a8a3a", marginBottom: 12 },

  label: { fontSize: 15, fontWeight: "700", marginTop: 12 },
  description: { fontSize: 14, color: "#444", marginTop: 4 },
  meta: { fontSize: 14, color: "#444", marginTop: 4 },
  inStock: { color: "#0a8a3a", fontWeight: "700" },
  outStock: { color: "#d63031", fontWeight: "700" },

  cartBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20
  },
cartText: { color: "#fff", fontSize: 16, fontWeight: "700", textAlign: "center" }
  });