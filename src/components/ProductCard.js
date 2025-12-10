import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addWishlist, removeWishlist } from "../redux/slices/wishlistSlice";
import { addToWishlistServer, removeFromWishlistServer } from "../api/wishlistApi";
import makeImageUrl from "../utils/makeImageUrl";
import { addToCart } from "../redux/slices/cartSlice";
import { useNavigation } from "@react-navigation/native";
import { addToCartServer } from "../api/cartApi";
import { addCart } from "../redux/slices/cartSlice";




export default function ProductCard({ product }) {

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist);

  const inWishlist = wishlist.some(item => item.id === product.id);  // backend returns products, not ids
  const imageUri = makeImageUrl(product?.images?.[0]);

const handleAddCart = async () => {
  dispatch(addCart({ productId: product.id, qty:1, product }));  // UI instant
  await addToCartServer(product.id);                             // DB sync
};

  //  WISHLIST ACTION
  const handleWishlist = async () => {
    try {
      if (inWishlist) {
        dispatch(removeWishlist(product.id));          // remove from UI
        await removeFromWishlistServer(product.id);    // remove from DB
      } else {
        dispatch(addWishlist(product));                // add full object
        await addToWishlistServer(product.id);         // sync to DB
      }
    } catch (err) {
      console.log("Wishlist Sync Error:", err);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate("ProductDetails", { product })}
    >
      {/* PRODUCT IMAGE */}
      <Image source={{ uri: imageUri }} style={styles.image} />

      {/*  BUTTON */}
      <TouchableOpacity style={styles.wishBtn} onPress={handleWishlist}>
        <Text style={styles.wishIcon}>
          {inWishlist ? "❤️" : "🤍"}
        </Text>
      </TouchableOpacity>

      {/* PRODUCT INFO */}
      <View style={styles.infoBox}>
        <Text numberOfLines={1} style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₹ {product.price}</Text>

        {/* ADD TO CART */}
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={handleAddCart}
        >
          <Text style={styles.cartText}>Add to Cart 🛒</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

/* ==================== STYLES ==================== */

const styles = StyleSheet.create({
  card:{
    width:"47%",
    backgroundColor:"#fff",
    borderRadius:12,
    margin:"1.5%",
    borderWidth:1,
    borderColor:"#ddd",
    elevation:4,
    overflow:"hidden"
  },
  image:{ width:"100%", height:150 },
  wishBtn:{
    position:"absolute",
    right:10,
    top:10,
    backgroundColor:"#fff",
    padding:6,
    borderRadius:25,
    elevation:5
  },
  wishIcon:{ fontSize:22 },

  infoBox:{ padding:10 },
  title:{ fontSize:15, fontWeight:"600" },
  price:{ fontSize:16, fontWeight:"700", color:"#0a8a45", marginVertical:5 },

  cartBtn:{ backgroundColor:"#007bff", paddingVertical:7, borderRadius:6, marginTop:6 },
  cartText:{ color:"#fff", textAlign:"center", fontWeight:"700" }
});
