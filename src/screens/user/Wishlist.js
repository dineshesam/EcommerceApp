
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
import Images from "../../assets/images";

import useDynamicStyles from "../../hooks/useDynamicStyles";

// ✅ Toast helpers
import { toastSuccess, toastError, toastInfo } from "../../utils/toast";
import { useTranslation } from "react-i18next";

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const cart = useSelector((state) => state.cart);              // [{ productId, qty, product }, ...]
  const wishlist = useSelector((state) => state.wishlist);       // [{ id, name, ... }, ...]
  const products = useSelector((state) => state.products.items); // [{ id, stock, ... }, ...]

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  // Fast lookup of cart product IDs
  const cartIds = useMemo(() => new Set(cart.map((c) => c.productId)), [cart]);

  // ID -> product map for live stock lookup (optional, for disabling by stock)
  const productsById = useMemo(() => {
    const map: Record<string | number, any> = {};
    for (const p of products) map[p.id] = p;
    return map;
  }, [products]);

  // Small helper to extract readable error text
  const getErrMsg = (e: any) =>
    e?.response?.data?.message ||
    e?.message ||
    t("common.error.generic");

  const handleRemove = async (product: any) => {
    try {
      // Optimistic: remove locally first
      dispatch(removeWishlist(product.id));
      await removeFromWishlistServer(product.id);

      // ✅ Toast feedback
      toastSuccess(t("wishlist.removed.title"), product.name);
    } catch (e) {
      console.log("remove wishlist failed:", e);
      toastError(t("wishlist.removeFailed.title"), getErrMsg(e));
    }
  };

  const handleMoveToCart = async (product: any) => {
    try {
      // If already in cart, just inform (or navigate)
      if (cartIds.has(product.id)) {
        toastInfo(t("wishlist.alreadyInCart.title"), product.name);
        // Optional: navigation.navigate("Cart");
        return;
      }

      // Optimistic: add to cart locally
      dispatch(addCart({ productId: product.id, qty: 1, product }));

      // Server add
      await addToCartServer(product.id);

      // Remove from wishlist (server + local)
      await removeFromWishlistServer(product.id);
      dispatch(removeWishlist(product.id));

      // ✅ Toast success
      toastSuccess(t("wishlist.addedToCart.title"), product.name);
    } catch (e) {
      console.log("move to cart failed:", e);
      // Optional rollback if you want strict consistency:
      // dispatch(removeFromCart({ productId: product.id }));
      toastError(t("wishlist.moveToCartFailed.title"), getErrMsg(e));
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const liveStock =
        productsById[item.id]?.stock ??
        (typeof item.stock === "number" ? item.stock : 0);

      const inCart = cartIds.has(item.id);

      // 🔧 UX tweak: only disable when out of stock (still allow tap when inCart to show info toast)
      const disabled = liveStock <= 0;

      const buttonLabel = inCart
        ? t("shop.inCart")
        : disabled
        ? t("shop.outOfStock")
        : t("shop.addToCart");

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
                  disabled && styles.btnDisabled
                ]}
                disabled={disabled}
                onPress={() => {
                  if (inCart) {
                    // Inform and optionally navigate
                    toastInfo(t("wishlist.alreadyInCart.title"), item.name);
                    // navigation.navigate("Cart");
                    return;
                  }
                  handleMoveToCart(item);
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.btnText,
                    disabled && { color: colors.disabledButtonText }
                  ]}
                >
                  {buttonLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.removeBtn]}
                onPress={() => handleRemove(item)}
                activeOpacity={0.85}
              >
                <Text style={styles.removeTxt}>🗑 {t("shop.remove")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, productsById, cartIds, colors, t]
  );

  return (
    <View style={styles.container}>
      {wishlist.length === 0 ? (
        <View style={styles.emptyBox}>
          {/* <View style={styles.iconWrapper}>
            <Images.icons.Email/>
            <Images.icons.Fx/>
            <Images.icons.Managegroup/>
            <Images.icons.Home/>
            <Images.icons.Gear/>
          </View> */}
          <Text style={styles.emptyText}>{t("wishlist.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBg },
    iconWrapper: {
      width: 26.25,
      height: 21,
    },

    emptyBox: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { fontSize: 18, fontWeight: "600", color: colors.secondaryText },

    card: {
      backgroundColor: colors.card,
      borderRadius: 10,
      flexDirection: "row",
      marginBottom: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      elevation: 2, // subtle Android elevation
      overflow: "hidden",
    },

    image: { width: 90, height: 90, borderRadius: 8, marginRight: 10 },

    info: { flex: 1, justifyContent: "center" },

    title: { fontSize: 15, fontWeight: "600", color: colors.primaryText },
    price: { fontSize: 16, color: colors.priceText, marginVertical: 4 },

    row: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },

    btn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: "center",
      marginHorizontal: 2,
    },

    cartBtn: { backgroundColor: colors.ctaButtonBg },
    btnDisabled: { backgroundColor: colors.disabledButtonBg },

    btnText: { color: colors.ctaButtonText, fontSize: 13, fontWeight: "700" },

    removeBtn: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.error,
    },
    removeTxt: { color: colors.error, fontSize: 13, fontWeight: "700" },
  });
