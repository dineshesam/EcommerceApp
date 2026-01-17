
// Register.js
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
import useDynamicStyles from "../hooks/useDynamicStyles";

// --- Simple validators ---
const isValidName = (name) => {
  const trimmed = name.trim();
  // At least 2 chars, letters/spaces allowed
  return trimmed.length >= 2 && /^[A-Za-z ]+$/.test(trimmed);
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const isValidPassword = (pwd) => {
  // Min 6, at least one letter and one number (adjust as needed)
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(pwd);
};

export default function Register() {
  const navigation = useNavigation();
  const { colors } = useDynamicStyles();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UX state
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Field-level error messages
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Validate on blur or submit
  const validateAll = () => {
    let ok = true;

    if (!isValidName(name)) {
      setNameError("Enter a valid full name (letters & spaces, min 2 chars).");
      ok = false;
    } else {
      setNameError("");
    }

    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      ok = false;
    } else {
      setEmailError("");
    }

    if (!isValidPassword(password)) {
      setPasswordError("Password must be 6+ chars and include a letter & a number.");
      ok = false;
    } else {
      setPasswordError("");
    }

    return ok;
  };

  const handleRegister = async () => {
    setServerError("");

    // Client-side validation
    const ok = validateAll();
    if (!ok) return;

    try {
      setLoading(true);

      // Backend: POST /auth/register
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password, // backend hashes it
      });

      const token = res?.data?.token;
      const user = res?.data?.user;

      if (token && user) {
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("userData", JSON.stringify(user));

        // Role-based routing
        if (user.role === "admin") {
          navigation.replace("AdminTabs");
        } else {
          navigation.replace("UserTabs");
        }
      } else {
        setServerError("Registration failed. Invalid server response.");
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || "Could not register user.");
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register a new account</Text>
      </View>

      {/* Card/Form */}
      <View style={styles.form}>
        {/* Name */}
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (nameError) setNameError(""); // clear on change
          }}
          onBlur={() => {
            if (!isValidName(name)) {
              setNameError("Enter a valid full name (letters & spaces, min 2 chars).");
            }
          }}
          style={[styles.input, nameError && styles.inputErrorBorder]}
          placeholderTextColor={colors.inputPlaceholder}
        />
        {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}

        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (emailError) setEmailError(""); // clear on change
          }}
          onBlur={() => {
            if (!isValidEmail(email)) {
              setEmailError("Enter a valid email address.");
            }
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, emailError && styles.inputErrorBorder]}
          placeholderTextColor={colors.inputPlaceholder}
        />
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        {/* Password + Show/Hide */}
        <View>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (passwordError) setPasswordError(""); // clear on change
            }}
            secureTextEntry={!showPassword}
            style={[styles.input, passwordError && styles.inputErrorBorder]}
            placeholderTextColor={colors.inputPlaceholder}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((s) => !s)}
            activeOpacity={0.8}
          >
            <Text style={styles.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

        {/* Server error */}
        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color={colors.ctaButtonText} />
          ) : (
            <Text style={styles.btnText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Link to Login */}
        <TouchableOpacity
          onPress={() => navigation.replace("Login")}
          style={styles.linkWrapper}
          activeOpacity={0.8}
        >
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkHighlight}>Login</Text>
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
      fontSize: 26,
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
    inputErrorBorder: {
      borderColor: colors.error,
    },
    fieldError: {
      color: colors.error,
      fontSize: 12,
      marginTop: -6,
      marginBottom: 8,
    },
    serverError: {
      color: colors.error,
      textAlign: "center",
      marginBottom: 8,
      fontSize: 14,
    },
    eyeButton: {
      position: "absolute",
      right: 10,
      top: 10,
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: colors.inputBg,
    },
    eyeText: {
      color: colors.brandAccent,
      fontWeight: "700",
      fontSize: 12,
    },
    btn: {
      backgroundColor: colors.ctaButtonBg,
      paddingVertical: 14,
      borderRadius: 8,
      marginTop: 8,
    },
    btnText: {
      color: colors.ctaButtonText,
      textAlign: "center",
      fontSize: 17,
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
  });
}
