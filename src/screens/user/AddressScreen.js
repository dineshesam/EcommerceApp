import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddressScreen() {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    const data = await AsyncStorage.getItem("userAddress");
    if(data){
      const a = JSON.parse(data);
      setName(a.name);
      setPhone(a.phone);
      setHouse(a.house);
      setStreet(a.street);
      setCity(a.city);
      setState(a.state);
      setPincode(a.pincode);
    }
  };

  const saveAddress = async () => {
    const address = { name, phone, house, street, city, state, pincode };

    await AsyncStorage.setItem("userAddress", JSON.stringify(address));

    Alert.alert("Success", "Address Saved Locally ✔\nBackend sync next step 🔥");
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.header}>🏠 Delivery Address</Text>

      <TextInput style={styles.input} placeholder="Full Name"
        value={name} onChangeText={setName} />

      <TextInput style={styles.input} placeholder="Phone Number"
        value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <TextInput style={styles.input} placeholder="House / Flat No." 
        value={house} onChangeText={setHouse} />

      <TextInput style={styles.input} placeholder="Street / Area"
        value={street} onChangeText={setStreet} />

      <TextInput style={styles.input} placeholder="City"
        value={city} onChangeText={setCity} />

      <TextInput style={styles.input} placeholder="State"
        value={state} onChangeText={setState} />

      <TextInput style={styles.input} placeholder="Pincode" 
        value={pincode} onChangeText={setPincode} keyboardType="numeric" />

      <TouchableOpacity style={styles.saveBtn} onPress={saveAddress}>
        <Text style={styles.saveTxt}>Save Address</Text>
      </TouchableOpacity>

      <View style={{height:30}}/>

    </ScrollView>
  );
}


/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#fff", padding:15 },
  header:{ fontSize:22, fontWeight:"700", marginBottom:20 },

  input:{
    borderWidth:1, borderColor:"#bbb",
    borderRadius:8, padding:12,
    marginBottom:10, fontSize:15
  },

  saveBtn:{
    backgroundColor:"#007bff",
    paddingVertical:14,
    borderRadius:8,
    marginTop:10
  },
  saveTxt:{ textAlign:"center", color:"#fff", fontSize:18, fontWeight:"700" }
});
