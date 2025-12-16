
// Login.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axiosConfig";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setWishlist } from "../redux/slices/wishlistSlice";
import { setCart } from "../redux/slices/cartSlice";
import { fetchWishlistProducts } from "../api/wishlistApi";
import { fetchCartFromServer } from "../api/cartApi";

export default function Login() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bootstrapUserData = async () => {
    try {
      const [wishlist, cart] = await Promise.all([
        fetchWishlistProducts(),
        fetchCartFromServer()
      ]);
      dispatch(setWishlist(wishlist));
      dispatch(setCart(cart));
    } catch (e) {
      console.log("post-login bootstrap failed:", e?.message || e);
      // Optional: show toast/snackbar if needed
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Enter email & password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", { email, password }); 
      // Expected: { token, user }

      const token = res?.data?.token;
      const user = res?.data?.user;

      if (token && user) {
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(user));

        // 🔥 Fetch wishlist & cart BEFORE navigating
        await bootstrapUserData();

        if (user.role === "admin") navigation.replace("AdminTabs");
        else navigation.replace("UserTabs");
      } else {
        setError("Login failed. Invalid server response.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Login Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back </Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.replace("Register")}>
        <Text style={styles.linkText}>New user? Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:"center", padding:24, backgroundColor:"#fff" },
  title:{ fontSize:28, fontWeight:"800", textAlign:"center" },
  subtitle:{ fontSize:15, color:"#666", textAlign:"center", marginBottom:22 },
  input:{ borderWidth:1, borderColor:"#bbb", borderRadius:8, padding:12, fontSize:15, marginBottom:12, color:"black" },
  btn:{ backgroundColor:"#007bff", paddingVertical:13, borderRadius:8, marginTop:6 },
  btnText:{ color:"#fff", fontSize:17, textAlign:"center", fontWeight:"700" },
   linkText:{ color:"#007bff", textAlign:"center", fontSize:14, fontWeight:"600" },
  error:{ color:"red", textAlign:"center", marginBottom:8 }
});