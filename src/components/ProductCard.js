
import React, { useCallback, useMemo } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { addWishlist, removeWishlist } from "../redux/slices/wishlistSlice";
import { addToWishlistServer, removeFromWishlistServer } from "../api/wishlistApi";
import makeImageUrl from "../utils/makeImageUrl";
import { addToCartServer } from "../api/cartApi";
import { addCart } from "../redux/slices/cartSlice";
import useDynamicStyles from "../hooks/useDynamicStyles";
import { useNavigation } from "@react-navigation/native";
import Images from "../assets/images";
import { toastSuccess, toastError, toastInfo } from "../utils/toast";
import { useTranslation } from "react-i18next";

// Hoist small constants so they aren't allocated per render
const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 };

// Pure visual SVGs (optional null guards)
const HeartIcon = Images?.icons?.Heart;
const RedHeartIcon = Images?.icons?.Redheart;

function ProductCard({ product }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  // ✅ Select only what you need so changes in other parts of the slice
  // don't cause a re-render for this card.
  const inWishlist = useSelector(
    (state) => state.wishlist.some((item) => item.id === product.id),
    shallowEqual
  );
  const inCart = useSelector(
    (state) => state.cart.some((c) => c.productId === product.id),
    shallowEqual
  );

  // Image building with safe fallback
  const firstImage = Array.isArray(product?.images) ? product.images[0] : undefined;
  const imageUri = makeImageUrl(firstImage);
  const hasImage = typeof imageUri === "string" && imageUri.length > 0;

  const isOut = product.stock <= 0;
  const disabled = isOut;
  const label = inCart ? t("shop.inCart") : isOut ? t("shop.outOfStock") : t("shop.addToCart");

  const getErrMsg = useCallback(
    (e) => e?.response?.data?.message || e?.message || t("common.error.generic"),
    [t]
  );

  const handleAddCart = useCallback(async () => {
    try {
      if (inCart) {
        toastInfo(t("wishlist.alreadyInCart.title"), product.name);
        return;
      }
      if (product.stock <= 0) {
        toastError(t("shop.outOfStock"), product.name);
        return;
      }
      // Optimistic add locally
      dispatch(addCart({ productId: product.id, qty: 1, product }));
      // Server sync
      await addToCartServer(product.id);
      toastSuccess(t("wishlist.addedToCart.title"), product.name);
    } catch (e) {
      console.log("move to cart failed:", e);
      toastError(
        t("cart.addFailed.title", { defaultValue: "Add to cart failed" }),
        getErrMsg(e)
      );
    }
  }, [dispatch, inCart, product, t, getErrMsg]);

  const handleWishlist = useCallback(async () => {
    try {
      if (inWishlist) {
        dispatch(removeWishlist(product.id));
        await removeFromWishlistServer(product.id);
        toastInfo(t("wishlist.removed.title"), product.name);
      } else {
        dispatch(addWishlist(product));
        await addToWishlistServer(product.id);
        toastSuccess(
          t("wishlist.added.title", { defaultValue: "Added to wishlist" }),
          product.name
        );
      }
    } catch (err) {
      console.log("Wishlist Sync Error:", err);
      toastError(t("wishlist.removeFailed.title"), getErrMsg(err));
    }
  }, [dispatch, inWishlist, product, t, getErrMsg]);

  const onNavigate = useCallback(() => {
    navigation.navigate("ProductDetails", { product });
  }, [navigation, product]);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onNavigate}>
      {/* PRODUCT IMAGE */}
      {hasImage ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No Image</Text>
        </View>
      )}

      {/* WISHLIST BUTTON */}
      <TouchableOpacity
        style={styles.wishBtn}
        onPress={handleWishlist}
        activeOpacity={0.85}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        accessibilityState={{ selected: inWishlist }}
      >
        {inWishlist && RedHeartIcon ? (
          <RedHeartIcon width={22} height={22} />
        ) : HeartIcon ? (
          <HeartIcon width={22} height={22} fill="none" stroke={colors.primaryText} strokeWidth={1.8} />
        ) : null}
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

/**
 * Memoize the card so it only re-renders when its product changes
 * or its inCart/inWishlist flags change.
 */
export default React.memo(ProductCard, (prevProps, nextProps) => {
  const p = prevProps.product;
  const n = nextProps.product;
  // Re-render if product identity or key fields change
  if (p?.id !== n?.id) return false;
  if (p?.price !== n?.price) return false;
  if (p?.stock !== n?.stock) return false;
  if (p?.name !== n?.name) return false;
  // If you pass extra props later, compare them here too.
  return true;
});

/* ==================== STYLES ==================== */
const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      flex: 1,               // allows 2 cards per row
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
      height: 140,
      resizeMode: "contain",
    },
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
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.inputBg,
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
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
