
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, Image
} from "react-native";
import makeImageUrl from "../../utils/makeImageUrl";
import { getMyOrders } from "../../api/orderApi";
import useDynamicStyles from "../../hooks/useDynamicStyles";
import { useTranslation } from "react-i18next";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  const loadOrders = async () => {
    try {
      const res = await getMyOrders();
      setOrders(Array.isArray(res) ? res : []);
    } catch (e) {
      console.log("ORDER FETCH ERROR:", e.response?.data || e);
    }
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  const renderItem = ({ item }) => {
    const status = item.status === "pending" ? "in-transit" : "delivered";
    const statusStyle = status === "in-transit" ? styles.pending : styles.done;

    return (
      <View style={styles.card}>
        <View style={styles.rowTop}>
          <Text style={styles.orderId}>Order ID: {String(item.id).slice(0, 8)}...</Text>
          <Text style={[styles.status, statusStyle]}>
            {status === "in-transit" ? t("common.inTransit") : "Delivered"}
          </Text>
        </View>

        {/* Items List */}
        {Array.isArray(item.items) && item.items.map((p, i) => {
          const img0 = Array.isArray(p.images) ? p.images[0] : undefined;
          const uri = makeImageUrl(img0);
          const hasImage = typeof uri === "string" && uri.length > 0;

          return (
            <View key={i} style={styles.itemRow}>
              {hasImage ? (
                <Image source={{ uri }} style={styles.img} />
              ) : (
                <View style={styles.imgPlaceholder}>
                  <Text style={styles.imgPlaceholderText}>No Image</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.qty}>Qty: {p.qty}</Text>
              </View>
              <Text style={styles.price}>
                ₹ {(Number(p.price) * Number(p.qty)).toLocaleString("en-IN")}
              </Text>
            </View>
          );
        })}

        <Text style={styles.total}>
          {t("cart.total")}: ₹ {(item.totals?.finalTotal ?? item.total ?? 0).toLocaleString("en-IN")}
        </Text>

        <Text style={styles.date}>
          {item.createdAt ? new Date(item.createdAt).toDateString() : ""}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("order.myOrders", "My Odrder")}</Text>

      {loading ? <ActivityIndicator size="large" color={colors.brandAccent} /> : null}

      {orders.length === 0 && !loading ? (
        <Text style={styles.empty}>No orders found</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */
const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBg, padding: 12 },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: colors.primaryText },

    card: {
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 10,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },

    rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    orderId: { fontSize: 13, fontWeight: "600", color: colors.primaryText },

    status: {
      fontSize: 12,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 6,
      fontWeight: "700",
      color: colors.ctaButtonText,
    },
    pending: { backgroundColor: colors.warning },
    done: { backgroundColor: colors.success },

    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    img: { width: 45, height: 45, borderRadius: 6, marginRight: 10 },

    // Fallback when image is missing
    imgPlaceholder: {
      width: 45,
      height: 45,
      borderRadius: 6,
      marginRight: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.tabBackground,
    },
    imgPlaceholderText: { fontSize: 10, color: colors.secondaryText },

    name: { fontSize: 14, fontWeight: "600", color: colors.primaryText },
    qty: { fontSize: 12, color: colors.secondaryText },
    price: { fontSize: 14, fontWeight: "800", color: colors.priceText },

    total: {
      fontSize: 16,
      fontWeight: "800",
      marginTop: 10,
      textAlign: "right",
      color: colors.primaryText,
    },
    date: { fontSize: 12, color: colors.secondaryText, textAlign: "right", marginTop: 4 },

    empty: { fontSize: 17, textAlign: "center", marginTop: 40, color: colors.secondaryText },
  });
