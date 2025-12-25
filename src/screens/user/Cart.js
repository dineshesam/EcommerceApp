
import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { updateQty, removeCart } from "../../redux/slices/cartSlice";
import { updateCartQtyServer, removeFromCartServer } from "../../api/cartApi";
import makeImageUrl from "../../utils/makeImageUrl";
import useDynamicStyles from "../../hooks/useDynamicStyles";
import { toastSuccess, toastInfo } from "../../utils/toast";
import { useTranslation } from "react-i18next";

export default function Cart({ navigation }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const products = useSelector((state) => state.products.items);

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  const productsById = useMemo(() => {
    const map = {};
    for (const p of products) map[String(p.id)] = p;
    return map;
  }, [products]);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.qty, 0);
  }, [cart]);

  const increase = useCallback(
    (item) => {
      const liveStockRaw = productsById[String(item.productId)]?.stock;
      const fallback = typeof item.product?.stock === "number" ? item.product.stock : Infinity;
      const liveStock = typeof liveStockRaw === "number" ? liveStockRaw : fallback;

      const nextQty = item.qty + 1;

      if (nextQty > liveStock) {
        Alert.alert(
          t("cart.stockLimitTitle"),
          t("cart.onlyNAvailable", { count: liveStock })
        );
        return;
      }

      dispatch(updateQty({ productId: item.productId, qty: nextQty }));
      updateCartQtyServer(item.productId, nextQty).catch((e) => {
        console.log("updateCartQtyServer failed:", e && e.message);
      });
      toastSuccess(t("cart.quantityUpdated.title"), item.product?.name + " • " + nextQty);
    },
    [dispatch, productsById, t]
  );

  const decrease = useCallback(
    (item) => {
      if (item.qty === 1) {
        dispatch(removeCart(item.productId));
        removeFromCartServer(item.productId).catch((e) => {
          console.log("removeFromCartServer failed:", e && e.message);
        });
        toastInfo(t("cart.removed.title"), item.product?.name);
        return;
      }
      const nextQty = item.qty - 1;
      dispatch(updateQty({ productId: item.productId, qty: nextQty }));
      updateCartQtyServer(item.productId, nextQty).catch((e) => {
        console.log("updateCartQtyServer failed:", e && e.message);
      });
      toastSuccess(t("cart.quantityUpdated.title"), item.product?.name + " • " + nextQty);
    },
    [dispatch, t]
  );

  const remove = useCallback(
    (item) => {
      dispatch(removeCart(item.productId));
      removeFromCartServer(item.productId).catch((e) => {
        console.log("removeFromCartServer failed:", e && e.message);
      });
      toastInfo(t("cart.removed.title"), item.product?.name);
    },
    [dispatch, t]
  );

  const renderItem = ({ item }) => {
    const liveStockRaw = productsById[String(item.productId)]?.stock;
    const fallback = typeof item.product?.stock === "number" ? item.product.stock : 0;
    const liveStock = typeof liveStockRaw === "number" ? liveStockRaw : fallback;

    const atMax = item.qty >= liveStock || liveStock <= 0;

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: makeImageUrl(item.product?.images?.[0]) }}
          style={styles.img}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={2}>{item.product?.name}</Text>
          <Text style={styles.price}>₹ {item.product?.price}</Text>

          <Text style={styles.stockText}>
            {liveStock <= 0
              ? t("shop.outOfStock")
              : t("shop.inStockCount", { count: liveStock })}
          </Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => decrease(item)} activeOpacity={0.85}>
              <Text style={styles.qtySymbol}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{item.qty}</Text>

            <TouchableOpacity
              style={[styles.qtyBtn, atMax && styles.qtyBtnDisabled]}
              onPress={() => increase(item)}
              disabled={atMax}
              activeOpacity={0.85}
            >
              <Text style={styles.qtySymbol}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => remove(item)} activeOpacity={0.85}>
          <Text style={styles.delete}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 {t("common.cart")} ({cart.length})</Text>

      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(i) => String(i.productId)}
        showsVerticalScrollIndicator={false}
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>
            {t("cart.total")}: ₹ {totalAmount.toLocaleString("en-IN")}
          </Text>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate("Checkout")}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutText}>
              {t("shop.proceedToCheckout")} →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBg, padding: 10 },
    header: { fontSize: 20, fontWeight: "700", marginBottom: 10, color: colors.primaryText },

    card: {
      flexDirection: "row",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: colors.divider
    },

    img: { width: 70, height: 70, borderRadius: 10, marginRight: 10 },

    name: { fontSize: 15, fontWeight: "600", color: colors.primaryText },
    price: { fontSize: 15, fontWeight: "800", color: colors.priceText, marginTop: 4 },

    stockText: { color: colors.secondaryText, marginTop: 4, fontSize: 12 },

    row: { flexDirection: "row", alignItems: "center", marginTop: 8 },

    qtyBtn: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: colors.inputBg
    },
    qtyBtnDisabled: { opacity: 0.5 },
    qty: { fontSize: 16, fontWeight: "700", marginHorizontal: 12, color: colors.primaryText },
    qtySymbol: { fontSize: 18, fontWeight: "900", color: colors.primaryText },

    delete: { fontSize: 24, color: colors.error, paddingHorizontal: 10 },

    footer: {
      marginTop: 15,
      borderTopWidth: 1,
      borderColor: colors.divider,
      paddingTop: 12,
      marginBottom: 100
    },
    total: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 15,
      textAlign: "right",
      color: colors.primaryText
    },
    checkoutBtn: {
      backgroundColor: colors.ctaButtonBg,
      padding: 12,
      borderRadius: 10,
      marginTop: 10
    },
    checkoutText: {
      color: colors.ctaButtonText,
      textAlign: "center",
      fontWeight: "700",
      fontSize: 15
    }
  });
}
