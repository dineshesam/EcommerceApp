
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert
} from "react-native";
import { getMyAddresses, removeAddress } from "../../api/addressApi";
import { useNavigation } from "@react-navigation/native";
import useDynamicStyles from "../../hooks/useDynamicStyles";
import { useTranslation } from "react-i18next";

export default function ManageAddress() {
  const [addresses, setAddresses] = useState([]);
  const navigation = useNavigation();
  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  const load = async () => {
    try {
      const data = await getMyAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("❌ Error loading address:", err?.response?.data || err?.message);
      Alert.alert(t("profile.error.title"), t("order.addressesLoadFailed"));
      setAddresses([]);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load); // Reload on return
    return unsubscribe;
  }, [navigation]);

  const deleteAddr = (id) => {
    Alert.alert(
      t("order.deleteAddressConfirmTitle"),
      t("order.deleteAddressConfirmMsg"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete", { defaultValue: "Delete" }),
          style: "destructive",
          onPress: async () => {
            try {
              await removeAddress(id);
              load(); // refresh list
            } catch (e) {
              Alert.alert(
                t("profile.error.title"),
                e?.response?.data?.message || e?.message || t("order.deleteAddressFailed")
              );
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name} ({item.type || t("order.addressTypeNA")})</Text>
      <Text style={styles.line}>{item.buildingName}, {item.area}</Text>
      <Text style={styles.line}>{item.city}, {item.state} - {item.pincode}</Text>
      {!!item.phoneNo && <Text style={styles.line}>📞 {item.phoneNo}</Text>}

      <View style={styles.row}>
        {/* EDIT */}
        <TouchableOpacity
          style={[styles.btn, styles.edit]}
          onPress={() => navigation.navigate("AddAddress", { editMode: true, address: item })}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t("common.edit", { defaultValue: "Edit" })}
        >
          <Text style={styles.btnTxt}>{t("common.edit", { defaultValue: "Edit" })}</Text>
        </TouchableOpacity>

        {/* DELETE */}
        <TouchableOpacity
          style={[styles.btn, styles.delete]}
          onPress={() => deleteAddr(item.id)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t("common.delete", { defaultValue: "Delete" })}
        >
          <Text style={styles.btnTxt}>🗑 {t("common.delete", { defaultValue: "Delete" })}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("order.manageAddressesTitle", { defaultValue: "My Saved Addresses" })}</Text>

      <FlatList
        data={addresses}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>{t("order.noSavedAddresses")}</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddAddress")}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("order.addNewAddress")}
      >
        <Text style={styles.addTxt}>➕ {t("order.addNewAddress")}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- STYLES ---------- */
function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, padding: 14, backgroundColor: colors.primaryBg },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 10, color: colors.primaryText },

    card: {
      padding: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      marginBottom: 12,
      backgroundColor: colors.card,
    },
    name: { fontSize: 16, fontWeight: "700", color: colors.primaryText },
    line: { fontSize: 13, color: colors.secondaryText, marginTop: 2 },

    row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },

    btn: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 6,
      alignItems: "center",
    },
    edit: { backgroundColor: colors.ctaButtonBg },
    delete: { backgroundColor: colors.error },

    btnTxt: { color: colors.ctaButtonText, fontWeight: "700" },

    addBtn: {
      backgroundColor: colors.inventoryInStock, // or colors.ctaButtonBg for consistency
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
      marginBottom: 70,
      alignItems: "center",
    },
    addTxt: { color: colors.ctaButtonText, textAlign: "center", fontWeight: "700", fontSize: 15 },

    empty: { textAlign: "center", marginTop: 30, color: colors.secondaryText },
  });
}
