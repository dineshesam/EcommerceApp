
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

export default function PlaceOrder({ navigation, route }) {
  const cart = useSelector((state) => state.cart);
  const checkout = useSelector((state) => state.checkout);
  const dispatch = useDispatch();

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

  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);

  const placeholders = {
    name: "Full Name",
    phoneNo: "Phone Number",
    pincode: "Pincode",
    state: "State",
    city: "City",
    buildingName: "Building / Flat Name",
    area: "Area / Street",
    location: "Landmark (optional)",
  };

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cart]
  );

  const displaySubtotal = checkout.subtotal || cartSubtotal;
  const displayDiscount = checkout.discount || 0;
  const displayPayable =
    checkout.finalTotal || Math.max(0, displaySubtotal - displayDiscount);
  const couponCode = checkout.couponCode || "";

  const handlePlaceOrder = async () => {
    if (!cart.length) {
      console.log("Cart empty, cannot place order");
      return;
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

      // Reset local state after successful order
      dispatch(clearCart());
      dispatch(clearCheckoutTotals());
      dispatch(fetchProducts(1));

      navigation.replace("OrderSuccess", { order });
    } catch (err) {
      console.log("Place order error:", err?.response?.data || err.message);
    }
  };

  const goSelectAddress = () => {
    navigation.navigate("SelectAddress", { fromCheckout: true });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Place Order</Text>

      {/* ---- Summary ---- */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Items: {cart.length}</Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.summaryText}>
            Subtotal: ₹ {displaySubtotal.toLocaleString("en-IN")}
          </Text>
          {displayDiscount > 0 && (
            <Text style={[styles.summaryText, { color: colors.error }]}>
              Discount: - ₹ {displayDiscount.toLocaleString("en-IN")}
            </Text>
          )}
          <Text style={[styles.summaryText, { color: colors.priceText, fontWeight: "800" }]}>
            Payable: ₹ {displayPayable.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* ---- Address Section ---- */}
      {selectedAddress ? (
        <View style={styles.addressBox}>
          <Text style={styles.sectionTitle}>Deliver To (Saved Address)</Text>
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
            <Text style={styles.changeText}>Change Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.addressBox}>
            <View style={styles.addressHeaderRow}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <TouchableOpacity onPress={goSelectAddress} activeOpacity={0.85}>
                <Text style={styles.linkText}>Use Saved Address</Text>
              </TouchableOpacity>
            </View>

            {[
              "name",
              "phoneNo",
              "pincode",
              "state",
              "city",
              "buildingName",
              "area",
              "location",
            ].map((key, idx, arr) => (
              <TextInput
                key={key}
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
            ))}
          </View>
        </>
      )}

      {/* ---- Payment ---- */}
      <View style={styles.paymentBox}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <Text style={styles.paymentText}>• Cash on Delivery (COD)</Text>
      </View>

      {/* ---- Place Order Button ---- */}
      <TouchableOpacity
        style={styles.orderBtn}
        onPress={handlePlaceOrder}
        disabled={!cart.length}
        activeOpacity={0.85}
      >
        <Text style={styles.orderText}>
          Place Order • ₹ {displayPayable.toLocaleString("en-IN")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ------------- STYLES ------------- */
const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBg, padding: 12 },
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
