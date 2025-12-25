
// Profile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next"; // ⬅️ add this
import useDynamicStyles from "../../hooks/useDynamicStyles";
import LanguageSwitcher from "../../components/LanguageSwitcher";

export default function Profile() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  const { t, i18n } = useTranslation(); // ⬅️ add this

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) setUser(JSON.parse(data));
    } catch (e) {
      console.log("Failed to load user:", e?.message);
    }
  };

  const logout = async () => {
    Alert.alert(
      t("profile.confirmLogoutTitle", "Confirm Logout"),
      t("profile.confirmLogoutMsg", "Are you sure you want to logout?"),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        {
          text: t("profile.logout", "Logout"),
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("userData");
              navigation.replace("Login");
            } catch (e) {
              console.log("Logout error:", e?.message);
            }
          }
        }
      ]
    );
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.primaryBg }]}>
        <Text style={{ color: colors.secondaryText }}>
          {t("common.loading", "Loading...")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={() => navigation.navigate("EditProfile")}
        activeOpacity={0.85}
      >
        <Image
          source={{
            uri: user.avatar || "https://i.pravatar.cc/150?img=3"
          }}
          style={styles.avatar}
        />
        <Text style={styles.editDp}>{t("profile.editPhoto", "Edit")}</Text>
      </TouchableOpacity>

      {/* User Info */}
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <Text style={styles.roleTag}>
        {user.role === "admin" ? t("profile.admin", "Admin") : t("profile.customer", "Customer")}
      </Text>

      {/* Options */}
      <ProfileOption
        label={t("profile.editProfile", "Edit Profile")}
        onPress={() => navigation.navigate("EditProfile")}
        colors={colors}
      />

      <ProfileOption
        label={t("profile.changePassword", "Change Password")}
        onPress={() => navigation.navigate("ChangePassword")}
        colors={colors}
      />

      <ProfileOption
        label={t("profile.manageAddress", "Manage Address")}
        onPress={() => navigation.navigate("ManageAddress")}
        colors={colors}
      />

      <ProfileOption
        label={t("profile.myOrders", "My Orders")}
        onPress={() => navigation.navigate("Orders")}
        colors={colors}
      />

      {/* Logout */}
      <TouchableOpacity style={styles.logout} onPress={logout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>{t("profile.logout", "Logout")}</Text>
      </TouchableOpacity>

      {/* Language buttons BELOW Logout */}
      
<LanguageSwitcher
  colors={colors}
  style={{ marginTop: 16 }}
  showLabel={true}
  compact={false}
  persistSelection={true}
  languages={["en", "hi", "te"]}
/>

    </View>
  );
}

/* ---------- Reusable Option ---------- */
function ProfileOption({ label, onPress, colors }) {
  const styles = optionStyles(colors);
  return (
    <TouchableOpacity style={styles.option} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.optionText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- STYLES ---------- */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      paddingTop: 40,
      backgroundColor: colors.primaryBg
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    avatarContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: "hidden",
      marginBottom: 15,
      position: "relative",
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder
    },
    avatar: {
      width: "100%",
      height: "100%"
    },
    editDp: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      textAlign: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
      color: "#fff",
      paddingVertical: 4,
      fontSize: 12
    },
    name: {
      fontSize: 22,
      fontWeight: "700",
      marginTop: 5,
      color: colors.primaryText
    },
    email: {
      fontSize: 15,
      color: colors.secondaryText
    },
    roleTag: {
      backgroundColor: colors.brandAccent,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      color: colors.ctaButtonText,
      marginVertical: 15,
      overflow: "hidden"
    },
    logout: {
      marginTop: 30,
      backgroundColor: colors.error,
      width: "90%",
      paddingVertical: 12,
      borderRadius: 8
    },
    logoutText: {
      color: colors.ctaButtonText,
       fontFamily:'NotoSansTelugu_ExtraCondensed-Black',
      textAlign: "center",
      fontSize: 17,
      fontWeight: "600"
    },

    /* ---- Language row styles ---- */
    langRow: {
      width: "90%",
      marginTop: 16
    },
    langLabel: {
      fontSize: 14,
      marginBottom: 8
    },
    langButtons: {
      flexDirection: "row",
      gap: 10
    },
    langBtn: {
      flex: 1,
      paddingVertical: 10,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: colors.inputBorder,
      alignItems: "center",
      backgroundColor: colors.inputBg
    },
    langBtnText: {
      fontSize: 14,
      fontWeight: "700"
    }
  });

const optionStyles = (colors) =>
  StyleSheet.create({
    option: {
      width: "90%",
      padding: 15,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBg,
      marginTop: 10
    },
    optionText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primaryText
    }
  });
