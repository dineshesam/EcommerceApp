import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Profile(){

  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("userData");
    if(data){
      setUser(JSON.parse(data));
    }
  };

  const logout = async () => {
    Alert.alert("Confirm Logout", "Are you sure?", [
      { text:"Cancel", style:"cancel" },
      {
        text:"Logout",
        style:"destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userData");
          navigation.replace("Login");
        }
      }
    ]);
  };

  if(!user){
    return (
      <View style={styles.center}>
        <Text style={{fontSize:18}}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Profile Picture Placeholder */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri:"https://i.pravatar.cc/150?img=3" }}
          style={styles.avatar}
        />
      </View>

      {/* User Details */}
      <Text style={styles.name}>{user.name ?? "User"}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.roleTag}>{user.role === "admin" ? "Admin" : "Customer"}</Text>

      <TouchableOpacity style={styles.option} 
  onPress={() => navigation.navigate("ManageAddress")}>
  <Text style={styles.optionText}>📍 Manage Address</Text>
</TouchableOpacity>

      {/* Menu Buttons */}
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("Wishlist")}>
        <Text style={styles.optionText}>❤️ My Wishlist</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}  onPress={() => navigation.navigate("Orders") }>
        <Text style={styles.optionText}>📦 My Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </View>
  );
}


/* ====== STYLES ====== */

const styles = StyleSheet.create({

  container:{ flex:1, alignItems:"center", paddingTop:40, backgroundColor:"#fff" },
  center:{ flex:1, justifyContent:"center", alignItems:"center" },

  avatarContainer:{ width:120, height:120, borderRadius:60, overflow:"hidden", marginBottom:15 },
  avatar:{ width:"100%", height:"100%" },

  name:{ fontSize:22, fontWeight:"700", color:"#111", marginTop:5 },
  email:{ fontSize:15, color:"#666", marginBottom:6 },
  roleTag:{
    backgroundColor:"#007bff",
    paddingHorizontal:12,
    paddingVertical:4,
    borderRadius:20,
    color:"#fff",
    marginBottom:25
  },

  option:{
    width:"90%",
    padding:15,
    borderWidth:1,
    borderRadius:8,
    borderColor:"#ddd",
    marginTop:10,
  },
  optionText:{ fontSize:17, fontWeight:"600" },

  logout:{
    marginTop:30,
    backgroundColor:"red",
    width:"90%",
    paddingVertical:12,
    borderRadius:8
  },
  logoutText:{ color:"#fff", textAlign:"center", fontSize:17, fontWeight:"700" }

});
