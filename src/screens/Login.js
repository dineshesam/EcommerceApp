
// Login.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axiosConfig";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setWishlist } from "../redux/slices/wishlistSlice";
import { setCart } from "../redux/slices/cartSlice";
import { fetchWishlistProducts } from "../api/wishlistApi";
import { fetchCartFromServer } from "../api/cartApi";
import useDynamicStyles from "../hooks/useDynamicStyles";

export default function Login() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colors } = useDynamicStyles();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bootstrapUserData = async () => {
    try {
      const [wishlist, cart] = await Promise.all([
        fetchWishlistProducts(),
        fetchCartFromServer(),
      ]);
      dispatch(setWishlist(wishlist));
      dispatch(setCart(cart));
    } catch (e) {
      console.log("post-login bootstrap failed:", e?.message || e);
      // You can show a toast/snackbar here if you have one
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

      const res = await api.post("/auth/login", { email, password }); // Expected: { token, user }
      const token = res?.data?.token;
      const user = res?.data?.user;

      if (token && user) {
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(user));

        // Fetch wishlist & cart BEFORE navigating
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

  const styles = createStyles(colors);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      {/* Card/form */}
      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor={colors.inputPlaceholder}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.ctaButtonText} />
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkWrapper}
          onPress={() => navigation.replace("Register")}
          activeOpacity={0.8}
        >
          <Text style={styles.linkText}>
            New user?{" "}
            <Text style={styles.linkHighlight}>Create an account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBg,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    header: {
      marginBottom: 24,
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.primaryText,
    },
    subtitle: {
      fontSize: 15,
      color: colors.secondaryText,
      marginTop: 6,
    },
    form: {
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.primaryText,
      marginBottom: 12,
      backgroundColor: colors.primaryBg,
    },
    btn: {
      backgroundColor: colors.ctaButtonBg,
      paddingVertical: 14,
      borderRadius: 8,
      marginTop: 8,
    },
    btnText: {
      color: colors.ctaButtonText,
      fontSize: 17,
      textAlign: "center",
      fontWeight: "700",
    },
    linkWrapper: {
      marginTop: 16,
      alignItems: "center",
    },
    linkText: {
      color: colors.secondaryText,
      fontSize: 14,
    },
    linkHighlight: {
      color: colors.brandAccent,
      fontWeight: "700",
    },
    error: {
      color: colors.error,
      textAlign: "center",
      marginBottom: 8,
      fontSize: 14,
    },
  });
}
