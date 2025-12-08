import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { toggleWishlist } from "../../redux/slices/wishlistSlice";
import makeImageUrl from "../../utils/makeImageUrl";

export default function ProductDetails() {

  const route = useRoute();
  const product = route.params.product;      // <-- product passed from Home

  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist);

  const image = makeImageUrl(product?.images?.[0]);
  const isWishlisted = wishlist.includes(product.id);

  return (
    <ScrollView style={styles.container}>

      {/* Product Image */}
      <Image source={{ uri: image }} style={styles.mainImage} />

      {/* Wishlist ❤️ */}
      <TouchableOpacity style={styles.wishBtn} onPress={() => dispatch(toggleWishlist(product.id))}>
        <Text style={styles.wishIcon}>{isWishlisted ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₹ {product.price.toLocaleString("en-IN")}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.meta}>{product.category}</Text>

        <Text style={styles.label}>Stock</Text>
        <Text style={[styles.meta, product.stock > 0 ? styles.inStock : styles.outStock]}>
          {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
        </Text>

        {/* Add to Cart */}
        <TouchableOpacity style={styles.cartBtn} onPress={() => dispatch(addToCart(product))}>
          <Text style={styles.cartText}>Add to Cart 🛒</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}


/* ================== Styles ==================== */
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#fff" },

  mainImage:{ width:"100%", height:300, resizeMode:"cover" },

  wishBtn:{
    position:"absolute",
    top:20,
    right:15,
    backgroundColor:"#fff",
    borderRadius:30,
    padding:6,
    elevation:5
  },
  wishIcon:{ fontSize:25 },

  content:{ padding:15 },

  title:{ fontSize:22, fontWeight:"700", color:"#111", marginBottom:6 },
  price:{ fontSize:20, fontWeight:"800", color:"#0a8a3a", marginBottom:12 },

  label:{ fontSize:15, fontWeight:"700", marginTop:12 },
  description:{ fontSize:14, color:"#444", marginTop:4 },
  meta:{ fontSize:14, color:"#444", marginTop:4 },
  inStock:{ color:"#0a8a3a", fontWeight:"700" },
  outStock:{ color:"#d63031", fontWeight:"700" },

  cartBtn:{
    backgroundColor:"#007bff",
    paddingVertical:10,
    borderRadius:8,
    marginTop:20
  },
  cartText:{ color:"#fff", fontSize:16, fontWeight:"700", textAlign:"center" }
});
