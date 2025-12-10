import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function OrderSuccess({ route, navigation }) {
  const { order } = route.params;

  return (
    <View style={styles.box}>
      <Text style={styles.big}>🎉 Order Placed!</Text>
      <Text style={styles.small}>Order ID: {order.id}</Text>

      <TouchableOpacity onPress={()=>navigation.navigate("Orders")}>
        <Text style={styles.link}>View My Orders →</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=>navigation.navigate("Home")} style={styles.homeBtn}>
        <Text style={styles.homeText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box:{ flex:1, alignItems:"center", justifyContent:"center" },
  big:{ fontSize:26, fontWeight:"800" },
  small:{ fontSize:14, marginTop:6, color:"#777" },
  link:{ color:"#0A84FF", marginTop:12, fontSize:16, fontWeight:"600" },
  homeBtn:{ marginTop:16, backgroundColor:"#0A84FF", padding:10, borderRadius:8 },
  homeText:{ color:"white", fontWeight:"700" }
});
