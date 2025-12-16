
import React, { useMemo, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { removeWishlist } from "../../redux/slices/wishlistSlice";
import { removeFromWishlistServer } from "../../api/wishlistApi";
import { addCart } from "../../redux/slices/cartSlice";
import makeImageUrl from "../../utils/makeImageUrl";
import { useNavigation } from "@react-navigation/native";
import { addToCartServer } from "../../api/cartApi";

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const cart = useSelector((state) => state.cart);              // [{ productId, qty, product }, ...]
  const wishlist = useSelector((state) => state.wishlist);       // [{ id, name, ... }, ...]
  const products = useSelector((state) => state.products.items); // [{ id, stock, ... }, ...]

  // Fast lookup of cart product IDs
  const cartIds = useMemo(() => new Set(cart.map((c) => c.productId)), [cart]);

  // ID -> product map for live stock lookup (optional, for disabling by stock)
  const productsById = useMemo(() => {
    const map = {};
    for (const p of products) map[p.id] = p;
    return map;
  }, [products]);

  const handleRemove = async (product) => {
    try {
      dispatch(removeWishlist(product.id));
      await removeFromWishlistServer(product.id);
    } catch (e) {
      console.log("remove wishlist failed:", e);
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      // If already in cart, do nothing (you may navigate to Cart if you prefer)
      if (cartIds.has(product.id)) return;

      dispatch(addCart({ productId: product.id, qty: 1, product }));
      await addToCartServer(product.id);

      // Remove from wishlist after adding to cart
      await removeFromWishlistServer(product.id);
      dispatch(removeWishlist(product.id));
    } catch (e) {
      console.log("move to cart failed:", e);
    }
  };

  const renderItem = useCallback(
    ({ item }) => {
      const liveStock =
        productsById[item.id]?.stock ??
        (typeof item.stock === "number" ? item.stock : 0);

      const inCart = cartIds.has(item.id);
      const disabled = inCart || liveStock <= 0;
      const buttonLabel = inCart
        ? "In Cart"
        : liveStock <= 0
        ? "Out of Stock"
        : "Add to Cart";

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("ProductDetails", { product: item })}
        >
          <Image
            source={{ uri: makeImageUrl(item.images?.[0]) }}
            style={styles.image}
          />

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.price}>₹ {item.price}</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.cartBtn,
                  disabled && { opacity: 0.6 }
                ]}
                disabled={disabled}
                onPress={() => {
                  if (inCart) {
                    // Optional: navigate to Cart when already in cart
                    // navigation.navigate("Cart");
                    return;
                  }
                  handleMoveToCart(item);
                }}
              >
                <Text style={styles.btnText}>{buttonLabel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.removeBtn]}
                onPress={() => handleRemove(item)}
              >
                <Text style={styles.removeTxt}>🗑 Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, productsById, cartIds] // include cartIds so label/disabled updates when cart changes
  );

  return (
    <View style={styles.container}>
      {wishlist.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No items in wishlist 😕</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#555" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row",
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd"
  },
  image: { width: 90, height: 90, borderRadius: 8, marginRight: 10 },
  info: { flex: 1, justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "600", color: "#111" },
  price: { fontSize: 16, color: "#008738", marginVertical: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  btn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 2
  },
  cartBtn: { backgroundColor: "#007bff" },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  removeBtn: { backgroundColor: "#fff", borderWidth: 1, borderColor: "red" },
  removeTxt: { color: "red", fontSize: 13, fontWeight: "700" }
});
