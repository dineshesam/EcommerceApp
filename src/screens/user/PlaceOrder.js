
import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createOrder } from "../../api/orderApi";
import { clearCart } from "../../redux/slices/cartSlice";
import { clearCheckoutTotals } from "../../redux/slices/checkoutSlice";
import { fetchProducts } from "../../redux/slices/productSlice";
import useDynamicStyles from "../../hooks/useDynamicStyles";
import { clearCartServer } from "../../api/cartApi";

// ✅ Toast helpers (compact bottom pill)
import { toastSuccess, toastError, toastInfo } from "../../utils/toast";
import { useTranslation } from "react-i18next";

export default function PlaceOrder({ navigation, route }) {
  const cart = useSelector((state) => state.cart);
  const checkout = useSelector((state) => state.checkout);
  const dispatch = useDispatch();
  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  const selectedAddress = route?.params?.address || null;
  const selectedAddressId = route?.params?.addressId || null;

  const [manualAddress, setManualAddress] = useState({
    name: "",
    phoneNo: "",
    pincode: "",
    state: "",
    city: "",
    buildingName: "",
    area: "",
    type: "home",
    location: "",
  });

  const placeholders = {
    name: t("order.fullName"),
    phoneNo: t("order.phoneNumber"),
    pincode: t("order.pincode"),
    state: t("order.state"),
    city: t("order.city"),
    buildingName: t("order.buildingName"),
    area: t("order.areaStreet"),
    location: t("order.landmarkOptional"),
  };

  // ✅ Only these fields should block placing the order
  const REQUIRED_FIELDS = ["name", "phoneNo", "pincode", "state", "city", "area"];
  const isRequired = (key) => REQUIRED_FIELDS.includes(key);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cart]
  );

  const displaySubtotal = checkout.subtotal || cartSubtotal;
  const displayDiscount = checkout.discount || 0;
  const displayPayable =
    checkout.finalTotal || Math.max(0, displaySubtotal - displayDiscount);
  const couponCode = checkout.couponCode || "";

  // ✅ Helpers
  const digitsOnly = (s = "") => String(s).replace(/\D/g, "");

  // ✅ Validate only required fields (rest remains optional)
  const validateManualAddress = (addr) => {
    const normalized = {
      name: addr?.name?.trim() ?? "",
      phoneNo: digitsOnly(addr?.phoneNo ?? ""),
      pincode: digitsOnly(addr?.pincode ?? ""),
      state: addr?.state?.trim() ?? "",
      city: addr?.city?.trim() ?? "",
      buildingName: addr?.buildingName?.trim() ?? "",
      area: addr?.area?.trim() ?? "",
      location: addr?.location?.trim() ?? "",
      type: addr?.type ?? "home",
    };

    const fieldErrMsgMap = {
      name: t("order.fullName"),
      phoneNo: t("order.phoneNumber"),
      pincode: t("order.pincode"),
      state: t("order.state"),
      city: t("order.city"),
      area: t("order.areaStreet"),
    };

    for (const key of REQUIRED_FIELDS) {
      const val = normalized[key];

      // Required empty check
      if (!val) {
        return { ok: false, msg: fieldErrMsgMap[key] || t("common.error.generic") };
      }

      // Format checks only for required fields (phone/pincode)
      if (key === "phoneNo" && String(val).length !== 10) {
        return { ok: false, msg: t("profile.validation.phone10") };
      }
      if (key === "pincode" && String(val).length !== 6) {
        return { ok: false, msg: t("profile.validation.pincode6") };
      }
    }

    return { ok: true };
  };

  const getErrMsg = (e) =>
    e?.response?.data?.message || e?.message || t("common.error.generic");

  const handlePlaceOrder = async () => {
    if (!cart.length) {
      toastInfo(t("cart.empty.title"), t("cart.empty.subtitle"));
      return;
    }

    // ✅ If no saved address selected, validate only required address fields
    if (!selectedAddressId && !selectedAddress) {
      const v = validateManualAddress(manualAddress);
      if (!v.ok) {
        toastError(t("order.addressIncomplete.title"), v.msg);
        return;
      }
    }

    try {
      const basePayload = selectedAddressId
        ? { paymentMethod: "cod", addressId: selectedAddressId }
        : { paymentMethod: "cod", address: manualAddress };

      const payload = {
        ...basePayload,
        items: cart.map((c) => ({ productId: c.product.id, qty: c.qty })),
        couponCode: couponCode || undefined,
        totals: {
          subtotal: displaySubtotal,
          discount: displayDiscount,
          finalTotal: displayPayable,
        },
      };

      const order = await createOrder(payload);

      // ✅ Clear server cart (await the API)
      await clearCartServer();

      // ✅ Clear local state
      dispatch(clearCart());
      dispatch(clearCheckoutTotals());
      dispatch(fetchProducts(1));

      const orderIdText = order?.id
        ? t("order.orderNumber", { id: order.id })
        : t("order.orderPlaced");
      toastSuccess(orderIdText, t("order.orderPlacedSubtitle"));

      navigation.replace("OrderSuccess", { order });
    } catch (err) {
      console.log("Place order error:", err?.response?.data || err.message);
      toastError(t("order.orderFailed.title"), getErrMsg(err));
    }
  };

  const goSelectAddress = () => {
    navigation.navigate("SelectAddress", { fromCheckout: true });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      keyboardShouldPersistTaps="always"  // ✅ keep keyboard open while typing/tapping
    >
      <Text style={styles.title}>{t("order.placeOrder")}</Text>

      {/* ---- Summary ---- */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          {t("order.items")}: {cart.length}
        </Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.summaryText}>
            {t("order.subtotal")}: ₹ {displaySubtotal.toLocaleString("en-IN")}
          </Text>
          {displayDiscount > 0 && (
            <Text style={[styles.summaryText, { color: colors.error }]}>
              {t("order.discount")}: - ₹ {displayDiscount.toLocaleString("en-IN")}
            </Text>
          )}
          <Text style={[styles.summaryText, { color: colors.priceText, fontWeight: "800" }]}>
            {t("order.payable")}: ₹ {displayPayable.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* ---- Address Section ---- */}
      {selectedAddress ? (
        <View style={styles.addressBox}>
          <Text style={styles.sectionTitle}>
            {t("order.deliverTo")} ({t("order.useSavedAddressShort")})
          </Text>
          <Text style={styles.addrLine}>
            {selectedAddress.name} ({selectedAddress.type})
          </Text>
          <Text style={styles.addrLine}>
            {selectedAddress.buildingName}, {selectedAddress.area}
          </Text>
          <Text style={styles.addrLine}>
            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
          </Text>
          <Text style={styles.addrLine}>📞 {selectedAddress.phoneNo}</Text>

          <TouchableOpacity style={styles.changeBtn} onPress={goSelectAddress} activeOpacity={0.85}>
            <Text style={styles.changeText}>{t("order.changeAddress")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.addressBox}>
            <View style={styles.addressHeaderRow}>
              <Text style={styles.sectionTitle}>{t("order.shippingAddress")}</Text>
              <TouchableOpacity onPress={goSelectAddress} activeOpacity={0.85}>
                <Text style={styles.linkText}>{t("order.useSavedAddress")}</Text>
              </TouchableOpacity>
            </View>

            {[
              "name",
              "phoneNo",
              "pincode",
              "state",
              "city",
              "buildingName", // optional
              "area",
              "location",     // optional
            ].map((key, idx, arr) => (
              <View key={key} style={{ marginBottom: 8 }}>
                {/* ✅ Label with asterisk for mandatory fields */}
                <Text style={styles.inputLabel}>
                  {placeholders[key]}
                  {isRequired(key) && <Text style={styles.requiredStar}> *</Text>}
                </Text>

                <TextInput
                  placeholder={placeholders[key]}
                  placeholderTextColor={colors.inputPlaceholder}
                  style={styles.input}
                  value={String(manualAddress[key] ?? "")}
                  onChangeText={(txt) =>
                    setManualAddress((prev) => ({ ...prev, [key]: txt }))
                  }
                  autoCapitalize={
                    key === "name" || key === "state" || key === "city" ? "words" : "none"
                  }
                  autoCorrect={false}
                  keyboardType={
                    key === "phoneNo" ? "phone-pad" :
                    key === "pincode" ? "number-pad" : "default"
                  }
                  returnKeyType={idx < arr.length - 1 ? "next" : "done"}
                  blurOnSubmit={false}
                />
              </View>
            ))}
          </View>
        </>
      )}

      {/* ---- Payment ---- */}
      <View style={styles.paymentBox}>
        <Text style={styles.sectionTitle}>{t("order.paymentMethod")}</Text>
        <Text style={styles.paymentText}>• {t("order.cod")}</Text>
      </View>

      {/* ---- Place Order Button ---- */}
      <TouchableOpacity
        style={styles.orderBtn}
        onPress={handlePlaceOrder}
        disabled={!cart.length}
        activeOpacity={0.85}
      >
        <Text style={styles.orderText}>
          {t("order.placeOrder")} • ₹ {displayPayable.toLocaleString("en-IN")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ------------- STYLES ------------- */
function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBg, padding: 12,marginBottom:75 },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 12, color: colors.primaryText },

    summaryBox: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.card,
      marginBottom: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    summaryText: { fontSize: 15, fontWeight: "600", color: colors.primaryText },

    sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: colors.primaryText },

    addressBox: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      marginBottom: 16,
      backgroundColor: colors.card,
    },
    addressHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    addrLine: { fontSize: 14, color: colors.secondaryText },

    // ✅ New: label + required star styles
    inputLabel: {
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 4,
      color: colors.primaryText,
    },
    requiredStar: {
      color: colors.brandAccent,
      fontWeight: "900",
      marginLeft: 2,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
      fontSize: 14,
      color: colors.primaryText,
      backgroundColor: colors.inputBg,
    },

    linkText: { color: colors.brandAccent, fontWeight: "700" },

    changeBtn: {
      marginTop: 10,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.brandAccent,
      backgroundColor: colors.inputBg,
    },
    changeText: { color: colors.brandAccent, fontWeight: "600", fontSize: 13 },

    paymentBox: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      marginBottom: 16,
      backgroundColor: colors.card,
    },
    paymentText: { fontSize: 14, color: colors.secondaryText },

    orderBtn: {
      backgroundColor: colors.ctaButtonBg,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 4,
    },
    orderText: {
      color: colors.ctaButtonText,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}
