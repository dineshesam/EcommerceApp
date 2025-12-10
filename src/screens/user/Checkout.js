import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import makeImageUrl from "../../utils/makeImageUrl";
import { Image } from "react-native";

export default function Checkout({ navigation }) {

  const cart = useSelector(state => state.cart);

  const total = useMemo(() =>
    cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
  [cart]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Image
        source={{ uri: makeImageUrl(item.product.images[0]) }}
        style={styles.img}
      />
      <View style={{ flex:1 }}>
        <Text style={styles.name}>{item.product.name}</Text>
        <Text style={styles.qty}>Qty: {item.qty}</Text>
      </View>
      <Text style={styles.price}>₹ {item.product.price * item.qty}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Summary</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={renderItem}
      />

      <View style={styles.totalBox}>
        <Text style={styles.totalText}>Total Payable:</Text>
        <Text style={styles.totalAmount}>₹ {total.toLocaleString("en-IN")}</Text>
      </View>

      {/* 🔥 Next Step (5.2) – Place Order */}
      <TouchableOpacity
        style={styles.orderBtn}
        onPress={() => navigation.navigate("PlaceOrder")} // will build next
      >
        <Text style={styles.orderText}>Proceed to Place Order →</Text>
      </TouchableOpacity>
    </View>
  );
}


/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#fff", padding:12 },
  header:{ fontSize:20, fontWeight:"700", marginBottom:10 },

  item:{ flexDirection:"row", alignItems:"center", paddingVertical:8,
         borderBottomWidth:1, borderColor:"#eee" },
  img:{ width:60, height:60, borderRadius:8, marginRight:10 },
  name:{ fontSize:15, fontWeight:"600" },
  qty:{ fontSize:13, color:"#555" },
  price:{ fontSize:15, fontWeight:"800", color:"#008738" },

  totalBox:{ marginTop:10, padding:10, backgroundColor:"#f8f8f8",
             borderRadius:8, flexDirection:"row",
             justifyContent:"space-between" },
  totalText:{ fontSize:17, fontWeight:"600" },
  totalAmount:{ fontSize:19, fontWeight:"800", color:"#008738" },

  orderBtn:{ marginTop:20, backgroundColor:"#0A84FF", padding:14,
             borderRadius:10, alignItems:"center" },
  orderText:{ color:"#fff", fontWeight:"800", fontSize:15 }
});
