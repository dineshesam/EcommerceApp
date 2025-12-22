
import React, { useMemo } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addWishlist, removeWishlist } from "../redux/slices/wishlistSlice";
import { addToWishlistServer, removeFromWishlistServer } from "../api/wishlistApi";
import makeImageUrl from "../utils/makeImageUrl";
import { addToCartServer } from "../api/cartApi";
import { addCart } from "../redux/slices/cartSlice";
import useDynamicStyles from "../hooks/useDynamicStyles";
import { useNavigation } from "@react-navigation/native";

export default function ProductCard({ product }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist);
  const cart = useSelector((state) => state.cart);
  const cartIds = useMemo(() => new Set(cart.map((c) => c.productId)), [cart]);

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  const inWishlist = wishlist.some(item => item.id === product.id);

  // SAFELY BUILD IMAGE URI & FALLBACK
  const firstImage = Array.isArray(product?.images) ? product.images[0] : undefined;
  const imageUri = makeImageUrl(firstImage);
  const hasImage = typeof imageUri === 'string' && imageUri.length > 0;

  const handleAddCart = async () => {
    try {
      if (cartIds.has(product.id)) return;
      // Dispatch minimal payload; slice will snapshot only primitives
      dispatch(addCart({ productId: product.id, qty: 1, product }));
      await addToCartServer(product.id);
    } catch (e) {
      console.log("move to cart failed:", e);
    }
  };

  const handleWishlist = async () => {
    try {
      if (inWishlist) {
        dispatch(removeWishlist(product.id));
        await removeFromWishlistServer(product.id);
      } else {
        dispatch(addWishlist(product));
        await addToWishlistServer(product.id);
      }
    } catch (err) {
      console.log("Wishlist Sync Error:", err);
    }
  };

  const isOut = product.stock <= 0;
  const inCart = cartIds.has(product.id);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate("ProductDetails", { product })}
    >
      {/* PRODUCT IMAGE */}
      {hasImage ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No Image</Text>
        </View>
      )}

      {/* WISHLIST BUTTON */}
      <TouchableOpacity style={styles.wishBtn} onPress={handleWishlist}>
        <Text style={[styles.wishIcon, { color: inWishlist ? colors.error : colors.primaryText }]}>
          {inWishlist ? "❤️" : "🤍"}
        </Text>
      </TouchableOpacity>

      {/* PRODUCT INFO */}
      <View style={styles.infoBox}>
        <Text numberOfLines={1} style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₹ {product.price}</Text>

        {/* ADD TO CART */}
        <TouchableOpacity
          style={[styles.cartBtn, (isOut || inCart) && styles.cartBtnDisabled]}
          disabled={isOut || inCart}
          onPress={handleAddCart}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.cartText,
              (isOut || inCart) && { color: colors.disabledButtonText }
            ]}
          >
            {inCart ? "In Cart" : isOut ? "Out of Stock" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

/* ==================== STYLES ==================== */
const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      width: 250,
      backgroundColor: colors.card,
      borderRadius: 12,
      margin: "1.5%",
      borderWidth: 1,
      borderColor: colors.inputBorder,
      elevation: 4,
      overflow: "hidden",
      padding: 10,
    },

    image: { width: "100%", height: 150 },

    // Fallback when uri missing
    imagePlaceholder: {
      width: "100%",
      height: 150,
      backgroundColor: colors.tabBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    imagePlaceholderText: {
      color: colors.secondaryText,
      fontSize: 12,
    },

    wishBtn: {
      position: "absolute",
      right: 10,
      top: 10,
      backgroundColor: colors.inputBg,
      padding: 6,
      borderRadius: 25,
      elevation: 5,
    },
    wishIcon: { fontSize: 22 },

    infoBox: { padding: 10 },

    title: { fontSize: 15, fontWeight: "600", color: colors.primaryText },
    price: { fontSize: 16, fontWeight: "700", color: colors.priceText, marginVertical: 5 },

    cartBtn: {
      backgroundColor: colors.ctaButtonBg,
      paddingVertical: 7,
      borderRadius: 6,
      marginTop: 6
    },
    cartBtnDisabled: {
      backgroundColor: colors.disabledButtonBg
    },
    cartText: {
      color: colors.ctaButtonText,
      textAlign: "center",
      fontWeight: "700"
    }
  });
