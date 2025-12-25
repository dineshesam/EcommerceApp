
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { addAddress, updateAddress } from "../../api/addressApi";
import { useNavigation, useRoute } from "@react-navigation/native";
import useDynamicStyles from "../../hooks/useDynamicStyles";
import { useTranslation } from "react-i18next";

export default function AddAddress() {
  const navigation = useNavigation();
  const route = useRoute();

  const editMode = route.params?.editMode || false;
  const oldData = route.params?.address || null;

  const [form, setForm] = useState({
    name: "",
    phoneNo: "",
    pincode: "",
    state: "",
    city: "",
    buildingName: "",
    area: "",
    type: "",
    location: ""
  });

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  // Localized placeholders
  const placeholders = {
    name: t("order.fullName"),
    phoneNo: t("order.phoneNumber"),
    pincode: t("order.pincode"),
    state: t("order.state"),
    city: t("order.city"),
    buildingName: t("order.buildingName"),
    area: t("order.areaStreet"),
    type: t("order.addressTypeHint", { defaultValue: "Address Type (home/office)" }),
    location: t("order.landmarkOptional")
  };

  useEffect(() => {
    if (editMode && oldData) {
      // Ensure all values are strings so placeholders behave predictably
      const normalized = Object.fromEntries(
        Object.entries(oldData).map(([k, v]) => [k, String(v ?? "")])
      );
      setForm(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    // minimal validation (kept as-is)
    if (!form.name?.trim()) return;
    if (!form.phoneNo?.trim()) return;
    if (!form.pincode?.trim()) return;

    const payload = {
      ...form,
      phoneNo: String(form.phoneNo ?? ""),
      pincode: String(form.pincode ?? "")
    };

    if (editMode) {
      await updateAddress(oldData.id, payload);
    } else {
      await addAddress(payload);
    }

    navigation.goBack();
  };

  const fields = Object.keys(form);

  // Title & Button (localized)
  const titleText = editMode
    ? t("order.editAddress", { defaultValue: "Edit Address" })
    : t("profile.addAddress", { defaultValue: "Add Address" });

  const buttonText = editMode
    ? t("profile.saveChanges", { defaultValue: "Save Changes" })
    : t("order.addNewAddress", { defaultValue: "Add Address" });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{titleText}</Text>

      {fields.map((key, idx) => (
        <TextInput
          key={key}
          placeholder={placeholders[key]}
          placeholderTextColor={colors.inputPlaceholder}
          style={styles.input}
          value={String(form[key] ?? "")}
          onChangeText={(txt) => setForm({ ...form, [key]: txt })}
          autoCapitalize={
            key === "name" || key === "state" || key === "city" ? "words" : "none"
          }
          autoCorrect={false}
          keyboardType={
            key === "phoneNo" ? "phone-pad" :
            key === "pincode" ? "number-pad" : "default"
          }
          returnKeyType={idx < fields.length - 1 ? "next" : "done"}
          blurOnSubmit={false}
        />
      ))}

      <TouchableOpacity style={styles.btn} onPress={save} activeOpacity={0.85}>
        <Text style={styles.btnTxt}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- STYLES ---------- */
function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, padding: 14, backgroundColor: colors.primaryBg },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 12, color: colors.primaryText },

    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
      fontSize: 14,
      color: colors.primaryText,
      backgroundColor: colors.inputBg,
    },

    btn: {
      backgroundColor: colors.ctaButtonBg,
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
      alignItems: "center",
    },
    btnTxt: { color: colors.ctaButtonText, textAlign: "center", fontWeight: "700", fontSize: 16 }
  });
}
