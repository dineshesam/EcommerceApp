import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, decreaseQty, addToCart } from "../../redux/slices/cartSlice";
import makeImageUrl from "../../utils/makeImageUrl";

export default function Cart() {
  const cart = useSelector(state => state.cart);
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Cart ({cart.length})</Text>

      <FlatList
        data={cart}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: makeImageUrl(item.images?.[0]) }} style={styles.image} />

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.price}>₹ {item.price} × {item.quantity}</Text>

              <View style={styles.row}>
                <TouchableOpacity onPress={() => dispatch(decreaseQty(item.id))}>
                  <Text style={styles.qtyBtn}>➖</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => dispatch(addToCart(item))}>
                  <Text style={styles.qtyBtn}>➕</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => dispatch(removeFromCart(item.id))}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:12 },
  header:{ fontSize:22, fontWeight:"bold", marginBottom:12 },

  card:{
    flexDirection:"row",
    backgroundColor:"#fff",
    padding:10,
    borderRadius:8,
    borderWidth:1,
    borderColor:"#ddd",
    marginBottom:10,
    elevation:2
  },
  image:{ width:80, height:80, borderRadius:6, marginRight:10 },
  title:{ fontSize:15, fontWeight:"600" },
  price:{ color:"#008c4a", fontWeight:"700", marginVertical:3 },

  row:{ flexDirection:"row", alignItems:"center", marginTop:4, gap:12 },
  qtyBtn:{ fontSize:20, paddingHorizontal:6 },
  remove:{ color:"red", fontWeight:"700" }
});
