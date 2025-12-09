import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { removeWishlist } from "../../redux/slices/wishlistSlice";
import {
  removeFromWishlistServer
} from "../../api/wishlistApi";
import { addToCart } from "../../redux/slices/cartSlice";
import { addCart } from "../../redux/slices/cartSlice";
import makeImageUrl from "../../utils/makeImageUrl";
import { useNavigation } from "@react-navigation/native";

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const wishlist = useSelector(state => state.wishlist);
  console.log("📌 Wishlist Redux State:", wishlist);


  const handleRemove = async (product) => {
    dispatch(removeWishlist(product.id));
    await removeFromWishlistServer(product.id);
  };

  const handleMoveToCart = async (product) => {
    dispatch(addCart({ productId: product.id, qty:1, product }));
    dispatch(removeWishlist(product.id));
    await removeFromWishlistServer(product.id);
    await addToCartServer(product.id); 

  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("ProductDetails", { product: item })
      }
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
            style={[styles.btn, styles.cartBtn]}
            onPress={() => handleMoveToCart(item)}
          >
            <Text style={styles.btnText}>Add to Cart 🛒</Text>
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

/* ======================= STYLES ======================= */

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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6
  },

  btn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 2
  },

  cartBtn: { backgroundColor: "#007bff" },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  removeBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "red"
  },
  removeTxt: {
    color: "red",
    fontSize: 13,
    fontWeight: "700"
  }
});
