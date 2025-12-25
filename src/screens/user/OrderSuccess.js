
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import useDynamicStyles from "../../hooks/useDynamicStyles";
import { useTranslation } from "react-i18next";

export default function OrderSuccess({ route, navigation }) {
  const { order } = route.params || {};
  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  return (
    <View style={styles.box}>
      {/* Title */}
      <Text style={styles.big}>✅ {t("order.orderPlaced")}</Text>

      {/* Optional subtitle */}
      <Text style={styles.small}>{t("order.orderPlacedSubtitle")}</Text>

      {/* Order ID chip */}
      {order?.id && (
        <View style={styles.orderChip} accessibilityRole="text">
          <Text style={styles.orderChipText}>
            {t("order.orderNumber", { id: order.id })}
          </Text>
        </View>
      )}

      {/* View Orders */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Orders")}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("order.viewMyOrders")}
      >
        <Text style={styles.link}>{t("order.viewMyOrders")} →</Text>
      </TouchableOpacity>

      {/* Back to Home */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        style={styles.homeBtn}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t("order.backToHome")}
      >
        <Text style={styles.homeText}>{t("order.backToHome")}</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    box: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryBg,
      paddingHorizontal: 24,
    },
    big: { fontSize: 26, fontWeight: "800", color: colors.primaryText },
    small: { fontSize: 14, marginTop: 6, color: colors.secondaryText },

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
      color: colors.success,
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
}
