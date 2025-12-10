import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { createOrder } from "../../api/orderApi";
import { clearCart } from "../../redux/slices/cartSlice";

export default function PlaceOrder({ navigation, route }) {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  // If coming from SelectAddress screen:
  const selectedAddress = route?.params?.address || null; // { id, name, city, ... }
  const selectedAddressId = route?.params?.addressId || null;

  // Fallback manual address state (when user hasn't selected saved address)
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

  const totalAmount = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.price * item.qty,
        0
      ),
    [cart]
  );

  const handlePlaceOrder = async () => {
    if (!cart.length) {
      console.log("Cart empty, cannot place order");
      return;
    }

    try {
      // If we have an addressId from saved address, use that.
      // Otherwise send inline address from the form.
      const payload = selectedAddressId
        ? {
            paymentMethod: "cod",
            addressId: selectedAddressId,
          }
        : {
            paymentMethod: "cod",
            address: manualAddress,
          };

      const order = await createOrder(payload);

      // Clear cart locally (Redux)
      dispatch(clearCart());

      // Navigate to success page
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

      {/* ---- Order Amount Summary ---- */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Items: {cart.length}</Text>
        <Text style={styles.summaryText}>
          Total: ₹ {totalAmount.toLocaleString("en-IN")}
        </Text>
      </View>

      {/* ---- Saved Address Section ---- */}
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
            {selectedAddress.city}, {selectedAddress.state} -{" "}
            {selectedAddress.pincode}
          </Text>
          <Text style={styles.addrLine}>📞 {selectedAddress.phoneNo}</Text>

          <TouchableOpacity
            style={styles.changeBtn}
            onPress={goSelectAddress}
          >
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
              "name",
              "phoneNo",
              "pincode",
              "state",
              "city",
              "buildingName",
              "area",
              "location",
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

      {/* ---- Payment Method info (COD only for now) ---- */}
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
          Place Order • ₹ {totalAmount.toLocaleString("en-IN")}
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
