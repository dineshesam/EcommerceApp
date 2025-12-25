
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
import { useTranslation } from "react-i18next";

export default function ChangePassword() {
  const navigation = useNavigation();

  const [changePassword, setChangePassword] = useState(""); // current password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // show/hide toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  const validate = () => {
    if (!changePassword || !newPassword || !confirmPassword) {
      Alert.alert(t("profile.validation.title"), t("profile.password.allRequired"));
      return false;
    }
    if (newPassword.length < 8) {
      Alert.alert(t("profile.validation.title"), t("profile.password.minLength"));
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("profile.validation.title"), t("profile.password.mismatch"));
      return false;
    }
    if (newPassword === changePassword) {
      Alert.alert(t("profile.validation.title"), t("profile.password.sameAsOld"));
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
        Alert.alert(t("profile.sessionExpired.title"), t("profile.sessionExpired.msg"));
        navigation.replace("Login");
        return;
      }

      await api.post(
        "/auth/change-password",
        { currentPassword: changePassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        t("profile.success.title"),
        t("profile.password.changedSuccess"),
        [
          {
            text: t("common.ok", { defaultValue: "OK" }),
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
        t("profile.error.title"),
        err?.response?.data?.message || err?.message || t("profile.password.changeFailed")
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
      <Text style={styles.header}>{t("profile.changePassword")}</Text>

      {/* Current Password */}
      <Text style={styles.label}>{t("profile.currentPassword")}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          value={changePassword}
          onChangeText={setChangePassword}
          style={[styles.input, { flex: 1 }]}
          placeholder={t("profile.password.enterCurrent")}
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
          accessibilityRole="button"
          accessibilityLabel={showCurrent ? t("profile.hide") : t("profile.show")}
        >
          <Text style={styles.showText}>{showCurrent ? t("profile.hide") : t("profile.show")}</Text>
        </TouchableOpacity>
      </View>

      {/* New Password */}
      <Text style={styles.label}>{t("profile.newPassword")}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          style={[styles.input, { flex: 1 }]}
          placeholder={t("profile.password.enterNew")}
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
          accessibilityRole="button"
          accessibilityLabel={showNew ? t("profile.hide") : t("profile.show")}
        >
          <Text style={styles.showText}>{showNew ? t("profile.hide") : t("profile.show")}</Text>
        </TouchableOpacity>
      </View>

      {/* Confirm New Password */}
      <Text style={styles.label}>{t("profile.confirmNewPassword")}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, { flex: 1 }]}
          placeholder={t("profile.password.reenterNew")}
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
          accessibilityRole="button"
          accessibilityLabel={showConfirm ? t("profile.hide") : t("profile.show")}
        >
          <Text style={styles.showText}>{showConfirm ? t("profile.hide") : t("profile.show")}</Text>
        </TouchableOpacity>
      </View>

      {/* Save / Update */}
      <TouchableOpacity
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
        onPress={handleChangePassword}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("profile.updatePassword")}
      >
        <Text style={styles.saveText}>
          {loading ? t("profile.updating") : t("profile.updatePassword")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------- STYLES ---------- */
function createStyles(colors) {
  return StyleSheet.create({
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
}
