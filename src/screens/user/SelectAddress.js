
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { getMyAddresses } from "../../api/addressApi";
import useDynamicStyles from "../../hooks/useDynamicStyles";

export default function SelectAddress({ navigation, route }) {
  const [addresses, setAddresses] = useState([]);
  const fromCheckout = route.params?.fromCheckout || false;

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  const load = async () => {
    try {
      const data = await getMyAddresses();
      console.log("📌 My addresses:", data);
      setAddresses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("❌ Address fetch error:", e.response?.data || e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const choose = (addr) => {
    navigation.navigate("PlaceOrder", { addressId: addr.id, address: addr });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => choose(item)} activeOpacity={0.85}>
      <Text style={styles.name}>{item.name} ({item.type})</Text>
      <Text style={styles.line}>{item.buildingName}, {item.area}</Text>
      <Text style={styles.line}>{item.city}, {item.state} - {item.pincode}</Text>
      {!!item.phoneNo && <Text style={styles.line}>📞 {item.phoneNo}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.head}>My Saved Addresses</Text>

      {fromCheckout && (
        <Text style={styles.hint}>
          Select an address to use for this order
        </Text>
      )}

      <FlatList
        data={addresses}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("AddAddress")}
        activeOpacity={0.85}
      >
        <Text style={styles.txt}>➕ Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBg, padding: 10 },
    head: { fontSize: 20, fontWeight: "700", marginBottom: 8, color: colors.primaryText },
    hint: { fontSize: 13, color: colors.brandAccent, marginBottom: 10 },

    card: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
    },
    name: { fontSize: 16, fontWeight: "800", color: colors.primaryText },
    line: { fontSize: 13, color: colors.secondaryText, marginTop: 2 },

    btn: {
      backgroundColor: colors.ctaButtonBg,
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
      alignItems: "center",
    },
    txt: { color: colors.ctaButtonText, fontWeight: "700" },
  });
