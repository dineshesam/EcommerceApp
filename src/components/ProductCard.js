
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
import Images from "../assets/images";

// ✅ Toast helpers (compact bottom pill)
import { toastSuccess, toastError, toastInfo } from "../utils/toast";
import { useTranslation } from "react-i18next";

export default function ProductCard({ product }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist);
  const cart = useSelector((state) => state.cart);
  const cartIds = useMemo(() => new Set(cart.map((c) => c.productId)), [cart]);

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  const inWishlist = wishlist.some((item) => item.id === product.id);

  // SAFELY BUILD IMAGE URI & FALLBACK
  const firstImage = Array.isArray(product?.images) ? product.images[0] : undefined;
  const imageUri = makeImageUrl(firstImage);
  const hasImage = typeof imageUri === "string" && imageUri.length > 0;

  const getErrMsg = (e) =>
    e?.response?.data?.message || e?.message || t("common.error.generic");

  const handleAddCart = async () => {
    try {
      if (cartIds.has(product.id)) {
        toastInfo(t("wishlist.alreadyInCart.title"), product.name);
        return;
      }
      if (product.stock <= 0) {
        toastError(t("shop.outOfStock"), product.name);
        return;
      }

      // Optimistic add to cart locally
      dispatch(addCart({ productId: product.id, qty: 1, product }));
      // Server sync
      await addToCartServer(product.id);

      toastSuccess(t("wishlist.addedToCart.title"), product.name);
    } catch (e) {
      console.log("move to cart failed:", e);
      toastError(t("cart.addFailed.title", { defaultValue: "Add to cart failed" }), getErrMsg(e));
    }
  };

  const handleWishlist = async () => {
    try {
      if (inWishlist) {
        dispatch(removeWishlist(product.id));
        await removeFromWishlistServer(product.id);
        toastInfo(t("wishlist.removed.title"), product.name);
      } else {
        dispatch(addWishlist(product));
        await addToWishlistServer(product.id);
        // Uses a safe default because `wishlist.added.title` isn't in your JSON
        toastSuccess(t("wishlist.added.title", { defaultValue: "Added to wishlist" }), product.name);
      }
    } catch (err) {
      console.log("Wishlist Sync Error:", err);
      toastError(t("wishlist.removeFailed.title"), getErrMsg(err));
    }
  };

  const isOut = product.stock <= 0;
  const inCart = cartIds.has(product.id);

  // Prefer disabling ONLY when out of stock, so we can show "Already in cart" toast.
  const disabled = isOut;
  const label = inCart ? t("shop.inCart") : isOut ? t("shop.outOfStock") : t("shop.addToCart");

  // 🔴 Use your actual SVGs here
  const Heart = Images?.icons?.Heart;       // outline heart (stroke)
  const RedHeart = Images?.icons?.Redheart; // filled heart (fill)

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

      {/* WISHLIST BUTTON — render SVG directly (no Text wrapper) */}
      <TouchableOpacity
        style={styles.wishBtn}
        onPress={handleWishlist}
        activeOpacity={0.85}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityRole="button"
        accessibilityLabel={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        accessibilityState={{ selected: inWishlist }}
      >
        {inWishlist ? (
          // Filled heart (uses fill)
          <RedHeart width={22} height={22} />
        ) : (
          // Outline heart (uses stroke)
          <Heart width={22} height={22} fill="none" stroke={colors.primaryText} strokeWidth={1.8} />
        )}
      </TouchableOpacity>

      {/* PRODUCT INFO */}
      <View style={styles.infoBox}>
        <Text numberOfLines={1} style={styles.title}>
          {product.name}
        </Text>
        <Text style={styles.price}>₹ {product.price}</Text>

        {/* ADD TO CART */}
        <TouchableOpacity
          style={[styles.cartBtn, (disabled || inCart) && styles.cartBtnDisabled]}
          disabled={disabled} // only disabled when out-of-stock
          onPress={() => {
            if (inCart) {
              toastInfo(t("wishlist.alreadyInCart.title"), product.name);
              return;
            }
            handleAddCart();
          }}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.cartText,
              (disabled || inCart) && { color: colors.disabledButtonText },
            ]}
          >
            {label}
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
      flex: 1, // allows 2 cards per row
      backgroundColor: colors.card,
      borderRadius: 12,
      margin: 6,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      elevation: 4,
      overflow: "hidden",
      padding: 10,
    },

    image: {
      width: "100%",
      height: 140, // slightly reduced
      resizeMode: "contain",
    },

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

    // Container for the wishlist icon
    wishBtn: {
      position: "absolute",
      right: 10,
      top: 10,
      width: 36,                 // fixed square container
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
      // Optional: subtle border for better contrast
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },

    infoBox: { padding: 10 },

    title: { fontSize: 15, fontWeight: "600", color: colors.primaryText },
    price: { fontSize: 16, fontWeight: "700", color: colors.priceText, marginVertical: 5 },

    cartBtn: {
      backgroundColor: colors.ctaButtonBg,
      paddingVertical: 7,
      borderRadius: 6,
      marginTop: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    cartBtnDisabled: {
      backgroundColor: colors.disabledButtonBg,
    },
    cartText: {
      color: colors.ctaButtonText,
      textAlign: "center",
      fontWeight: "700",
    },
  });
