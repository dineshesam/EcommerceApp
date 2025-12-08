import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axiosConfig";
import { useNavigation } from "@react-navigation/native";

export default function Register() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Backend: POST /auth/register
      const res = await api.post("/auth/register", {
        name,
        email,
        password,    // backend hashes it
      });

      if (res?.data?.token && res?.data?.user) {
        await AsyncStorage.setItem("userToken", res.data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));

        // Role-based routing
        if (res.data.user.role === "admin") {
          navigation.replace("AdminTabs");
        } else {
          navigation.replace("UserTabs");
        }
      } else {
        setError("Registration failed. Invalid server response.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Could not register user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account 📝</Text>
      <Text style={styles.subtitle}>Register a new account</Text>

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

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

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> :
          <Text style={styles.btnText}>Sign Up</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace("Login")} style={{ marginTop: 18 }}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:"center", padding:25, backgroundColor:"#fff" },
  title:{ fontSize:26, fontWeight:"800", textAlign:"center" },
  subtitle:{ fontSize:15, color:"#555", textAlign:"center", marginBottom:20 },
  input:{
    borderWidth:1, borderColor:"#bbb", borderRadius:8,
    padding:12, marginBottom:12, fontSize:15
  },
  btn:{
    backgroundColor:"#28a745", padding:14, borderRadius:8, marginTop:5
  },
  btnText:{ color:"#fff", textAlign:"center", fontSize:17, fontWeight:"700" },
  error:{ color:"red", textAlign:"center", marginBottom:8 },
  linkText:{ textAlign:"center", color:"#007bff", fontSize:14, fontWeight:"600" }
});
