
import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createOrder } from "../../api/orderApi";
import { clearCart } from "../../redux/slices/cartSlice";
import { clearCheckoutTotals } from "../../redux/slices/checkoutSlice";
import { fetchProducts } from "../../redux/slices/productSlice";

export default function PlaceOrder({ navigation, route }) {
  const cart = useSelector((state) => state.cart);
  const checkout = useSelector((state) => state.checkout); // ✅ read from Redux
  const dispatch = useDispatch();

  const selectedAddress = route?.params?.address || null;
   const selectedAddressId = route?.params?.addressId || null;

  const [manualAddress, setManualAddress] = useState({
    name: "", phoneNo: "", pincode: "", state: "", city: "",
    buildingName: "", area: "", type: "home", location: "",
  });

  // For safety, compute current subtotal, but prefer Redux values if present
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cart]
  );

  const displaySubtotal = checkout.subtotal || cartSubtotal;
  const displayDiscount = checkout.discount || 0;
  const displayPayable = checkout.finalTotal || Math.max(0, displaySubtotal - displayDiscount);
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

      // Clear cart and checkout totals
      dispatch(clearCart());
      dispatch(clearCheckoutTotals());
       dispatch(fetchProducts(1)); 

      navigation.replace("OrderSuccess", { order });
    } catch (err) {
      console.log("Place order error:", err?.response?.data || err.message);
    }
  };

  const goSelectAddress = () => {
    // No need to forward params—Redux persists totals
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
            <Text style={[styles.summaryText, { color: "#ef4444" }]}>
              Discount: - ₹ {displayDiscount.toLocaleString("en-IN")}
            </Text>
          )}
          <Text style={[styles.summaryText, { color: "#0a8a3a", fontWeight: "800" }]}>
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

          <TouchableOpacity style={styles.changeBtn} onPress={goSelectAddress}>
            <Text style={styles.changeText}>Change Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.addressBox}>
            <View style={styles.addressHeaderRow}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <TouchableOpacity onPress={goSelectAddress}>
                <Text style={styles.linkText}>Use Saved Address</Text>
              </TouchableOpacity>
            </View>

            {[
              "name", "phoneNo", "pincode", "state", "city",
              "buildingName", "area", "location",
            ].map((key) => (
              <TextInput
                key={key}
                placeholder={key}
                style={styles.input}
                value={manualAddress[key]}
                onChangeText={(txt) =>
                  setManualAddress((prev) => ({ ...prev, [key]: txt }))
                }
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
      >
        <Text style={styles.orderText}>
          Place Order • ₹ {displayPayable.toLocaleString("en-IN")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ------------- STYLES ------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },

  summaryBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryText: { fontSize: 15, fontWeight: "600" },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  addressBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
  },
  addressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  addrLine: { fontSize: 14, color: "#333" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 14,
  },

  linkText: { color: "#0A84FF", fontWeight: "700" },

  changeBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#0A84FF",
  },
  changeText: { color: "#0A84FF", fontWeight: "600", fontSize: 13 },

  paymentBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
  },
  paymentText: { fontSize: 14, color: "#333" },

  orderBtn: {
    backgroundColor: "#0A84FF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  orderText: {
    color: "#fff",
    fontSize: 16,
       fontWeight: "700",
  },
});