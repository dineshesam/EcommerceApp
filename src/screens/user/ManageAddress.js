import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert
} from "react-native";

import { getMyAddresses, removeAddress } from "../../api/addressApi";
import { useNavigation } from "@react-navigation/native";

export default function ManageAddress() {

  const [addresses, setAddresses] = useState([]);
  const navigation = useNavigation();

  const load = async () => {
    try {
      const data = await getMyAddresses();
      console.log("📌 Address List:", data);
      setAddresses(data);
    } catch (err) {
      console.log("❌ Error loading address:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load); // Reload on return
    return unsubscribe;
  }, []);

  const deleteAddr = (id) => {
    Alert.alert(
      "Delete Address?",
      "Are you sure you want to remove this address?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await removeAddress(id);
            load(); // refresh list
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name} ({item.type || "N/A"})</Text>
      <Text style={styles.line}>{item.buildingName}, {item.area}</Text>
      <Text style={styles.line}>{item.city}, {item.state} - {item.pincode}</Text>
      <Text style={styles.line}>{item.phoneNo}</Text>

      <View style={styles.row}>
        
        {/* EDIT */}
        <TouchableOpacity
          style={[styles.btn, styles.edit]}
          onPress={() => navigation.navigate("AddAddress", { editMode:true, address:item })}
        >
          <Text style={styles.btnTxt}>✏ Edit</Text>
        </TouchableOpacity>

        {/* DELETE */}
        <TouchableOpacity
          style={[styles.btn, styles.delete]}
          onPress={() => deleteAddr(item.id)}
        >
          <Text style={styles.btnTxt}>🗑 Delete</Text>
        </TouchableOpacity>

      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>My Saved Addresses</Text>

      <FlatList
        data={addresses}
        keyExtractor={(i)=>i.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{textAlign:"center", marginTop:30, color:"#777"}}>
            No saved address yet.
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddAddress")}
      >
        <Text style={styles.addTxt}>➕ Add Address</Text>
      </TouchableOpacity>

    </View>
  );
}


/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container:{ flex:1, padding:14, backgroundColor:"#fff" },
  title:{ fontSize:22, fontWeight:"800", marginBottom:10 },

  card:{ padding:12, borderWidth:1, borderColor:"#ccc", borderRadius:8, marginBottom:12 },
  name:{ fontSize:16, fontWeight:"700" },
  line:{ fontSize:13, color:"#555" },

  row:{ flexDirection:"row", justifyContent:"space-between", marginTop:10 },

  btn:{ paddingVertical:6, paddingHorizontal:14, borderRadius:6 },
  edit:{ backgroundColor:"#0A84FF" },
  delete:{ backgroundColor:"red" },
  btnTxt:{ color:"#fff", fontWeight:"700" },

  addBtn:{ backgroundColor:"#008738", padding:12, borderRadius:8, marginTop:10 },
  addTxt:{ color:"white", textAlign:"center", fontWeight:"700", fontSize:15 }
});
