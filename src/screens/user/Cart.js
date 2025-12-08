import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";

import { updateQty, removeCart } from "../../redux/slices/cartSlice";
import {
  updateCartQtyServer,
  removeFromCartServer,
} from "../../api/cartApi";
import makeImageUrl from "../../utils/makeImageUrl";

export default function Cart() {
  const cart = useSelector((state) => state.cart); // [{ productId, qty, product }]
  const dispatch = useDispatch();

  const totalAmount = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.price * item.qty,
        0
      ),
    [cart]
  );

  const increaseQty = (item) => {
    const newQty = item.qty + 1;
    dispatch(updateQty({ productId: item.productId, qty: newQty }));
    updateCartQtyServer(item.productId, newQty);
  };

  const decreaseQty = (item) => {
    if (item.qty === 1) {
      return removeItem(item);
    }
    const newQty = item.qty - 1;
    dispatch(updateQty({ productId: item.productId, qty: newQty }));
    updateCartQtyServer(item.productId, newQty);
  };

  const removeItem = (item) => {
    dispatch(removeCart(item.productId));
    removeFromCartServer(item.productId);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: makeImageUrl(item.product.images[0]) }}
        style={styles.img}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{item.product.name}</Text>
        <Text style={styles.price}>₹ {item.product.price}</Text>

        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => decreaseQty(item)}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qty}>{item.qty}</Text>

          <TouchableOpacity
            onPress={() => increaseQty(item)}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => removeItem(item)}>
        <Text style={styles.delete}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Cart ({cart.length})</Text>

      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(i) => i.productId.toString()} // IMPORTANT: backend has productId, not id
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            ₹ {totalAmount.toLocaleString("en-IN")}
          </Text>
        </View>
      )}
    </View>
  );
}

/* =====================  STYLES  ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  img: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#222" },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0a8a45",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyBtn: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyText: { fontSize: 18, fontWeight: "900" },
  qty: { fontSize: 16, marginHorizontal: 12, fontWeight: "700" },
  delete: { fontSize: 22, color: "red", paddingHorizontal: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: "#ddd",
    marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: "600" },
  totalValue: { fontSize: 18, fontWeight: "800" },
});
