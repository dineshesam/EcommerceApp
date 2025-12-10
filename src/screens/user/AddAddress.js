import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { addAddress, updateAddress } from "../../api/addressApi";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function AddAddress() {

  const navigation = useNavigation();
  const route = useRoute();

  // Comes only when editing
  const editMode = route.params?.editMode || false;
  const oldData = route.params?.address || null;

  const [form, setForm] = useState({
    name:"",
    phoneNo:"",
    pincode:"",
    state:"",
    city:"",
    buildingName:"",
    area:"",
    type:"",
    location:""
  });

  // 🔥 Prefill form when editing
  useEffect(() => {
    if (editMode && oldData) {
      setForm(oldData);  // fill inputs
    }
  }, []);

  const save = async () => {
    if (editMode) {
      await updateAddress(oldData.id, form);
    } else {
      await addAddress(form);
    }

    navigation.goBack(); // auto refresh in ManageAddress (load() is on focus)
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        {editMode ? "✏ Edit Address" : "➕ Add Address"}
      </Text>

      {Object.keys(form).map(key => (
        <TextInput
          key={key}
          placeholder={key}
          style={styles.input}
          value={form[key]}
          onChangeText={txt => setForm({...form,[key]:txt})}
        />
      ))}

      <TouchableOpacity style={styles.btn} onPress={save}>
        <Text style={styles.btnTxt}>
          {editMode ? "Save Changes" : "Add Address" }
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container:{ flex:1, padding:14, backgroundColor:"#fff" },
  title:{ fontSize:22, fontWeight:"800", marginBottom:12 },
  input:{ borderWidth:1,borderColor:"#bbb",borderRadius:8,padding:10,marginBottom:10 },
  btn:{ backgroundColor:"#0A84FF", padding:12, borderRadius:8, marginTop:10 },
  btnTxt:{ color:"#fff", textAlign:"center", fontWeight:"700", fontSize:16 }
});
