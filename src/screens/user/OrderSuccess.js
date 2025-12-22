
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import useDynamicStyles from "../../hooks/useDynamicStyles";

export default function OrderSuccess({ route, navigation }) {
  const { order } = route.params || {};
  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  return (
    <View style={styles.box}>
      <Text style={styles.big}>✅ Order Placed!</Text>

      {/* Order ID chip (optional visual highlight) */}
      {order?.id && (
        <View style={styles.orderChip}>
          <Text style={styles.orderChipText}>Order ID: {order.id}</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => navigation.navigate("Orders")} activeOpacity={0.85}>
        <Text style={styles.link}>View My Orders →</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        style={styles.homeBtn}
        activeOpacity={0.85}
      >
        <Text style={styles.homeText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    box: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryBg,
      paddingHorizontal: 24,
    },
    big: { fontSize: 26, fontWeight: "800", color: colors.primaryText },

    // Subheadline shown when needed; you can use it below the title if preferred
    small: { fontSize: 14, marginTop: 6, color: colors.secondaryText },

    // Order ID chip
    orderChip: {
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    orderChipText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.success, // success accent
    },

    link: { color: colors.brandAccent, marginTop: 12, fontSize: 16, fontWeight: "600" },

    homeBtn: {
      marginTop: 16,
      backgroundColor: colors.ctaButtonBg,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    homeText: { color: colors.ctaButtonText, fontWeight: "700", fontSize: 15 },
  });
