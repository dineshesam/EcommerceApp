
import React, { useMemo, useCallback } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { updateQty, removeCart } from "../../redux/slices/cartSlice";
import { updateCartQtyServer, removeFromCartServer } from "../../api/cartApi";
import makeImageUrl from "../../utils/makeImageUrl";

export default function Cart({ navigation }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  console.log("cart data", cart);
  const products = useSelector((state) => state.products.items);

  // Build map with string keys to avoid type mismatch
  const productsById = useMemo(() => {
    const map = {};
    for (const p of products) map[String(p.id)] = p;
    return map;
  }, [products]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.qty, 0),
    [cart]
  );

  const increase = useCallback(
    (item) => {
      const liveStockRaw = productsById[String(item.productId)]?.stock;
      const fallback = typeof item.product?.stock === "number" ? item.product.stock : Infinity;
      const liveStock = typeof liveStockRaw === "number" ? liveStockRaw : fallback;

      const nextQty = item.qty + 1;

      console.log("[increase]", { productId: item.productId, qty: item.qty, nextQty, liveStock });

      if (nextQty > liveStock) {
        Alert.alert("Stock limit", `Only ${liveStock} item(s) available.`);
        return;
      }

      dispatch(updateQty({ productId: item.productId, qty: nextQty }));
      updateCartQtyServer(item.productId, nextQty).catch((e) =>
        console.log("updateCartQtyServer failed:", e?.message)
      );
    },
    [dispatch, productsById]
  );

  const decrease = useCallback(
    (item) => {
      if (item.qty === 1) {
        dispatch(removeCart(item.productId));
        removeFromCartServer(item.productId).catch((e) =>
          console.log("removeFromCartServer failed:", e?.message)
        );
        return;
      }
      const nextQty = item.qty - 1;
      dispatch(updateQty({ productId: item.productId, qty: nextQty }));
      updateCartQtyServer(item.productId, nextQty).catch((e) =>
        console.log("updateCartQtyServer failed:", e?.message)
      );
    },
    [dispatch]
  );

  const remove = useCallback(
    (item) => {
      dispatch(removeCart(item.productId));
      removeFromCartServer(item.productId).catch((e) =>
        console.log("removeFromCartServer failed:", e?.message)
      );
    },
    [dispatch]
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

          <Text style={{ color: "#666", marginTop: 4, fontSize: 12 }}>
            {liveStock <= 0 ? "Out of stock" : `In stock: ${liveStock}`}
          </Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => decrease(item)}>
              <Text style={styles.qtySymbol}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{item.qty}</Text>

            <TouchableOpacity
              style={[styles.qtyBtn, atMax && { opacity: 0.5 }]}
              onPress={() => increase(item)}
              disabled={atMax}
            >
              <Text style={styles.qtySymbol}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => remove(item)}>
          <Text style={styles.delete}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Cart ({cart.length})</Text>

      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(i) => String(i.productId)}
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>
            Total: ₹ {totalAmount.toLocaleString("en-IN")}
          </Text>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate("Checkout")}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#fff", padding:10 },
  header:{ fontSize:20, fontWeight:"700", marginBottom:10 },
  card:{ flexDirection:"row", paddingVertical:10, borderBottomWidth:1, borderColor:"#eee" },
  img:{ width:70, height:70, borderRadius:10, marginRight:10 },
  name:{ fontSize:15, fontWeight:"600" },
  price:{ fontSize:15, fontWeight:"800", color:"#0a8a45", marginTop:4 },
  row:{ flexDirection:"row", alignItems:"center", marginTop:8 },
  qtyBtn:{ borderWidth:1, borderColor:"#888", borderRadius:6, paddingHorizontal:10, paddingVertical:4 },
  qty:{ fontSize:16, fontWeight:"700", marginHorizontal:12 },
  qtySymbol:{ fontSize:18, fontWeight:"900" },
  delete:{ fontSize:24, color:"red", paddingHorizontal:10 },
  footer:{ marginTop:15, borderTopWidth:1, borderColor:"#ddd", paddingTop:12 },
  total:{ fontSize:18, fontWeight:"800", marginBottom:15, textAlign:"right" },
  checkoutBtn:{ backgroundColor:"#0A84FF", padding:12, borderRadius:10, marginTop:10 },
  checkoutText:{ color:"#fff", textAlign:"center", fontWeight:"700", fontSize:15 }
  });