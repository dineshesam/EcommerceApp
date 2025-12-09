import React, { useMemo } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet
} from "react-native";

import { useSelector, useDispatch } from "react-redux";
import { updateQty, removeCart } from "../../redux/slices/cartSlice";
import {
  updateCartQtyServer,
  removeFromCartServer,
} from "../../api/cartApi";
import makeImageUrl from "../../utils/makeImageUrl";

export default function Cart() {
  
  const cart = useSelector(state => state.cart);
  const dispatch = useDispatch();

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cart]
  );

  const increase = (item) => {
    const qty = item.qty + 1;
    dispatch(updateQty({ productId:item.productId, qty }));
    updateCartQtyServer(item.productId, qty);
  };

  const decrease = (item) => {
    if(item.qty === 1) return remove(item); // auto delete
    const qty = item.qty - 1;
    dispatch(updateQty({ productId:item.productId, qty }));
    updateCartQtyServer(item.productId, qty);
  };

  const remove = (item) => {
    dispatch(removeCart(item.productId));  // UI instant
    removeFromCartServer(item.productId);  // 🔥 remove single product
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      
      <Image source={{ uri:makeImageUrl(item.product.images[0]) }} style={styles.img} />
      
      <View style={{ flex:1 }}>
        <Text style={styles.name}>{item.product.name}</Text>
        <Text style={styles.price}>₹ {item.product.price}</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.qtyBtn} onPress={()=>decrease(item)}>
            <Text style={styles.qtySymbol}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qty}>{item.qty}</Text>

          <TouchableOpacity style={styles.qtyBtn} onPress={()=>increase(item)}>
            <Text style={styles.qtySymbol}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={()=>remove(item)}>
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
        keyExtractor={i=>i.productId.toString()}
      />

      {cart.length>0 && (
        <Text style={styles.total}>
          Total: ₹ {totalAmount.toLocaleString('en-IN')}
        </Text>
      )}
    </View>
  );
}


/* ---------- STYLES ---------- */
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
  total:{ fontSize:18, fontWeight:"800", marginTop:15, textAlign:"right" }
});
