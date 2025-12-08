import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist } from "../redux/slices/wishlistSlice";
import makeImageUrl from "../utils/makeImageUrl";

export default function ProductCard({ product }) {

  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist);

  const imageUri = makeImageUrl(product?.images?.[0]);
  const isWishlisted = wishlist.includes(product.id);

  return (
    <View style={styles.card}>

      {/* PRODUCT IMAGE */}
      <Image source={{ uri: imageUri }} style={styles.image} />

      {/* WISHLIST HEART BUTTON */}
      <TouchableOpacity
        style={styles.wishBtn}
        onPress={() => dispatch(toggleWishlist(product.id))}
      >
        <Text style={styles.wishIcon}>
          {isWishlisted ? "❤️" : "🤍"}
        </Text>
      </TouchableOpacity>

      {/* INFO */}
      <View style={styles.infoBox}>
        <Text style={styles.title} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.price}>₹ {product.price.toLocaleString("en-IN")}</Text>

        <TouchableOpacity
          onPress={() => dispatch(addToCart(product))}
          style={styles.cartBtn}
        >
          <Text style={styles.cartText}>Add to Cart 🛒</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}


/*==================== STYLES =======================*/
const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: "1.5%",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#e5e5e5",
    overflow: "hidden"
  },

  image: {
    width: "100%",
    height: 150,
  },

  wishBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ffffffdd",
    padding: 6,
    borderRadius: 25,
    elevation: 7,
    shadowColor: "#000"
  },

  wishIcon: {
    fontSize: 22
  },

  infoBox: {
    padding: 10,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  price: {
    marginVertical: 6,
    fontSize: 16,
    fontWeight: "800",
    color: "#0A8A45",
  },

  cartBtn: {
    backgroundColor: "#0A7AFF",
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 5
  },

  cartText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  }
});
