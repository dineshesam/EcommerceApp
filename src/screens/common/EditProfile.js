
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import api from "../../api/axiosConfig"; // axios instance with baseURL
import useDynamicStyles from "../../hooks/useDynamicStyles";

export default function EditProfile() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        const user = JSON.parse(data);
        setName(user.name || "");
        setAvatar(user.avatar || null);
      }
    } catch (e) {
      console.log("Failed to load user:", e?.message);
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.7
    });

    if (result?.didCancel) return;
    if (result?.assets && result.assets.length > 0) {
      const uri = result.assets[0]?.uri;
      if (uri) setAvatar(uri);
    }
  };

  // ---- Update name on server (keep avatar local) ----
  const updateNameApi = async (newName) => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      throw new Error("Unauthorized: Please login again.");
    }
    const res = await api.patch(
      "/auth/update-name",
      { name: newName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; // { message, user }
  };

  const saveProfile = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return Alert.alert("Validation", "Name cannot be empty");
    }
    if (trimmed.length < 2) {
      return Alert.alert("Validation", "Name must be at least 2 characters");
    }

    try {
      setLoading(true);

      // 1) Update on server (name only)
      const { user: updatedFromServer } = await updateNameApi(trimmed);

      // 2) Update local storage: merge server user with local avatar
      const existingRaw = await AsyncStorage.getItem("userData");
      const existing = existingRaw ? JSON.parse(existingRaw) : {};

      const mergedUser = {
        ...existing,
        ...updatedFromServer, // id, name, email, role from server are source of truth
        avatar // keep avatar locally (not stored on server yet)
      };

      await AsyncStorage.setItem("userData", JSON.stringify(mergedUser));

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile";
      if (/unauthorized|token|jwt/i.test(msg)) {
        Alert.alert("Session expired", "Please login again.", [
          {
            text: "OK",
            onPress: async () => {
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("userData");
              navigation.replace("Login");
            }
          }
        ]);
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = { uri: avatar || "https://i.pravatar.cc/150?img=3" };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      {/* Avatar (local-only for now) */}
      <TouchableOpacity style={styles.avatarBox} onPress={pickImage} activeOpacity={0.85}>
        <View style={styles.avatarRing}>
          <Image source={avatarSrc} style={styles.avatar} />
        </View>
        <Text style={styles.changePhoto}>Change Photo</Text>
      </TouchableOpacity>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor={colors.inputPlaceholder}
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={saveProfile}
      />

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
        onPress={saveProfile}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.saveText}>
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- STYLES ---------- */
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.primaryBg
    },
    header: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 20,
      color: colors.primaryText
    },
    avatarBox: {
      alignItems: "center",
      marginBottom: 20
    },
    avatarRing: {
      width: 128,
      height: 128,
      borderRadius: 64,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.inputBg,
      borderWidth: 2,
      borderColor: colors.inputBorder
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60
    },
    changePhoto: {
      marginTop: 8,
      fontSize: 14,
      color: colors.brandAccent,
      fontWeight: "600"
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      color: colors.primaryText
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 20,
      color: colors.primaryText,
      backgroundColor: colors.inputBg
    },
    saveBtn: {
      backgroundColor: colors.ctaButtonBg,
      paddingVertical: 14,
      borderRadius: 8
    },
    saveBtnDisabled: {
      backgroundColor: colors.disabledButtonBg
    },
    saveText: {
      color: colors.ctaButtonText,
      fontSize: 17,
      fontWeight: "700",
      textAlign: "center"
    }
  });
