import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { getMyAddresses, removeAddress } from "../../api/addressApi";

export default function SelectAddress({ navigation, route }) {

  const [addresses, setAddresses] = useState([]);
  const fromCheckout = route.params?.fromCheckout || false;

const load = async () => {
  try {
    const data = await getMyAddresses();
    console.log("📌 My addresses:", data);   // <--- check this
    setAddresses(data);
  } catch(e) {
    console.log("❌ Address fetch error:", e.response?.data || e.message);
  }
};


  useEffect(()=>{ load(); },[]);

  const choose = (addr) => {
    navigation.navigate("PlaceOrder", { addressId: addr.id, address:addr });
  };

  return (
    <View style={{ flex:1, backgroundColor:"#fff", padding:10 }}>

      <Text style={styles.head}>My Saved Addresses</Text>

      <FlatList
        data={addresses}
        keyExtractor={(i)=>i.id.toString()}
        renderItem={({item})=>(
          <TouchableOpacity 
            style={styles.card}
            onPress={()=> choose(item)}
          >
            <Text style={styles.name}>{item.name} ({item.type})</Text>
            <Text style={styles.line}>{item.buildingName}, {item.area}</Text>
            <Text style={styles.line}>{item.city}, {item.state} - {item.pincode}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.btn} onPress={()=>navigation.navigate("AddAddress")}>
        <Text style={styles.txt}>➕ Add New Address</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  head:{ fontSize:20,fontWeight:"700",marginBottom:12 },
  card:{ borderWidth:1,borderColor:"#ccc",padding:12,borderRadius:8,marginBottom:10 },
  name:{ fontSize:16,fontWeight:"800" },
  line:{ fontSize:13,color:"#555" },
  btn:{ backgroundColor:"#0A84FF",padding:12,borderRadius:8,marginTop:10 },
  txt:{ color:"#fff",fontWeight:"700",textAlign:"center" }
});
