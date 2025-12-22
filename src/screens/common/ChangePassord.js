
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import api from "../../api/axiosConfig"; // use your axios instance
import useDynamicStyles from "../../hooks/useDynamicStyles";

export default function ChangePassword() {
  const navigation = useNavigation();

  const [changePassword, setChangePassword] = useState(""); // old password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // show/hide toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  const validate = () => {
    if (!changePassword || !newPassword || !confirmPassword) {
      Alert.alert("Validation", "All fields are required");
      return false;
    }
    if (newPassword.length < 8) {
      Alert.alert("Validation", "Password must be at least 8 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "Passwords do not match");
      return false;
    }
    if (newPassword === changePassword) {
      Alert.alert("Validation", "New password must be different from current password");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Session expired", "Please login again.");
        navigation.replace("Login");
        return;
      }

      await api.post(
        "/auth/change-password",
        { currentPassword: changePassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        "Success",
        "Password changed successfully. Please login again.",
        [
          {
            text: "OK",
            onPress: async () => {
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("userData");
              navigation.replace("Login");
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || err?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="always"
    >
      <Text style={styles.header}>Change Password</Text>

      <Text style={styles.label}>Current Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          value={changePassword}
          onChangeText={setChangePassword}
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter current password"
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={!showCurrent}
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          returnKeyType="next"
          textContentType="password"
          importantForAutofill="yes"
        />
        <TouchableOpacity
          style={styles.showBtn}
          onPress={() => setShowCurrent(v => !v)}
          activeOpacity={0.85}
        >
          <Text style={styles.showText}>{showCurrent ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>New Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter new password"
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={!showNew}
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          returnKeyType="next"
          textContentType="password"
          importantForAutofill="yes"
        />
        <TouchableOpacity
          style={styles.showBtn}
          onPress={() => setShowNew(v => !v)}
          activeOpacity={0.85}
        >
          <Text style={styles.showText}>{showNew ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Confirm New Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, { flex: 1 }]}
          placeholder="Re-enter new password"
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          autoCorrect={false}
          blurOnSubmit={false}
          returnKeyType="done"
          onSubmitEditing={handleChangePassword}
          textContentType="password"
          importantForAutofill="yes"
        />
        <TouchableOpacity
          style={styles.showBtn}
          onPress={() => setShowConfirm(v => !v)}
          activeOpacity={0.85}
        >
          <Text style={styles.showText}>{showConfirm ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
        onPress={handleChangePassword}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.saveText}>
          {loading ? "Updating..." : "Update Password"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------- STYLES ---------- */
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBg
    },
    header: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 20,
      color: colors.primaryText
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
      marginBottom: 16,
      color: colors.primaryText,
      backgroundColor: colors.inputBg
    },
    passwordRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8
    },
    showBtn: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBg
    },
    showText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.brandAccent
    },
    saveBtn: {
      backgroundColor: colors.ctaButtonBg,
      paddingVertical: 14,
      borderRadius: 8,
      marginTop: 10
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
