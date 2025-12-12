import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import makeImageUrl from "../../utils/makeImageUrl";
import { getMyOrders } from "../../api/orderApi";
import { Image } from "react-native";

export default function Orders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try{
      const res = await getMyOrders();
      setOrders(res);
    }catch(e){
      console.log("ORDER FETCH ERROR:", e.response?.data || e);
    }
    setLoading(false);
  };

  useEffect(()=>{ loadOrders(); }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.orderId}>Order ID: {item.id.slice(0,8)}...</Text>
        <Text style={[styles.status, 
             item.status==="pending"?styles.pending:styles.done]}>
          {item.status.toUpperCase()}
        </Text>
      </View>

      {/* Items List */}
      {item.items.map((p,i)=>(
        <View key={i} style={styles.itemRow}>
          <Image
            source={{uri: makeImageUrl(p.images?.[0])}}
            style={styles.img}
          />
          <View style={{flex:1}}>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.qty}>Qty: {p.qty}</Text>
          </View>
          <Text style={styles.price}>₹ {p.price * p.qty}</Text>
        </View>
      ))}

      <Text style={styles.total}>Total: ₹ {item.total.toLocaleString("en-IN")}</Text>
      <Text style={styles.date}> {new Date(item.createdAt).toDateString()}</Text>
    </View>
  );

  return(
    <View style={styles.container}>

      <Text style={styles.title}>My Orders</Text>

      {loading ? <ActivityIndicator size="large" color="#0A84FF" /> : null}

      {orders.length === 0 && !loading ? (
        <Text style={styles.empty}>No orders found </Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={i=>i.id}
          contentContainerStyle={{paddingBottom:20}}
        />
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#fff", padding:12 },
  title:{ fontSize:22, fontWeight:"700", marginBottom:10 },

  card:{ backgroundColor:"#fff", padding:12, borderRadius:10,
         marginVertical:8, borderWidth:1, borderColor:"#e6e6e6" },

  rowTop:{ flexDirection:"row", justifyContent:"space-between" },
  orderId:{ fontSize:13, fontWeight:"600", color:"#333" },

  status:{ fontSize:12, paddingVertical:2, paddingHorizontal:6,
           borderRadius:6, fontWeight:"700", color:"#fff" },
  pending:{ backgroundColor:"#ff9f1c" },
  done:{ backgroundColor:"#06d6a0" },

  itemRow:{ flexDirection:"row", alignItems:"center", marginTop:8 },
  img:{ width:45, height:45, borderRadius:6, marginRight:10 },

  name:{ fontSize:14, fontWeight:"600" },
  qty:{ fontSize:12, color:"#666" },
  price:{ fontSize:14, fontWeight:"800", color:"#008738" },

  total:{ fontSize:16, fontWeight:"800", marginTop:10, textAlign:"right" },
  date:{ fontSize:12, color:"#555", textAlign:"right", marginTop:4 },

  empty:{ fontSize:17, textAlign:"center", marginTop:40, color:"#666" }
});
