import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { loginApi } from "../api/authApi";
import { setItem } from "../utils/storage";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) return alert("Enter email & password");
    setLoading(true);

    try {
      const data = await loginApi(email, password);

      dispatch(setCredentials({
        user: data.user,
        token: data.token,
        isAdmin: data.user.role === "admin"
      }));

      await setItem("auth", data); // Persist login

      navigation.replace(data.user.role === "admin" ? "AdminTabs" : "UserTabs");

    } catch (err) {
      alert(err.msg || "Login failed");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail} />

      <TextInput placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword} />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        {loading ? <ActivityIndicator color="#fff"/> :
          <Text style={styles.btnText}>Login</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:"center", padding:20 },
  title:{ fontSize:28, fontWeight:"bold", textAlign:"center", marginBottom:30 },
  input:{ borderWidth:1, borderColor:"#aaa", borderRadius:8, padding:12, marginBottom:15 },
  btn:{ backgroundColor:"black", padding:14, borderRadius:8, alignItems:"center" },
  btnText:{ color:"#fff", fontSize:18, fontWeight:"600" }
});
